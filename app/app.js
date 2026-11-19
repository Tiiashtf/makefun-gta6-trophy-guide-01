// Leonida Legend — the tracker. Loads app/data/trophies.json, renders the 55
// trophies as a checklist, and keeps progress in the browser (see storage.js).
// Deep links, used by the screenshots and shareable: ?spoilers=off, ?filter=story,
// ?grade=silver, ?open=<trophy id>, ?demo=<comma-separated ids to mark earned>.
import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, importProgressFile } from './storage.js';
import { renderRoadmap } from './roadmap.js';

const KIND_LABELS = {
  all: 'All kinds',
  story: 'Story',
  missable: 'Missable',
  side: 'Side quests',
  activities: 'Activities',
  collectibles: 'Collectibles',
  robbery: 'Robbery',
  exploration: 'Exploration',
  money: 'Money',
  moments: 'Moments',
  platinum: 'Platinum',
};
const KIND_ORDER = ['all', 'story', 'missable', 'side', 'activities', 'collectibles', 'robbery', 'exploration', 'money', 'moments'];

const listEl = document.getElementById('trophyList');
const showingEl = document.getElementById('showing');
const emptyNote = document.getElementById('emptyNote');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const hideEarnedBox = document.getElementById('hideEarned');
const spoilersBox = document.getElementById('spoilers');
const kindFiltersEl = document.getElementById('kindFilters');

const params = new URLSearchParams(location.search);
const settings = loadSettings();
let earned = loadEarned();
let trophies = [];
let openGuideId = null;

if (params.get('spoilers') === 'off') settings.spoilers = false;
if (params.get('spoilers') === 'on') settings.spoilers = true;
if (params.get('filter') && KIND_LABELS[params.get('filter')]) settings.kind = params.get('filter');
if (params.get('grade') && ['all', 'platinum', 'gold', 'silver', 'bronze'].includes(params.get('grade'))) settings.grade = params.get('grade');
if (params.get('demo')) {
  for (const raw of params.get('demo').split(',')) {
    const id = Number(raw);
    if (Number.isInteger(id)) earned.add(id);
  }
  saveEarned(earned);
}
if (params.get('open')) {
  const id = Number(params.get('open'));
  if (Number.isInteger(id)) openGuideId = id;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isMasked(trophy) {
  return settings.spoilers && trophy.hidden && !earned.has(trophy.id);
}

function trophyMatches(trophy) {
  if (settings.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (settings.kind !== 'all' && trophy.kind !== settings.kind) {
    return false;
  }
  if (settings.grade !== 'all' && trophy.grade !== settings.grade) return false;
  if (settings.hideEarned && earned.has(trophy.id)) return false;
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function renderTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(trophy.id) ? ' earned' : '');
  card.dataset.trophyId = String(trophy.id);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveEarned(earned);
    renderAll();
  });
  const titleWrap = document.createElement('div');
  titleWrap.className = 'card-title';
  const title = document.createElement('h3');
  title.textContent = isMasked(trophy) ? 'Hidden trophy — earn it to reveal' : trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = isMasked(trophy)
    ? 'Hidden on PlayStation until earned.'
    : trophy.description;
  titleWrap.append(title, official);
  const badge = document.createElement('span');
  badge.className = 'badge ' + trophy.grade;
  badge.textContent = gradeLabel(trophy.grade);
  head.append(box, titleWrap, badge);
  card.append(head);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  tags.append(kindTag);
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-flag';
    hiddenTag.textContent = 'Hidden on PS5';
    tags.append(hiddenTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = '⚠ Possibly missable';
    tags.append(missTag);
  }
  const stageTag = document.createElement('span');
  stageTag.className = 'tag';
  stageTag.textContent = 'Roadmap step ' + trophy.stage;
  tags.append(stageTag);
  card.append(tags);

  if (isMasked(trophy)) {
    const masked = document.createElement('p');
    masked.className = 'spoiler-masked';
    masked.textContent = 'Its guide stays hidden until you earn it — turn “Hide story spoilers” off to read it now.';
    card.append(masked);
    return card;
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle secondary';
  const isOpen = openGuideId === trophy.id;
  toggle.textContent = isOpen ? 'Hide guide' : 'Show guide';
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.addEventListener('click', () => {
    openGuideId = openGuideId === trophy.id ? null : trophy.id;
    renderAll();
  });
  card.append(toggle);

  if (isOpen) {
    const guide = document.createElement('div');
    guide.className = 'guide';
    if (trophy.missable) {
      const warn = document.createElement('p');
      warn.className = 'missable-note';
      warn.textContent = 'Possibly missable — read this one before you play Chapter 1.';
      guide.append(warn);
    }
    const text = document.createElement('p');
    text.textContent = trophy.guide;
    guide.append(text);
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ';
    trophy.sources.forEach((source, index) => {
      if (index > 0) sources.append(document.createTextNode(' · '));
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      sources.append(link);
    });
    guide.append(sources);
    card.append(guide);
  }
  return card;
}

function renderKindFilters() {
  kindFiltersEl.replaceChildren();
  for (const kind of KIND_ORDER) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = KIND_LABELS[kind];
    button.setAttribute('aria-pressed', String(settings.kind === kind));
    button.addEventListener('click', () => {
      settings.kind = kind;
      saveSettings(settings);
      renderAll();
    });
    kindFiltersEl.append(button);
  }
}

function updateProgress() {
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('progressText').textContent = done + ' of ' + total + ' earned';
  document.getElementById('progressPct').textContent = total ? Math.round((done / total) * 100) + '%' : '0%';
  document.getElementById('progressFill').style.width = total ? (done / total) * 100 + '%' : '0%';
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => {
      const ofGrade = trophies.filter((t) => t.grade === grade);
      const got = ofGrade.filter((t) => earned.has(t.id)).length;
      return got + '/' + ofGrade.length + ' ' + grade;
    })
    .join(' · ');
  document.getElementById('gradeCounts').textContent = counts;
  const missable = trophies.filter((t) => t.missable);
  document.getElementById('missableText').textContent = missable.length === 0
    ? 'No trophy in this list is flagged missable.'
    : missable.map((t) => t.name + ' — ' + t.description).join(' ') +
      ' Only this one is reported as possibly missable, and only because of a Chapter 1 meditation. Everything else can be finished after the story.';
}

function renderAll() {
  // Rebuilding the list drops focus, so remember where the reader was and put
  // them back there: the checkbox they just ticked, at the same scroll position.
  const focusedId = document.activeElement?.closest?.('[data-trophy-id]')?.dataset.trophyId;
  const scrollY = window.scrollY;
  renderKindFilters();
  gradeSelect.value = settings.grade;
  hideEarnedBox.checked = settings.hideEarned;
  spoilersBox.checked = settings.spoilers;
  listEl.replaceChildren();
  let shown = 0;
  for (const trophy of trophies) {
    if (!trophyMatches(trophy)) continue;
    listEl.append(renderTrophyCard(trophy));
    shown += 1;
  }
  showingEl.textContent = 'Showing ' + shown + ' of ' + trophies.length + ' trophies';
  emptyNote.hidden = shown !== 0;
  updateProgress();
  window.scrollTo(0, scrollY);
  if (focusedId) {
    const box = listEl.querySelector('[data-trophy-id="' + focusedId + '"] input[type="checkbox"]');
    if (box) box.focus();
  }
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json (' + response.status + ')');
  const doc = await response.json();
  trophies = doc.trophies;
}

searchInput.addEventListener('input', renderAll);
gradeSelect.addEventListener('change', () => {
  settings.grade = gradeSelect.value;
  saveSettings(settings);
  renderAll();
});
hideEarnedBox.addEventListener('change', () => {
  settings.hideEarned = hideEarnedBox.checked;
  saveSettings(settings);
  renderAll();
});
spoilersBox.addEventListener('change', () => {
  settings.spoilers = spoilersBox.checked;
  saveSettings(settings);
  renderAll();
});
document.getElementById('export').addEventListener('click', () => exportProgress(earned));
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await importProgressFile(file, new Set(trophies.map((t) => t.id)));
    saveEarned(earned);
    renderAll();
  } catch (error) {
    alert('Import failed: ' + error.message);
  }
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});

try {
  await loadTrophies();
  renderRoadmap(document.getElementById('roadmapSteps'));
  renderAll();
  if (params.get('view') === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  }
} catch (error) {
  listEl.textContent = 'The trophy list could not be loaded: ' + error.message;
  throw error;
}
