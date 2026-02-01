import {
  ckMultiselectGridSheet,
  ckMultiselectGridCSS,
} from './ck-multiselect-grid.styles';

const DEFAULT_TITLE = 'Select Items';
const DEFAULT_DESCRIPTION = 'Choose the items that apply to this client.';
const DEFAULT_FIELDSET_ID = 'ck-multiselect-grid-fieldset';
const DEFAULT_LABEL_ID = 'ck-multiselect-grid-label';

type MultiselectOption = {
  id: string;
  label: string;
  name: string;
  value: string;
};

export class CkMultiselectGrid extends HTMLElement {
  // Form-associated custom element marker
  static formAssociated = true;

  private shadow: ShadowRoot;
  private initialized = false;
  private internals: ElementInternals;
  private initialSelectedValues: string[] = [];
  private currentSelectedValues: string[] = [];
  private isDisabled = false;

  /** WeakMap associating checkbox inputs with their option metadata. */
  private inputOptionMap = new WeakMap<HTMLInputElement, MultiselectOption>();
  /** WeakMap associating checkbox inputs with their container div. */
  private inputContainerMap = new WeakMap<HTMLInputElement, HTMLDivElement>();
  /** Cached checkbox references for efficient sync operations. */
  private checkboxCache: HTMLInputElement[] = [];

  /**
   * Delegated event handler for checkbox change events.
   * Uses event delegation on multiselectGroup to avoid per-element listeners.
   */
  private handleInputChange = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') {
      return;
    }

    const option = this.inputOptionMap.get(target);
    if (!option) {
      return;
    }

    const isSelected = target.checked;
    this.syncCheckboxCheckedAttribute(target);
    this.updateOptionSelectionState(target);

    // Update current selected values for form integration
    if (isSelected) {
      if (!this.currentSelectedValues.includes(option.value)) {
        this.currentSelectedValues.push(option.value);
      }
    } else {
      this.currentSelectedValues = this.currentSelectedValues.filter(
        v => v !== option.value
      );
    }
    this.updateFormValue();

    const eventName = isSelected
      ? 'ck-multiselect-option-selected'
      : 'ck-multiselect-option-unselected';

    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          option: { ...option },
          checked: isSelected,
        },
        bubbles: true,
        composed: true,
      })
    );
  };

  private container!: HTMLDivElement;
  private fieldset!: HTMLFieldSetElement;
  private titleLabel!: HTMLDivElement;
  private descriptionText!: HTMLDivElement;
  private multiselectGroup!: HTMLDivElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.internals = this.attachInternals();

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
      'fieldset-id',
      'fieldset-class',
      'availableitems',
      'selecteditems',
      'name',
    ];
  }

  connectedCallback() {
    this.ensureInitialized();
    // Capture initial selected values for form reset
    this.initialSelectedValues = [...this.getSelectedValues()];
    this.currentSelectedValues = [...this.initialSelectedValues];
    this.render();
    this.updateFormValue();

    // Set up event delegation on the multiselect group container
    this.multiselectGroup?.addEventListener('change', this.handleInputChange);
  }

  /**
   * Lifecycle callback invoked when the element is removed from the DOM.
   * Cleans up event listeners to prevent memory leaks.
   */
  disconnectedCallback() {
    // Remove delegated event listener
    this.multiselectGroup?.removeEventListener(
      'change',
      this.handleInputChange
    );
    // Clear checkbox cache to allow GC
    this.checkboxCache = [];
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
    return this.getAttribute('title') || DEFAULT_TITLE;
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

  // Form-associated: name property for FormData key
  get name(): string | null {
    return this.getAttribute('name');
  }

  set name(value: string) {
    this.setAttribute('name', value);
  }

  // Form-associated: value property reflecting current selections
  get value(): string[] {
    return [...this.currentSelectedValues];
  }

  set value(newValues: string[]) {
    this.currentSelectedValues = [...newValues];
    this.updateFormValue();
    this.syncCheckboxesToCurrentValues();
  }

  // Form-associated: expose the associated form
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  // Form-associated lifecycle callback: called when element is added/removed from form
  formAssociatedCallback() {
    // ElementInternals automatically handles form association; no custom logic required.
  }

  // Form-associated lifecycle callback: called when form is reset
  formResetCallback() {
    this.currentSelectedValues = [...this.initialSelectedValues];
    this.updateFormValue();
    this.syncCheckboxesToCurrentValues();
  }

  // Form-associated lifecycle callback: called when disabled state changes
  formDisabledCallback(disabled: boolean) {
    this.isDisabled = disabled;
    this.syncDisabledState();
  }

  // Form-associated lifecycle callback: called when form state is restored (e.g., back/forward navigation)
  formStateRestoreCallback(state: string) {
    if (state) {
      try {
        const values = JSON.parse(state);
        if (Array.isArray(values)) {
          this.currentSelectedValues = values;
          this.updateFormValue();
          this.syncCheckboxesToCurrentValues();
        }
      } catch {
        // Ignore invalid state
      }
    }
  }

  private syncCheckboxesToCurrentValues() {
    if (!this.multiselectGroup) return;
    const selectedSet = new Set(this.currentSelectedValues);

    // Use cached checkbox references for efficient sync
    this.checkboxCache.forEach(checkbox => {
      const shouldBeChecked = selectedSet.has(checkbox.value);
      checkbox.checked = shouldBeChecked;
      this.syncCheckboxCheckedAttribute(checkbox);
      this.updateOptionSelectionState(checkbox);
    });
  }

  private syncDisabledState() {
    // Use cached checkbox references for efficient sync
    this.checkboxCache.forEach(checkbox => {
      checkbox.disabled = this.isDisabled;
    });
  }

  private updateFormValue() {
    const name = this.name;
    if (name) {
      const jsonValue = JSON.stringify(this.currentSelectedValues);
      this.internals.setFormValue(jsonValue, jsonValue);
    } else {
      this.internals.setFormValue(null);
    }
  }

  /**
   * Initializes the component's shadow DOM structure.
   * Creates the following hierarchy:
   *   .ck-multiselect-grid (container)
   *     └── fieldset.multiselect-fieldset
   *           ├── .form-group
   *           │     ├── .form-label (titleLabel)
   *           │     └── .form-text (descriptionText)
   *           └── .multiselect-grid[role="group"] (multiselectGroup)
   *                 └── .multiselect-option * n (rendered by renderMultiselectOptions)
   *
   * Uses constructable stylesheets when available, with <style> fallback.
   */
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
    multiselectDiv.setAttribute('aria-labelledby', DEFAULT_LABEL_ID);
    this.multiselectGroup = multiselectDiv;
    this.fieldset.appendChild(this.multiselectGroup);
    this.container.appendChild(this.fieldset);
    this.shadow.appendChild(this.container);
  }

  private getDescriptionText() {
    return this.getAttribute('description') ?? DEFAULT_DESCRIPTION;
  }

  private getFieldsetId(): string {
    return this.getAttribute('fieldset-id')?.trim() || DEFAULT_FIELDSET_ID;
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
    const labelId = DEFAULT_LABEL_ID;
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
    const selectedValuesList = this.getSelectedValues();
    const selectedValues = new Set(selectedValuesList);
    const availableOptions = this.getAvailableOptions();
    const synthesizedOptions = this.buildSelectedOnlyOptions(
      availableOptions,
      selectedValuesList
    );
    const options = [...availableOptions, ...synthesizedOptions];
    const usedIds = new Set<string>();

    const optionNodes = options.map((option, index) => {
      const resolvedId = this.resolveOptionId(option.id, usedIds, index);
      const isSelected = selectedValues.has(option.value);
      return this.buildOptionNode({ ...option, id: resolvedId }, isSelected);
    });

    this.multiselectGroup.replaceChildren(...optionNodes);

    // Cache checkbox references for efficient sync operations
    this.checkboxCache = Array.from(
      this.multiselectGroup.querySelectorAll('input[type="checkbox"]')
    ) as HTMLInputElement[];
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
    // Note: aria-describedby removed; the <label> already provides the accessible name
    this.inputOptionMap.set(checkbox, option);
    this.inputContainerMap.set(checkbox, optionDiv);
    // Event listener handled via delegation on multiselectGroup
    if (isSelected) {
      checkbox.checked = true;
      // Boolean attribute: presence indicates checked state
      checkbox.setAttribute('checked', '');
    }
    this.setOptionSelectionState(optionDiv, isSelected);

    const label = document.createElement('label');
    label.className = 'multiselect-label';
    label.setAttribute('for', option.id);

    const pill = document.createElement('span');
    pill.className = 'multiselect-pill';
    pill.id = `${option.id}-desc`;
    pill.textContent = option.label;
    // Note: pill click handler removed; <label> natively toggles the checkbox

    label.appendChild(pill);
    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(label);

    return optionDiv;
  }

  private buildSelectedOnlyOptions(
    existingOptions: MultiselectOption[],
    selectedValues: string[]
  ): MultiselectOption[] {
    if (!selectedValues.length) {
      return [];
    }

    const existingValueSet = new Set(
      existingOptions.map(option => option.value)
    );
    const synthesized: MultiselectOption[] = [];

    selectedValues.forEach(value => {
      if (existingValueSet.has(value)) {
        return;
      }

      const normalized = this.normalizeOption(
        value,
        existingOptions.length + synthesized.length
      );
      if (normalized) {
        existingValueSet.add(normalized.value);
        synthesized.push(normalized);
      }
    });

    return synthesized;
  }

  private syncCheckboxCheckedAttribute(input: HTMLInputElement) {
    if (input.checked) {
      // Boolean attribute: presence indicates checked state
      input.setAttribute('checked', '');
    } else {
      input.removeAttribute('checked');
    }
  }

  private updateOptionSelectionState(input: HTMLInputElement) {
    const container = this.inputContainerMap.get(input);
    if (!container) {
      return;
    }

    this.setOptionSelectionState(container, input.checked);
  }

  private setOptionSelectionState(
    container: HTMLDivElement,
    isSelected: boolean
  ) {
    container.dataset.selected = isSelected ? 'true' : 'false';
    container.classList.toggle('is-selected', isSelected);
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
        { error, raw }
      );
      return [];
    }
  }

  /**
   * Normalizes an option entry (string or object) into a MultiselectOption.
   * For objects, the fallback priority for determining the value is:
   *   value → label → name
   * String entries use the trimmed string for all fields.
   */
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
