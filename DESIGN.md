# QuickDineFlow Admin Design System

This document is the visual and interaction contract for the QuickDineFlow admin console. It describes the design logic behind `client/src/components/admin/`, `client/src/pages/admin/`, and the scoped admin rules in `client/src/index.css`.

## 1. Product context

QuickDineFlow admin is an operations desk for cafeteria staff. The interface should help a person scan queues, update status, manage the menu, review feedback, and understand performance without decorative noise.

Design read: a calm service dashboard with an editorial edge, warm paper surfaces, ink typography, thin structural rules, and one practical orange accent.

Design dials:

- Variance: 5/10. Use small asymmetries and clear grouping, not visual chaos.
- Motion: 3/10. Motion confirms state changes and focus; it never competes with live operational work.
- Density: 6/10. Tables, orders, filters, and metrics may be information-rich, but every group needs breathing room.

## 2. Palette and roles

The admin console uses one warm neutral family and one accent. Status colors may remain semantic where they communicate order or feedback state.

- Paper canvas: `#F6F4F1` / HSL `36 25% 96%` — primary page background.
- Surface white: `#FFFEFC` / HSL `40 33% 99%` — cards, panels, and modal surfaces.
- Ink: `#2B2620` / HSL `25 20% 14%` — headings and primary content.
- Muted ink: `#70685F` / HSL `26 10% 43%` — descriptions, timestamps, and helper text.
- Structural border: `#E2D9CD` / HSL `32 18% 86%` — dividers, input borders, and table rules.
- Service orange: `#ED6A2F` / HSL `20 86% 52%` — primary actions, active navigation, focus, and selected metrics.
- Charcoal rail: `#2A2521` / HSL `26 17% 14%` — persistent admin navigation.

Never introduce a second decorative accent, purple/neon gradients, pure black, or color changes that make one page feel like a different product. Use red, yellow, blue, and green only for status meaning.

## 3. Typography and hierarchy

- Use the existing sans UI stack through `var(--font-sans)` for all admin screens. Keep the type neutral, compact, and readable.
- Page titles are large but controlled: `clamp(1.7rem, 2.5vw, 2.45rem)` with tight tracking.
- Metadata and section labels use the mono stack, uppercase, and wide tracking. Use them sparingly as orientation cues.
- Labels sit above controls. Placeholder text never replaces a label.
- Body copy stays short and functional. Prefer “Update menu item details” over promotional or metaphorical copy.

## 4. Shell and navigation patterns

### Admin shell

Every admin screen uses `.admin-shell`, `.admin-sidebar`, `.admin-main`, and `.admin-page-content`.

- The desktop rail is 272px wide and remains visually distinct from the content canvas.
- The content area is contained to a maximum of 1440px and uses responsive horizontal padding.
- The rail uses an orange active marker and a charcoal surface; the active item must be identifiable without relying on color alone.
- At tablet widths the rail compresses to icon-first navigation. At mobile widths it becomes a sticky horizontal header while keeping menu and logout actions available.
- Do not add a second sidebar, floating navigation system, or page-specific navigation language.

### Page header

Use one short mono kicker, one clear title, one sentence of context, and action controls aligned to the opposite side when space allows. On mobile, actions stack below the title.

## 5. Panels, tables, and data patterns

- Use a panel/card only when it creates meaningful grouping or elevation. Prefer borders and spacing for simple lists.
- Panels use the same soft 12–16px corner scale, thin borders, and background-tinted shadows.
- Metric cards use one accent rule to identify the primary KPI; do not make every metric colorful.
- Tables should use generous row padding, calm dividers, and visible hover/focus states. Long tables scroll horizontally inside a bounded region rather than pushing the page width.
- Empty, loading, and error states must occupy the same visual area as the final content and explain what action can populate or recover the view.

## 6. Modal and popup scroll contract

The Radix dialog is portaled outside `.admin-shell`, so admin dialogs must include an explicit `admin-dialog` class. This is required for theme, width, scrollbar, and mobile rules to apply.

### Long menu forms

Create and Edit Menu Item use `admin-dialog admin-dialog-form`.

- Width is `min(52rem, calc(100vw - 2rem))` so the modal cannot collapse to a narrow column.
- Height is bounded at `min(92dvh, 52rem)` on desktop and `calc(100dvh - 2rem)` on mobile.
- The dialog itself is `overflow: hidden`; only `.admin-menu-form` owns vertical scrolling.
- The form uses `scrollbar-gutter: stable` to prevent content width from jumping when the scrollbar appears.
- The scrollbar is thin, transparent-track, rounded, and neutral. Hovering the thumb uses the service-orange accent.
- The form footer is sticky inside the scroll region so Cancel and Create/Update remain reachable after a long scroll.
- At widths below 640px the dialog is centered with `top: 50%` and `transform: translate(-50%, -50%)`; fields become one column and footer buttons become full width.
- Never use a nested scrolling container inside the menu form. One modal body scroll region is the rule.

### Short confirmations and detail dialogs

Delete, role-change, and feedback-detail dialogs use `admin-dialog` with a stable header and a compact footer. Use `admin-dialog-confirm` for destructive or permission-changing actions and reserve red/yellow for the meaning of that action.

## 7. Interaction rules

- Primary buttons use service orange with high-contrast text. Secondary buttons use outline or quiet neutral fills.
- Buttons give tactile `:active` feedback but never bounce or glow.
- Focus rings use the service orange and must remain visible in both themes.
- Status changes should use the existing toast and query invalidation logic. Styling must not change mutation behavior.
- Respect `prefers-reduced-motion`; avoid perpetual animation in operational screens.
- Maintain existing `data-testid` hooks when changing layout or styling.

## 8. Responsive and accessibility rules

- No horizontal page scroll below 768px.
- Multi-column form grids collapse to one column below 640px.
- Touch targets are at least 44px where possible, especially navigation, dialog actions, and icon buttons.
- Dialogs must retain a visible close control, readable title, labelled controls, and keyboard-accessible focus states.
- Do not communicate availability, role, or order status using color alone; retain the existing text labels and badges.

## 9. Banned patterns

- No AI-purple or neon gradients.
- No pure-black backgrounds or un-tinted drop shadows.
- No decorative card nesting that obscures the operational hierarchy.
- No oversized centered hero treatment inside admin screens.
- No placeholder names, invented precision, emoji UI, or marketing copy in staff workflows.
- No modal that scrolls the page behind it, collapses below readable width, exposes a bright native scrollbar, or places actions permanently below an unreachable long form.
