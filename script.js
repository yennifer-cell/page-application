
// DOM Elements
const form = document.getElementById('searchForm');
const wordInput = document.getElementById('wordInput');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const resultWord = document.getElementById('resultWord');
const resultPhonetic = document.getElementById('resultPhonetic');
const resultBody = document.getElementById('resultBody');
const audioEl = document.getElementById('audio');
const playAudioBtn = document.getElementById('playAudio');
const saveWordBtn = document.getElementById('saveWord');
const savedList = document.getElementById('savedList');
const clearSavedBtn = document.getElementById('clearSaved');
const themeToggle = document.getElementById('themeToggle');

// API Configuration
const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
let lastWordData = null;

// Initialize app
init();

function init() {
  // Theme
  const theme = localStorage.getItem('wordly_theme') || 'dark';
  setTheme(theme);

  // Saved words
  renderSaved();

  // Events
  form.addEventListener('submit', onSearchSubmit);
  playAudioBtn.addEventListener('click', () => audioEl.play());
  saveWordBtn.addEventListener('click', onSaveWord);
  clearSavedBtn.addEventListener('click', clearSaved);
  themeToggle.addEventListener('click', toggleTheme);
}

async function onSearchSubmit(e) {
  e.preventDefault();
  const word = wordInput.value.trim();

  if (!word) {
    showError('Please enter a word');
    return;
  }

  resetMessages();
  setLoading(true, `Searching "${word}"...`);

  try {
    const data = await fetchWord(word);
    lastWordData = normalizeApiData(data);
    renderResult(lastWordData);
    setLoading(false, 'Done.');
  } catch (err) {
    lastWordData = null;
    clearResultToEmptyState();
    setLoading(false, '');
    showError(err.message || 'Something went wrong.');
  }
}

async function fetchWord(word) {
  const res = await fetch(`${API_BASE}${encodeURIComponent(word)}`);

  if (!res.ok) {
    let detail = 'Word not found.';
    try {
      const body = await res.json();
      if (body && body.message) detail = body.message;
    } catch (_) {}
    throw new Error(detail);
  }

  return res.json();
}

function resetMessages() {
  statusEl.textContent = '';
  errorEl.textContent = '';
}

function setLoading(isLoading, message) {
  statusEl.textContent = message || '';
  form.querySelector('button[type="submit"]').disabled = isLoading;
}

function showError(msg) {
  errorEl.textContent = msg;
  statusEl.textContent = '';
}

function normalizeApiData(apiResponse) {
  const entry = apiResponse[0];

  const word = entry.word || '';
  const phonetic =
    entry.phonetic ||
    (entry.phonetics && entry.phonetics.find(p => p.text)?.text) ||
    '';

  const audio =
    (entry.phonetics && entry.phonetics.find(p => p.audio)?.audio) || '';

  const meanings = (entry.meanings || []).map(m => ({
    partOfSpeech: m.partOfSpeech || 'unknown',
    definitions: (m.definitions || []).map(d => ({
      definition: d.definition || '',
      example: d.example || '',
      synonyms: d.synonyms || []
    })),
    synonyms: m.synonyms || []
  }));

  const sourceUrls = entry.sourceUrls || [];

  return { word, phonetic, audio, meanings, sourceUrls };
}

function renderResult(data) {
  resultWord.textContent = data.word || 'Unknown word';
  resultPhonetic.textContent = data.phonetic ? `/${data.phonetic}/` : '';

  // Audio
  if (data.audio) {
    audioEl.src = data.audio;
    playAudioBtn.disabled = false;
  } else {
    audioEl.removeAttribute('src');
    playAudioBtn.disabled = true;
  }

  // Save button
  saveWordBtn.disabled = !data.word;

  // Body
  resultBody.innerHTML = '';

  if (!data.meanings.length) {
    resultBody.innerHTML = `<p class="hint">No meanings found for this word.</p>`;
    return;
  }

  data.meanings.forEach((meaning) => {
    const section = document.createElement('section');
    section.className = 'meaning';

    const title = document.createElement('h4');
    title.textContent = meaning.partOfSpeech;
    section.appendChild(title);

    const ol = document.createElement('ol');
    ol.className = 'definitions';

    meaning.definitions.slice(0, 3).forEach((def) => {
      const li = document.createElement('li');
      li.textContent = def.definition;

      if (def.example) {
        const ex = document.createElement('div');
        ex.className = 'example';
        ex.textContent = `Example: ${def.example}`;
        li.appendChild(ex);
      }

      const syns = [...(def.synonyms || [])].slice(0, 6);
      if (syns.length) {
        const s = document.createElement('div');
        s.className = 'synonyms';
        s.textContent = 'Synonyms: ';
        syns.forEach((w) => {
          const tag = document.createElement('span');
          tag.className = 'tag';
          tag.textContent = w;
          tag.addEventListener('click', () => quickSearch(w));
          s.appendChild(tag);
        });
        li.appendChild(s);
      }

      ol.appendChild(li);
    });

    section.appendChild(ol);

    const meaningSyns = [...(meaning.synonyms || [])].slice(0, 8);
    if (meaningSyns.length) {
      const s2 = document.createElement('div');
      s2.className = 'synonyms';
      s2.textContent = 'More synonyms: ';
      meaningSyns.forEach((w) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = w;
        tag.addEventListener('click', () => quickSearch(w));
        s2.appendChild(tag);
      });
      section.appendChild(s2);
    }

    resultBody.appendChild(section);
  });

  if (data.sourceUrls.length) {
    const sources = document.createElement('div');
    sources.className = 'meaning';
    sources.innerHTML = `<h4>Sources</h4>`;
    data.sourceUrls.slice(0, 2).forEach((url) => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.textContent = url;
      a.style.display = 'block';
      a.style.marginTop = '6px';
      sources.appendChild(a);
    });
    resultBody.appendChild(sources);
  }

  highlightIfSaved(data.word);
}

function clearResultToEmptyState() {
  resultWord.textContent = 'Search something 👀';
  resultPhonetic.textContent = '';
  resultBody.innerHTML = `<p class="hint">Your definitions will show here.</p>`;
  playAudioBtn.disabled = true;
  saveWordBtn.disabled = true;
  audioEl.removeAttribute('src');
}

function quickSearch(word) {
  wordInput.value = word;
  form.requestSubmit();
}

// Saved words functionality
function getSavedWords() {
  try {
    return JSON.parse(localStorage.getItem('wordly_saved') || '[]');
  } catch {
    return [];
  }
}

function setSavedWords(list) {
  localStorage.setItem('wordly_saved', JSON.stringify(list));
}

function onSaveWord() {
  if (!lastWordData?.word) return;

  const word = lastWordData.word.toLowerCase();
  const saved = getSavedWords();

  if (!saved.includes(word)) {
    saved.unshift(word);
    setSavedWords(saved.slice(0, 20));
  }

  renderSaved();
  highlightIfSaved(lastWordData.word);
}

function clearSaved() {
  setSavedWords([]);
  renderSaved();
  highlightIfSaved(lastWordData?.word || '');
}

function renderSaved() {
  const saved = getSavedWords();
  savedList.innerHTML = '';

  if (!saved.length) {
    const li = document.createElement('li');
    li.textContent = 'No saved words';
    li.style.cursor = 'default';
    li.style.opacity = '0.7';
    savedList.appendChild(li);
    return;
  }

  saved.forEach((w) => {
    const li = document.createElement('li');
    li.textContent = w;
    li.addEventListener('click', () => quickSearch(w));
    savedList.appendChild(li);
  });
}

function highlightIfSaved(word) {
  const saved = getSavedWords();
  const active = (word || '').toLowerCase();

  [...savedList.children].forEach((li) => {
    li.classList.toggle('active', li.textContent === active);
  });

  const resultsCard = document.querySelector('.results');
  if (resultsCard) {
    resultsCard.style.boxShadow = saved.includes(active)
      ? '0 0 0 3px rgba(122,162,255,0.18)'
      : 'none';
  }
}

// Theme functionality
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wordly_theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;

  if (theme === 'dark') {
    // Show sun icon (to indicate switching to light mode)
    icon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
  } else {
    // Show moon icon (to indicate switching to dark mode)
    icon.innerHTML = `
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    `;
  }
}
