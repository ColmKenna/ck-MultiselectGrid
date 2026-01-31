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
```html
<ck-multiselect-grid
  title="Select Resource Scopes"
  description="Choose which resource scopes this client is allowed to request."
  availableItems='["Scope.Read","Scope.Write"]'
  selectedItems='["Scope.Write"]'
></ck-multiselect-grid>
```

### Attributes

- `availableItems` — JSON array of strings or option objects (`{ id?, name?, label?, value? }`) used to build the checkbox list
- `selectedItems` — JSON array of strings matching option `value` entries that should be checked

## Demo

Open `examples/demo.html` after running a build.
