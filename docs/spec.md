# Specification: CkMultiselectGrid

## Component

- **Custom element tag:** `ck-multiselect-grid`
- **Class:** `CkMultiselectGrid`
- **Shadow DOM:** Open
- **Styles:** Constructable stylesheets when supported, otherwise a `<style data-ck-multiselect-grid-fallback>` fallback.

## Rendered Markup

The component renders the following structure inside its shadow root:

```html
<div class="ck-multiselect-grid">
  <fieldset class="multiselect-fieldset {fieldset-class}" id="{fieldset-id}">
    <div class="form-group">
      <div class="form-label">{title}</div>
      <div class="form-text">{description}</div>
    </div>
    <div class="multiselect-grid" role="group" aria-labelledby="scopes-label">
      <div class="multiselect-option" * n="availableItems.length">
        <input
          class="multiselect-input"
          type="checkbox"
          id="{option.id}"
          name="{option.name}"
          value="{option.value}"
          aria-describedby="{option.id}-desc"
          {checked}
        />
        <label class="multiselect-label" for="{option.id}">
          <span class="multiselect-pill" id="{option.id}-desc">{option.label}</span>
        </label>
      </div>
    </div>
  </fieldset>
</div>
```

## Attributes

### `title`

- **Type:** string
- **Default:** `Select Resource Scopes`
- **Purpose:** Controls the label text.

### `description`

- **Type:** string
- **Default:** `Choose which resource scopes this client is allowed to request.`
- **Purpose:** Preferred helper text attribute. If both helper attributes exist, this one wins.

### `discription`

- **Type:** string
- **Default:** `Choose which resource scopes this client is allowed to request.`
- **Purpose:** Legacy helper text attribute kept for backwards compatibility.

### `fieldset-id`

- **Type:** string
- **Default:** `scopes-fieldset`
- **Purpose:** Applies the `id` of the `<fieldset>` that wraps the `.form-group`.

### `fieldset-class`

- **Type:** string (space-delimited tokens)
- **Default:** `""`
- **Purpose:** Adds one or more classes in addition to the required `multiselect-fieldset` class.

### `availableItems`

- **Type:** JSON array of strings or objects (`{ id?, name?, label?, value? }`)
- **Default:** `[]`
- **Purpose:** Describes each checkbox option. Strings populate `id` (slugified), `name`, `label`, and `value`. Objects can override any subset.

### `selectedItems`

- **Type:** JSON array of strings
- **Default:** `[]`
- **Purpose:** Values that should render as checked. Each entry must match an option's `value`; if a listed value is missing from `availableItems`, the component synthesizes a checkbox row using that value for the `label`, `name`, and `value` fields so the selection still appears.

## Behavior

- DOM is created once during `connectedCallback()`; subsequent updates only touch existing nodes.
- Helper text uses `description` if available, otherwise falls back to `discription` or the default copy.
- Fieldset metadata (`id`, classes) updates whenever `fieldset-id` or `fieldset-class` mutates.
- Available/selected item arrays are parsed from JSON (strings or objects) and drive the checkbox grid; attribute mutations trigger a re-render so the grid stays in sync.
- Selected values missing from the available list are converted into synthetic options appended to the grid using the trimmed string as the pill text and checkbox metadata, ensuring persisted selections remain visible even when their source data is temporarily unavailable.
- Each checkbox references a pill via `aria-describedby`, and the grid container keeps `role="group"` + `aria-labelledby="scopes-label"` for assistive context.
- `textContent` assignment avoids interpreting user strings as HTML.
- Re-connecting the element reuses the existing shadow DOM without duplication.

## Styling

- `ckMultiselectGridCSS` delivers the Story-3 responsive layout: `.multiselect-grid` auto-fits 200–240px columns (depending on viewport), collapses to a single column under 576px, and switches to block layout with page-break guards when printing.
- `.multiselect-option` cards use CSS custom properties for border/background colors, hover/focus transitions, and print/contrast overrides. Checked states rely on `.multiselect-option:has(.multiselect-input:checked)` so the entire card reflects selection.
- `.multiselect-input` is visually replaced by a custom checkbox that renders an inline SVG checkmark when selected, while keyboard focus uses `--focus-border`/`--focus-shadow` variables.
- Theme tokens exposed: `--input-border`, `--card-bg`, `--surface-bg`, `--primary-color`, `--focus-border`, `--focus-shadow`, `--option-pill-color`, `--option-pill-active-bg`, `--text-light`, `--form-bg`.

## Removed Attributes

These legacy attributes remain removed and unsupported:

- `name`
- `color`
