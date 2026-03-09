# UX Pattern Libraries

Exhaustive reference organized by project classification and UI pattern category. Every component you produce should trace to a pattern documented here.

## How to Use This File

1. Determine your project classification (SaaS, Game, Marketing, Developer Tool, E-commerce, General)
2. Locate the pattern category for what you are building (navigation, forms, data tables, etc.)
3. Study the pattern's key elements, spacing values, typography specs, and structural outline
4. Adopt the pattern. Adapt only what the specific context demands.

---

## Pattern Categories Index

| Category | Coverage | Prevalent In |
|---|---|---|
| [Navigation](#navigation-patterns) | Sidebars, top bars, breadcrumbs, tabs, command palettes | All classifications |
| [Forms](#form-patterns) | Inputs, validation, multi-step, search | All classifications |
| [Data Display](#data-display-patterns) | Tables, cards, lists, grids, statistics | SaaS, Developer Tools, E-commerce |
| [Dashboards](#dashboard-patterns) | Metric tiles, charts, activity feeds | SaaS, Developer Tools |
| [Modals and Overlays](#modal-and-overlay-patterns) | Modals, drawers, popovers, tooltips, toasts | All classifications |
| [Onboarding](#onboarding-patterns) | Welcome sequences, progress indicators, empty states | SaaS, E-commerce |
| [Authentication](#authentication-patterns) | Login, registration, password recovery, MFA | All classifications |
| [Settings](#settings-patterns) | Preferences, account, billing, integrations | SaaS, Developer Tools |
| [Search](#search-patterns) | Search bars, filters, results, autocomplete | All classifications |
| [Notifications](#notification-patterns) | Toasts, banners, badges, notification centers | All classifications |
| [Empty States](#empty-state-patterns) | No data, first use, error, no search results | All classifications |
| [Error Pages](#error-page-patterns) | 404, 500, maintenance, permission denied | All classifications |
| [Loading States](#loading-state-patterns) | Skeletons, spinners, progress bars, shimmer | All classifications |
| [Hero Sections](#hero-section-patterns) | Headlines, CTAs, feature showcases | Marketing, E-commerce |
| [Product Display](#product-display-patterns) | Product cards, galleries, pricing, reviews | E-commerce |
| [Game UI](#game-ui-patterns) | HUDs, inventories, skill trees, menus | Games |

---

## Navigation Patterns

### Sidebar Navigation (SaaS / Dashboard)

**Purpose:** Primary navigation for content-rich applications with 5+ top-level sections.

**Key elements:**
- Fixed sidebar (240-280px wide), collapsible to icon-only mode (64-72px)
- Logo or brand mark at top (32-40px height)
- Nav items: icon (20px) + label, 40-44px row height
- Active indicator: background highlight + left-edge accent or filled background
- Section dividers with subtle group labels (uppercase, 11-12px, muted color)
- User avatar and account menu anchored to bottom
- Hover response on all items (subtle background shift)

**Spacing:**
- Sidebar horizontal padding: 12-16px
- Gap between nav items: 2-4px
- Section group label: 24px top margin, 8px bottom margin
- Icon-to-label gap: 12px

**Typography:**
- Nav item labels: 14px, weight 500
- Section group labels: 11-12px, weight 600, uppercase, muted color
- Active item label: 14px, weight 600

**Structural outline:**
```
sidebar (fixed, 256px wide, full viewport height)
  brand-area (padding: 16px, height: 64px)
    logo (max-height: 32px)
  nav-group
    group-label ("WORKSPACE", uppercase, muted)
    nav-item (icon + "Overview", active indicator)
    nav-item (icon + "Projects")
    nav-item (icon + "Reports")
  nav-group
    group-label ("CONFIGURATION")
    nav-item (icon + "Account")
    nav-item (icon + "Billing")
  account-menu (bottom, border-top)
    avatar (32px) + name + chevron
```

### Top Navigation Bar (Marketing / General)

**Purpose:** Horizontal navigation for sites with few top-level destinations.

**Key elements:**
- Fixed to top, 56-72px height, full viewport width
- Logo left-aligned, nav items centered or right-aligned, CTA button far right
- Nav items: text links, 14-16px, weight 500
- Active indicator: underline or color change (never both simultaneously)
- Mobile transformation: hamburger menu at 768px breakpoint
- Subtle bottom border or shadow for depth

**Spacing:**
- Container max-width: 1280px, centered
- Logo to first nav item: 32-48px
- Between nav items: 24-32px
- CTA button horizontal padding: 16-24px
- Vertical padding: 16-20px

**Typography:**
- Nav items: 14-16px, weight 500
- CTA: 14px, weight 600, optional uppercase

### Breadcrumbs

**Purpose:** Indicate current location in hierarchy, enable rapid backtracking.

**Key elements:**
- Horizontal chain: Home > Section > Subsection > Current
- Separator: `/` or `>` or chevron icon
- Current item: not linked, bolder or darker text
- All preceding items: links, muted color
- Truncate with `...` when exceeding 4-5 levels

**Spacing:**
- Between items and separator: 8px
- Below breadcrumbs to page content: 16-24px
- Total height: 32-40px

### Tab Navigation

**Purpose:** Switch between views within the same page context.

**Key elements:**
- Horizontal row of tabs, left-aligned
- Active tab: bottom border (2-3px, accent color) or filled background
- Inactive tabs: muted text, no border
- Content area below, border-top aligned with tab row
- Maximum 6-7 tabs (beyond that, use dropdown or sidebar)

**Spacing:**
- Tab horizontal padding: 12-16px, vertical: 8-12px
- Between tabs: 0 (tabs adjoin) or 4px gap
- Below tabs to content: 24px

---

## Form Patterns

### Stacked Form (Standard)

**Purpose:** The default form layout, one field per row.

**Key elements:**
- Labels above inputs (never placeholder-only)
- Required indicator: asterisk or "(required)" text
- Helper text below input (muted, smaller)
- Error text below input (red, replaces helper text)
- Input height: 36-40px
- Submit button at bottom, left-aligned (not centered)
- Logical field grouping with section headings

**Spacing:**
- Label to input: 4-6px
- Input to helper/error text: 4px
- Between fields: 16-24px
- Between sections: 32-40px
- Submit button top margin: 24-32px

**Typography:**
- Labels: 14px, weight 500
- Input text: 14-16px, weight 400
- Helper text: 12-13px, muted color
- Error text: 12-13px, error color
- Section headings: 16-18px, weight 600

**Structural outline:**
```
form (max-width: 480-560px single column)
  fieldset
    legend ("Credentials", weight 600)
    field
      label ("Email address *")
      input (type=email, 40px height)
      helper-text ("Your work email address")
    field
      label ("Password *")
      input (type=password)
      error-text ("Minimum 8 characters required")
  fieldset
    legend ("Personal Details")
    field
      label ("Full name")
      input (type=text)
  action-row
    button-primary ("Create account")
    link ("Already registered? Sign in")
```

### Inline Form

**Purpose:** Compact forms for simple inputs (search, subscribe, quick add).

**Key elements:**
- Label + input + button arranged horizontally
- No helper text (insufficient space)
- Validation on submit, not inline
- Clear visual grouping (shared border or background)

**Spacing:**
- Input to button gap: 0 (visually connected) or 8px
- Input minimum width: 200px
- Button horizontal padding: 12-16px

### Multi-Step Form (Wizard)

**Purpose:** Complex forms with 8+ fields, reducing cognitive load per step.

**Key elements:**
- Progress indicator at top (numbered steps or progress bar)
- One logical group per step (3-5 fields maximum)
- Back + Next buttons (Back is secondary/ghost, Next is primary)
- Summary/review step before final submission
- Data persisted between steps (never lost on navigation)
- Step indicator distinguishes completed, current, and upcoming

**Spacing:**
- Progress indicator total height: 48-64px including margins
- Progress indicator to form content: 32px
- Back/Next buttons: 32px top margin, 16px gap between buttons

---

## Data Display Patterns

### Data Table

**Purpose:** Present structured data for scanning, sorting, and filtering.

**Key elements:**
- Column headers: sortable (click to toggle), bold or semibold, optional uppercase
- Row height: 48-56px for comfortable scanning
- Row separation: alternating backgrounds OR borders between rows (never both)
- Hover indicator on rows (subtle background shift)
- Pagination or infinite scroll at bottom
- Bulk actions toolbar (appears when rows are selected)
- Empty state when no data matches
- Loading state: skeleton rows matching column structure

**Spacing:**
- Cell padding: 12-16px horizontal, 12px vertical
- Header padding: 12-16px horizontal, 12-16px vertical
- Table to pagination gap: 16px
- Table container: horizontal scroll on narrow viewports

**Typography:**
- Headers: 12-13px, weight 600, uppercase, muted color (tracking: 0.05em)
- Cell text: 14px, weight 400
- Cell secondary text: 13px, muted color
- Pagination: 14px

**Structural outline:**
```
table-container
  toolbar (optional: search, filters, bulk actions)
  table
    thead
      tr
        th ("Name", sortable, left-aligned)
        th ("Status", sortable)
        th ("Created", sortable)
        th ("Actions", right-aligned)
    tbody
      tr (hover: bg-gray-50)
        td (avatar + name + email stack)
        td (status pill: green/amber/red)
        td ("Jan 15, 2026", muted)
        td (icon buttons: edit, remove)
  pagination
    "Showing 1-10 of 312"
    prev/next buttons + page numbers
```

### Card Grid

**Purpose:** Display items with visual previews and variable content length.

**Key elements:**
- Responsive grid: 1-4 columns depending on viewport
- Card: border or shadow, border-radius, overflow hidden
- Image or preview at top (16:9 or 4:3 ratio, consistent)
- Content area: title, description (2-3 lines max, truncated), metadata
- Action area: buttons or links, consistent placement
- Hover: subtle shadow increase or border color shift

**Spacing:**
- Grid gap: 16-24px
- Card content padding: 16-20px
- Title to description: 8px
- Description to metadata: 12px
- Metadata to actions: 16px

### Metric Tile

**Purpose:** Display KPIs and statistics at a glance.

**Key elements:**
- Compact card with a single metric
- Label (what is measured), value (the number), trend (up/down + percentage)
- Optional sparkline or mini chart
- Grid of 3-4 tiles across on desktop

**Spacing:**
- Tile padding: 20-24px
- Label to value: 4-8px
- Value to trend: 8px
- Grid gap: 16-24px

**Typography:**
- Label: 13-14px, muted color, weight 500
- Value: 28-36px, weight 700 or 600
- Trend: 13px, green (up) or red (down)

---

## Dashboard Patterns

### Overview Dashboard

**Purpose:** Landing view displaying key metrics and recent activity.

**Structural outline:**
```
page
  page-header
    title ("Dashboard")
    date-range-selector
  metrics-grid (3-4 metric tiles)
  main-content (2 columns on desktop)
    column-primary (65-70% width)
      chart-card (line/bar chart, 300-400px height)
      recent-activity-list
    column-secondary (30-35% width)
      quick-actions-card
      alerts-card
```

**Governing principles:**
- Highest-priority metrics at top
- Charts should communicate trends, not just current values
- Recent activity conveys a sense of "what is happening now"
- Quick actions minimize clicks for frequent tasks

**Spacing:**
- Page padding: 24-32px
- Between sections: 24-32px
- Chart card padding: 24px
- Between metric tiles: 16-24px

---

## Modal and Overlay Patterns

### Confirmation Modal

**Purpose:** Confirm destructive or irreversible actions.

**Key elements:**
- Overlay: semi-transparent black (opacity 0.3-0.5)
- Modal: centered, max-width 400-480px, border-radius, shadow
- Severity indicator via icon or color (red for destructive)
- Title: clear action description ("Remove this workspace?")
- Description: consequences explained plainly
- Buttons: Cancel (secondary/ghost) + Confirm (primary or destructive)
- Cancel positioned left/first, destructive action positioned right/last
- Dismiss via Escape key and overlay click (unless destructive)

**Spacing:**
- Modal padding: 24px
- Title to description: 8px
- Description to buttons: 24px
- Between buttons: 12px
- Button minimum width: 80px

### Drawer / Side Panel

**Purpose:** Detail view or secondary content without losing page context.

**Key elements:**
- Slides in from right (or left for navigation), 320-480px wide
- Overlay behind on mobile, push-content on desktop optional
- Header with title and close button
- Scrollable content area
- Optional footer with action buttons

**Spacing:**
- Header padding: 16-20px, border-bottom
- Content padding: 16-24px
- Footer padding: 16-20px, border-top

### Toast / Notification

**Purpose:** Temporary feedback messages (success, error, informational).

**Key elements:**
- Position: top-right or bottom-right, fixed
- Stack multiple toasts with 8px gap
- Auto-dismiss: 3-5 seconds (never auto-dismiss errors)
- Icon + message + optional action link + close button
- Color-coded left border or background by type

**Spacing:**
- Toast padding: 12-16px
- Distance from viewport edge: 16-24px
- Icon to message: 12px
- Between stacked toasts: 8px
- Max-width: 400px

---

## Onboarding Patterns

### Welcome Sequence

**Purpose:** Guide new users through initial setup.

**Key elements:**
- Progress indicator (numbered steps or progress bar)
- One task per step (prevent overwhelm)
- Skip option for non-critical steps
- Illustration or icon per step (optional but effective)
- Value proposition per step ("This helps you...")
- Final step: celebration + clear next action

**Structural outline:**
```
onboarding-container (max-width: 640px, centered)
  progress (step 2 of 4)
  step-content
    illustration (max-height: 200px)
    heading ("Configure your workspace")
    description ("Workspaces help you organize...")
    form-fields (relevant to this step)
  action-row
    button-ghost ("Skip")
    button-primary ("Continue")
```

---

## Authentication Patterns

### Login Page

**Purpose:** User authentication entry point.

**Key elements:**
- Centered card, max-width 400px
- Logo at top
- Email + password fields
- "Remember me" checkbox (optional)
- "Forgot password?" link near password field
- Submit button full-width
- Social login buttons below (if applicable), separated by "or" divider
- Registration link below

**Spacing:**
- Card padding: 32-40px
- Between fields: 16-20px
- Form to social login: 24px with divider
- Logo bottom margin: 24-32px

**Typography:**
- Page heading: 24-28px, weight 700
- Subheading: 14-16px, muted
- Labels: 14px, weight 500
- Links: 14px, primary color
- Social buttons: 14px, weight 500

---

## Settings Patterns

### Settings Page

**Purpose:** User, account, and application configuration.

**Key elements:**
- Sidebar navigation for setting categories (or tabs on smaller screens)
- Content area: section headings + form fields
- Save button per section (not one global save)
- Confirmation dialog for destructive settings (delete account)
- Toast feedback on successful save

**Structural outline:**
```
settings-layout
  settings-nav (200-240px sidebar)
    nav-item ("Profile", active)
    nav-item ("Account")
    nav-item ("Notifications")
    nav-item ("Billing")
    nav-item ("Danger Zone", red text)
  settings-content (max-width: 640px)
    section
      heading ("Profile Information")
      description ("Update your personal details", muted)
      form-fields
      button-primary ("Save changes")
    section
      heading ("Danger Zone", red)
      description
      button-destructive ("Delete account")
```

---

## Search Patterns

### Search Bar

**Purpose:** Help users find content rapidly.

**Key elements:**
- Search icon inside input (left side)
- Placeholder text describing searchable content
- Clear button appears when text is entered (X icon, right side)
- Results dropdown on input (debounced 150-300ms)
- Keyboard shortcut hint (Cmd+K or /)
- Recent searches shown on empty focus

**Spacing:**
- Input height: 40-44px (larger for prominent search: 48-56px)
- Icon inset: 12px from edge
- Results dropdown: 8px below, full width of input, max-height 400px

### Search Results

**Key elements:**
- Result count at top
- Each result: title (linked), excerpt with highlighted matches, metadata
- Pagination or "Load more"
- Filters sidebar or inline filter bar
- "No results" state with alternative suggestions

---

## Empty State Patterns

### First-Use Empty State

**Purpose:** Guide users when they have not yet created any content.

**Key elements:**
- Illustration or icon (subtle, not overwhelming)
- Heading explaining what will appear here
- Description with value proposition
- Primary CTA to create first item
- Optional secondary link to documentation

**Structural outline:**
```
empty-state (centered, max-width: 400px)
  illustration (120-160px, muted colors)
  heading ("No workflows yet")
  description ("Workflows automate your repetitive tasks. Create your first one to get started.")
  button-primary ("Create workflow")
  link ("Learn more about workflows")
```

**Spacing:**
- Illustration bottom margin: 24px
- Heading to description: 8px
- Description to CTA: 24px
- Overall: centered vertically and horizontally in available space

### No Search Results

**Key elements:**
- Clear message: "No results for [query]"
- Suggestions for alternative search terms
- Link to browse all items
- Optional: related or similar results

---

## Error Page Patterns

### 404 Not Found

**Key elements:**
- Large, unambiguous "404" or "Page not found"
- Brief, friendly explanation
- Search bar or link to homepage
- Optional: suggested destinations

### 500 Server Error

**Key elements:**
- Apologetic but not alarming message
- Link to status page if available
- Retry button
- Contact support link

---

## Loading State Patterns

### Skeleton Screen (Preferred)

**Purpose:** Display content structure while loading, minimizing perceived wait time.

**Key elements:**
- Gray blocks matching actual content layout precisely
- Subtle pulse or shimmer animation (left to right)
- Blocks match real content dimensions (not generic rectangles)
- Appears within 200ms, actual content replaces skeletons on load

**Structural outline:** Mirror the real content layout:
```
skeleton-card
  skeleton-image (rectangle, aspect ratio matching real image)
  skeleton-title (rectangle, 60-80% width, 20px height)
  skeleton-text (rectangle, 100% width, 14px height)
  skeleton-text (rectangle, 40% width, 14px height)
```

### Spinner (Sparingly)

**When appropriate:** Only for actions where content structure is unknown (submitting, processing).
- Size: 16-20px for inline, 32-40px for page-level
- Color: primary or muted (never multicolored)
- Always paired with text ("Saving...", "Processing...")
- Timeout: display error state after 10-15 seconds

### Progress Bar

**When appropriate:** Long operations with deterministic progress (uploads, imports).
- Display percentage or step count
- Estimated remaining time for long operations
- Determinate (known progress) preferred over indeterminate

---

## Hero Section Patterns

### Primary Hero (Marketing)

**Purpose:** First impression, communicate value proposition, drive conversion.

**Key elements:**
- Headline: 40-60px, bold, maximum 10 words
- Subheading: 18-22px, muted, 1-2 sentences maximum
- Primary CTA button: large (48-56px height), contrasting color
- Optional secondary CTA: text link or ghost button
- Hero image, illustration, or product screenshot on right
- Social proof below (logos, testimonials, statistics)

**Spacing:**
- Container max-width: 1280px
- Vertical padding: 80-120px
- Headline to subheading: 16-24px
- Subheading to CTA: 32px
- Between CTAs: 16px
- Text column: 50-60% width on desktop

---

## Product Display Patterns

### Product Card (E-commerce)

**Key elements:**
- Product image (1:1 or 4:3 ratio, consistent across grid)
- Product name (16px, weight 500, 2 lines maximum)
- Price (16-18px, weight 700), strikethrough for original price on sale
- Rating stars (optional, 14px)
- Quick-add button or hover overlay
- Badge for "Sale", "New", "Sold Out"

**Spacing:**
- Card padding: 0 (image full-bleed) + 12-16px (content area)
- Name to price: 4-8px
- Grid gap: 16-24px
- Image to content: 12px

### Pricing Table

**Key elements:**
- 2-4 tiers arranged side by side
- Highlighted recommended tier (distinct border, shadow, or background)
- Plan name, price (large), billing period
- Feature checklist with check/X icons
- CTA button per tier
- Enterprise or custom tier with "Contact us"

---

## Game UI Patterns

### Main Menu

**Key elements:**
- Full-screen background (animated or parallax)
- Game logo, prominent and centered at top
- Menu items: large text (20-28px), stacked vertically, center-aligned
- Hover effects: glow, scale, color shift, audio cue
- Version number: bottom corner, small, muted

### HUD (Heads-Up Display)

**Key elements:**
- Health/mana bars: top-left, horizontal or circular
- Score or currency: top-right
- Minimap: bottom-right corner
- Abilities or skills: bottom-center, with hotkey labels
- All elements have subtle background for readability over game scene
- Minimal chrome, maximum game visibility

### Inventory Grid

**Key elements:**
- Grid of uniform slots (48-64px each)
- Item icon + stack count
- Rarity border color (common gray, uncommon green, rare blue, epic purple, legendary orange)
- Hover: tooltip with item details
- Drag-and-drop between slots
- Empty slot: subtle border, darker background

---

## Cross-Cutting Concerns

These apply to ALL patterns regardless of project classification.

### Responsive Behavior

| Breakpoint | Columns | Sidebar | Navigation |
|---|---|---|---|
| Mobile (< 640px) | 1 | Hidden or drawer | Hamburger |
| Tablet (640-1024px) | 2 | Collapsed to icons | Tabs or hamburger |
| Desktop (> 1024px) | 3-4 | Fully expanded | Complete nav |

### Accessibility Imperatives

Every pattern must include:
- Focus indicators on all interactive elements (2px outline, primary color)
- Keyboard navigation (Tab, Enter, Escape, Arrow keys where appropriate)
- ARIA labels for icons and non-text content
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Screen reader announcements for dynamic content (toasts, modals)
- Reduced motion support (`prefers-reduced-motion` media query)

### Interaction States

Every interactive element must define:
- **Default:** Baseline appearance
- **Hover:** Subtle shift (background, shadow, or color)
- **Focus:** Visible outline (`:focus-visible`, not just `:focus`)
- **Active/Pressed:** Slight scale-down or darker shade
- **Disabled:** Reduced opacity (0.5-0.6), no pointer events, not focusable
- **Loading:** Spinner or skeleton, interaction blocked
