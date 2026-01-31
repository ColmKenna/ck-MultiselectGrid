import { CkMultiselectGrid } from '../../src/components/ck-multiselect-grid/ck-multiselect-grid';

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

  test('should observe title, description and discription attributes', () => {
    const observedAttributes = CkMultiselectGrid.observedAttributes;
    expect(observedAttributes).toContain('title');
    expect(observedAttributes).toContain('description');
    expect(observedAttributes).toContain('discription');
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

  test('should not duplicate DOM when reconnected', () => {
    element.connectedCallback();
    document.body.removeChild(element);
    document.body.appendChild(element);
    element.connectedCallback();

    expect(element.shadowRoot?.querySelectorAll('.form-group').length).toBe(1);
  });
});
