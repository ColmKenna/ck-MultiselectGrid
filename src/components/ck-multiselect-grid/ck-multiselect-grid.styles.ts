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
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  margin: 0;
  padding: 1.5rem;
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
