# Web Component Library

A modern web component library built with TypeScript and Rollup, designed to be lightweight, reusable, and easy to integrate into any web project. Published to GitHub Packages for easy distribution and version management.

## 🚀 Features

- **Modern Web Components**: Built using native Custom Elements API
- **TypeScript Support**: Full TypeScript definitions included
- **Multiple Build Formats**: UMD, ES modules, and minified versions
- **GitHub Packages**: Published to GitHub Packages for easy distribution
- **Development Server**: Built-in development server for testing

## 📦 Installation

### Via GitHub Packages

First, configure npm to use GitHub Packages for this namespace. Create or update your `.npmrc` file:

```
@colmkenna:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install the package:

```bash
npm install @colmkenna/ck-webcomponents
```

### Via CDN (if published to a CDN)

```html
<script src="https://unpkg.com/@colmkenna/ck-webcomponents@latest/dist/ck-multiselect-grid/ck-multiselect-grid.min.js"></script>
```

Then import in your JavaScript:

```javascript
import '@colmkenna/ck-webcomponents';
```

Or import specific components:

```javascript
import { CkMultiselectGrid } from '@colmkenna/ck-webcomponents';
```

## 🧩 Components

### CkMultiselectGrid Component

An accessible multiselect grid that combines a configurable `<fieldset>` header with a pill-based list of checkboxes driven entirely by attributes.

```html
<!-- Basic usage -->
<ck-multiselect-grid></ck-multiselect-grid>

<!-- With custom title + helper text -->
<ck-multiselect-grid
  title="Select Items"
  description="Choose the items that apply to this client."
></ck-multiselect-grid>

<!-- Control the surrounding fieldset -->
<ck-multiselect-grid
  fieldset-id="ck-multiselect-grid-fieldset"
  fieldset-class="selection-block"
></ck-multiselect-grid>

<!-- Drive the checkbox list via JSON attributes -->
<ck-multiselect-grid
  availableItems='["Item.Read","Item.Write","Item.Manage"]'
  selectedItems='["Item.Write"]'
></ck-multiselect-grid>
```

#### Attributes

| Attribute | Type   | Default | Description                    |
|-----------|--------|---------|--------------------------------|
| `title` | string | "Select Items" | Label text |
| `description` | string | "Choose the items that apply to this client." | Helper text |
| `fieldset-id` | string | `ck-multiselect-grid-fieldset` | Sets the `<fieldset>` `id` that wraps the form group |
| `fieldset-class` | string | `""` | Appends one or more classes in addition to the default `multiselect-fieldset` |
| `availableItems` | JSON array | `[]` | Array of strings or objects (`{ id?, name?, label?, value? }`) describing each checkbox option |
| `selectedItems` | JSON array | `[]` | Array of strings referencing the option `value` entries that should render as checked; values missing from `availableItems` are synthesized into the grid so persisted selections still display |

#### Events

| Event | Description | Detail Payload |
|-------|-------------|----------------|
| `ck-multiselect-option-selected` | Fired whenever a checkbox transitions to the checked state (user interaction). | `{ option: { id, label, name, value }, checked: true }`
| `ck-multiselect-option-unselected` | Fired whenever a checkbox transitions to the unchecked state. | `{ option: { id, label, name, value }, checked: false }`

Both events bubble and are composed, so you can listen on the custom element from outside the shadow DOM:

```javascript
grid.addEventListener('ck-multiselect-option-selected', event => {
  console.log('selected', event.detail.option.value);
});
```

**Interaction note:** Users can click anywhere on the pill text/label to toggle the checkbox. The component mirrors the checkbox's `checked` attribute whenever the value changes so attribute selectors and DOM inspections always see the latest state, and it toggles both a `data-selected="true|false"` attribute and an `is-selected` class on each option for styling (and browsers that lack `:has`).

#### Default palette

Each CSS custom property now ships with a built-in fallback so the grid looks correct even if you never override the tokens:

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

#### Properties

The component also supports JavaScript property access:

```javascript
const multiselectGrid = document.querySelector('ck-multiselect-grid');
multiselectGrid.title = 'Select Items';
multiselectGrid.description = 'Choose the items that apply to this client.';
multiselectGrid.setAttribute(
  'availableItems',
  JSON.stringify(['Item.Read', 'Item.Write'])
);
multiselectGrid.setAttribute('selectedItems', JSON.stringify(['Item.Read']));
```

## 🛠️ Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ColmKenna/ck-MultiselectGrid.git
cd ck-MultiselectGrid
```

2. Install dependencies:
```bash
npm install
```

3. Start development mode:
```bash
npm run dev
```

4. Serve the demo page:
```bash
npm run serve
```

### Available Scripts

- `npm run build` - Build the library for production
- `npm run dev` - Build in watch mode for development
- `npm run serve` - Serve the dist folder on localhost:8080
- `npm run clean` - Clean the dist folder

### Project Structure

```
webcomponent-library/
├── src/
│   ├── components/
│   │   └── ck-multiselect-grid/
│   │       └── ck-multiselect-grid.ts
│   └── index.ts
├── dist/
│   ├── index.html (demo page)
│   ├── ck-multiselect-grid/
│   │   ├── ck-multiselect-grid.js (UMD build)
│   │   ├── ck-multiselect-grid.esm.js (ES module build)
│   │   └── ck-multiselect-grid.min.js (minified UMD build)
│   └── ck-multiselect-grid/index.d.ts (TypeScript definitions)
├── package.json
├── rollup.config.js
├── tsconfig.json
└── README.md
```

## 📖 Creating New Components

1. Create a new component file in `src/components/`:

```typescript
export class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    this.shadowRoot!.innerHTML = `
      <style>
        /* Component styles */
      </style>
      <div>
        <!-- Component template -->
      </div>
    `;
  }
}

// Register the component
if (!customElements.get('my-component')) {
  customElements.define('my-component', MyComponent);
}
```

2. Export the component in `src/index.ts`:

```typescript
export { MyComponent } from './components/my-component/my-component.component';
import './components/my-component/my-component.component';
```

## 🧪 Development & Testing

This project includes comprehensive testing, linting, and formatting setup.

### Available Scripts

- `npm run build` - Build the project for production
- `npm run dev` - Start development mode with watch
- `npm run serve` - Serve the built files for testing
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

Tests are written using Jest with jsdom environment for DOM testing. Test files are located in `__tests__` directories next to the components they test.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

### Code Quality

The project uses ESLint for code linting and Prettier for code formatting:

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check if code is properly formatted
npm run format:check
```

### Adding New Components

1. Create a new directory under `src/components/`
2. Add your component TypeScript file
3. Create a corresponding test directory under `tests/` (e.g., `tests/my-component/`)
4. Add test files in the test directory
5. Export your component from `src/index.ts`
6. Run tests to ensure everything works

Example component structure:
```
src/components/my-component/
├── my-component.ts
tests/my-component/
└── my-component.test.ts
```

## 🚀 Publishing
 to GitHub Packages

### Automatic Publishing

The project is configured to automatically publish to GitHub Packages when you create a new release:

1. Update the version in `package.json`:
```bash
npm version patch  # or minor, major
```

2. Push the tag to GitHub:
```bash
git push origin --tags
```

3. The GitHub Action will automatically build and publish the package.

### Manual Publishing

You can also publish manually:

1. Build the project:
```bash
npm run build
```

2. Make sure you're authenticated with GitHub Packages:
```bash
npm login --registry=https://npm.pkg.github.com
```

3. Publish:
```bash
npm publish
```

## 📖 Using the Package

After installing, you can use the components in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
      import '@colmkenna/ck-webcomponents';
    </script>
</head>
<body>
  <ck-multiselect-grid name="GitHub Packages"></ck-multiselect-grid>
</body>
</html>
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions and support, please open an issue on GitHub.
