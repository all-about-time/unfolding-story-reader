const RENEW_REGISTRY = './data/renew/libraries.json';
const renew = { libraries: [], selected: null };
const byId = id => document.getElementById(id);

function libraryThemes(registry) {
  return (registry.libraries || []).flatMap(library => (library.themes || []).map(theme => ({ ...theme, libraryId: library.id, libraryName: library.name, libraryStatus: library.status })));
}

function showSelection(theme) {
  renew.selected = theme;
  const selection = byId('renew-selection');
  selection.hidden = false;
  selection.innerHTML = '';
  const heading = document.createElement('h3');
  heading.textContent = theme.name;
  const note = document.createElement('p');
  note.textContent = theme.description;
  const status = document.createElement('p');
  status.className = 'session-meta';
  status.textContent = theme.libraryStatus === 'placeholder'
    ? 'This example theme is ready for a Scripture library to be added.'
    : 'This theme will open its Scripture meditation in the next RENEW milestone.';
  selection.append(heading, note, status);
}

function renderThemes(registry) {
  const grid = byId('renew-theme-grid');
  grid.replaceChildren();
  const themes = libraryThemes(registry);
  byId('renew-library-status').textContent = themes.length
    ? `${themes.length} example theme${themes.length === 1 ? '' : 's'} available. Scripture collections will be added separately.`
    : 'No themes are available yet.';
  for (const theme of themes) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'renew-theme';
    const name = document.createElement('strong');
    name.textContent = theme.name;
    const description = document.createElement('span');
    description.textContent = theme.description;
    button.append(name, description);
    button.onclick = () => showSelection(theme);
    grid.append(button);
  }
}

async function loadRenewLibraries() {
  try {
    const response = await fetch(RENEW_REGISTRY);
    if (!response.ok) throw new Error('The Scripture library registry could not be loaded.');
    const registry = await response.json();
    if (!Array.isArray(registry.libraries)) throw new Error('The Scripture library registry is not valid.');
    renew.libraries = registry.libraries;
    renderThemes(registry);
  } catch (error) {
    byId('renew-library-status').textContent = error.message;
  }
}

export function initRenew() {
  loadRenewLibraries();
}
