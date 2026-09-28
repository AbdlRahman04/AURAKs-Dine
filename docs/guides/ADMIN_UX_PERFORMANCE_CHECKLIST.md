# QuickDineFlow Admin and Menu UX Performance Checklist

Use this document for every performance-sensitive release or menu/catalog change. Record evidence instead of marking a check complete from visual inspection alone.

## Run record

| Field | Value |
|---|---|
| Date |  |
| Commit |  |
| Environment | Local / staging / production |
| Browser and device |  |
| Network profile | Wi-Fi / Fast 3G / Slow 3G / offline recovery |
| Menu item count | 20 / 100+ / other |
| Order, feedback, and user counts |  |
| Reviewer |  |

## Initial implementation baseline — 2026-09-27

| Check | Result |
|---|---|
| `npm run check` | Passed |
| `npm run build` | Passed; existing Browserslist/Baseline and PostCSS warnings remain |
| `npm run db:push` | Passed; menu indexes applied to the configured database |
| `npm run smoke` against updated backend | Passed on isolated local port; menu pagination, admin authorization, admin menu access, and order pagination verified |
| Public menu dataset | 20 items returned through the paginated endpoint |
| Server-side category filter | Passed for `Regional Dishes` |
| Server-side search filter | Passed with existing `Chicken` menu data |
| Browser Web Vitals and slow-network run | Pending manual review |

## Phase 6-7 implementation run — 2026-09-28

This is a post-change local run. A browser-controlled pre-change baseline was not available, so the results below must not be treated as a full before/after browser comparison.

| Check | Result |
|---|---|
| Environment | Local Express/Vite server on port 5002 with the configured local PostgreSQL database |
| Validation | `npm run check`, `npm run build`, and `npm run smoke` passed |
| Production route split | Build emitted a separate `CardPaymentForm` chunk (13.85 kB; 5.38 kB gzip); it is loaded only after the card-payment step is reached |
| 20-item public menu API | 10 warm requests: 57.51 ms min, 120.91 ms average, 557.79 ms max; 14,012-byte response; 20 returned items |
| Isolated 120-item menu search | 10 requests: 6.55 ms min, 8.07 ms average, 11.90 ms max; 9,773-byte response; 120 matching items |
| Temporary fixture handling | Created 120 uniquely prefixed local menu records for the measurement, then removed exactly those 120 records |
| Paginated orders vs. summary API | Current authenticated local comparison, 10 requests each: `/api/orders` 8.51/9.83/12.77 ms min/avg/max and 4,396 bytes; `/api/orders/summary` 4.18/4.93/6.36 ms and 18 bytes |
| Database plans | `EXPLAIN (ANALYZE, BUFFERS)`: menu count 1.630 ms planning / 0.084 ms execution; menu page 0.155 / 0.109 ms; order-summary lookup 0.076 / 0.034 ms; 120-item search 1.669 / 1.132 ms |
| Responsive student-flow check | Passed in Edge at explicit 1440×900 and 375×812 overrides: authenticated menu → cart → checkout reached cash-order review without submitting an order; English desktop and English/Arabic mobile layouts had no horizontal page overflow |
| Responsive correction | Mobile navigation initially clipped the final link; it now wraps into a second row, and all seven authenticated links were visible at 375×812 |
| Keyboard and focus check | Passed: Enter opened item details and cart; focus entered each dialog with a visible ring; Escape closed both and returned focus to the originating menu/card or cart control; Tab advanced from item details to its adjacent favorite control |
| Checkout feedback check | Passed: missing pickup time raised an assertive inline alert and toast; its recovery control cleared the alert and focused the first pickup-time option. The nested Stripe fallback exposes an `aria-busy` polite status while payment details load |
| Card-payment confirmation | Skipped for this run because configured Stripe test keys were not provided; no card payment or order submission was attempted |
| Unmet measurement coverage | Cache-disabled desktop/mobile, Fast 3G, route-to-usable, image transfer, React profiler, and browser long-task measurements were not captured in this responsive validation |
| Unmet acceptance coverage | Stripe card confirmation remains pending until configured Stripe test keys are supplied |

No database index was added in this pass. The low local execution times above do not replace the required browser measurements; record any production threshold failure in the post-deployment review table.

## Current browser follow-up — 2026-09-28

This follow-up adds current browser evidence but does not create a pre-change comparison. The browser automation environment did not expose Chrome's Performance Timeline or network throttling controls, so timing and Web Vitals are intentionally not inferred from this run.

| Check | Result |
|---|---|
| Environment | Local app at `http://localhost:5000/menu`, commit `0c9dcd7`, Chrome on the current desktop viewport, default unthrottled network |
| Menu render | 20 menu item cards rendered from the 20-item dataset |
| Image behavior | 22 images present; 17 had `loading="lazy"` and 5 were eager. Resource transfer size was not available from the browser measurement surface |
| Search behavior | After entering `chicken` and allowing the debounce window to settle, 3 matching cards were shown; clearing the field restored all 20 cards |
| Desktop layout | `document.body.scrollWidth` equaled `document.documentElement.clientWidth` at 1905 px; no horizontal overflow was observed at this viewport |
| Reload observation | The page shell returned before menu data was present; after an explicit 1.5-second settling window, all three observations showed 20 cards. This is not recorded as route-to-usable latency because the observation window was fixed |
| Browser performance coverage | Cache-disabled desktop/mobile, Fast 3G, image transfer timing, React profiler, long tasks, LCP, CLS, INP, and cart-to-checkout timing remain pending |

The current evidence supports the implemented menu behavior and lazy-loading configuration, but it does not satisfy the controlled browser benchmark or before/after comparison required to close Phase 7.

## Baseline measurements

- [ ] Record route-to-usable time for `/menu`, `/admin`, and `/admin/menu`.
- [ ] Record menu API latency, response size, item count, and page size.
- [ ] Record initial image request count and total image transfer size.
- [ ] Check browser Performance panel for long tasks over 200 ms.
- [ ] Check Core Web Vitals: LCP, CLS, and INP.
- [ ] Record search/filter response time and whether the previous results remain usable while loading.

## Student menu

- [ ] Menu loads with a stable skeleton and no content jump.
- [ ] Search is debounced and does not issue one request per keystroke.
- [ ] Category changes reset results correctly and preserve usable loading feedback.
- [ ] Only available items are shown.
- [ ] Images below the first viewport are lazy-loaded.
- [ ] Failed images show a readable fallback without breaking card height.
- [ ] English and Arabic names/descriptions render correctly.
- [ ] Favorites, item details, quantity controls, customizations, and add-to-cart work.
- [ ] Mobile layout has no horizontal page scroll.

## Admin menu management

- [ ] Admin menu loads paginated results without fetching unrelated records.
- [ ] Unavailable items remain visible to authorized admins.
- [ ] Search and category filters work with 20 and 100+ items.
- [ ] Admin card images are lazy-loaded and use reserved dimensions.
- [ ] Edit/create dialogs remain responsive and only one edit form is mounted.
- [ ] Create, edit, archive, and delete update the visible cache correctly.
- [ ] Destructive actions retain confirmation and clear pending/error feedback.
- [ ] Unauthorized access to `/api/admin/menu` returns 401/403.
- [ ] Icon-only actions have accessible labels or visible accessible names.

## Other admin pages

- [ ] Kitchen display remains responsive while orders update in real time.
- [ ] All orders does not grow an unbounded DOM without pagination/load-more behavior.
- [ ] Feedback and user management are checked for bulk payloads and long tables.
- [ ] Analytics route size and chart render time are recorded separately.
- [ ] Loading, empty, error, and retry states occupy stable layout space.

## Accessibility and interaction

- [ ] Keyboard navigation reaches search, filters, cards, dialogs, and actions.
- [ ] Focus is visible and remains correctly managed when dialogs open and close.
- [ ] Interactive targets are at least 44 by 44 px where practical.
- [ ] Status, availability, and errors are not communicated by color alone.
- [ ] `prefers-reduced-motion` removes nonessential motion.
- [ ] Text remains readable in light and dark themes with WCAG AA contrast.

## Image and bundle checks

- [ ] Menu images have stable aspect-ratio containers.
- [ ] Images use WebP/AVIF or an equivalent optimized source where the host supports it.
- [ ] No original-resolution remote image is used for a small card thumbnail.
- [ ] Production build output is reviewed for unexpectedly large route chunks.
- [ ] Analytics/chart code is loaded only when the analytics route is used.

## Validation commands

```text
npm run check
npm run build
npm run smoke
```

If a command cannot run, record the exact missing service, environment variable, or external dependency here:

```text
Skipped checks:
Reason:
Follow-up owner:
Due date:
```

## Release decision

- [ ] No measured regression against the previous run.
- [ ] All critical menu and admin interactions pass.
- [ ] Performance thresholds in `ADMIN_UX_PERFORMANCE_PLAN.md` are met or an exception is documented.
- [ ] Follow-up work has an owner and due date.

## Post-deployment review

| Observation | Root cause | Fix or follow-up | Owner | Due date | Status |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
