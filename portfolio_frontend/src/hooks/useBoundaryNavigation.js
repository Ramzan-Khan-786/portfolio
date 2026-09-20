import { useEffect, useRef } from 'react';
const ignored = 'input,textarea,select,[contenteditable="true"],[data-scroll-lock],iframe';
export function atBoundary(element, direction) {
  return direction > 0 ? element.scrollTop + element.clientHeight >= element.scrollHeight - 4 : element.scrollTop <= 4;
}
export function nestedScroller(target, root, direction) {
  for (let node = target; node && node !== root; node = node.parentElement) {
    if (node.scrollHeight > node.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(node).overflowY) && !atBoundary(node, direction)) return true;
  }
  return false;
}
export default function useBoundaryNavigation(ref, { enabled, routeKey, previous, next, navigate }) {
  const lock = useRef(0);
  useEffect(() => { lock.current = Math.max(lock.current, performance.now() + 420); }, [routeKey]);
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return undefined;
    let last = 0, directionHeld = 0, distance = 0, touch = null;
    const blocked = (target) => target?.closest?.(ignored);
    function move(direction) {
      const item = direction > 0 ? next : previous;
      if (!item) return false;
      lock.current = performance.now() + 600;
      distance = 0;
      navigate(item.destination, { state: { pageDirection: direction } });
      return true;
    }
    function wheel(event) {
      const now = performance.now(), gap = now - last;
      last = now;
      const direction = Math.sign(event.deltaY);
      if (event.ctrlKey || event.metaKey || event.shiftKey || !direction ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || blocked(event.target) ||
        nestedScroller(event.target, root, direction)) { distance = 0; return; }
      if (now < lock.current) {
        // Momentum cannot carry one gesture across several pages.
        lock.current = Math.max(lock.current, now + 130);
        distance = 0;
        return;
      }
      if (!atBoundary(root, direction)) { distance = 0; directionHeld = 0; return; }
      if (gap > 750 || direction !== directionHeld) distance = 0;
      directionHeld = direction;
      distance += Math.abs(event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? root.clientHeight : 1);
      // One ordinary mouse notch or a gentle trackpad gesture; no speed requirement.
      if (distance >= 36 && move(direction)) event.preventDefault();
    }
    function touchStart(event) {
      touch = null;
      if (event.touches.length !== 1 || blocked(event.target) || performance.now() < lock.current) return;
      const point = event.touches[0];
      touch = { x: point.clientX, y: point.clientY, top: atBoundary(root, -1), bottom: atBoundary(root, 1), target: event.target };
    }
    function touchEnd(event) {
      if (!touch || event.changedTouches.length !== 1) { touch = null; return; }
      const dy = touch.y - event.changedTouches[0].clientY, dx = touch.x - event.changedTouches[0].clientX;
      const direction = Math.sign(dy);
      if (Math.abs(dy) >= 48 && Math.abs(dy) > Math.abs(dx) * 1.4 &&
        (direction > 0 ? touch.bottom : touch.top) && atBoundary(root, direction) &&
        !nestedScroller(touch.target, root, direction) && performance.now() >= lock.current) move(direction);
      touch = null;
    }
    const cancel = () => { touch = null; };
    root.addEventListener('wheel', wheel, { passive: false });
    root.addEventListener('touchstart', touchStart, { passive: true });
    root.addEventListener('touchend', touchEnd, { passive: true });
    root.addEventListener('touchcancel', cancel);
    return () => {
      root.removeEventListener('wheel', wheel); root.removeEventListener('touchstart', touchStart);
      root.removeEventListener('touchend', touchEnd); root.removeEventListener('touchcancel', cancel);
    };
  }, [enabled, routeKey, previous, next, navigate, ref]);
}
