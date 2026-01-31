// Jest setup file for DOM testing

// Mock any global APIs or setup that your components might need
Object.defineProperty(window, 'customElements', {
  value: window.customElements || {
    define: jest.fn(),
    get: jest.fn(),
    whenDefined: jest.fn(() => Promise.resolve()),
  },
  writable: true,
});

// Setup for any additional globals your web components might need
global.HTMLElement = window.HTMLElement;
global.customElements = window.customElements;

// Mock ElementInternals for form-associated custom elements
// JSDOM doesn't fully support ElementInternals.setFormValue(), so we polyfill it
const elementInternalsMap = new WeakMap();

class MockElementInternals {
  constructor(element) {
    this._element = element;
    this._formValue = null;
    this._formState = null;
    this._form = null;
    elementInternalsMap.set(element, this);
  }

  get form() {
    // Walk up the DOM to find the enclosing form
    let parent = this._element.parentNode;
    while (parent) {
      if (parent.tagName === 'FORM') {
        return parent;
      }
      parent = parent.parentNode;
    }
    return null;
  }

  setFormValue(value, state) {
    this._formValue = value;
    this._formState = state !== undefined ? state : value;
  }

  get shadowRoot() {
    return this._element.shadowRoot;
  }

  get states() {
    return new Set();
  }

  setValidity() {}
  reportValidity() { return true; }
  checkValidity() { return true; }
  get validity() { return { valid: true }; }
  get validationMessage() { return ''; }
  get willValidate() { return true; }
  get labels() { return []; }
}

// Patch HTMLElement.prototype.attachInternals if not available or incomplete
const originalAttachInternals = HTMLElement.prototype.attachInternals;

HTMLElement.prototype.attachInternals = function() {
  // If native attachInternals exists and works, use it
  if (originalAttachInternals) {
    try {
      const internals = originalAttachInternals.call(this);
      // Check if setFormValue is available
      if (typeof internals.setFormValue === 'function') {
        return internals;
      }
      // If setFormValue is missing, wrap with our mock
      const mockInternals = new MockElementInternals(this);
      // Copy over any properties from native internals
      Object.defineProperty(mockInternals, 'shadowRoot', {
        get: () => internals.shadowRoot
      });
      return mockInternals;
    } catch (e) {
      // Fall through to mock
    }
  }
  return new MockElementInternals(this);
};

// Patch FormData to include form-associated custom elements
const originalFormDataConstructor = global.FormData;

class PatchedFormData extends originalFormDataConstructor {
  constructor(form) {
    super(form);
    if (form && form.querySelectorAll) {
      // Find form-associated custom elements and add their values
      const elements = form.querySelectorAll('*');
      elements.forEach(el => {
        const internals = elementInternalsMap.get(el);
        if (internals && internals._formValue !== null) {
          const name = el.getAttribute('name');
          if (name) {
            this.set(name, internals._formValue);
          }
        }
      });
    }
  }
}

global.FormData = PatchedFormData;

// Patch HTMLFormElement.prototype.reset to call formResetCallback on form-associated custom elements
const originalFormReset = HTMLFormElement.prototype.reset;

HTMLFormElement.prototype.reset = function() {
  // Call original reset first
  originalFormReset.call(this);
  
  // Find form-associated custom elements and call their formResetCallback
  const elements = this.querySelectorAll('*');
  elements.forEach(el => {
    if (el.constructor.formAssociated && typeof el.formResetCallback === 'function') {
      el.formResetCallback();
    }
  });
};
