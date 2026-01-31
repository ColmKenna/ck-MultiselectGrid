# Technical Notes: CkMultiselectGrid

## Rendering Strategy

- The component creates its internal DOM once in `connectedCallback()` (guarded) and reuses cached references (`fieldset`, `.form-group`, `.multiselect-grid`).
- Each call to `render()` re-syncs header text and rebuilds the checkbox grid by replacing children on the cached `.multiselect-grid` node.
- Option rows are constructed with DOM APIs to avoid `innerHTML`, assign deterministic ids, and wire `aria-describedby` to the visible pill text.
- Layout continues to wrap everything in a `<fieldset>` for semantics.

## Styling Strategy

- Uses a constructable stylesheet (`CSSStyleSheet`) when available.
- Falls back to injecting a `<style>` tag into the shadow root when constructable stylesheets are not supported.
- Story-3 refresh introduces responsive `.multiselect-grid` columns (200–240px), single-column mobile layout, `prefers-contrast` overrides, and print-friendly blocks.
- Interactive states depend on CSS custom properties (`--input-border`, `--card-bg`, `--surface-bg`, `--primary-color`, `--focus-border`, `--focus-shadow`, `--option-pill-color`, `--option-pill-active-bg`, `--text-light`, `--form-bg`) so hosts can theme without editing the bundled CSS.
- `.multiselect-option:has(.multiselect-input:checked)` is used for concise selection styling; browsers lacking `:has()` still show the default state, so documentation notes progressive enhancement expectations.

## Lifecycle

- `connectedCallback()` initializes DOM (once) and triggers `render()`.
- `attributeChangedCallback()` triggers `render()` for observed attributes so checkbox state reflects attribute changes.

## Observed Attributes

 - `title`, `description`
 - `fieldset-id`, `fieldset-class` for fieldset metadata
 - `availableitems`, `selecteditems` (lower-cased per Custom Elements spec) to keep the checkbox grid in sync

## Option Data

- `availableItems` accepts a JSON array of either strings or objects with `id?`, `name?`, `label?`, and `value?` fields; strings are treated as both the label and value.
- `selectedItems` accepts a JSON array of strings that should match the option `value` entries; they feed a `Set` for quick lookup when rendering.
- `buildSelectedOnlyOptions()` walks the selected list and synthesizes `MultiselectOption`s for any values not already represented so persisted selections survive when the available list is filtered by the host application.
- A `WeakMap<HTMLInputElement, MultiselectOption>` tracks option metadata for each checkbox; `handleInputChange()` listens for `change` events and dispatches bubbled/composed custom events (`ck-multiselect-option-selected` / `...-unselected`) with `{ option, checked }` detail so hosts never reach into the shadow DOM.
- Parsing happens inside a small helper that catches `JSON.parse` errors, logs a warning for debugging, and falls back to an empty array to avoid throwing inside lifecycle hooks.
- `slugify` keeps backwards-compatible id generation (lowercase + whitespace → hyphen) and a resolver guarantees uniqueness within a render.

## Helper Text Handling

- `description` is the only helper-text attribute; the former typo-driven alias has been removed to keep the API surface consistent.

- `fieldset-id` reflects onto the `<fieldset>` `id`, defaulting to `ck-multiselect-grid-fieldset` for predictable referencing.
- `fieldset-class` accepts space-delimited tokens that are appended to the required `multiselect-fieldset` class, enabling theming hooks.
