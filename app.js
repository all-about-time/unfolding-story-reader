import { initRenew } from './renew.js';
import { initPrayer } from './prayer.js';

const STORAGE = { completed: 'unfolding-story-completed', font: 'unfolding-story-font', theme: 'unfolding-story-theme', accent: 'unfolding-story-accent', fontStyle: 'unfolding-story-font-style' };
const storage = {
  get(key, fallback = null) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { $('storage-note').hidden = false; } }
};
function savedCompleted() {
  try { const values = JSON.parse(storage.get(STORAGE.completed, '[]')); return Array.isArray(values) ? values.filter(id => typeof id === 'string' && /^S\d{3}$/.test(id)) : []; } catch { return []; }
}
const state = { sessions: [], books: new Map(), current: null, completed: new Set(savedCompleted()), font: Math.max(15, Math.min(32, Number(storage.get(STORAGE.font)) || 19)), theme: storage.get(STORAGE.theme) === 'dark' ? 'dark' : 'light' };
const $ = id => document.getElementById(id);
document.documentElement.style.setProperty('--reader-size', `${state.font}px`);
document.documentElement.dataset.theme = state.theme;
const fontStyles = { serif: "Georgia, 'Times New Roman', serif", sans: "Aptos, 'Segoe UI', system-ui, sans-serif", book: "Palatino, 'Palatino Linotype', 'Book Antiqua', serif" };
function setAccent(accent) {
  accent = ['green', 'sky', 'pink', 'gold'].includes(accent) ? accent : 'green';
  document.documentElement.dataset.accent = accent;
  storage.set(STORAGE.accent, accent);
  document.querySelectorAll('[data-accent-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.accentChoice === accent)));
}
function setFontStyle(style) {
  style = Object.hasOwn(fontStyles, style) ? style : 'serif';
  document.documentElement.style.setProperty('--reader-font', fontStyles[style]);
  $('font-style').value = style;
  storage.set(STORAGE.fontStyle, style);
}
function selectTab(name) {
  document.querySelectorAll('[data-tab]').forEach(button => {
    const active = button.dataset.tab === name;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    $(`panel-${button.dataset.tab}`).hidden = !active;
  });
  if (name !== 'reading' && !$('overview').hidden) toggleOverview(false);
}

function sessionFromUrl() {
  const requested = new URLSearchParams(location.search).get('session');
  const lastCompleted = Math.max(0, ...[...state.completed].map(id => Number(id.slice(1))).filter(Number.isFinite));
  const raw = requested || `S${String(Math.min(lastCompleted + 1, state.sessions.length)).padStart(3, '0')}`;
  const normalized = raw.toUpperCase().startsWith('S') ? raw.toUpperCase() : `S${raw.padStart(3, '0')}`;
  return state.sessions.find(session => session.id === normalized) || state.sessions[0];
}
const sessionHref = session => `?session=${session.id}`;

async function loadBook(code) {
  if (!state.books.has(code)) {
    const response = await fetch(`./data/books/${code}.json`);
    if (!response.ok) throw new Error(`Could not load ${code}`);
    state.books.set(code, await response.json());
  }
  return state.books.get(code);
}

function verseRange(ref, book) {
  const result = [];
  for (let chapter = ref.startChapter; chapter <= ref.endChapter; chapter++) {
    const start = chapter === ref.startChapter ? ref.startVerse : 1;
    const end = chapter === ref.endChapter ? ref.endVerse : Math.max(...Object.keys(book.chapters[String(chapter)] || {}).map(Number));
    for (let verse = start; verse <= end; verse++) {
      const text = book.chapters[String(chapter)]?.[String(verse)];
      if (text) result.push({ chapter, verse, text });
    }
  }
  return result;
}

async function passage(ref) {
  const book = await loadBook(ref.book);
  const section = document.createElement('section');
  section.className = 'passage';
  const heading = document.createElement('h2');
  heading.textContent = ref.label;
  section.append(heading);
  const paragraph = document.createElement('p');
  for (const item of verseRange(ref, book)) {
    const span = document.createElement('span');
    span.className = 'verse';
    const number = document.createElement('sup');
    number.className = 'verse-number';
    number.textContent = item.verse;
    span.append(number, document.createTextNode(`${item.text} `));
    paragraph.append(span);
  }
  section.append(paragraph);
  return section;
}

function updateProgress() {
  const count = state.completed.size;
  const percent = Math.round(count / state.sessions.length * 100) || 0;
  $('progress-count').textContent = `${count} of ${state.sessions.length} complete`;
  $('progress-percent').textContent = `${percent}%`;
  $('progress-bar').max = state.sessions.length;
  $('progress-bar').value = count;
  $('reader-progress-count').textContent = `${count} of ${state.sessions.length} complete`;
  $('reader-progress-percent').textContent = `${percent}%`;
  $('reader-progress-bar').max = state.sessions.length;
  $('reader-progress-bar').value = count;
  const lastCompleted = Math.max(0, ...[...state.completed].map(id => Number(id.slice(1))).filter(Number.isFinite));
  const resume = state.sessions[Math.min(lastCompleted, state.sessions.length - 1)];
  $('resume-link').href = sessionHref(resume);
  const complete = state.current && state.completed.has(state.current.id);
  $('complete').textContent = complete ? 'Completed ✓' : 'Mark complete';
  $('complete').classList.toggle('is-complete', complete);
  $('complete-bottom').textContent = complete ? 'Session completed ✓' : 'Mark Session complete';
  $('complete-bottom').classList.toggle('is-complete', complete);
  document.querySelectorAll('[data-session]').forEach(link => link.classList.toggle('is-complete', state.completed.has(link.dataset.session)));
}

function buildOverview() {
  const groups = new Map();
  for (const session of state.sessions) {
    if (!groups.has(session.part)) groups.set(session.part, []);
    groups.get(session.part).push(session);
  }
  for (const [part, sessions] of groups) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `${part} · ${sessions.length}`;
    const list = document.createElement('div');
    list.className = 'overview-sessions';
    for (const session of sessions) {
      const link = document.createElement('a');
      link.href = sessionHref(session);
      link.dataset.session = session.id;
      link.dataset.search = `${session.id} ${session.title} ${session.part}`.toLowerCase();
      link.innerHTML = `<span>${session.id}</span><strong>${session.title}</strong>`;
      list.append(link);
    }
    details.append(summary, list);
    $('overview-list').append(details);
  }
}

function toggleOverview(show) {
  $('overview').hidden = !show;
  $('overview-toggle').setAttribute('aria-expanded', String(show));
  document.body.classList.toggle('overview-open', show);
  if (show) $('session-search').focus();
  else $('overview-toggle').focus();
}

async function renderSession(session) {
  state.current = session;
  document.title = `${session.id} — ${session.title} | Meditate`;
  $('part').textContent = session.part;
  $('title').textContent = session.title;
  $('session-meta').textContent = `Session ${session.number} of ${state.sessions.length} · ${session.estimatedVerses} verses · ${session.length.toLowerCase()}`;
  $('session-select').value = session.id;
  const previous = state.sessions[session.number - 2];
  const next = state.sessions[session.number];
  $('previous').href = previous ? sessionHref(previous) : sessionHref(session);
  $('previous').toggleAttribute('aria-disabled', !previous);
  $('next').href = next ? sessionHref(next) : sessionHref(session);
  $('next').toggleAttribute('aria-disabled', !next);
  $('readings').replaceChildren();
  $('extra').replaceChildren();
  for (const ref of session.primary) $('readings').append(await passage(ref));
  for (const ref of session.supplementary) $('extra').append(await passage(ref));
  $('supplementary').hidden = !session.supplementary.length;
  updateProgress();
}

function changeSize(delta) {
  state.font = Math.max(15, Math.min(32, state.font + delta));
  storage.set(STORAGE.font, state.font);
  document.documentElement.style.setProperty('--reader-size', `${state.font}px`);
  $('text-size').value = state.font;
  $('text-size-value').textContent = `${state.font} px`;
}

function toggleComplete() {
  if (!state.current) return;
  state.completed.has(state.current.id) ? state.completed.delete(state.current.id) : state.completed.add(state.current.id);
  storage.set(STORAGE.completed, JSON.stringify([...state.completed]));
  updateProgress();
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  storage.set(STORAGE.theme, theme);
  $('theme-toggle').textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  $('theme-toggle').setAttribute('aria-pressed', String(theme === 'dark'));
}

async function init() {
  try {
    const response = await fetch('./data/sessions.json');
    if (!response.ok) throw new Error('Could not load the reading plan.');
    state.sessions = await response.json();
    state.completed = new Set([...state.completed].filter(id => state.sessions.some(session => session.id === id)));
    for (const session of state.sessions) {
      const option = document.createElement('option');
      option.value = session.id;
      option.textContent = `${session.id} · ${session.title}`;
      $('session-select').append(option);
    }
    buildOverview();
    $('session-select').onchange = () => location.href = sessionHref(state.sessions.find(session => session.id === $('session-select').value));
    $('smaller').onclick = () => changeSize(-2);
    $('larger').onclick = () => changeSize(2);
    $('complete').onclick = toggleComplete;
    $('complete-bottom').onclick = toggleComplete;
    $('theme-toggle').onclick = () => setTheme(state.theme === 'dark' ? 'light' : 'dark');
    setTheme(state.theme);
    setAccent(storage.get(STORAGE.accent, 'green'));
    setFontStyle(storage.get(STORAGE.fontStyle, 'serif'));
    changeSize(0);
    $('settings-open').onclick = () => $('settings-dialog').showModal();
    $('settings-close').onclick = () => $('settings-dialog').close();
    $('text-size').oninput = event => changeSize(Number(event.target.value) - state.font);
    $('font-style').onchange = event => setFontStyle(event.target.value);
    document.querySelectorAll('[data-accent-choice]').forEach(button => button.onclick = () => setAccent(button.dataset.accentChoice));
    const tabs = [...document.querySelectorAll('[data-tab]')];
    tabs.forEach((button, index) => {
      button.onclick = () => selectTab(button.dataset.tab);
      button.onkeydown = event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        selectTab(tabs[target].dataset.tab);
        tabs[target].focus();
      };
    });
    $('overview-toggle').onclick = () => toggleOverview($('overview').hidden);
    $('overview-close').onclick = () => toggleOverview(false);
    $('session-search').oninput = event => {
      const query = event.target.value.trim().toLowerCase();
      document.querySelectorAll('[data-session]').forEach(link => link.hidden = !link.dataset.search.includes(query));
      document.querySelectorAll('#overview-list details').forEach(group => group.open = Boolean(query));
      document.querySelectorAll('#overview-list details').forEach(group => group.hidden = ![...group.querySelectorAll('[data-session]')].some(link => !link.hidden));
    };
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('overview').hidden) toggleOverview(false); });
    await renderSession(sessionFromUrl());
    initRenew();
    initPrayer();
  } catch (error) {
    $('error').hidden = false;
    $('error').textContent = error.message;
    $('readings').replaceChildren();
  }
}

init();

