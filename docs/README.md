# Documentation

- Authoritative API/spec: `docs/spec.md`
- Change log (TDD journal): `docs/steps.md`

## Quick Usage

```html
<ck-multiselect-grid
  title="Select Resource Scopes"
  description="Choose which resource scopes this client is allowed to request."
></ck-multiselect-grid>
```

### Attributes

- `title`: label text
- `description`: helper text (preferred)
- `discription`: helper text (legacy spelling)
- `fieldset-id`: sets the wrapping `<fieldset>` `id` (defaults to `scopes-fieldset`)
- `fieldset-class`: appends custom classes to the default `multiselect-fieldset`

## Demo

Open `examples/demo.html` after running a build.
