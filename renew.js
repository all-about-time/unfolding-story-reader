const RENEW_REGISTRY = './data/renew/libraries.json';
const renew = { themes: [], selected: null };
const byId = id => document.getElementById(id);

function message(text) { byId('renew-library-status').textContent = text; }
function validText(value) { return typeof value === 'string' && value.trim().length > 0; }
function validReference(reference) {
  return reference && validText(reference.book) && validText(reference.label)
    && Number.isInteger(reference.startChapter) && Number.isInteger(reference.startVerse)
    && Number.isInteger(reference.endChapter) && Number.isInteger(reference.endVerse);
}

function normalizeThemes(library, themes) {
  if (!Array.isArray(themes)) throw new Error(`${library.name} does not contain themes.`);
  return themes.map(theme => {
    if (!validText(theme.id) || !validText(theme.name) || !validText(theme.description)) throw new Error(`${library.name} contains an incomplete theme.`);
    const scriptures = theme.scriptures || [];
    if (!Array.isArray(scriptures) || scriptures.some(item => !validText(item.id) || !validReference(item.reference))) throw new Error(`${library.name} contains an invalid Scripture reference.`);
    return { ...theme, scriptures, libraryId: library.id, libraryName: library.name, libraryStatus: library.status };
  });
}

async function loadActiveLibrary(library) {
  if (!validText(library.file)) throw new Error(`${library.name} needs a library file.`);
  const response = await fetch(library.file);
  if (!response.ok) throw new Error(`${library.name} could not be loaded.`);
  const data = await response.json();
  if (data.schemaVersion !== '1.0') throw new Error(`${library.name} has an unsupported library format.`);
  return normalizeThemes(library, data.themes);
}

function showSelection(theme) {
  renew.selected = theme;
  const selection = byId('renew-selection');
  selection.hidden = false;
  selection.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = theme.name;
  const note = document.createElement('p');
  note.textContent = theme.description;
  const status = document.createElement('p');
  status.className = 'session-meta';
  status.textContent = theme.scriptures.length
    ? `${theme.scriptures.length} Scripture ${theme.scriptures.length === 1 ? 'passage is' : 'passages are'} ready for the RENEW journey.`
    : 'This example theme is ready for an authored Scripture library.';
  selection.append(heading, note, status);
}

function renderThemes() {
  const grid = byId('renew-theme-grid');
  grid.replaceChildren();
  message(renew.themes.length
    ? `${renew.themes.length} theme${renew.themes.length === 1 ? '' : 's'} available. Scripture collections are managed separately.`
    : 'No themes are available yet.');
  for (const theme of renew.themes) {
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
    if (registry.schemaVersion !== '1.0' || !Array.isArray(registry.libraries)) throw new Error('The Scripture library registry is not valid.');
    const loaded = await Promise.all(registry.libraries.map(async library => {
      if (!validText(library.id) || !validText(library.name) || !['placeholder', 'active'].includes(library.status)) throw new Error('The Scripture library registry contains an invalid library.');
      return library.status === 'active' ? loadActiveLibrary(library) : normalizeThemes(library, library.themes);
    }));
    renew.themes = loaded.flat();
    renderThemes();
  } catch (error) {
    renew.themes = [];
    byId('renew-theme-grid').replaceChildren();
    message(error.message);
  }
}

export function initRenew() { loadRenewLibraries(); }
