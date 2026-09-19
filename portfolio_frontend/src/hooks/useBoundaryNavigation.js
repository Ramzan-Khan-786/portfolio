import { useEffect, useRef } from 'react';
const ignored = 'input,textarea,select,[contenteditable="true"],[data-scroll-lock],iframe';
export function atBoundary(element, direction) {
  return direction > 0
    ? element.scrollTop + element.clientHeight >= element.scrollHeight - 3
    : element.scrollTop <= 3;
}
export function nestedScroller(target, root, direction) {
  for (let node = target; node && node !== root; node = node.parentElement) {
    if (
      node.scrollHeight > node.clientHeight + 3 &&
      /auto|scroll/.test(getComputedStyle(node).overflowY) &&
      !atBoundary(node, direction)
    )
      return true;
  }
  return false;
}
export default function useBoundaryNavigation(
  ref,
  { enabled, routeKey, previous, next, navigate },
) {
  const lock = useRef(0);
  useEffect(() => {
    lock.current = performance.now() + 850;
  }, [routeKey]);
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return undefined;
    let last = 0,
      candidate = 0,
      total = 0,
      touch = null;
    const blocked = (target) =>
      target?.closest?.(ignored) || document.activeElement?.closest?.(ignored);
    function move(direction) {
      const item = direction > 0 ? next : previous;
      if (!item) return false;
      lock.current = performance.now() + 950;
      candidate = 0;
      total = 0;
      navigate(item.destination, { state: { pageDirection: direction } });
      return true;
    }
    function wheel(event) {
      const now = performance.now(),
        idle = now - last;
      last = now;
      const direction = Math.sign(event.deltaY);
      if (
        event.ctrlKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        !direction ||
        blocked(event.target) ||
        nestedScroller(event.target, root, direction)
      ) {
        candidate = 0;
        return;
      }
      if (now < lock.current || !atBoundary(root, direction)) {
        candidate = 0;
        total = 0;
        return;
      }
      // A fresh gesture at the boundary is required. Momentum from the previous scroll cannot arm it.
      if (idle > 220) {
        candidate = direction;
        total = 0;
      }
      if (candidate !== direction) return;
      total +=
        Math.abs(event.deltaY) *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? root.clientHeight : 1);
      if (total >= 100 && move(direction)) event.preventDefault();
    }
    function touchStart(event) {
      touch = null;
      if (event.touches.length !== 1 || blocked(event.target) || performance.now() < lock.current)
        return;
      const point = event.touches[0];
      touch = {
        x: point.clientX,
        y: point.clientY,
        top: atBoundary(root, -1),
        bottom: atBoundary(root, 1),
        target: event.target,
      };
    }
    function touchEnd(event) {
      if (!touch || event.changedTouches.length !== 1) {
        touch = null;
        return;
      }
      const dy = touch.y - event.changedTouches[0].clientY,
        dx = touch.x - event.changedTouches[0].clientX,
        direction = Math.sign(dy);
      if (
        Math.abs(dy) > 110 &&
        Math.abs(dy) > Math.abs(dx) * 1.5 &&
        (direction > 0 ? touch.bottom : touch.top) &&
        atBoundary(root, direction) &&
        !nestedScroller(touch.target, root, direction) &&
        performance.now() > lock.current
      )
        move(direction);
      touch = null;
    }
    root.addEventListener('wheel', wheel, { passive: false });
    root.addEventListener('touchstart', touchStart, { passive: true });
    root.addEventListener('touchend', touchEnd, { passive: true });
    const cancel = () => {
      touch = null;
    };
    root.addEventListener('touchcancel', cancel);
    return () => {
      root.removeEventListener('wheel', wheel);
      root.removeEventListener('touchstart', touchStart);
      root.removeEventListener('touchend', touchEnd);
      root.removeEventListener('touchcancel', cancel);
    };
  }, [enabled, routeKey, previous, next, navigate, ref]);
}
