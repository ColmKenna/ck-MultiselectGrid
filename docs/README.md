# Documentation

- Authoritative API/spec: `docs/spec.md`
- Change log (TDD journal): `docs/steps.md`

## Quick Usage

```html
<ck-multiselect-grid
  title="Select Items"
  description="Choose the items that apply to this client."
></ck-multiselect-grid>
```
```html
<ck-multiselect-grid
  title="Select Items"
  description="Choose the items that apply to this client."
  availableItems='["Item.Read","Item.Write"]'
  selectedItems='["Item.Write"]'
></ck-multiselect-grid>
```

### Attributes

- `availableItems` — JSON array of strings or option objects (`{ id?, name?, label?, value? }`) used to build the checkbox list
- `selectedItems` — JSON array of strings matching option `value` entries that should be checked; if a value is absent from `availableItems`, the component synthesizes a matching checkbox row so persisted selections never disappear

### Events

- `ck-multiselect-option-selected` — bubbles + composed, fired when a checkbox becomes checked. `event.detail` includes `{ option, checked: true }`.
- `ck-multiselect-option-unselected` — bubbles + composed, fired when a checkbox becomes unchecked. `event.detail` includes `{ option, checked: false }`.

## Styling

The Story-3 refresh ships a responsive checkbox grid: `.multiselect-grid` auto-fills columns (200–240px) above mobile, collapses to a single column below 576px, and respects a print-friendly block layout. Interactive states rely on CSS custom properties so host applications can theme the options without rewriting the stylesheet.

| Custom Property | Purpose |
|-----------------|---------|
| `--input-border` | Neutral border color for cards + inputs |
| `--card-bg` | Default background for `.multiselect-option` |
| `--surface-bg` | Hover background for cards |
| `--primary-color` | Accent color for hover/focus/checked states |
| `--focus-border` / `--focus-shadow` | Visible focus ring + shadow |
| `--option-pill-color` | Default pill text color |
| `--option-pill-active-bg` | Background when a card is checked |
| `--text-light` | Text color for checked pills |
| `--form-bg` | Disabled checkbox fill |

Set these properties on `ck-multiselect-grid` (or an ancestor) to align with your design system.

## Demo

Open `examples/demo.html` after running a build.
