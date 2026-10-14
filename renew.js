const RENEW_REGISTRY = './data/renew/libraries.json';
const renew = { themes: [], selected: null, journey: null };
const byId = id => document.getElementById(id);
const validText = value => typeof value === 'string' && value.trim().length > 0;
const message = text => { byId('renew-library-status').textContent = text; };

function validReference(reference) {
  return reference && validText(reference.book) && validText(reference.label)
    && ['startChapter', 'startVerse', 'endChapter', 'endVerse'].every(key => Number.isInteger(reference[key]));
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

async function resolvePassage(reference) {
  const response = await fetch(`./data/books/${reference.book}.json`);
  if (!response.ok) throw new Error(`Could not load ${reference.label}.`);
  const book = await response.json();
  const verses = [];
  for (let chapter = reference.startChapter; chapter <= reference.endChapter; chapter++) {
    const start = chapter === reference.startChapter ? reference.startVerse : 1;
    const chapterVerses = book.chapters[String(chapter)] || {};
    const end = chapter === reference.endChapter ? reference.endVerse : Math.max(...Object.keys(chapterVerses).map(Number));
    for (let verse = start; verse <= end; verse++) {
      const text = chapterVerses[String(verse)];
      if (!text) throw new Error(`${reference.label} does not match the available BSB text.`);
      verses.push({ verse, text });
    }
  }
  return verses;
}

function renderWords(container, text) {
  const words = text.match(/\S+/g) || [];
  const controls = document.createElement('div'); controls.className = 'renew-emphasis-controls';
  const previous = document.createElement('button'); previous.type = 'button'; previous.textContent = 'Previous word';
  const next = document.createElement('button'); next.type = 'button'; next.textContent = 'Next word';
  const wordsLine = document.createElement('div'); wordsLine.className = 'renew-words'; wordsLine.setAttribute('aria-label', 'Words in the Scripture passage');
  let selected = 0;
  const buttons = words.map((word, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'renew-word'; button.textContent = word; button.setAttribute('aria-pressed', 'false');
    button.onclick = () => selectWord(index);
    wordsLine.append(button, document.createTextNode(' '));
    return button;
  });
  function selectWord(index) {
    selected = (index + buttons.length) % buttons.length;
    buttons.forEach((button, wordIndex) => button.setAttribute('aria-pressed', String(wordIndex === selected)));
    buttons[selected].focus();
  }
  previous.onclick = () => selectWord(selected - 1);
  next.onclick = () => selectWord(selected + 1);
  wordsLine.onkeydown = event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); selectWord(selected + (event.key === 'ArrowRight' ? 1 : -1));
  };
  controls.append(previous, next); container.append(controls, wordsLine); selectWord(0);
}

function renderJourney() {
  const root = byId('renew-journey'); root.replaceChildren();
  const { scripture, verses, step } = renew.journey;
  const label = document.createElement('p'); label.className = 'eyebrow'; label.textContent = step === 'read' ? 'Step 1 of 5 · Read' : 'Step 2 of 5 · Emphasise';
  const heading = document.createElement('h2'); heading.textContent = scripture.reference.label;
  const guidance = document.createElement('p'); guidance.className = 'renew-guidance'; guidance.textContent = step === 'read' ? 'Read this Scripture slowly three times. Let the words settle before moving on.' : 'Move the emphasis through one word at a time. Notice which word begins to stand out.';
  root.append(label, heading, guidance);
  if (step === 'read') {
    const passage = document.createElement('p'); passage.className = 'renew-passage';
    verses.forEach(({ verse, text }) => { const number = document.createElement('sup'); number.textContent = verse; passage.append(number, document.createTextNode(` ${text} `)); });
    const next = document.createElement('button'); next.type = 'button'; next.className = 'renew-begin'; next.textContent = 'Continue to Emphasise'; next.onclick = () => { renew.journey.step = 'emphasise'; renderJourney(); };
    root.append(passage, next);
  } else {
    renderWords(root, verses.map(item => item.text).join(' '));
    const back = document.createElement('button'); back.type = 'button'; back.textContent = 'Read again'; back.onclick = () => { renew.journey.step = 'read'; renderJourney(); };
    root.append(back);
  }
}

async function beginJourney(theme) {
  const scripture = theme.scriptures[Math.floor(Math.random() * theme.scriptures.length)];
  const root = byId('renew-journey'); root.hidden = false; root.textContent = 'Loading Scripture…';
  try { renew.journey = { scripture, verses: await resolvePassage(scripture.reference), step: 'read' }; renderJourney(); }
  catch (error) { root.textContent = error.message; }
}

function showSelection(theme) {
  renew.selected = theme; renew.journey = null;
  const selection = byId('renew-selection'); selection.hidden = false; selection.replaceChildren(); byId('renew-journey').hidden = true;
  const heading = document.createElement('h3'); heading.textContent = theme.name;
  const note = document.createElement('p'); note.textContent = theme.description;
  const status = document.createElement('p'); status.className = 'session-meta'; status.textContent = theme.scriptures.length ? `${theme.scriptures.length} Scripture ${theme.scriptures.length === 1 ? 'passage is' : 'passages are'} ready for the RENEW journey.` : 'This example theme is ready for an authored Scripture library.';
  selection.append(heading, note, status);
  if (theme.scriptures.length) { const begin = document.createElement('button'); begin.type = 'button'; begin.className = 'renew-begin'; begin.textContent = 'Begin meditation'; begin.onclick = () => beginJourney(theme); selection.append(begin); }
}

function renderThemes() {
  const grid = byId('renew-theme-grid'); grid.replaceChildren();
  message(renew.themes.length ? `${renew.themes.length} theme${renew.themes.length === 1 ? '' : 's'} available. Scripture collections are managed separately.` : 'No themes are available yet.');
  for (const theme of renew.themes) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'renew-theme';
    const name = document.createElement('strong'); name.textContent = theme.name;
    const description = document.createElement('span'); description.textContent = theme.description;
    button.append(name, description); button.onclick = () => showSelection(theme); grid.append(button);
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
    renew.themes = loaded.flat(); renderThemes();
  } catch (error) { renew.themes = []; byId('renew-theme-grid').replaceChildren(); message(error.message); }
}

export function initRenew() { loadRenewLibraries(); }
