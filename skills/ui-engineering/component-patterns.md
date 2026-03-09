# Component Blueprints

Reusable structural patterns with accessibility wired in from the start. Framework-agnostic HTML/CSS that adapts to React, Vue, Svelte, or vanilla JavaScript.

## Action Elements

### Primary Action Button
```html
<button class="action action-primary" type="button">
  Confirm changes
</button>
```
```css
.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: var(--button-height-md);
  padding: 0 var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast), box-shadow var(--transition-fast);
}
.action:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
.action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.action-primary {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
}
.action-primary:hover:not(:disabled) {
  background: var(--color-primary-700);
}
.action-primary:active:not(:disabled) {
  background: var(--color-primary-800);
}
```

### Outlined Action Button
```css
.action-outlined {
  background: transparent;
  color: var(--color-primary-600);
  border: 1px solid var(--color-primary-600);
}
.action-outlined:hover:not(:disabled) {
  background: var(--color-primary-50);
}
```

### Subtle Action Button
```css
.action-subtle {
  background: transparent;
  color: var(--color-text-secondary);
}
.action-subtle:hover:not(:disabled) {
  background: var(--color-neutral-100);
}
```

### Danger Action Button
```css
.action-danger {
  background: var(--color-error);
  color: var(--color-text-inverse);
}
.action-danger:hover:not(:disabled) {
  background: #b91c1c; /* error-700 */
}
```

### Action Button with Leading Icon
```html
<button class="action action-primary" type="button">
  <svg aria-hidden="true" class="action-icon"><!-- icon SVG --></svg>
  Confirm changes
</button>
```

### Icon-Only Action Button
```html
<button class="action action-subtle action-square" type="button" aria-label="Dismiss panel">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>
```
```css
.action-square {
  width: var(--button-height-md);
  padding: 0;
}
```

### Action Button Sizes
```css
.action-sm { height: var(--button-height-sm); padding: 0 var(--space-3); font-size: var(--text-sm); }
.action-md { height: var(--button-height-md); padding: 0 var(--space-4); font-size: var(--text-base); }
.action-lg { height: var(--button-height-lg); padding: 0 var(--space-6); font-size: var(--text-lg); }
```

---

## Input Elements

### Text Field with Label
```html
<div class="input-group">
  <label for="username" class="input-label">
    Username <span class="input-required" aria-hidden="true">*</span>
  </label>
  <input
    id="username"
    type="text"
    class="input-control"
    required
    aria-required="true"
    aria-describedby="username-hint"
  />
  <p id="username-hint" class="input-hint">Choose a unique handle for your account.</p>
</div>
```
```css
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.input-label {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}
.input-required {
  color: var(--color-error);
}
.input-control {
  height: var(--input-height-md);
  padding: 0 var(--space-3);
  font-size: var(--text-base);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.input-control:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
.input-control[aria-invalid="true"] {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px var(--color-error-light);
}
.input-hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.input-error {
  font-size: var(--text-sm);
  color: var(--color-error);
}
```

### Validation Error State
```html
<div class="input-group">
  <label for="username" class="input-label">Username *</label>
  <input
    id="username"
    type="text"
    class="input-control"
    aria-invalid="true"
    aria-describedby="username-err"
  />
  <p id="username-err" class="input-error" role="alert">
    This username is already taken.
  </p>
</div>
```

### Dropdown Select
```html
<div class="input-group">
  <label for="region" class="input-label">Region</label>
  <select id="region" class="input-control input-select">
    <option value="">Choose a region</option>
    <option value="na">North America</option>
    <option value="eu">Europe</option>
  </select>
</div>
```

### Toggle Checkbox
```html
<div class="input-toggle">
  <input id="notifications" type="checkbox" class="input-checkbox" />
  <label for="notifications" class="input-toggle-label">Enable email notifications</label>
</div>
```

---

## Navigation Elements

### Sidebar Navigation
```html
<aside class="sidebar" aria-label="Primary navigation">
  <div class="sidebar-brand">
    <img src="logo.svg" alt="Application name" class="sidebar-logo" />
  </div>
  <nav class="sidebar-nav">
    <div class="sidebar-group">
      <span class="sidebar-group-label">Main</span>
      <a href="/overview" class="sidebar-item active" aria-current="page">
        <svg aria-hidden="true" class="sidebar-icon"><!-- icon --></svg>
        Overview
      </a>
      <a href="/workflows" class="sidebar-item">
        <svg aria-hidden="true" class="sidebar-icon"><!-- icon --></svg>
        Workflows
      </a>
    </div>
  </nav>
  <div class="sidebar-account">
    <button class="sidebar-profile" aria-haspopup="true">
      <img src="avatar.jpg" alt="" class="sidebar-avatar" />
      <span>Alex Rivera</span>
    </button>
  </div>
</aside>
```
```css
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}
.sidebar-brand {
  padding: var(--space-4);
  height: var(--topbar-height);
  display: flex;
  align-items: center;
}
.sidebar-group-label {
  display: block;
  padding: var(--space-6) var(--space-4) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.sidebar-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
.sidebar-item.active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: var(--font-semibold);
}
.sidebar-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
.sidebar-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
}
```

### Horizontal Navigation Bar
```html
<header class="navbar">
  <div class="navbar-inner">
    <a href="/" class="navbar-brand">
      <img src="logo.svg" alt="Company" />
    </a>
    <nav class="navbar-links" aria-label="Primary navigation">
      <a href="/product" class="navbar-link">Product</a>
      <a href="/pricing" class="navbar-link">Pricing</a>
      <a href="/docs" class="navbar-link">Documentation</a>
    </nav>
    <div class="navbar-actions">
      <a href="/login" class="action action-subtle">Sign in</a>
      <a href="/register" class="action action-primary">Get started</a>
    </div>
  </div>
</header>
```

---

## Data Display Elements

### Tabular Data
```html
<div class="table-wrap" role="region" aria-label="Team members" tabindex="0">
  <table class="data-table">
    <thead>
      <tr>
        <th scope="col">
          <button class="table-sort" aria-sort="ascending">
            Name <svg aria-hidden="true"><!-- sort indicator --></svg>
          </button>
        </th>
        <th scope="col">Role</th>
        <th scope="col">Joined</th>
        <th scope="col"><span class="sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="table-stack">
            <span class="table-primary">Alex Rivera</span>
            <span class="table-secondary">alex@company.com</span>
          </div>
        </td>
        <td><span class="pill pill-positive">Admin</span></td>
        <td class="table-muted">Jan 15, 2026</td>
        <td class="table-actions">
          <button class="action action-subtle action-square action-sm" aria-label="Edit Alex Rivera">
            <svg aria-hidden="true"><!-- pencil icon --></svg>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```
```css
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-base);
}
.data-table thead th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}
.data-table tbody td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}
.data-table tbody tr:hover {
  background: var(--color-bg-secondary);
}
.table-stack {
  display: flex;
  flex-direction: column;
}
.table-primary {
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}
.table-secondary {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.table-muted {
  color: var(--color-text-secondary);
}
.table-actions {
  text-align: right;
}
```

### Content Card
```html
<article class="content-card">
  <div class="content-card-media">
    <img src="thumbnail.jpg" alt="Project thumbnail" />
  </div>
  <div class="content-card-body">
    <h3 class="content-card-title">Workflow Automation</h3>
    <p class="content-card-summary">A streamlined pipeline that reduces manual steps by 70% across deployment workflows.</p>
  </div>
  <div class="content-card-meta">
    <span class="content-card-timestamp">Modified 3 hours ago</span>
    <a href="/project/42" class="action action-subtle action-sm">Open</a>
  </div>
</article>
```
```css
.content-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-primary);
  transition: box-shadow var(--transition-normal);
}
.content-card:hover {
  box-shadow: var(--shadow-md);
}
.content-card-media img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}
.content-card-body {
  padding: var(--space-4);
  flex: 1;
}
.content-card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}
.content-card-summary {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}
.content-card-meta {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.content-card-timestamp {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
```

---

## Feedback Elements

### Status Pill
```html
<span class="pill pill-positive">Active</span>
<span class="pill pill-caution">Pending</span>
<span class="pill pill-negative">Revoked</span>
<span class="pill pill-neutral">Archived</span>
```
```css
.pill {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
}
.pill-positive { background: var(--color-success-light); color: var(--color-success); }
.pill-caution  { background: var(--color-warning-light); color: var(--color-warning); }
.pill-negative { background: var(--color-error-light);   color: var(--color-error);   }
.pill-neutral  { background: var(--color-neutral-100);    color: var(--color-neutral-600); }
```

### Inline Notification
```html
<div class="inline-notice inline-notice-positive" role="alert" aria-live="polite">
  <svg aria-hidden="true" class="inline-notice-icon"><!-- checkmark --></svg>
  <div class="inline-notice-body">
    <p class="inline-notice-text">Configuration saved successfully.</p>
  </div>
  <button class="inline-notice-dismiss" aria-label="Dismiss notification">
    <svg aria-hidden="true"><!-- X icon --></svg>
  </button>
</div>
```

---

## Overlay Elements

### Confirmation Dialog
```html
<div class="overlay-backdrop" aria-hidden="true"></div>
<dialog class="overlay-dialog" aria-labelledby="dialog-heading" aria-describedby="dialog-body">
  <div class="overlay-header">
    <h2 id="dialog-heading" class="overlay-title">Remove workspace?</h2>
    <button class="action action-subtle action-square action-sm" aria-label="Close">
      <svg aria-hidden="true"><!-- X --></svg>
    </button>
  </div>
  <div class="overlay-body">
    <p id="dialog-body">This will permanently delete all projects and data in this workspace. This cannot be undone.</p>
  </div>
  <div class="overlay-actions">
    <button class="action action-subtle">Cancel</button>
    <button class="action action-danger">Remove workspace</button>
  </div>
</dialog>
```
```css
.overlay-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 480px);
  max-height: 85vh;
  overflow-y: auto;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-modal);
  padding: 0;
}
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: var(--z-modal-backdrop);
}
.overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) var(--space-6) 0;
}
.overlay-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0;
}
.overlay-body {
  padding: var(--space-4) var(--space-6);
  color: var(--color-text-secondary);
}
.overlay-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: 0 var(--space-6) var(--space-6);
}
```

**Accessibility imperatives:**
- Focus traps inside dialog when open
- Escape key dismisses the dialog
- Focus returns to the triggering element on close
- `aria-labelledby` references the heading
- `aria-describedby` references the body text
- Background content marked with `aria-hidden="true"` and `inert`

---

## Utility Patterns

### Screen Reader Only
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
  border-width: 0;
}
```

### Content Placeholder (Skeleton)
```css
.placeholder {
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
  animation: placeholder-shimmer 2s ease-in-out infinite;
}
.placeholder-line {
  height: 1em;
  margin-bottom: var(--space-2);
}
.placeholder-line:last-child {
  width: 60%;
}
.placeholder-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
}
@keyframes placeholder-shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```
