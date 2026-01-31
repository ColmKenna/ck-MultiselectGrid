import { CkMultiselectGrid } from '../../src/components/ck-multiselect-grid/ck-multiselect-grid';
import { ckMultiselectGridCSS } from '../../src/components/ck-multiselect-grid/ck-multiselect-grid.styles';

// Define the custom element before running tests
beforeAll(() => {
  if (!customElements.get('ck-multiselect-grid')) {
    customElements.define('ck-multiselect-grid', CkMultiselectGrid);
  }
});

describe('CkMultiselectGrid Component', () => {
  let element: CkMultiselectGrid;

  beforeEach(() => {
    // Create a fresh instance for each test
    element = new CkMultiselectGrid();
    document.body.appendChild(element);
  });

  afterEach(() => {
    // Clean up after each test
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  test('should create an instance', () => {
    expect(element).toBeInstanceOf(CkMultiselectGrid);
    expect(element).toBeInstanceOf(HTMLElement);
  });

  test('should have shadow DOM', () => {
    expect(element.shadowRoot).toBeTruthy();
  });

  test('should render title and discription in a form-group', () => {
    element.setAttribute('title', 'Select Resource Scopes');
    element.setAttribute(
      'discription',
      'Choose which resource scopes this client is allowed to request.'
    );
    element.connectedCallback();

    const root = element.shadowRoot;
    expect(root).toBeTruthy();

    const formGroup = root?.querySelector('.form-group');
    expect(formGroup).toBeTruthy();

    const label = root?.querySelector('.form-label');
    expect(label?.textContent).toBe('Select Resource Scopes');

    const helpText = root?.querySelector('.form-text');
    expect(helpText?.textContent).toBe(
      'Choose which resource scopes this client is allowed to request.'
    );
  });

  test('should update content when title attribute changes', () => {
    element.setAttribute('title', 'Select Resource Scopes');
    element.connectedCallback();
    element.setAttribute('title', 'Select Another Title');

    // Trigger attribute change callback
    element.attributeChangedCallback(
      'title',
      'Select Resource Scopes',
      'Select Another Title'
    );

    const label = element.shadowRoot?.querySelector('.form-label');
    expect(label?.textContent).toBe('Select Another Title');
  });

  test('should observe title, description, discription and fieldset attributes', () => {
    const observedAttributes = CkMultiselectGrid.observedAttributes;
    expect(observedAttributes).toContain('title');
    expect(observedAttributes).toContain('description');
    expect(observedAttributes).toContain('discription');
    expect(observedAttributes).toContain('fieldset-id');
    expect(observedAttributes).toContain('fieldset-class');
  });

  test('should have default title and discription values', () => {
    element.connectedCallback();
    const label = element.shadowRoot?.querySelector('.form-label');
    const helpText = element.shadowRoot?.querySelector('.form-text');

    expect(label?.textContent).toBe('Select Resource Scopes');
    expect(helpText?.textContent).toBe(
      'Choose which resource scopes this client is allowed to request.'
    );
  });

  test('should wrap content in a default fieldset', () => {
    element.connectedCallback();

    const fieldset = element.shadowRoot?.querySelector('fieldset');
    const formGroup = element.shadowRoot?.querySelector('.form-group');

    expect(fieldset).toBeTruthy();
    expect(fieldset?.id).toBe('scopes-fieldset');
    expect(fieldset?.classList.contains('multiselect-fieldset')).toBe(true);
    expect(formGroup?.parentElement).toBe(fieldset);
  });

  test('should use attribute-driven fieldset id', () => {
    element.setAttribute('fieldset-id', 'custom-scopes');
    element.connectedCallback();

    const fieldset = element.shadowRoot?.querySelector('fieldset');
    expect(fieldset?.id).toBe('custom-scopes');
  });

  test('should append custom fieldset class while keeping the default', () => {
    element.setAttribute('fieldset-class', 'extra spacing');
    element.connectedCallback();

    const fieldset = element.shadowRoot?.querySelector('fieldset');
    expect(fieldset?.classList.contains('multiselect-fieldset')).toBe(true);
    expect(fieldset?.classList.contains('extra')).toBe(true);
    expect(fieldset?.classList.contains('spacing')).toBe(true);
  });

  test('should update fieldset metadata when attributes change post-init', () => {
    element.connectedCallback();

    element.setAttribute('fieldset-id', 'later-id');
    element.attributeChangedCallback('fieldset-id', 'scopes-fieldset', 'later-id');

    element.setAttribute('fieldset-class', 'dynamic');
    element.attributeChangedCallback('fieldset-class', '', 'dynamic');

    const fieldset = element.shadowRoot?.querySelector('fieldset');
    expect(fieldset?.id).toBe('later-id');
    expect(fieldset?.classList.contains('multiselect-fieldset')).toBe(true);
    expect(fieldset?.classList.contains('dynamic')).toBe(true);
  });

  test('should render checkbox options from availableItems and selectedItems', () => {
    const available = ['Scope.Read', 'Scope.Write'];
    const selected = ['Scope.Write'];

    element.setAttribute('availableItems', JSON.stringify(available));
    element.setAttribute('selectedItems', JSON.stringify(selected));
    element.connectedCallback();

    const grid = element.shadowRoot?.querySelector('.multiselect-grid');
    expect(grid?.getAttribute('role')).toBe('group');
    expect(grid?.getAttribute('aria-labelledby')).toBe('scopes-label');

    const options = element.shadowRoot?.querySelectorAll('.multiselect-option');
    expect(options?.length).toBe(2);

    const readInput = element.shadowRoot?.getElementById('scope.read') as HTMLInputElement | null;
    expect(readInput).toBeTruthy();
    expect(readInput?.classList.contains('multiselect-input')).toBe(true);
    expect(readInput?.getAttribute('name')).toBe('Scope.Read');
    expect(readInput?.getAttribute('value')).toBe('Scope.Read');
    expect(readInput?.getAttribute('aria-describedby')).toBe('scope.read-desc');
    expect(readInput?.hasAttribute('checked')).toBe(false);

    const writeInput = element.shadowRoot?.getElementById('scope.write') as HTMLInputElement | null;
    expect(writeInput?.hasAttribute('checked')).toBe(true);

    const pillText = element.shadowRoot?.querySelectorAll('.multiselect-pill')?.[1]?.textContent;
    expect(pillText).toBe('Scope.Write');
  });

  test('should synthesize missing options for selected values', () => {
    const available = ['Scope.Read'];
    const selected = ['Scope.Write'];

    element.setAttribute('availableItems', JSON.stringify(available));
    element.setAttribute('selectedItems', JSON.stringify(selected));
    element.connectedCallback();

    const options = element.shadowRoot?.querySelectorAll('.multiselect-option');
    expect(options?.length).toBe(2);

    const readInput = element.shadowRoot?.getElementById('scope.read') as HTMLInputElement | null;
    expect(readInput?.hasAttribute('checked')).toBe(false);

    const syntheticInput = element.shadowRoot?.getElementById('scope.write') as HTMLInputElement | null;
    expect(syntheticInput).toBeTruthy();
    expect(syntheticInput?.getAttribute('value')).toBe('Scope.Write');
    expect(syntheticInput?.hasAttribute('checked')).toBe(true);

    const syntheticLabel = element.shadowRoot?.getElementById('scope.write-desc');
    expect(syntheticLabel?.textContent).toBe('Scope.Write');
  });

  test('should prefer description over discription when both are present', () => {
    element.setAttribute('description', 'Correctly spelled description.');
    element.setAttribute('discription', 'Legacy misspelling.');
    element.connectedCallback();

    const helpText = element.shadowRoot?.querySelector('.form-text');
    expect(helpText?.textContent).toBe('Correctly spelled description.');
  });

  test('should not interpret HTML-like title/description as DOM', () => {
    const injectedTitle = '<img src=x onerror=alert(1)>Title';
    const injectedDescription = '<b>bold</b> description';

    element.setAttribute('title', injectedTitle);
    element.setAttribute('description', injectedDescription);
    element.connectedCallback();

    expect(element.shadowRoot?.querySelector('img')).toBeNull();
    expect(element.shadowRoot?.querySelector('b')).toBeNull();

    const label = element.shadowRoot?.querySelector('.form-label');
    const helpText = element.shadowRoot?.querySelector('.form-text');
    expect(label?.textContent).toBe(injectedTitle);
    expect(helpText?.textContent).toBe(injectedDescription);
  });

  test('should update selected checkboxes when selectedItems changes', async () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha']));
    element.setAttribute('selectedItems', JSON.stringify([]));
    element.connectedCallback();

    const checkbox = element.shadowRoot?.querySelector('input.multiselect-input');
    expect(checkbox?.hasAttribute('checked')).toBe(false);

    element.setAttribute('selectedItems', JSON.stringify(['alpha']));
    await Promise.resolve();

    const updatedCheckbox = element.shadowRoot?.querySelector('input.multiselect-input');
    expect(updatedCheckbox?.hasAttribute('checked')).toBe(true);
  });

  test('should refresh available options when availableItems changes', async () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha']));
    element.connectedCallback();

    const initialOptions = element.shadowRoot?.querySelectorAll('.multiselect-option');
    expect(initialOptions?.length).toBe(1);

    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    await Promise.resolve();

    const updatedOptions = element.shadowRoot?.querySelectorAll('.multiselect-option');
    expect(updatedOptions?.length).toBe(2);
  });

  test('should not duplicate DOM when reconnected', () => {
    element.connectedCallback();
    document.body.removeChild(element);
    document.body.appendChild(element);
    element.connectedCallback();

    expect(element.shadowRoot?.querySelectorAll('.form-group').length).toBe(1);
  });
});

describe('CkMultiselectGrid styles', () => {
  test('should include Story-3 responsive grid layout rules', () => {
    expect(ckMultiselectGridCSS).toContain('.multiselect-fieldset');
    expect(ckMultiselectGridCSS).toContain('.multiselect-grid');
    expect(ckMultiselectGridCSS).toContain('grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));');
    expect(ckMultiselectGridCSS).toContain('@media (min-width: 768px)');
    expect(ckMultiselectGridCSS).toContain('@media (max-width: 575.98px)');
  });

  test('should apply interactive option + checkbox styling per Story-3 spec', () => {
    expect(ckMultiselectGridCSS).toContain('.multiselect-option');
    expect(ckMultiselectGridCSS).toContain('.multiselect-option:has(.multiselect-input:checked)');
    expect(ckMultiselectGridCSS).toContain('.multiselect-input:checked');
    expect(ckMultiselectGridCSS).toContain("background-image: url(\"data:image/svg+xml");
    expect(ckMultiselectGridCSS).toContain('.multiselect-pill');
  });
});
