# Technical Notes: CkMultiselectGrid

## Rendering Strategy

- The component creates its internal DOM once in `connectedCallback()` (guarded so it runs only once) and updates only `textContent` on subsequent renders.
- This avoids XSS risks from string interpolation into `innerHTML`.

## Styling Strategy

- Uses a constructable stylesheet (`CSSStyleSheet`) when available.
- Falls back to injecting a `<style>` tag into the shadow root when constructable stylesheets are not supported.

## Lifecycle

- `connectedCallback()` initializes DOM (once) and triggers `render()`.
- `attributeChangedCallback()` triggers `render()` for observed attributes.

## Observed Attributes

 - `title`, `description`, `discription` (legacy spelling)

## Attribute Precedence

- If both `description` and `discription` are present, `description` wins.
