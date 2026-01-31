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
  <div class="form-group">
    <div class="form-label">{title}</div>
    <div class="form-text">{description}</div>
  </div>
</div>
```

## Attributes

### `title`

- **Type:** string
- **Default:** `Select Resource Scopes`
- **Purpose:** Controls the label text.

### `discription`

- **Type:** string
- **Default:** `Choose which resource scopes this client is allowed to request.`
- **Purpose:** Controls the helper text shown under the label.

> Note: The attribute name `discription` is supported for backwards compatibility.

### `description`

- **Type:** string
- **Default:** `Choose which resource scopes this client is allowed to request.`
- **Purpose:** Correctly spelled alias for the helper text.
- **Precedence:** If both `description` and `discription` are present, `description` wins.

### Removed Attributes

The following legacy attributes were removed:

- `name`
- `color`
