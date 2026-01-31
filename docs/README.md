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

### Form Integration

The component is **form-associated** and participates in native form submission:

```html
<form id="myForm">
  <ck-multiselect-grid
    name="permissions"
    title="Permissions"
    availableItems='["read","write","delete"]'
    selectedItems='["read"]'
  ></ck-multiselect-grid>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('myForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  // formData.get('permissions') returns '["read"]' (JSON string)
  console.log('Selected:', JSON.parse(formData.get('permissions')));
});
</script>
```

#### Form Features

- **FormData inclusion**: Selected values are serialized as a JSON array under the `name` attribute
- **Form reset**: `form.reset()` restores initial selections
- **Disabled state**: Respects `<fieldset disabled>` and form-level disabled states
- **Programmatic access**: Use `element.value` to get/set selections, `element.form` to access the associated form

### Attributes

- `name` — the form field name used in FormData serialization (required for form participation)
- `availableItems` — JSON array of strings or option objects (`{ id?, name?, label?, value? }`) used to build the checkbox list
- `selectedItems` — JSON array of strings matching option `value` entries that should be checked; if a value is absent from `availableItems`, the component synthesizes a matching checkbox row so persisted selections never disappear

### Properties

- `value` — get/set the currently selected values as a `string[]`
- `form` — read-only reference to the associated `<form>` element
- `name` — reflects the `name` attribute

### Events

- `ck-multiselect-option-selected` — bubbles + composed, fired when a checkbox becomes checked. `event.detail` includes `{ option, checked: true }`.
- `ck-multiselect-option-unselected` — bubbles + composed, fired when a checkbox becomes unchecked. `event.detail` includes `{ option, checked: false }`.

### Interaction Notes

- Users can click the pill surface (the visible tag inside each option) to toggle the underlying checkbox; the component forwards those clicks and emits the same select/unselect events.
- The checkbox `checked` attribute is updated in lock-step with the property so attribute selectors (and test assertions) always reflect the live state.
- Each `.multiselect-option` exposes both `data-selected="true|false"` and an `is-selected` class so themes (and older browsers without `:has`) can style selected rows without inspecting the shadow DOM.

#### Default palette

All styling tokens include fallback values so the component renders with a neutral palette even if you never override them:

| Custom Property | Default |
|-----------------|---------|
| `--input-border` | `#d0d5dd` |
| `--card-bg` | `#ffffff` |
| `--surface-bg` | `#eef2ff` |
| `--primary-color` | `#4338ca` |
| `--focus-border` | `#4338ca` |
| `--focus-shadow` | `0 0 0 3px rgba(67, 56, 202, 0.25)` |
| `--option-pill-color` | `#0f172a` |
| `--option-pill-active-bg` | `#4338ca` |
| `--text-light` | `#ffffff` |
| `--form-bg` | `#e2e8f0` |

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
