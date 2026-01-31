export const ckMultiselectGridCSS = `
:host {
  display: block;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

.ck-multiselect-grid {
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.multiselect-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 1rem;
}

.form-text {
  font-size: 0.95rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.multiselect-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

@media (min-width: 768px) {
  .multiselect-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (min-width: 1024px) {
  .multiselect-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 575.98px) {
  .multiselect-grid {
    grid-template-columns: 1fr;
  }
}

.multiselect-option {
  display: flex;
  align-items: center;
  border: 1px solid var(--input-border, #d0d5dd);
  border-radius: 0.375rem;
  background-color: var(--card-bg, #ffffff);
  transition: all 0.2s ease-in-out;
}

.multiselect-option:hover {
  border-color: var(--primary-color, #4338ca);
  background-color: var(--surface-bg, #eef2ff);
}

.multiselect-option:focus-within {
  outline: 2px solid var(--focus-border, #4338ca);
  outline-offset: 2px;
}

.multiselect-option:has(.multiselect-input:checked),
.multiselect-option.is-selected,
.multiselect-option[data-selected='true'] {
  background-color: var(--option-pill-active-bg, #4338ca);
  border-color: var(--primary-color, #4338ca);
}

.multiselect-option:has(.multiselect-input:checked) .multiselect-pill,
.multiselect-option.is-selected .multiselect-pill,
.multiselect-option[data-selected='true'] .multiselect-pill {
  color: var(--text-light, #ffffff);
}

@media (prefers-contrast: more) {
  .multiselect-option {
    border-width: 2px;
  }
}

@media print {
  .multiselect-option {
    page-break-inside: avoid;
    margin-bottom: 0.5rem;
  }
}

.multiselect-input {
  appearance: none;
  -webkit-appearance: none;
  position: absolute;
  opacity: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  margin-right: 0.75rem;
  cursor: pointer;
  border: 1px solid var(--input-border, #d0d5dd);
  border-radius: 0.25rem;
  background-color: var(--card-bg, #ffffff);
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
}

.multiselect-input:checked {
  background-color: var(--primary-color, #4338ca);
  border-color: var(--primary-color, #4338ca);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.multiselect-input:focus {
  outline: 0;
  border-color: var(--focus-border, #4338ca);
  box-shadow: var(--focus-shadow, 0 0 0 3px rgba(67, 56, 202, 0.25));
}

.multiselect-input:focus-visible {
  outline: 2px solid var(--focus-border, #4338ca);
  outline-offset: 2px;
}

.multiselect-input:disabled {
  background-color: var(--form-bg, #e2e8f0);
  border-color: var(--input-border, #d0d5dd);
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 575.98px) {
  .multiselect-input {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.625rem;
  }
}

@media (prefers-contrast: more) {
  .multiselect-input {
    border-width: 2px;
  }
}

@media print {
  .multiselect-input {
    margin-right: 0.5rem;
  }
}

.multiselect-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
  flex-grow: 1;
  min-width: 0;
  padding: 0.75rem;
}

@media (max-width: 575.98px) {
  .multiselect-label {
    padding: 0.625rem;
  }
}

.multiselect-pill {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  color: var(--option-pill-color, #0f172a);
}

@media (max-width: 575.98px) {
  .multiselect-pill {
    font-size: 0.875rem;
    padding: 0.3125rem 0.625rem;
  }
}

@media (prefers-contrast: more) {
  .multiselect-pill {
    font-weight: 600;
  }
}

@media print {
  .multiselect-grid {
    display: block;
    page-break-inside: avoid;
  }
}
`;

// Try to create a constructable stylesheet where supported. Fall back to null.
export const ckMultiselectGridSheet: CSSStyleSheet | null = (() => {
  try {
    // CSSStyleSheet may not be available in older browsers
    // create and populate the sheet once at module-eval time
    // so it gets parsed only once.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: may not exist in all targets
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(ckMultiselectGridCSS);
    return sheet;
  } catch {
    return null;
  }
})();
