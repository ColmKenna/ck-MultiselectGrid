# Technical Notes: CkMultiselectGrid

## Rendering Strategy

- The component creates its internal DOM once in `connectedCallback()` (guarded so it runs only once) and updates only `textContent` on subsequent renders.
- This avoids XSS risks from string interpolation into `innerHTML`.
- Layout now includes a cached `<fieldset>` element that wraps the `.form-group` for accessibility semantics.

## Styling Strategy

- Uses a constructable stylesheet (`CSSStyleSheet`) when available.
- Falls back to injecting a `<style>` tag into the shadow root when constructable stylesheets are not supported.

## Lifecycle

- `connectedCallback()` initializes DOM (once) and triggers `render()`.
- `attributeChangedCallback()` triggers `render()` for observed attributes.

## Observed Attributes

 - `title`, `description`, `discription` (legacy spelling)
 - `fieldset-id`, `fieldset-class` for fieldset metadata

## Attribute Precedence

- If both `description` and `discription` are present, `description` wins.

## Fieldset Metadata

- `fieldset-id` reflects onto the `<fieldset>` `id`, defaulting to `scopes-fieldset` for predictable referencing.
- `fieldset-class` accepts space-delimited tokens that are appended to the required `multiselect-fieldset` class, enabling theming hooks.
