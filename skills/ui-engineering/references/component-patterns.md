# Component patterns

Structural blueprints for the components most screens need. They show structure, states and accessibility, not a visual style: in a project with a design system, use the system's component and treat this file as the checklist it must satisfy. Examples use React with Tailwind-style token classes; translate to the project's stack.

Library APIs used here were checked on 2026-10-25: `cva` from class-variance-authority (https://cva.style/docs/getting-started/variants), the HTML `dialog` element (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) and the WAI-ARIA Authoring Practices patterns (https://www.w3.org/WAI/ARIA/apg/patterns/).

Contents: 1. Button · 2. Icon button · 3. Text field · 4. Select, checkbox, switch · 5. Dialog · 6. Data table · 7. Card · 8. Status badge · 9. Inline alert and toast · 10. Skeleton · 11. Visually hidden text

## 1. Button

- Element: `<button type="button">` for actions (`type="submit"` only inside forms), `<a href>` for navigation even when styled as a button.
- Variants: a small named set (primary, secondary, ghost, destructive). Sizes: three (sm, md, lg).
- States: default, hover, focus-visible, active, disabled, loading. Loading keeps the width, shows a spinner, sets `aria-busy="true"` and blocks repeat clicks.
- One primary button per view or section.

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
  "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4", lg: "h-12 px-6 text-lg" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { loading?: boolean };

export function Button({ variant, size, loading, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={button({ variant, size })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner aria-hidden="true" />}
      {children}
    </button>
  );
}
```

## 2. Icon button

- Needs an accessible name: `aria-label="Close"` (or visually hidden text). The icon itself is `aria-hidden="true"`.
- Same states as a button; a tooltip may repeat the label but never replaces it.
- Pointer target at least 24 by 24 CSS pixels, or spaced so the 24 px circle does not overlap a neighbour (WCAG 2.2 SC 2.5.8).

## 3. Text field

Anatomy: label, optional hint, input, error message.

```tsx
<div className="grid gap-1.5">
  <label htmlFor="email">Email address</label>
  <p id="email-hint" className="text-sm text-muted-foreground">We will send the receipt here.</p>
  <input
    id="email"
    name="email"
    type="email"
    autoComplete="email"
    aria-describedby={error ? "email-hint email-error" : "email-hint"}
    aria-invalid={error ? true : undefined}
  />
  {error && <p id="email-error" className="text-sm text-destructive">Error: {error}</p>}
</div>
```

- Label always visible; placeholder is an example at most.
- Error text says what is wrong and how to fix it ("Enter an email address in the format name@example.com"), uses colour plus the word or an icon, and is linked with `aria-describedby`.
- Validate on submit; on failure keep the value, show an error summary at the top of the form and move focus to it (GOV.UK validation pattern, https://design-system.service.gov.uk/patterns/validation/).
- Correct `type`, `inputmode` and `autocomplete` for the data.

## 4. Select, checkbox, switch

- Prefer the native `<select>` unless search or rich options are needed; then use the design system's combobox, which must follow the APG combobox pattern.
- Checkbox: a real `<input type="checkbox">` with a `<label>`; groups in a `fieldset` with a `legend`.
- Switch: for settings that take effect immediately; `role="switch"` with `aria-checked`, or the design system's switch. For settings saved with a button, use a checkbox.

## 5. Dialog

- Use the system's dialog, or the native `<dialog>` opened with `showModal()` for a modal one.
- Required behaviour (APG dialog modal pattern): focus moves into the dialog on open, stays inside while open, Escape closes, focus returns to the element that opened it, the dialog has an accessible name (`aria-labelledby` pointing at its title).
- Destructive confirmation: title names the action and object; body states the consequence; buttons are "Cancel" and a destructive-styled verb ("Delete project"), never "Yes/No".
- On small screens a dialog can become a full-screen sheet; keep the same focus rules.

```tsx
function ConfirmDelete({ open, onClose, onConfirm, name }) {
  const ref = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-labelledby="confirm-title" onClose={onClose}>
      <h2 id="confirm-title">Delete project "{name}"?</h2>
      <p>This removes the project and its files for everyone. It cannot be undone.</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Delete project</Button>
      </div>
    </dialog>
  );
}
```

## 6. Data table

- Real `<table>`, `<thead>`, `<th scope="col">`; a `<caption>` or an accessible name.
- Sortable headers are buttons inside `<th>` with `aria-sort` on the sorted column.
- Numbers right-aligned with tabular figures; dates in one format.
- States: loading (skeleton rows of the final height), empty (with the reason and next action), error (with retry), partial (some rows failed), and selected rows for bulk actions.
- Row actions in a consistent final column or row menu (APG menu button).
- Small screens: horizontal scroll inside a labelled, focusable region with the first column fixed, or a stacked card per row.

## 7. Card

- A container, not a widget: `<article>` or `<section>` with a heading when it holds standalone content.
- If the whole card is a link, put one real `<a>` on the title and stretch its hit area with CSS; do not nest other interactive elements inside a link.
- One primary action; secondary actions in a menu.

## 8. Status badge

- Short label plus colour plus, where meaning matters, an icon: "Failed" in danger colour with an icon, not a red dot alone.
- Badge text meets 4.5:1 against the badge background.

## 9. Inline alert and toast

- Inline alert: sits next to what it describes; `role="alert"` only for urgent, time-sensitive messages (APG alert pattern), otherwise a polite live region or static text.
- Toast: confirms an action the user took; does not take focus; is dismissible; stays long enough to read; never the only place an error appears. Provide an undo action for reversible destructive actions instead of a confirmation dialog where the design system supports it.

## 10. Skeleton

- Same size and layout as the content it stands for, so nothing shifts when data arrives.
- Animation respects reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

- The region being loaded gets `aria-busy="true"`; screen readers get one "Loading" announcement, not one per placeholder.

## 11. Visually hidden text

Text for assistive technology that should not be visible (for example a label for an icon-only control when `aria-label` will not do):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Tailwind ships an equivalent `sr-only` utility; most design systems ship a VisuallyHidden component. Use the project's.
