const BASE_OPTIONS = [
  { id: 'item-read', label: 'Item.Read', name: 'item', value: 'item.read' },
  { id: 'item-write', label: 'Item.Write', name: 'item', value: 'item.write' },
  { id: 'item-manage', label: 'Item.Manage', name: 'item', value: 'item.manage' },
  { id: 'item-admin', label: 'Item.Admin', name: 'item', value: 'item.admin' },
  { id: 'item-sharing', label: 'Item.Sharing', name: 'item', value: 'item.sharing' },
  { id: 'item-audit', label: 'Item.Audit', name: 'item', value: 'item.audit' }
];

const COMPLEX_OPTIONS = [
  { id: 'item-read', label: 'Item.Read (GET)', name: 'item', value: 'item.read' },
  { id: 'item-write', label: 'Item.Write (POST)', name: 'item', value: 'item.write' },
  { id: 'item-delete', label: 'Item.Delete (DELETE)', name: 'item', value: 'item.delete' },
  { id: 'item-manage-users', label: 'Item.ManageUsers', name: 'item', value: 'item.manage.users' },
  { id: 'item-manage-apps', label: 'Item.ManageApps', name: 'item', value: 'item.manage.apps' },
  { id: 'item-reporting', label: 'Item.Reporting', name: 'item', value: 'item.reporting' },
  { id: 'item-analytics', label: 'Item.Analytics', name: 'item', value: 'item.analytics' },
  { id: 'item-exports', label: 'Item.Exports', name: 'item', value: 'item.exports' }
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
  medium: buildOptions('item', 16),
  large: buildOptions('item', 48)
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

export function syncHiddenInput(form, grid, inputName = 'selections') {
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
  loaderEl.textContent = 'Loading items...';
  promiseFactory().then(({ options, selected }) => {
    setGridData(grid, options, selected);
    wrapper.dataset.state = 'ready';
    loaderEl.textContent = 'Loaded';
  }).catch(error => {
    console.error(error);
    wrapper.dataset.state = 'error';
    loaderEl.textContent = 'Failed to load items';
  });
}

export function logEvents(grid, listEl) {
  if (!grid || !listEl) return;
  const push = event => {
    const time = new Date().toLocaleTimeString();
    const row = document.createElement('li');
    row.textContent = `${time} * ${event.type} * ${event.detail.option.value}`;
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

