# Smart Cafeteria Ordering System - Design Guidelines

## Design Foundation

**Approach:** Material Design 3 - utility-focused, data-heavy interface prioritizing speed and clarity.

**Principles:**
1. Efficiency First: Minimize clicks (browse → order → pay)
2. Clear role hierarchy: Student vs. admin interfaces
3. Progressive disclosure: Critical info upfront, details on demand
4. Mobile-first for students, desktop-optimized for admin

---

## Typography

**Font:** Inter (Google Fonts) → system-ui, -apple-system, sans-serif

**Scale:**
- H1: 2.5rem/700/1.2
- H2: 1.875rem/600/1.3
- H3: 1.5rem/600/1.4
- H4: 1.25rem/600/1.5
- Body Large: 1.125rem/400/1.6
- Body Regular: 1rem/400/1.5
- Body Small: 0.875rem/400/1.5
- Caption: 0.75rem/400/1.4

**Special:**
- Prices: 600 weight, 1.125rem min
- Order Numbers: 700 weight, Roboto Mono
- Status Labels: 600 weight, 0.875rem, uppercase, 0.5px tracking
- Errors/Success: Regular body with 500 weight

---

## Layout & Spacing

**Spacing Scale:** 2, 4, 6, 8, 12, 16, 20, 24
- Micro: 2, 4
- Component internal: 4, 6, 8
- Related elements: 8, 12
- Sections: 16, 20, 24

**Containers:**
- Student: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Admin: `max-w-screen-2xl mx-auto px-6`

**Grids:**
- Menu: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Admin Sidebar: Fixed `w-64` + flexible main
- Reports: `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6`

**Breakpoints:** Mobile (base), sm(640px), md(768px), lg(1024px), xl(1280px)

---

## Components

### Navigation
**Student Header:**
- Sticky, `h-16` mobile / `h-20` desktop, backdrop-blur
- Logo + Nav + Cart badge + Avatar
- Mobile: Hamburger → slide-out drawer

**Admin:**
- Left sidebar `w-64` (collapsible overlay mobile)
- Top bar: breadcrumbs + quick actions

### Menu Cards
**Structure:** Image(4:3) → Badge → Title → Description → Nutrition → Price + Add button
- Padding: `p-4 gap-3`
- Hover: `shadow-md` → `shadow-lg`
- Out of stock: Semi-transparent overlay
- Images: 400x300px, rounded-lg, lazy-loaded WebP+JPG fallback

**Category Filters:**
- Horizontal scroll (snap), pill buttons
- Sticky below header
- Icons (Heroicons): sun(breakfast), utensils(lunch), shopping-bag(snacks), cup(beverages)

### Cart & Checkout
**Cart Drawer:**
- `w-full sm:w-96`, slide-in right
- Header → Scrollable items → Sticky footer (total + CTA)
- Item: 20x20 thumbnail + details + quantity + remove
- Empty: Centered icon + CTA

**Checkout Steps:**
- Progress indicator: Numbered circles + connecting lines
- Steps: Cart → Pickup Time → Payment → Confirmation
- Time selector: 3-col mobile, 6-col desktop grid of pill buttons

### Order Tracking
**Status Card:**
- Timeline: Vertical mobile, horizontal desktop
- Current status: Pulse animation on active node
- Order #: Large, monospace, copy-to-clipboard
- Expandable items list accordion

**Order History:**
- Cards: Date + # + 2-3 item preview + Total + Reorder
- 20/page pagination, `gap-4`
- Filters: Status dropdown + date range

### Admin Components
**Kitchen Display:**
- 3-4 col grid, color-coded by urgency
- Card: Large # → Pickup → Items → Status buttons
- Real-time: Slide-in animation + sound toggle

**Menu Table:**
- Sticky header, sortable columns
- Columns: Thumb, Name, Category, Price, Toggle, Actions
- Inline editing, bulk actions with checkbox

**Analytics:**
- Top KPIs: 4-col grid (Orders, Revenue, AOV, Popular Item) - large number + trend + sparkline
- Charts: 2-col desktop (Line/Bar/Donut via Chart.js)
- Date presets: Today, Week, Month, Custom

### Forms
**Structure:** `max-w-md` (single) / `max-w-3xl` (complex), `space-y-6`
- Labels: Above, 500 weight, `mb-2`
- Inputs: `h-12`, `px-4 py-3`, focus `ring-2 ring-offset-2`
- Error: Border change + icon + message below
- Help text: `text-sm opacity-70`

**Buttons:**
- Primary: `h-12 px-8 rounded-lg` 600 weight
- Secondary: Outline variant
- Icon: `w-10 h-10 rounded-full`
- Disabled: `opacity-50 cursor-not-allowed`

**Dropdowns:**
- Match input style, chevron icon
- Menu: `shadow-xl rounded-lg py-2`
- Options: `px-4 py-3` with hover

### Feedback
**Toasts:**
- Position: `top-right fixed max-w-sm`
- Icon + Message + Close, auto-dismiss 5s
- Variants: Success, Error, Warning, Info
- Stack with `gap-2`

**Loading:**
- Skeleton: Pulse animation
- Spinner: Centered overlay with backdrop-blur
- Progress bars for multi-step
- Optimistic UI: Show → rollback on error

**Empty States:**
- Centered icon(24x24) + Title + Description + CTA

### Modals
**Dialog:**
- `max-w-lg centered shadow-2xl rounded-xl p-6`
- Backdrop: `backdrop-blur-sm`
- Mobile: Full screen or bottom slide-up
- Confirmation: `max-w-md`, clear action hierarchy

---

## Color System

**Primary (Brand):**
- Light: Surface tint, hover states
- Base: Primary CTAs, links
- Dark: Active states, pressed

**Secondary/Accent:**
- Highlight elements, badges

**Semantic:**
- Success: Green (600)
- Error: Red (600)
- Warning: Amber (600)
- Info: Blue (600)

**Neutrals:**
- Background: White/Gray-50
- Surface: White with subtle elevation shadows
- Text: Gray-900 (primary), Gray-600 (secondary), Gray-400 (disabled)
- Borders: Gray-200/300

**Food Category Colors:** (Badge overlays on menu cards)
- Breakfast: Warm yellow tint
- Lunch: Fresh green tint
- Snacks: Playful orange tint
- Beverages: Cool blue tint

---

## Accessibility

- Minimum 44x44px touch targets
- Visible focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Semantic HTML structure
- Skip-to-main link for keyboards
- Color contrast WCAG AA minimum

---

## Performance

- Lazy load images, srcset for responsive
- WebP with JPG fallback
- Skeleton screens during fetch
- Optimistic cart updates
- WebSocket indicator in admin

---

## Mobile-Specific

- Bottom nav: Home, Menu, Orders, Profile
- Sticky "Add to Cart" on item detail
- Swipe to remove cart items
- Pull-to-refresh order tracking

---

## Image Specifications

**Hero:** 1920x700px (16:9 mobile), diverse students, gradient overlay for text readability

**Menu Items:** 400x300px (4:3), professional food photography, consistent lighting, rounded-lg

**Icons:** Heroicons library - cart, user, search, filter, clock, check, trash, plus, minus, bell, chevron variants, exclamation-circle (allergens), information-circle (nutrition)