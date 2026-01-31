import {
  ckMultiselectGridSheet,
  ckMultiselectGridCSS,
} from './ck-multiselect-grid.styles';

export class CkMultiselectGrid extends HTMLElement {
  private shadow: ShadowRoot;
  private initialized = false;

  private container!: HTMLDivElement;
  private fieldset!: HTMLFieldSetElement;
  private titleLabel!: HTMLDivElement;
  private descriptionText!: HTMLDivElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    // Adopt the constructable stylesheet when supported. We do this once per instance
    // but the underlying sheet was created once at module load time.
    const adopted = (
      this.shadow as unknown as ShadowRoot & {
        adoptedStyleSheets?: CSSStyleSheet[];
      }
    ).adoptedStyleSheets;
    if (ckMultiselectGridSheet && adopted !== undefined) {
      (
        this.shadow as unknown as ShadowRoot & {
          adoptedStyleSheets: CSSStyleSheet[];
        }
      ).adoptedStyleSheets = [...adopted, ckMultiselectGridSheet];
    }
  }

  static get observedAttributes() {
    return [
      'title',
      'description',
      'discription',
      'fieldset-id',
      'fieldset-class',
    ];
  }

  connectedCallback() {
    this.ensureInitialized();
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (this.isConnected) {
        this.ensureInitialized();
        this.render();
      }
    }
  }

  get title() {
    return this.getAttribute('title') || 'Select Resource Scopes';
  }

  set title(value: string) {
    this.setAttribute('title', value);
  }

  get description(): string | null {
    return this.getAttribute('description');
  }

  set description(value: string) {
    this.setAttribute('description', value);
  }

  get discription(): string | null {
    return this.getAttribute('discription');
  }

  set discription(value: string) {
    this.setAttribute('discription', value);
  }

  private ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    // If constructable stylesheets are not available, inject a fallback <style>
    // once for this shadow root.
    if (!ckMultiselectGridSheet) {
      const style = document.createElement('style');
      style.setAttribute('data-ck-multiselect-grid-fallback', '');
      style.textContent = ckMultiselectGridCSS;
      this.shadow.appendChild(style);
    }

    this.container = document.createElement('div');
    this.container.className = 'ck-multiselect-grid';

    this.fieldset = document.createElement('fieldset');
    this.applyFieldsetMetadata();

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    // Chosen semantics: this is a heading/label-like text, not a <label> tied to a control.
    this.titleLabel = document.createElement('div');
    this.titleLabel.className = 'form-label';

    this.descriptionText = document.createElement('div');
    this.descriptionText.className = 'form-text';

    formGroup.appendChild(this.titleLabel);
    formGroup.appendChild(this.descriptionText);
    this.fieldset.appendChild(formGroup);
    this.container.appendChild(this.fieldset);
    this.shadow.appendChild(this.container);
  }

  private getDescriptionText() {
    return (
      this.getAttribute('description') ??
      this.getAttribute('discription') ??
      'Choose which resource scopes this client is allowed to request.'
    );
  }

  private getFieldsetId(): string {
    return this.getAttribute('fieldset-id')?.trim() || 'scopes-fieldset';
  }

  private getFieldsetClassName(): string {
    const classes = ['multiselect-fieldset'];
    const extra = this.getAttribute('fieldset-class');
    if (extra) {
      const tokens = extra
        .split(/\s+/)
        .map(token => token.trim())
        .filter(Boolean);
      classes.push(...tokens);
    }
    return classes.join(' ');
  }

  private applyFieldsetMetadata() {
    if (!this.fieldset) return;
    this.fieldset.id = this.getFieldsetId();
    this.fieldset.className = this.getFieldsetClassName();
  }

  private render() {
    this.titleLabel.textContent = this.title;
    this.descriptionText.textContent = this.getDescriptionText();
    this.applyFieldsetMetadata();
  }
}

// Register the custom element
if (!customElements.get('ck-multiselect-grid')) {
  customElements.define('ck-multiselect-grid', CkMultiselectGrid);
}
