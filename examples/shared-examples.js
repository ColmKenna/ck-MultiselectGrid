const BASE_OPTIONS = [
  { id: 'scope-read', label: 'Scope.Read', name: 'scope', value: 'scope.read' },
  { id: 'scope-write', label: 'Scope.Write', name: 'scope', value: 'scope.write' },
  { id: 'scope-manage', label: 'Scope.Manage', name: 'scope', value: 'scope.manage' },
  { id: 'scope-admin', label: 'Scope.Admin', name: 'scope', value: 'scope.admin' },
  { id: 'scope-sharing', label: 'Scope.Sharing', name: 'scope', value: 'scope.sharing' },
  { id: 'scope-audit', label: 'Scope.Audit', name: 'scope', value: 'scope.audit' }
];

const COMPLEX_OPTIONS = [
  { id: 'scope-read', label: 'Scope.Read (GET)', name: 'scope', value: 'scope.read' },
  { id: 'scope-write', label: 'Scope.Write (POST)', name: 'scope', value: 'scope.write' },
  { id: 'scope-delete', label: 'Scope.Delete (DELETE)', name: 'scope', value: 'scope.delete' },
  { id: 'scope-manage-users', label: 'Scope.ManageUsers', name: 'scope', value: 'scope.manage.users' },
  { id: 'scope-manage-apps', label: 'Scope.ManageApps', name: 'scope', value: 'scope.manage.apps' },
  { id: 'scope-reporting', label: 'Scope.Reporting', name: 'scope', value: 'scope.reporting' },
  { id: 'scope-analytics', label: 'Scope.Analytics', name: 'scope', value: 'scope.analytics' },
  { id: 'scope-exports', label: 'Scope.Exports', name: 'scope', value: 'scope.exports' }
];

function buildOptions(prefix, count) {
  return Array.from({ length: count }, (_, index) => {
    const num = String(index + 1).padStart(2, '0');
    return {
      id: `${prefix}-${num}`,
      label: `${prefix.toUpperCase()} Option ${num}`,
      name: prefix,
      value: `${prefix}.${num}`
    };
  });
}

export const optionsCatalog = {
  base: BASE_OPTIONS,
  complex: COMPLEX_OPTIONS,
  medium: buildOptions('scope', 16),
  large: buildOptions('scope', 48)
};

export function setGridData(grid, options = optionsCatalog.base, selected = []) {
  if (!grid) return;
  grid.setAttribute('availableItems', JSON.stringify(options));
  grid.setAttribute('selectedItems', JSON.stringify(selected));
}

export function snapshotState(grid) {
  const shadow = grid.shadowRoot;
  const inputs = Array.from(shadow?.querySelectorAll('input[type="checkbox"]') ?? []);
  const selected = inputs.filter(input => input.checked).map(input => input.value);
  return {
    total: inputs.length,
    selected,
    checkedCount: selected.length,
    dirty: grid.dataset.dirty === 'true',
    disabled: grid.hasAttribute('disabled') || grid.dataset.disabled === 'true',
    readonly: grid.dataset.readonly === 'true'
  };
}

export function observeSelections(grid, callback) {
  if (!grid) return () => void 0;
  const handler = () => callback(snapshotState(grid));
  grid.addEventListener('ck-multiselect-option-selected', handler);
  grid.addEventListener('ck-multiselect-option-unselected', handler);
  const observer = new MutationObserver(handler);
  observer.observe(grid, { attributes: true, attributeFilter: ['selectedItems'] });
  customElements.whenDefined('ck-multiselect-grid').then(handler);
  return () => {
    grid.removeEventListener('ck-multiselect-option-selected', handler);
    grid.removeEventListener('ck-multiselect-option-unselected', handler);
    observer.disconnect();
  };
}

export function syncHiddenInput(form, grid, inputName = 'scopes') {
  if (!form || !grid) return;
  const hidden = form.querySelector(`input[name="${inputName}"]`) ?? document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = inputName;
  form.appendChild(hidden);
  const update = () => {
    hidden.value = JSON.stringify(snapshotState(grid).selected);
  };
  observeSelections(grid, update);
  update();
}

export function simulateLoading(wrapper, grid, loaderEl, promiseFactory) {
  if (!wrapper || !grid || !loaderEl) return;
  wrapper.dataset.state = 'loading';
  loaderEl.textContent = 'Loading scopes…';
  promiseFactory().then(({ options, selected }) => {
    setGridData(grid, options, selected);
    wrapper.dataset.state = 'ready';
    loaderEl.textContent = 'Loaded';
  }).catch(error => {
    console.error(error);
    wrapper.dataset.state = 'error';
    loaderEl.textContent = 'Failed to load scopes';
  });
}

export function logEvents(grid, listEl) {
  if (!grid || !listEl) return;
  const push = event => {
    const time = new Date().toLocaleTimeString();
    const row = document.createElement('li');
    row.textContent = `${time} • ${event.type} • ${event.detail.option.value}`;
    listEl.prepend(row);
    const items = Array.from(listEl.querySelectorAll('li'));
    if (items.length > 12) {
      items.slice(12).forEach(li => li.remove());
    }
  };
  grid.addEventListener('ck-multiselect-option-selected', push);
  grid.addEventListener('ck-multiselect-option-unselected', push);
}

export function markDirtyOnInteraction(grid, indicatorEl) {
  if (!grid) return;
  const setDirty = () => {
    grid.dataset.dirty = 'true';
    if (indicatorEl) {
      indicatorEl.textContent = 'dirty';
    }
  };
  grid.addEventListener('ck-multiselect-option-selected', setDirty);
  grid.addEventListener('ck-multiselect-option-unselected', setDirty);
}

export function attachLifecycleDebug(grid, logEl) {
  if (!grid || !logEl) return;
  logEl.textContent = 'connectedCallback() executed';
  const attributeChanged = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      const row = document.createElement('li');
      row.textContent = `${mutation.attributeName}: ${grid.getAttribute(mutation.attributeName)}`;
      logEl.appendChild(row);
    });
  });
  attributeChanged.observe(grid, { attributes: true });
}
