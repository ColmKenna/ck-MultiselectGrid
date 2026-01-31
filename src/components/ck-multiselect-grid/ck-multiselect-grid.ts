import {
  ckMultiselectGridSheet,
  ckMultiselectGridCSS,
} from './ck-multiselect-grid.styles';

type MultiselectOption = {
  id: string;
  label: string;
  name: string;
  value: string;
};

export class CkMultiselectGrid extends HTMLElement {
  private shadow: ShadowRoot;
  private initialized = false;

  private container!: HTMLDivElement;
  private fieldset!: HTMLFieldSetElement;
  private titleLabel!: HTMLDivElement;
  private descriptionText!: HTMLDivElement;
  private multiselectGroup!: HTMLDivElement;

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
      'availableitems',
      'selecteditems',
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

    const multiselectDiv = document.createElement('div');
    multiselectDiv.className = 'multiselect-grid';
    multiselectDiv.setAttribute('role', 'group');
    multiselectDiv.setAttribute('aria-labelledby', 'scopes-label');
    this.multiselectGroup = multiselectDiv;
    this.fieldset.appendChild(this.multiselectGroup);
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
    const labelId = 'scopes-label';
    this.titleLabel.id = labelId;
    this.titleLabel.textContent = this.title;
    this.descriptionText.textContent = this.getDescriptionText();
    this.applyFieldsetMetadata();
    if (this.multiselectGroup) {
      this.multiselectGroup.setAttribute('role', 'group');
      this.multiselectGroup.setAttribute('aria-labelledby', labelId);
    }
    this.renderMultiselectOptions();
  }

  private renderMultiselectOptions() {
    if (!this.multiselectGroup) return;
    const selectedValues = new Set(this.getSelectedValues());
    const options = this.getAvailableOptions();
    const usedIds = new Set<string>();

    const optionNodes = options.map((option, index) => {
      const resolvedId = this.resolveOptionId(option.id, usedIds, index);
      const isSelected = selectedValues.has(option.value);
      return this.buildOptionNode({ ...option, id: resolvedId }, isSelected);
    });

    this.multiselectGroup.replaceChildren(...optionNodes);
  }

  private buildOptionNode(
    option: MultiselectOption,
    isSelected: boolean
  ): HTMLDivElement {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'multiselect-option';

    const checkbox = document.createElement('input');
    checkbox.className = 'multiselect-input';
    checkbox.type = 'checkbox';
    checkbox.id = option.id;
    checkbox.name = option.name;
    checkbox.value = option.value;
    checkbox.setAttribute('aria-describedby', `${option.id}-desc`);
    if (isSelected) {
      checkbox.checked = true;
      checkbox.setAttribute('checked', 'checked');
    }

    const label = document.createElement('label');
    label.className = 'multiselect-label';
    label.setAttribute('for', option.id);

    const pill = document.createElement('span');
    pill.className = 'multiselect-pill';
    pill.id = `${option.id}-desc`;
    pill.textContent = option.label;

    label.appendChild(pill);
    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(label);

    return optionDiv;
  }

  private getAvailableOptions(): MultiselectOption[] {
    const parsed = this.parseAttributeArray('availableItems');
    return parsed
      .map((entry, index) => this.normalizeOption(entry, index))
      .filter((option): option is MultiselectOption => Boolean(option));
  }

  private getSelectedValues(): string[] {
    return this.parseAttributeArray('selectedItems')
      .filter((value): value is string => typeof value === 'string')
      .map(value => value.trim())
      .filter(Boolean);
  }

  private parseAttributeArray(attributeName: string): unknown[] {
    const raw = this.getAttribute(attributeName);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      window.console.warn(
        `[ck-multiselect-grid] Failed to parse ${attributeName}:`,
        error
      );
      return [];
    }
  }

  private normalizeOption(
    entry: unknown,
    index: number
  ): MultiselectOption | null {
    if (typeof entry === 'string') {
      const trimmed = entry.trim();
      if (!trimmed) return null;
      return {
        id: this.createOptionId(trimmed, index),
        label: trimmed,
        name: trimmed,
        value: trimmed,
      };
    }

    if (entry && typeof entry === 'object') {
      const optionRecord = entry as Record<string, unknown>;
      const value =
        this.asNonEmptyString(optionRecord.value) ??
        this.asNonEmptyString(optionRecord.label) ??
        this.asNonEmptyString(optionRecord.name);
      if (!value) return null;

      const label = this.asNonEmptyString(optionRecord.label) ?? value;
      const name = this.asNonEmptyString(optionRecord.name) ?? value;
      const idSource = this.asNonEmptyString(optionRecord.id) ?? name ?? value;
      return {
        id: this.createOptionId(idSource, index),
        label,
        name,
        value,
      };
    }

    return null;
  }

  private asNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private createOptionId(source: string, index: number): string {
    const slug = this.slugify(source);
    return slug || `option-${index}`;
  }

  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private resolveOptionId(
    baseId: string,
    usedIds: Set<string>,
    index: number
  ): string {
    let candidate = baseId || `option-${index}`;
    if (!usedIds.has(candidate)) {
      usedIds.add(candidate);
      return candidate;
    }

    let suffix = 1;
    while (usedIds.has(`${candidate}-${suffix}`)) {
      suffix += 1;
    }

    const resolved = `${candidate}-${suffix}`;
    usedIds.add(resolved);
    return resolved;
  }
}

// Register the custom element
if (!customElements.get('ck-multiselect-grid')) {
  customElements.define('ck-multiselect-grid', CkMultiselectGrid);
}
