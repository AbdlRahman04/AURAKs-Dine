# QuickDineFlow Admin and Menu Performance Plan

## Purpose

QuickDineFlow must stay responsive as the menu, order history, feedback, and user records grow. This plan focuses first on the shared admin/student menu experience because both surfaces currently load and filter the complete menu collection in the browser.

## Current implementation and remaining risks

- `GET /api/menu` and `GET /api/admin/menu` are paginated, server-filtered, and capped at 50 items. The student and admin menu screens render a page at a time, debounce search, and reserve image space.
- Menu queries have category/name and availability/category indexes. The menu search predicate still uses four `ILIKE` expressions, so query-plan evidence should determine whether a future text-search index is warranted.
- Checkout previously downloaded a paginated order history only to decide whether to show a first-order discount. It now requests a compact, indexed order summary instead.
- Card-payment code is loaded only after the student reaches card payment. Checkout is prefetched after a cart with items opens.
- Admin users, feedback, and analytics remain separate follow-up candidates; they are outside the student-flow performance scope for this pass.

## Performance goals

- Keep menu search and category changes responsive within 100 ms of user input after the request state is shown.
- Keep cumulative layout shift below 0.1 by reserving stable media space.
- Keep primary interactions within an INP target of 200 ms on a production-like device.
- Return the first menu page in under 300 ms on a warm production-like API.
- Request only above-the-fold images eagerly; load the remaining images lazily.
- Preserve the current bilingual, responsive, accessible ordering experience.

## Implementation order

1. Completed: paginate and filter the public/admin menu routes, then update the shared React Query menu hook and screens.
2. Completed: reserve image space, lazily load below-the-fold media, and isolate menu-card/dialog work.
3. Completed: add the menu indexes through the normal schema workflow.
4. Completed: replace checkout's full order-history query with a compact summary endpoint and lazy-load the Stripe payment component.
5. Record browser Web Vitals, responsive screenshots, and slow-network behavior before declaring the phase complete.
6. Measure staff-only bulk pages and analytics separately before scheduling additional pagination, indexing, or code splitting.

## API and data behavior

`GET /api/menu` returns available items for students. `GET /api/admin/menu` is admin-only and returns all items. Both endpoints accept `page`, `limit`, `search`, and `category`; `limit` is capped at 50.

Both endpoints return:

```ts
{
  items: MenuItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
}
```

Checkout additionally uses the authenticated endpoint:

```ts
GET /api/orders/summary
// { hasOrders: boolean }
```

It uses `orders_user_created_idx` to answer first-order eligibility without returning order records or order items.

Menu mutations remain on the existing `/api/menu` and `/api/menu/:id` routes. After a mutation, the relevant cached menu pages are updated or invalidated without broad unrelated refetches.

## Frontend behavior

- Search requests are debounced by 250 ms and reset pagination when the search or category changes.
- Previous results remain visible while a new page is loading.
- Menu cards use stable media dimensions, `loading="lazy"`, asynchronous decoding, and a safe fallback when an image fails.
- The admin edit dialog is rendered once outside the item map.
- Card rendering is isolated in memoized components where it reduces rerenders.
- No virtualization dependency is added for the current 20-item menu; it will be reconsidered after measured growth beyond 100 visible items.
- Checkout preloads from an open cart and lazy-loads Stripe only after the card-payment step; cash checkout does not download the payment component.

## Database and operations

- Add a menu index that supports category/name ordering and search as far as PostgreSQL can use it.
- Confirm query plans before adding additional indexes for users, feedback, or analytics.
- Record dataset size, environment, browser/device, network profile, API latency, payload size, image request count, and interaction results for each performance review.
- Do not add permanent telemetry or expose sensitive user data as part of this work.

## Acceptance criteria

- Student browsing, search, category changes, favorites, details, and add-to-cart continue to work in English and Arabic.
- Admins can view available and unavailable items, search, filter, create, edit, archive, and delete items.
- Unauthorized users cannot access `/api/admin/menu`.
- Menu layouts remain stable while images load or fail.
- The app passes `npm run check`, `npm run build`, and `npm run smoke` when the required services and environment variables are available.
- The living checklist is completed for 20 items and a 100+ item dataset before declaring the performance work complete.
