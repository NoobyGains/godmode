# UI pattern library

The sources in section 1 were opened on 2026-10-25. The pattern notes in sections 2 to 11 are condensed from them; where a rule comes from a specific page, the page is linked. When a project already uses a design system, its own component guidance overrides these notes.

Contents: 1. Sources · 2. Navigation · 3. Forms · 4. Data display · 5. Dashboards · 6. Overlays and feedback · 7. Empty, loading and error states · 8. Auth, onboarding and settings · 9. Search · 10. Marketing and commerce · 11. Games and CLIs · 12. Cross-cutting rules

## 1. Sources

| Source | Best for | URL |
|---|---|---|
| WAI-ARIA Authoring Practices Guide (APG) | Keyboard and screen-reader behaviour for widgets: dialog, tabs, menu button, combobox, disclosure, grid, table, breadcrumb, alert, feed | https://www.w3.org/WAI/ARIA/apg/patterns/ |
| WCAG 2.2 | The accessibility success criteria themselves | https://www.w3.org/TR/WCAG22/ |
| GOV.UK Design System | Forms, question pages, validation and error messages, tables; heavily user-researched | https://design-system.service.gov.uk/patterns/ |
| Material Design 3 | Component specs for Android and the web | https://m3.material.io/components |
| Apple Human Interface Guidelines | Platform conventions for iOS, iPadOS, macOS, watchOS, visionOS | https://developer.apple.com/design/human-interface-guidelines/patterns |
| IBM Carbon | Enterprise and data-dense UI: data tables, empty states, loading | https://carbondesignsystem.com |
| Atlassian Design System | Collaboration and product UI components | https://atlassian.design/components |
| Shopify Polaris | Commerce admin UI; Polaris React is deprecated in favour of Polaris web components | https://polaris.shopify.com · https://shopify.dev/docs/api/app-home/polaris-web-components |
| Nielsen Norman Group | Research-backed usability articles | https://www.nngroup.com/articles/ |
| Mobbin | Screenshots and flows from shipped apps and sites | https://mobbin.com |
| Laws of UX | Short summaries of perception and decision heuristics (Hick's law, Fitts's law) | https://lawsofux.com |
| Command Line Interface Guidelines | Human-first CLI design | https://clig.dev |

## 2. Navigation

**Sidebar (apps, dashboards).** Persistent vertical list of top-level sections, current item clearly marked (`aria-current="page"`), grouped with headings when there are more than about seven items, collapsible to icons on medium widths, moved into a drawer on small widths. Account and settings at the bottom or in the top bar, not mixed into the section list.

**Top bar (marketing, simple apps).** Logo left, a handful of primary links, one primary call to action on the right. On small widths, links move into a menu button that follows the APG menu or disclosure pattern. <!-- https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ -->

**Breadcrumbs.** For deep hierarchies only; a `nav` with an accessible name, the current page last and marked with `aria-current`. <!-- https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/ -->

**Tabs.** For switching between peer views of the same object, not for navigation between pages. Arrow keys move between tabs; Tab moves into the panel. <!-- https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ -->

## 3. Forms

**Layout.** Single column, labels above fields, related fields grouped in a `fieldset` with a `legend`, form width constrained to a readable measure. Mark optional fields "(optional)" rather than marking every required field, or follow the design system's rule. Placeholder text is never the only label. <!-- https://www.w3.org/WAI/tutorials/forms/ -->

**One thing per page for long flows.** GOV.UK's question-page pattern asks one question per page with a back link and a single "Continue" button; it scales well to multi-step flows (wizards, checkouts). <!-- https://design-system.service.gov.uk/patterns/question-pages/ -->

**Validation.** <!-- https://design-system.service.gov.uk/patterns/validation/ -->
- Validate when the user submits or tries to continue, not when they leave a field, and not while they are still typing. GOV.UK's research found early validation causes problems, especially for slower typists.
- On failure: show the page again with the user's answers kept, prefix the page title with "Error: ", show an error summary at the top and move focus to it, and show an error message next to each failing field. <!-- https://design-system.service.gov.uk/components/error-summary/ -->
- Accept reasonable variations (spaces in postcodes or card numbers, pasted whitespace) instead of rejecting them.
- Do not use validation for eligibility or permission; send the user to a page that explains.

**Submission.** Disable double submission while the request is in flight and show progress on the button; announce the outcome to assistive technology.

**Sign-in forms.** Use the right `autocomplete` values and input types so password managers and autofill work. <!-- https://web.dev/articles/sign-in-form-best-practices -->

## 4. Data display

**Data table.** Real `<table>` markup with header cells; right-align numbers; sortable columns show their sort state; sticky header for long tables; row actions in a consistent last column or a row menu; pagination or virtualised scrolling for long sets; a toolbar for search, filters and bulk actions above the table. Interactive spreadsheets need the APG grid pattern; read-only tables use the table pattern. <!-- https://www.w3.org/WAI/ARIA/apg/patterns/table/ https://www.w3.org/WAI/ARIA/apg/patterns/grid/ https://carbondesignsystem.com/components/data-table/usage/ -->

On small screens, either let the table scroll horizontally inside its container, with the first column fixed, or switch to a stacked card per row. Choose one per table and keep it.

**Card grid.** Uniform cards in a responsive grid; one primary action per card; the whole card clickable only if there is a single action, with a real link inside.

**Metric tile.** Label, value, unit, comparison (delta and period), optional sparkline; the delta is never colour-only (add an arrow or sign).

## 5. Dashboards

Most important metrics in the top row; trends in the middle; detail tables below. Every chart has a title, units and a time range; filters that affect the whole page sit at the top and show their current values. Each tile has its own loading, empty and error state, so one failed query does not blank the page. Load with skeletons that match the final layout.

## 6. Overlays and feedback

**Modal dialog.** Use for a decision that must happen before continuing (confirm destructive action, short focused task). Focus moves into the dialog and is trapped there; Escape closes it; focus returns to the trigger on close; it has an accessible name. The native `<dialog>` element opened with `showModal()` gives much of this behaviour. <!-- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog --> Destructive confirmations name the object and the consequence ("Delete project 'Atlas'? This removes 312 files.") and put the destructive button in the destructive style.

**Non-modal alternatives.** Prefer a drawer or inline panel for tasks that need context from the page behind. NN/g describes when modal versus non-modal dialogs fit. <!-- https://www.nngroup.com/articles/modal-nonmodal-dialog/ -->

**Drawer / side panel.** Detail views and secondary editing while keeping the list visible; same focus rules as a dialog when it is modal.

**Toast / notification.** Brief, non-blocking confirmation of something the user did; never the only place an error is reported; does not steal focus; stays long enough to read and can be dismissed; important messages use a live region or the APG alert pattern. <!-- https://www.w3.org/WAI/ARIA/apg/patterns/alert/ https://www.nngroup.com/articles/indicators-validations-notifications/ -->

## 7. Empty, loading and error states

**Empty states.** A blank area makes users wonder whether the system is still loading, failed, or was filtered wrongly. Say what would appear here, why it is empty, and offer the direct next action (create the first item, clear filters, import data). <!-- https://www.nngroup.com/articles/empty-state-interface-design/ https://carbondesignsystem.com/patterns/empty-states-pattern/ -->

Distinguish: first use (nothing created yet), no results (search or filters), cleared (user finished everything), and no permission.

**Loading.**
- Skeleton screens mimic the final layout and are used for full-page or full-region loads; frame-only skeletons (header and background, no content placeholders) are not recommended; animated shimmer can distract and should respect reduced-motion settings. <!-- https://www.nngroup.com/articles/skeleton-screens/ -->
- For waits longer than about 10 seconds, show a percent-done indicator and an estimate. <!-- https://www.nngroup.com/articles/progress-indicators/ -->
- Spinners for short, indeterminate waits on a single control or region.
- Keep layout stable while loading (reserve space) so content does not jump.

**Error pages.** Page not found: say so plainly, offer search and the main destinations. Service problem: apologise, say what to do and whether data was saved; never show stack traces. GOV.UK has separate patterns for "page not found", "there is a problem with the service" and "service unavailable". <!-- https://design-system.service.gov.uk/patterns/validation/ -->

## 8. Auth, onboarding and settings

**Sign-in.** One column, email then password (or a passwordless option), clear link to recovery, social sign-in buttons grouped and labelled, errors that do not reveal whether an account exists.

**Onboarding.** Ask only what is needed to deliver first value; let users skip and come back; show progress for multi-step setup; end on a populated, useful screen (use the empty-state pattern to guide the first action).

**Settings.** Grouped into sections with a section list or tabs; each setting has a label and a one-line description; say whether changes save immediately or on a save button, and be consistent; destructive account actions in a separate, clearly marked area.

## 9. Search

Search box with a visible label or accessible name and a submit control; recent and suggested queries in a combobox that follows the APG combobox pattern; results show the matched terms, the count, sorting and filters; a no-results state that suggests spelling fixes or broader filters. <!-- https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ -->

## 10. Marketing and commerce

**Hero.** One headline that says what the product does for whom, one supporting sentence, one primary call to action (a secondary one at most), and a real product image or screenshot. Common SaaS section order, seen across the galleries in `template-marketplaces.md`: hero, social proof, three or four core features, how it works, pricing, testimonials, FAQ, final call to action. Confirm the order against the niche's examples rather than assuming it.

**Pricing table.** Two to four tiers, the recommended one visually marked, the billing period explicit, the same feature rows in the same order in every column, and a call to action per tier.

**Product card.** Image with a fixed aspect ratio, name, price (with any discount shown honestly), rating if available, and one primary action; out-of-stock state designed.

## 11. Games and CLIs

**Game menus and HUD.** Large, high-contrast type over busy art (add a scrim); full keyboard and controller navigation with a visible focus state; critical status (health, ammo, objective) at the screen edges in consistent positions; pause and settings reachable at all times; respect reduced-motion and offer subtitle and colour-blind options.

**Inventory grid.** Fixed slot sizes, item tooltips on hover and focus, quantity badges, clear empty-slot appearance, drag and keyboard alternatives.

**CLI output.** Follow the Command Line Interface Guidelines: human-readable output by default with a machine-readable option, errors to stderr with a non-zero exit code, help that shows examples, colour only when the output is a terminal and the user has not disabled it. <!-- https://clig.dev -->

## 12. Cross-cutting rules

- **Interaction states** for every interactive element: default, hover, focus-visible, active, disabled, and loading where it triggers work.
- **Contrast**: text 4.5:1, large text 3:1, UI component boundaries and states 3:1 (WCAG 2.2 SC 1.4.3 and 1.4.11). <!-- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html -->
- **Target size**: at least 24 by 24 CSS pixels, or enough spacing (WCAG 2.2 SC 2.5.8). Platform guidelines may ask for more on touch devices. <!-- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html -->
- **Focus not obscured**: a focused element must not be entirely hidden by sticky headers, footers or banners (SC 2.4.11). <!-- https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html -->
- **Colour is never the only signal**: pair it with text, icons or patterns.
- **Responsive**: design small widths first, then add columns as space allows.
- **Choices**: fewer, clearer options decide faster (Hick's law); make frequent targets large and close (Fitts's law). <!-- https://lawsofux.com/hicks-law/ https://lawsofux.com/fittss-law/ -->
