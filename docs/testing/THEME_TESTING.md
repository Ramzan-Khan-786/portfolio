# Theme manual acceptance

Not executed. Follow [setup](MANUAL_TESTING_GUIDE.md) and [theme architecture](../theme-system.md). Use separate browser profiles/tabs and record expected/actual outcomes yourself.

## Admin management

- [ ] Open Admin → Themes. Confirm mode cards, enabled count, palette filters/presets, fallback selector and preview panel fit desktop/mobile.
- [ ] Search a palette; filter All/Light/Dark/Enabled. Empty results should be clear without altering the pool.
- [ ] Use Enable all, Light only and Dark only. The fallback must remain in the selected pool.
- [ ] Toggle a palette and set its fallback/default. The last enabled palette cannot be removed.
- [ ] Preview several palettes. Only the sample panel changes; no settings save or actual workspace theme change occurs.
- [ ] Change the CMS sidebar selector. Only this tab's workspace/public appearance changes, not the editor values or global policy.
- [ ] Change mode/pool/override settings, then Discard. Saved values return.
- [ ] Restore defaults. It selects random-reload/all palettes/visitor choice in the editor, but requires Save to publish.
- [ ] Save policy; reload editor and check persistence yourself. Unauthorized users cannot save.
- [ ] API failure preserves edits and gives an error, not a successful save notice.

## Random on every reload — requested behavior

- [ ] Enable at least three palettes, choose Random on every reload, allow visitor choice, then save.
- [ ] Reload the Chrome tab. A random enabled theme appears.
- [ ] Reload again. With sessionStorage available, it differs from the last displayed palette.
- [ ] Navigate through Home, Profile, Work, Resume and CMS without reloading. Theme remains the same.
- [ ] Switch tabs and return; wait through a one-minute policy refresh. The theme must not reroll.
- [ ] Choose a theme manually. It applies immediately and remains through page navigation/focus/policy refresh.
- [ ] Reload after that manual choice. The choice is discarded; a new automatic draw excludes that last displayed palette when alternatives exist.
- [ ] Choose another manual theme, then Return to automatic. The original assignment for this visit returns; this action does not draw a new random theme.
- [ ] Open another tab. It makes its own assignment and does not inherit the first tab's manual choice. Random tabs can legitimately match.
- [ ] Change the first tab's manual choice. The other tab must not change.
- [ ] Close/reopen the page as a new visit. No manual choice is restored.
- [ ] Enable only one palette. The editor warns and all reloads safely use that palette.
- [ ] Keep a valid theme enabled while saving another policy revision. The open tab does not reroll just because of the revision.
- [ ] Disable the current theme. On policy refresh the tab falls back to an enabled theme.
- [ ] With browser storage blocked, selection works in memory; reload still draws, but avoiding the previous palette cannot be guaranteed.

## Fixed and daily options

- [ ] Fixed: save a default and reload. It is selected automatically.
- [ ] Pick a personal theme in fixed mode, then reload. The saved default returns.
- [ ] Daily: without manual overrides, devices using the same policy/UTC date select the same palette.
- [ ] Daily: reloading on the same UTC day does not reroll.
- [ ] Daily: a manual choice remains for the visit, including through a day change; reloading returns to the current daily selection.
- [ ] Disallow overrides. Selectors explain the lock and saved/in-memory choices do not override policy.

## Compatibility and visual acceptance

- [ ] An old random-device policy is returned/displayed as random-reload, with no permanent device assignment restored.
- [ ] Existing fixed/daily policies remain intact until deliberately changed.
- [ ] Old localStorage visitor preferences do not survive into the new reload lifetime.
- [ ] With cached policy, inspect reload painting yourself: the generated head initializer and React share one assignment without a second draw.
- [ ] An uncached policy can reconcile after bootstrap; no claim that server policy is known before it arrives.
- [ ] At your actual host, confirm CSP allows the generated theme initializer and caches are refreshed for new frontend files.
- [ ] Check all ten palettes on public pages, forms, tables, notices, media dialogs, PDF toolbar and Showroom chrome.
- [ ] Keyboard-select palettes/modes, tab through controls and inspect focus/contrast at 320–1536px.
- [ ] No theme change affects Showroom iframe state, session cookies or public CMS content.
- [ ] Storage contains public policy and a last-viewed hint only for this feature, never account credentials.

Result:

- [ ] Pass
- [ ] Fail
- [ ] Needs investigation
