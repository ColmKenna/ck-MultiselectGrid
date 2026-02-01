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

  test('should render title and description in a form-group', () => {
    element.setAttribute('title', 'Select Custom Items');
    element.setAttribute(
      'description',
      'Choose which custom items this client is allowed to request.'
    );
    element.connectedCallback();

    const root = element.shadowRoot;
    expect(root).toBeTruthy();

    const formGroup = root?.querySelector('.form-group');
    expect(formGroup).toBeTruthy();

    const label = root?.querySelector('.form-label');
    expect(label?.textContent).toBe('Select Custom Items');

    const helpText = root?.querySelector('.form-text');
    expect(helpText?.textContent).toBe(
      'Choose which custom items this client is allowed to request.'
    );
  });

  test('should update content when title attribute changes', () => {
    element.setAttribute('title', 'Initial Title');
    element.connectedCallback();
    element.setAttribute('title', 'Select Another Title');

    // Trigger attribute change callback
    element.attributeChangedCallback(
      'title',
      'Initial Title',
      'Select Another Title'
    );

    const label = element.shadowRoot?.querySelector('.form-label');
    expect(label?.textContent).toBe('Select Another Title');
  });

  test('should observe title, description, and fieldset attributes', () => {
    const observedAttributes = CkMultiselectGrid.observedAttributes;
    expect(observedAttributes).toContain('title');
    expect(observedAttributes).toContain('description');
    expect(observedAttributes).toContain('fieldset-id');
    expect(observedAttributes).toContain('fieldset-class');
  });

  test('should have default title and description values', () => {
    element.connectedCallback();
    const label = element.shadowRoot?.querySelector('.form-label');
    const helpText = element.shadowRoot?.querySelector('.form-text');

    expect(label?.textContent).toBe('Select Items');
    expect(helpText?.textContent).toBe(
      'Choose the items that apply to this client.'
    );
  });

  test('should wrap content in a default fieldset', () => {
    element.connectedCallback();

    const fieldset = element.shadowRoot?.querySelector('fieldset');
    const formGroup = element.shadowRoot?.querySelector('.form-group');

    expect(fieldset).toBeTruthy();
    expect(fieldset?.id).toBe('ck-multiselect-grid-fieldset');
    expect(fieldset?.classList.contains('multiselect-fieldset')).toBe(true);
    expect(formGroup?.parentElement).toBe(fieldset);
  });

  test('should use attribute-driven fieldset id', () => {
    element.setAttribute('fieldset-id', 'custom-fieldset');
    element.connectedCallback();

    const fieldset = element.shadowRoot?.querySelector('fieldset');
    expect(fieldset?.id).toBe('custom-fieldset');
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
    element.attributeChangedCallback(
      'fieldset-id',
      'ck-multiselect-grid-fieldset',
      'later-id'
    );

    element.setAttribute('fieldset-class', 'dynamic');
    element.attributeChangedCallback('fieldset-class', '', 'dynamic');

    const fieldset = element.shadowRoot?.querySelector('fieldset');
    expect(fieldset?.id).toBe('later-id');
    expect(fieldset?.classList.contains('multiselect-fieldset')).toBe(true);
    expect(fieldset?.classList.contains('dynamic')).toBe(true);
  });

  test('should render checkbox options from availableItems and selectedItems', () => {
    const available = ['Item.Read', 'Item.Write'];
    const selected = ['Item.Write'];

    element.setAttribute('availableItems', JSON.stringify(available));
    element.setAttribute('selectedItems', JSON.stringify(selected));
    element.connectedCallback();

    const grid = element.shadowRoot?.querySelector('.multiselect-grid');
    expect(grid?.getAttribute('role')).toBe('group');
    expect(grid?.getAttribute('aria-labelledby')).toBe(
      'ck-multiselect-grid-label'
    );

    const options = element.shadowRoot?.querySelectorAll('.multiselect-option');
    expect(options?.length).toBe(2);

    const readInput = element.shadowRoot?.getElementById(
      'item.read'
    ) as HTMLInputElement | null;
    expect(readInput).toBeTruthy();
    expect(readInput?.classList.contains('multiselect-input')).toBe(true);
    expect(readInput?.getAttribute('name')).toBe('Item.Read');
    expect(readInput?.getAttribute('value')).toBe('Item.Read');
    // aria-describedby removed to avoid redundant screen reader announcements
    expect(readInput?.hasAttribute('checked')).toBe(false);

    const writeInput = element.shadowRoot?.getElementById(
      'item.write'
    ) as HTMLInputElement | null;
    expect(writeInput?.hasAttribute('checked')).toBe(true);

    const pillText =
      element.shadowRoot?.querySelectorAll('.multiselect-pill')?.[1]
        ?.textContent;
    expect(pillText).toBe('Item.Write');
  });

  test('should synthesize missing options for selected values', () => {
    const available = ['Item.Read'];
    const selected = ['Item.Write'];

    element.setAttribute('availableItems', JSON.stringify(available));
    element.setAttribute('selectedItems', JSON.stringify(selected));
    element.connectedCallback();

    const options = element.shadowRoot?.querySelectorAll('.multiselect-option');
    expect(options?.length).toBe(2);

    const readInput = element.shadowRoot?.getElementById(
      'item.read'
    ) as HTMLInputElement | null;
    expect(readInput?.hasAttribute('checked')).toBe(false);

    const syntheticInput = element.shadowRoot?.getElementById(
      'item.write'
    ) as HTMLInputElement | null;
    expect(syntheticInput).toBeTruthy();
    expect(syntheticInput?.getAttribute('value')).toBe('Item.Write');
    expect(syntheticInput?.hasAttribute('checked')).toBe(true);

    const syntheticLabel =
      element.shadowRoot?.getElementById('item.write-desc');
    expect(syntheticLabel?.textContent).toBe('Item.Write');
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

    const checkbox = element.shadowRoot?.querySelector(
      'input.multiselect-input'
    );
    expect(checkbox?.hasAttribute('checked')).toBe(false);

    element.setAttribute('selectedItems', JSON.stringify(['alpha']));
    await Promise.resolve();

    const updatedCheckbox = element.shadowRoot?.querySelector(
      'input.multiselect-input'
    );
    expect(updatedCheckbox?.hasAttribute('checked')).toBe(true);
  });

  test('should refresh available options when availableItems changes', async () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha']));
    element.connectedCallback();

    const initialOptions = element.shadowRoot?.querySelectorAll(
      '.multiselect-option'
    );
    expect(initialOptions?.length).toBe(1);

    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    await Promise.resolve();

    const updatedOptions = element.shadowRoot?.querySelectorAll(
      '.multiselect-option'
    );
    expect(updatedOptions?.length).toBe(2);
  });

  test('should emit a custom event when an option becomes selected', () => {
    element.setAttribute('availableItems', JSON.stringify(['Item.Read']));
    element.connectedCallback();

    const handler = jest.fn();
    element.addEventListener('ck-multiselect-option-selected', handler);

    const checkbox = element.shadowRoot?.getElementById(
      'item.read'
    ) as HTMLInputElement | null;
    expect(checkbox).toBeTruthy();

    if (!checkbox) return;

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    const eventDetail = handler.mock.calls[0][0].detail;
    expect(eventDetail.option.value).toBe('Item.Read');
    expect(eventDetail.option.label).toBe('Item.Read');
    expect(eventDetail.checked).toBe(true);
  });

  test('should emit a custom event when an option becomes unselected', () => {
    element.setAttribute('availableItems', JSON.stringify(['Item.Write']));
    element.setAttribute('selectedItems', JSON.stringify(['Item.Write']));
    element.connectedCallback();

    const handler = jest.fn();
    element.addEventListener('ck-multiselect-option-unselected', handler);

    const checkbox = element.shadowRoot?.getElementById(
      'item.write'
    ) as HTMLInputElement | null;
    expect(checkbox).toBeTruthy();

    if (!checkbox) return;

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    const eventDetail = handler.mock.calls[0][0].detail;
    expect(eventDetail.option.value).toBe('Item.Write');
    expect(eventDetail.checked).toBe(false);
  });

  test('should toggle checkbox when label is clicked', () => {
    element.setAttribute('availableItems', JSON.stringify(['Item.Read']));
    element.connectedCallback();

    const checkbox = element.shadowRoot?.getElementById(
      'item.read'
    ) as HTMLInputElement | null;
    const label = element.shadowRoot?.querySelector(
      'label[for="item.read"]'
    ) as HTMLLabelElement | null;

    expect(checkbox).toBeTruthy();
    expect(label).toBeTruthy();
    if (!checkbox || !label) return;

    expect(checkbox.checked).toBe(false);
    expect(checkbox.hasAttribute('checked')).toBe(false);

    // Native label click toggles the checkbox
    label.click();

    expect(checkbox.checked).toBe(true);
    expect(checkbox.hasAttribute('checked')).toBe(true);

    label.click();

    expect(checkbox.checked).toBe(false);
    expect(checkbox.hasAttribute('checked')).toBe(false);
  });

  test('should reflect selection state via data-selected attribute', () => {
    element.setAttribute('availableItems', JSON.stringify(['Item.Read']));
    element.setAttribute('selectedItems', JSON.stringify(['Item.Read']));
    element.connectedCallback();

    const option = element.shadowRoot?.querySelector(
      '.multiselect-option'
    ) as HTMLDivElement | null;
    const checkbox = element.shadowRoot?.getElementById(
      'item.read'
    ) as HTMLInputElement | null;

    expect(option).toBeTruthy();
    expect(checkbox).toBeTruthy();
    if (!option || !checkbox) return;

    expect(option.getAttribute('data-selected')).toBe('true');
    expect(option.classList.contains('is-selected')).toBe(true);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(option.getAttribute('data-selected')).toBe('false');
    expect(option.classList.contains('is-selected')).toBe(false);

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(option.getAttribute('data-selected')).toBe('true');
    expect(option.classList.contains('is-selected')).toBe(true);
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
    expect(ckMultiselectGridCSS).toContain(
      'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));'
    );
    expect(ckMultiselectGridCSS).toContain('@media (min-width: 768px)');
    expect(ckMultiselectGridCSS).toContain('@media (max-width: 575.98px)');
  });

  test('should apply interactive option + checkbox styling per Story-3 spec', () => {
    expect(ckMultiselectGridCSS).toContain('.multiselect-option');
    expect(ckMultiselectGridCSS).toContain(
      '.multiselect-option:has(.multiselect-input:checked)'
    );
    expect(ckMultiselectGridCSS).toContain('.multiselect-input:checked');
    expect(ckMultiselectGridCSS).toContain(
      'background-image: url("data:image/svg+xml'
    );
    expect(ckMultiselectGridCSS).toContain('.multiselect-pill');
    expect(ckMultiselectGridCSS).toContain(
      'border: 1px solid var(--input-border, #d0d5dd);'
    );
    expect(ckMultiselectGridCSS).toContain(
      'background-color: var(--option-pill-active-bg, #4338ca);'
    );
    expect(ckMultiselectGridCSS).toContain(
      'color: var(--text-light, #ffffff);'
    );
  });
});

describe('CkMultiselectGrid form-associated behavior', () => {
  let element: CkMultiselectGrid;
  let form: HTMLFormElement;

  beforeEach(() => {
    form = document.createElement('form');
    element = new CkMultiselectGrid();
    element.setAttribute('name', 'test-selection');
    form.appendChild(element);
    document.body.appendChild(form);
  });

  afterEach(() => {
    if (form.parentNode) {
      form.parentNode.removeChild(form);
    }
  });

  test('should declare static formAssociated = true', () => {
    expect(
      (CkMultiselectGrid as unknown as { formAssociated: boolean })
        .formAssociated
    ).toBe(true);
  });

  test('should have name in observedAttributes', () => {
    const observedAttributes = CkMultiselectGrid.observedAttributes;
    expect(observedAttributes).toContain('name');
  });

  test('should expose name property that reflects attribute', () => {
    element.setAttribute('name', 'my-grid');
    expect(element.name).toBe('my-grid');

    element.name = 'another-name';
    expect(element.getAttribute('name')).toBe('another-name');
  });

  test('should include selected values in FormData on form submission', () => {
    element.setAttribute(
      'availableItems',
      JSON.stringify(['alpha', 'beta', 'gamma'])
    );
    element.setAttribute('selectedItems', JSON.stringify(['alpha', 'gamma']));
    element.connectedCallback();

    const formData = new FormData(form);
    const value = formData.get('test-selection');

    // Expect a JSON string of selected values
    expect(value).toBe(JSON.stringify(['alpha', 'gamma']));
  });

  test('should update FormData when selections change', () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    element.setAttribute('selectedItems', JSON.stringify([]));
    element.connectedCallback();

    // Initially empty
    let formData = new FormData(form);
    expect(formData.get('test-selection')).toBe(JSON.stringify([]));

    // Select an option
    const checkbox = element.shadowRoot?.getElementById(
      'alpha'
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    formData = new FormData(form);
    expect(formData.get('test-selection')).toBe(JSON.stringify(['alpha']));
  });

  test('should restore initial selections on form reset', () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    element.setAttribute('selectedItems', JSON.stringify(['alpha']));
    element.connectedCallback();

    // Verify initial state
    const alphaCheckbox = element.shadowRoot?.getElementById(
      'alpha'
    ) as HTMLInputElement;
    const betaCheckbox = element.shadowRoot?.getElementById(
      'beta'
    ) as HTMLInputElement;
    expect(alphaCheckbox?.checked).toBe(true);
    expect(betaCheckbox?.checked).toBe(false);

    // Change selections
    alphaCheckbox.checked = false;
    alphaCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    betaCheckbox.checked = true;
    betaCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(alphaCheckbox?.checked).toBe(false);
    expect(betaCheckbox?.checked).toBe(true);

    // Reset the form
    form.reset();

    // Should restore initial state
    expect(alphaCheckbox?.checked).toBe(true);
    expect(betaCheckbox?.checked).toBe(false);
  });

  test('should return associated form via form property', () => {
    element.connectedCallback();
    expect(element.form).toBe(form);
  });

  test('should expose value property reflecting current selections', () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    element.setAttribute('selectedItems', JSON.stringify(['beta']));
    element.connectedCallback();

    expect(element.value).toEqual(['beta']);

    // Change selection
    const alphaCheckbox = element.shadowRoot?.getElementById(
      'alpha'
    ) as HTMLInputElement;
    alphaCheckbox.checked = true;
    alphaCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(element.value).toEqual(['beta', 'alpha']);
  });

  test('should set value property and update checkboxes', () => {
    element.setAttribute(
      'availableItems',
      JSON.stringify(['alpha', 'beta', 'gamma'])
    );
    element.setAttribute('selectedItems', JSON.stringify([]));
    element.connectedCallback();

    element.value = ['beta', 'gamma'];

    const alphaCheckbox = element.shadowRoot?.getElementById(
      'alpha'
    ) as HTMLInputElement;
    const betaCheckbox = element.shadowRoot?.getElementById(
      'beta'
    ) as HTMLInputElement;
    const gammaCheckbox = element.shadowRoot?.getElementById(
      'gamma'
    ) as HTMLInputElement;

    expect(alphaCheckbox?.checked).toBe(false);
    expect(betaCheckbox?.checked).toBe(true);
    expect(gammaCheckbox?.checked).toBe(true);
  });

  test('should disable all checkboxes when formDisabledCallback(true) is called', () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    element.connectedCallback();

    // Simulate browser calling formDisabledCallback
    (
      element as unknown as {
        formDisabledCallback: (disabled: boolean) => void;
      }
    ).formDisabledCallback(true);

    const checkboxes = element.shadowRoot?.querySelectorAll(
      'input[type="checkbox"]'
    ) as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => {
      expect(cb.disabled).toBe(true);
    });
  });

  test('should re-enable all checkboxes when formDisabledCallback(false) is called', () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    element.connectedCallback();

    (
      element as unknown as {
        formDisabledCallback: (disabled: boolean) => void;
      }
    ).formDisabledCallback(true);
    (
      element as unknown as {
        formDisabledCallback: (disabled: boolean) => void;
      }
    ).formDisabledCallback(false);

    const checkboxes = element.shadowRoot?.querySelectorAll(
      'input[type="checkbox"]'
    ) as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => {
      expect(cb.disabled).toBe(false);
    });
  });
});

describe('CkMultiselectGrid lifecycle and cleanup', () => {
  let element: CkMultiselectGrid;

  beforeEach(() => {
    element = new CkMultiselectGrid();
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  test('should have a disconnectedCallback method', () => {
    expect(
      typeof (element as unknown as { disconnectedCallback?: () => void })
        .disconnectedCallback
    ).toBe('function');
  });

  test('should not throw when disconnectedCallback is called', () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha', 'beta']));
    element.connectedCallback();

    expect(() => {
      document.body.removeChild(element);
    }).not.toThrow();
  });

  test('should still respond to checkbox changes after re-connection', () => {
    element.setAttribute('availableItems', JSON.stringify(['alpha']));
    element.connectedCallback();

    // Remove and re-add element
    document.body.removeChild(element);
    document.body.appendChild(element);

    const handler = jest.fn();
    element.addEventListener('ck-multiselect-option-selected', handler);

    const checkbox = element.shadowRoot?.getElementById(
      'alpha'
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('CkMultiselectGrid accessibility improvements', () => {
  let element: CkMultiselectGrid;

  beforeEach(() => {
    element = new CkMultiselectGrid();
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  test('should not have redundant aria-describedby on checkboxes', () => {
    element.setAttribute('availableItems', JSON.stringify(['Item.Read']));
    element.connectedCallback();

    const checkbox = element.shadowRoot?.getElementById(
      'item.read'
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();

    // aria-describedby should NOT be present since label already provides accessible name
    expect(checkbox.hasAttribute('aria-describedby')).toBe(false);
  });

  test('should toggle checkbox via label click (label for attribute)', () => {
    element.setAttribute('availableItems', JSON.stringify(['Item.Read']));
    element.connectedCallback();

    const checkbox = element.shadowRoot?.getElementById(
      'item.read'
    ) as HTMLInputElement;
    const label = element.shadowRoot?.querySelector(
      'label[for="item.read"]'
    ) as HTMLLabelElement;

    expect(checkbox).toBeTruthy();
    expect(label).toBeTruthy();
    expect(checkbox.checked).toBe(false);

    // Clicking label should toggle checkbox via native behavior
    label.click();

    expect(checkbox.checked).toBe(true);
  });

  test('pill should not have click handler data attribute', () => {
    element.setAttribute('availableItems', JSON.stringify(['Item.Read']));
    element.connectedCallback();

    const pill = element.shadowRoot?.querySelector(
      '.multiselect-pill'
    ) as HTMLElement;
    expect(pill).toBeTruthy();

    // data-checkbox-id was used for pill click handling; should no longer exist
    expect(pill.hasAttribute('data-checkbox-id')).toBe(false);
  });
});
