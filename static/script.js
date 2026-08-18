/**
 * GuzoAI — Vanilla JS Application
 * Converted from frontend2/src/ React + TypeScript application
 * ============================================================
 */

// ============================================================
// 1. DATA — Global Hubs & Suggestion Chips
// ============================================================

const GLOBAL_HUBS = [
  { id: 'ADD', code: 'ADD', name: 'Bole International',  city: 'Addis Ababa', country: 'Ethiopia',      latitude:  8.9806, longitude:  38.7993, color: '#10b981', isOrigin: true },
  { id: 'CDG', code: 'CDG', name: 'Charles de Gaulle',   city: 'Paris',       country: 'France',        latitude: 49.0097, longitude:   2.5479, color: '#3b82f6' },
  { id: 'HND', code: 'HND', name: 'Haneda Airport',      city: 'Tokyo',       country: 'Japan',        latitude: 35.5494, longitude: 139.7798, color: '#f43f5e' },
  { id: 'DXB', code: 'DXB', name: 'Dubai International', city: 'Dubai',       country: 'UAE',          latitude: 25.2532, longitude:  55.3657, color: '#f59e0b' },
  { id: 'JFK', code: 'JFK', name: 'John F. Kennedy',     city: 'New York',    country: 'USA',         latitude: 40.6413, longitude: -73.7781, color: '#8b5cf6' },
  { id: 'DPS', code: 'DPS', name: 'Ngurah Rai',          city: 'Bali',        country: 'Indonesia',   latitude: -8.7482, longitude: 115.1672, color: '#06b6d4' },
  { id: 'CPT', code: 'CPT', name: 'Cape Town Int.',      city: 'Cape Town',   country: 'South Africa', latitude: -33.9715, longitude:  18.6021, color: '#ec4899' },
  { id: 'LHR', code: 'LHR', name: 'Heathrow',             city: 'London',      country: 'UK',           latitude: 51.4700, longitude:  -0.4543, color: '#6366f1' },
  { id: 'FCO', code: 'FCO', name: 'Fiumicino Airport',    city: 'Rome',        country: 'Italy',        latitude: 41.8003, longitude:  12.2389, color: '#eab308' },
  { id: 'NBO', code: 'NBO', name: 'Jomo Kenyatta',        city: 'Nairobi',     country: 'Kenya',        latitude: -1.3192, longitude:  36.9278, color: '#14b8a6' },
  { id: 'SYD', code: 'SYD', name: 'Kingsford Smith',     city: 'Sydney',      country: 'Australia',    latitude: -33.9399, longitude: 151.1753, color: '#3b82f6' },
  { id: 'BKK', code: 'BKK', name: 'Suvarnabhumi',        city: 'Bangkok',     country: 'Thailand',     latitude: 13.6900, longitude: 100.7501, color: '#a855f7' },
];

const FLIGHT_ROUTES = [
  ['ADD', 'NBO'], ['ADD', 'DXB'], ['ADD', 'CDG'], ['ADD', 'CPT'],
  ['NBO', 'DXB'], ['NBO', 'CPT'], ['DXB', 'CDG'], ['DXB', 'FCO'],
  ['DXB', 'BKK'], ['CDG', 'LHR'], ['CDG', 'FCO'], ['BKK', 'HND'],
  ['BKK', 'DPS'], ['HND', 'DPS'], ['HND', 'SYD'], ['JFK', 'CDG'],
];

const HUB_ALIASES = {
  ADD: ['addis ababa', 'bole'],
  CDG: ['paris', 'charles de gaulle'],
  HND: ['tokyo', 'kyoto', 'haneda'],
  DXB: ['dubai', 'abu dhabi'],
  JFK: ['new york', 'john f kennedy'],
  DPS: ['bali', 'ubud', 'canggu', 'denpasar', 'ngurah rai'],
  CPT: ['cape town'],
  LHR: ['london', 'heathrow'],
  FCO: ['rome', 'amalfi', 'fiumicino'],
  NBO: ['nairobi', 'jomo kenyatta'],
  SYD: ['sydney', 'kingsford smith'],
  BKK: ['bangkok', 'suvarnabhumi'],
};

function projectHub(hub, width, height) {
  return {
    x: ((hub.longitude + 180) / 360) * width,
    y: ((90 - hub.latitude) / 180) * height,
  };
}

function hubIsMentioned(hub, text) {
  const normalized = String(text || '').toLowerCase();
  const codeMatch = new RegExp(`\\b${hub.code.toLowerCase()}\\b`).test(normalized);
  return codeMatch || (HUB_ALIASES[hub.id] || []).some(alias => normalized.includes(alias));
}

function getVisibleFlightRoutes(plan = state.activePlan) {
  if (!plan) return FLIGHT_ROUTES;

  const destinationText = String(plan.destination || '').toLowerCase();
  const flightText = String(plan.flightResults || '').toLowerCase();
  const destinationHub = GLOBAL_HUBS.find(hub =>
    !hub.isOrigin && hubIsMentioned(hub, destinationText)
  ) || GLOBAL_HUBS.find(hub =>
    !hub.isOrigin && hubIsMentioned(hub, flightText)
  );

  if (!destinationHub) return FLIGHT_ROUTES;

  const mentionedIds = new Set(
    GLOBAL_HUBS.filter(hub => hubIsMentioned(hub, `${destinationText} ${flightText}`)).map(hub => hub.id)
  );
  mentionedIds.add('ADD');
  mentionedIds.add(destinationHub.id);

  const responseRoutes = FLIGHT_ROUTES.filter(([fromId, toId]) =>
    mentionedIds.has(fromId) && mentionedIds.has(toId) &&
    (fromId === destinationHub.id || toId === destinationHub.id)
  );
  if (responseRoutes.length) return responseRoutes;

  const destinationRoutes = FLIGHT_ROUTES.filter(([fromId, toId]) =>
    fromId === destinationHub.id || toId === destinationHub.id
  );
  return destinationRoutes.length ? destinationRoutes : FLIGHT_ROUTES;
}

const SUGGESTION_CHIPS = [
  { id: 'ethiopia-coffee', title: '☕ Coffee Origin & Rift Valley', destination: 'Addis Ababa & Rift Valley, Ethiopia', icon: '☕', prompt: '5-day cultural trip to Addis Ababa and Rift Valley exploring authentic coffee ceremonies, Entoto mountain viewpoints, jazz lounges, and crater lakes.', duration: 5, style: 'Cultural & Heritage' },
  { id: 'tokyo-neon',      title: '🗼 Anime, Neon & Sushi',         destination: 'Tokyo & Kyoto, Japan',               icon: '🗼', prompt: '7 days in Tokyo and Kyoto experiencing Shibuya crossing, Akihabara tech district, Tsukiji market sushi, and serene Kyoto bamboo groves.', duration: 7, style: 'Foodie & Culinary' },
  { id: 'rome-amalfi',     title: '🏛️ Ancient Marvels & Amalfi',   destination: 'Rome & Amalfi Coast, Italy',         icon: '🏛️', prompt: '6 days exploring Rome Colosseum, Vatican museums, followed by scenic cliffside coastal sunsets in Positano and Amalfi.', duration: 6, style: 'Luxury & Wellness' },
  { id: 'bali-waterfalls', title: '🌴 Jungle Stays & Waterfalls',  destination: 'Ubud & Canggu, Bali',                icon: '🌴', prompt: '6 days in Bali with jungle treehouse stays in Ubud, sunrise volcano trek at Mount Batur, sacred temples, and surf in Canggu.', duration: 6, style: 'Adventure & Nature' },
  { id: 'dubai-safari',    title: '🏜️ Desert Oases & Sky Lounges', destination: 'Dubai & Abu Dhabi, UAE',             icon: '🏜️', prompt: '4 days in Dubai and Abu Dhabi featuring desert dune bashing, Burj Khalifa view dining, Sheikh Zayed Mosque, and marina yachts.', duration: 4, style: 'Luxury & Wellness' },
  { id: 'norway-aurora',   title: '🌌 Aurora Borealis & Fjords',   destination: 'Tromsø & Lofoten, Norway',           icon: '🌌', prompt: '5 days chasing Northern Lights in Tromsø, dog sledding through arctic valleys, and staying in traditional red rorbuer cabins in Lofoten.', duration: 5, style: 'Adventure & Nature' },
];

const NEURAL_NODES = [
  { id: 'intent',       name: 'Spontaneous Travel Intent',       amharic: 'የጉዞ ህልም (Vision)',       category: 'intent',  x: 0.04, y: 0.50, pulsePhase: 0,                connections: ['ai_engine','corridor_add','budget_opt'],          description: 'Understands raw desires, pacing preferences, and travel archetypes.', icon: '✨', color: '#38bdf8' },
  { id: 'ai_engine',   name: 'Personal Trip Planner',      amharic: 'ጉዞ እቅድ (Trip Plan)',             category: 'intent',  x: 0.50, y: 0.35, pulsePhase: Math.PI/2,        connections: ['corridor_add','corridor_hnd','culture_hub','budget_opt'], description: 'Combines your preferences with flight options, places to stay, and local experiences.', icon: '🧠', color: '#818cf8' },
  { id: 'corridor_add',name: 'Bole Gateway Corridor (ADD)',      amharic: 'የቦሌ በረራ መተላለፊያ',       category: 'flight',  x: 0.27, y: 0.68, pulsePhase: Math.PI,          connections: ['culture_hub','corridor_hnd'],                      description: 'Transatlantic & Pan-African airline hub connecting 130+ global destinations.', icon: '✈️', color: '#06b6d4' },
  { id: 'corridor_hnd',name: 'Tokyo Haneda Corridor (HND)',      amharic: 'የቶኪዮ በረራ መስመር',         category: 'flight',  x: 0.73, y: 0.65, pulsePhase: Math.PI*1.3,      connections: ['culture_hub','budget_opt'],                        description: 'Asia-Pacific transit node for high-speed transit and modern culinary expeditions.', icon: '🗼', color: '#ec4899' },
  { id: 'culture_hub', name: 'Cultural Resonance & Phonetics',   amharic: 'ባህላዊ ቅርስና ልምምድ',       category: 'culture', x: 0.96, y: 0.40, pulsePhase: Math.PI*0.7,      connections: ['budget_opt'],                                     description: 'Real ceremony etiquette, local phrasebook pronunciations, and hidden neighborhood gems.', icon: '☕', color: '#f59e0b' },
  { id: 'budget_opt',  name: 'Budget & Travel Pace',  amharic: 'የዋጋና በጀት ሚዛን',           category: 'budget',  x: 0.62, y: 0.82, pulsePhase: Math.PI*1.7,      connections: ['intent'],                                         description: 'Balances trip length, comfort, activities, and spending.', icon: '💰', color: '#34d399' },
];

const FAQ_DATA = [
  { q: 'How does GuzoAI generate personalized travel itineraries?', a: 'GuzoAI asks about your destination, dates, interests, budget, and travel style, then creates a practical day-by-day plan with flight ideas, places to stay, and local experiences.' },
  { q: 'What does the Canvas Flight Radar represent?',              a: 'The interactive Canvas background illustrates live transatlantic, intra-African, and transpacific flight corridors connecting global hubs like Addis Ababa (Bole Int.), Tokyo (Haneda), Paris (CDG), Dubai (DXB), and New York (JFK). You can hover over any hub to inspect its active routes.' },
  { q: 'Are the estimated costs and flight rates accurate?',        a: 'Yes! GuzoAI calibrates estimated flight prices, hotel nightly averages, and daily meal expenses using comprehensive multi-source pricing indices. It also automatically incorporates a 10% emergency buffer for local tipping and transit.' },
  { q: 'Can I export my travel plan for offline mobile access?',    a: 'Absolutely. You can click the "Print" button to generate a clean, printer-friendly PDF dossier or save the trip directly to your browser bookmarks for instant recall even without active internet.' },
  { q: 'Why does GuzoAI emphasize local phrases and customs?',      a: 'True exploration lies in human connection. GuzoAI provides accurate phonetic phrasebooks (such as Amharic, Japanese, Italian) and etiquette tips so you can navigate markets, ceremonies, and local hospitality with genuine respect.' },
];

// ============================================================
// 2. APP STATE
// ============================================================

const SAVED_TRIPS_KEY  = 'guzo_saved_trips';
const THREAD_KEY       = 'guzo_thread_id';
const THEME_KEY        = 'guzo_theme';

const state = {
  theme:       localStorage.getItem(THEME_KEY) || 'dark',
  currency:    'USD',
  threadId:    localStorage.getItem(THREAD_KEY) || null,
  activePlan:  null,
  savedTrips:  [],
  isLoading:   false,
  activeTab:   'summary',
  isListening: false,
  recognition: null,
  speechLang:  'en-US',
  showAdvanced: true,
  hoveredHub:  null,
  flightPlaying: true,
  flightSpeed:   1,
  flightParticles: [],
  flightRipples:   [],
  neuralRunning: true,
  neuralSpeed:   1,
  activeNeuralNode: null,
  neuralParticles: [],
};

// Load saved trips
try {
  const stored = localStorage.getItem(SAVED_TRIPS_KEY);
  state.savedTrips = stored ? JSON.parse(stored) : [];
} catch (_) { state.savedTrips = []; }

// ============================================================
// 3. MARKDOWN RENDERER (ported from markdown.tsx)
// ============================================================

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInline(str) {
  return escapeHtml(str)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
      const safeUrl = /^https?:\/\//i.test(url.trim()) ? escapeHtml(url.trim()) : '#';
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
}

function renderMarkdownToHtml(text) {
  if (!text || !text.trim()) return '<p class="empty-state">No content available.</p>';
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inList = false, listType = null;

  const closeList = () => {
    if (inList && listType) {
      html.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false; listType = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { closeList(); continue; }
    if (/^---+$/.test(trimmed)) { closeList(); html.push('<hr>'); continue; }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
      continue;
    }
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') { closeList(); html.push('<ul>'); inList = true; listType = 'ul'; }
      html.push(`<li>${formatInline(ulMatch[1])}</li>`);
      continue;
    }
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') { closeList(); html.push('<ol>'); inList = true; listType = 'ol'; }
      html.push(`<li>${formatInline(olMatch[1])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${formatInline(trimmed)}</p>`);
  }
  closeList();
  return html.join('\n');
}

// ============================================================
// 4. TRAVEL API (ported from travelApi.ts)
// ============================================================

function getPreferences() {
  return {
    destinationPrompt: document.getElementById('destination-prompt-input').value,
    originCity:        'Addis Ababa (ADD)',
    duration:          parseInt(document.getElementById('adv-duration').value, 10),
    style:             document.getElementById('adv-style').value,
    budgetLevel:       document.getElementById('adv-budget').value,
    travelers:         document.getElementById('adv-travelers').value,
  };
}

function buildTravelMessage(prefs) {
  return [
    prefs.destinationPrompt.trim(),
    `Origin: ${prefs.originCity}`,
    `Duration: ${prefs.duration} days`,
    `Travel style: ${prefs.style}`,
    `Budget: ${prefs.budgetLevel}`,
    `Travelers: ${prefs.travelers}`,
  ].join('\n');
}

function extractDestination(prompt) {
  const m = prompt.match(/\bin\s+([A-Za-z\s,]+?)(?:\s+exploring|\s+featuring|\s+with|\.|$)/i);
  if (m && m[1]) return m[1].trim().split(',')[0].trim();
  return prompt.split(/\s+/).slice(0, 6).join(' ') || 'Custom Journey';
}

function normalizeTextField(value) {
  if (Array.isArray(value)) return value.map(i => (typeof i === 'string' ? i : String(i))).join('\n\n');
  if (value == null) return '';
  return typeof value === 'string' ? value : String(value);
}

function adaptBackendResponse(data, prefs) {
  const destination = extractDestination(prefs.destinationPrompt);
  return {
    id:           `plan-${Date.now()}`,
    threadId:     data.thread_id,
    title:        `GuzoAI Plan: ${destination}`,
    destination,
    country:      '',
    durationDays: prefs.duration,
    style:        prefs.style,
    travelers:    prefs.travelers,
    createdAt:    new Date().toISOString(),
    query:        buildTravelMessage(prefs),
    answer:       data.answer,
    flightResults: normalizeTextField(data.flight_results),
    hotelResults:  normalizeTextField(data.hotel_results),
    itinerary:     data.itinerary,
    llmCalls:      data.llm_calls,
    source:        'backend',
  };
}

async function fetchTravelPlan(prefs) {
  const response = await fetch('/api/travel', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message:   buildTravelMessage(prefs),
      thread_id: state.threadId || undefined,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  try { localStorage.setItem(THREAD_KEY, data.thread_id); } catch (_) {}
  return adaptBackendResponse(data, prefs);
}

// ============================================================
// 5. TOAST & UTILITIES
// ============================================================

let toastTimer = null;

function showToast(msg) {
  const el = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.style.overflow = '';
}

function openDrawer() {
  document.getElementById('saved-drawer').classList.remove('hidden');
  document.getElementById('drawer-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderSavedDrawer();
}

function closeDrawer() {
  document.getElementById('saved-drawer').classList.add('hidden');
  document.getElementById('drawer-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ============================================================
// 6. THEME
// ============================================================

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const moonIcon = document.getElementById('theme-icon-moon');
  const sunIcon  = document.getElementById('theme-icon-sun');
  if (theme === 'dark') {
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  } else {
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(state.theme);
}

// ============================================================
// 7. SUGGESTION CHIPS
// ============================================================

function renderSuggestionChips() {
  const container = document.getElementById('suggestion-chips');
  const promptVal = document.getElementById('destination-prompt-input').value;
  container.innerHTML = SUGGESTION_CHIPS.map(chip => {
    const isActive = promptVal.includes(chip.destination.split(',')[0]);
    return `<button class="suggestion-chip${isActive ? ' active' : ''}" id="suggestion-chip-${chip.id}"
      onclick="selectChip('${chip.id}')" role="listitem" aria-pressed="${isActive}">
      <span>${chip.icon}</span><span>${chip.title}</span>
    </button>`;
  }).join('');
}

function selectChip(id) {
  const chip = SUGGESTION_CHIPS.find(c => c.id === id);
  if (!chip) return;
  const textarea = document.getElementById('destination-prompt-input');
  textarea.value = chip.prompt;
  document.getElementById('adv-duration').value = chip.duration;
  document.getElementById('adv-style').value    = chip.style;
  updateClearBtn();
  renderSuggestionChips();
}

// ============================================================
// 8. VOICE SEARCH
// ============================================================

function initVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    state.isListening = true;
    updateVoiceUI(true);
    showVoiceFeedback('Listening... Speak your dream journey (e.g. "5 days in Addis Ababa exploring coffee and jazz")', true);
  };
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
    document.getElementById('destination-prompt-input').value = transcript;
    showVoiceFeedback(`Heard: "${transcript}"`, true);
    updateClearBtn();
    renderSuggestionChips();
  };
  recognition.onerror = (event) => {
    state.isListening = false;
    updateVoiceUI(false);
    const msg = event.error === 'not-allowed'
      ? 'Microphone permission required. Please allow mic access.'
      : 'Could not hear voice clearly. Try again or type prompt.';
    showVoiceFeedback(msg, false);
    setTimeout(() => hideVoiceFeedback(), 4000);
  };
  recognition.onend = () => {
    state.isListening = false;
    updateVoiceUI(false);
    setTimeout(() => hideVoiceFeedback(), 3000);
  };
  state.recognition = recognition;
}

function toggleVoiceSearch() {
  if (state.isListening) {
    state.recognition && state.recognition.stop();
    state.isListening = false;
    updateVoiceUI(false);
    return;
  }
  if (state.recognition) {
    try {
      state.recognition.lang = document.getElementById('voice-lang-select').value;
      state.recognition.start();
    } catch (e) {
      state.recognition.stop();
      setTimeout(() => state.recognition.start(), 200);
    }
  } else {
    // Fallback simulation
    state.isListening = true;
    updateVoiceUI(true);
    showVoiceFeedback('Simulating voice capture for Addis Ababa & Rift Valley coffee journey...', true);
    setTimeout(() => {
      document.getElementById('destination-prompt-input').value =
        '5 days in Addis Ababa exploring authentic coffee ceremonies, Entoto mountain viewpoints, jazz lounges, and crater lakes.';
      document.getElementById('adv-duration').value = 5;
      document.getElementById('adv-style').value    = 'Cultural & Heritage';
      state.isListening = false;
      updateVoiceUI(false);
      showVoiceFeedback('✨ Voice prompt captured & synthesized!', false);
      updateClearBtn();
      renderSuggestionChips();
      setTimeout(() => hideVoiceFeedback(), 3000);
    }, 1500);
  }
}

function updateVoiceUI(isListening) {
  const btn = document.getElementById('voice-btn');
  const micIcon    = document.getElementById('voice-mic-icon');
  const micOffIcon = document.getElementById('voice-mic-off-icon');
  btn.classList.toggle('is-listening', isListening);
  micIcon.classList.toggle('hidden', isListening);
  micOffIcon.classList.toggle('hidden', !isListening);
  const textarea = document.getElementById('destination-prompt-input');
  textarea.classList.toggle('is-listening', isListening);
}

function showVoiceFeedback(text, isListening) {
  const el = document.getElementById('voice-feedback');
  document.getElementById('voice-feedback-text').textContent = text;
  el.classList.remove('hidden');
  document.getElementById('voice-listen-dot').classList.toggle('hidden', !isListening);
  document.getElementById('voice-volume-icon').classList.toggle('hidden', isListening);
  document.getElementById('voice-waveform').classList.toggle('hidden', !isListening);
}

function hideVoiceFeedback() {
  document.getElementById('voice-feedback').classList.add('hidden');
}

// ============================================================
// 9. ADVANCED OPTIONS TOGGLE
// ============================================================

function toggleAdvanced() {
  state.showAdvanced = !state.showAdvanced;
  const panel = document.getElementById('advanced-options');
  const label = document.getElementById('advanced-toggle-label');
  const btn   = document.getElementById('advanced-toggle-btn');
  panel.style.display  = state.showAdvanced ? '' : 'none';
  label.textContent    = state.showAdvanced ? 'Trip Customizers (Active)' : 'Customize Trip Parameters';
  btn.setAttribute('aria-expanded', String(state.showAdvanced));
}

// ============================================================
// 10. PLAN GENERATION
// ============================================================

let loadingInterval = null;
let progressInterval = null;

function startLoading(destination) {
  state.isLoading = true;
  state.activeTab = 'summary';
  hideFlightCanvas();

  // Show loading, hide error and results
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('error-banner').classList.add('hidden');
  document.getElementById('results-view-section').classList.add('hidden');

  // Update loading title
  document.getElementById('loading-title').textContent =
    `Building Your Journey to ${destination || 'Your Destination'}...`;

  // Animate loading steps
  let step = 0;
  const steps = document.querySelectorAll('.loading-step');
  steps.forEach((s, i) => {
    s.classList.remove('is-current', 'is-done');
    if (i === 0) s.classList.add('is-current');
    const iconWrap = s.querySelector('.step-icon-wrap');
    iconWrap.innerHTML = i === 0
      ? '<div class="step-spinner" aria-hidden="true"></div>'
      : `<div class="step-num" aria-hidden="true">${i + 1}</div>`;
  });

  loadingInterval = setInterval(() => {
    const prev = steps[step];
    prev.classList.remove('is-current');
    prev.classList.add('is-done');
    prev.querySelector('.step-icon-wrap').innerHTML =
      '<svg class="step-check" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';

    step = Math.min(step + 1, steps.length - 1);
    if (step < steps.length) {
      steps[step].classList.add('is-current');
      steps[step].querySelector('.step-icon-wrap').innerHTML = '<div class="step-spinner" aria-hidden="true"></div>';
    }
  }, 700);

  // Animate progress bar
  let progress = 15;
  const bar = document.getElementById('progress-bar');
  bar.style.width = `${progress}%`;
  progressInterval = setInterval(() => {
    if (progress < 95) {
      progress += Math.floor(Math.random() * 8) + 4;
      progress = Math.min(progress, 95);
      bar.style.width = `${progress}%`;
    }
  }, 200);

  // Update generate button
  const btn = document.getElementById('generate-plan-submit-btn');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div><span>Synthesizing Expedition...</span>`;
  btn.classList.remove('animate-shimmer');
}

function stopLoading() {
  state.isLoading = false;
  clearInterval(loadingInterval);
  clearInterval(progressInterval);
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('progress-bar').style.width = '15%';

  const btn = document.getElementById('generate-plan-submit-btn');
  btn.disabled = false;
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1rem;height:1rem;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    <span>Generate Full Itinerary &amp; Live Rates</span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1rem;height:1rem;"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  `;
  btn.classList.add('animate-shimmer');
}

function showFlightCanvas() {
  const section = document.getElementById('flight-canvas-container');
  if (!section) return;
  section.classList.remove('hidden');
  if (!flightCanvasCleanup) initFlightCanvas();
}

function hideFlightCanvas() {
  const section = document.getElementById('flight-canvas-container');
  if (!section) return;
  section.classList.add('hidden');
  flightCanvasCleanup?.();
}

async function handleGeneratePlan() {
  const prefs = getPreferences();
  if (!prefs.destinationPrompt.trim()) return;

  startLoading(prefs.destinationPrompt);

  try {
    const plan = await fetchTravelPlan(prefs);
    state.activePlan = plan;
    state.threadId   = plan.threadId || null;
    state.activeTab  = 'summary';

    showFlightCanvas();
    renderResultsPanel(plan);
    document.getElementById('results-view-section').classList.remove('hidden');

    triggerSuccessCelebration('Your AI travel plan is ready!');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate travel plan.';
    document.getElementById('error-banner').classList.remove('hidden');
    document.getElementById('error-body-text').textContent = msg;
    showToast(`Error: ${msg}`);
  } finally {
    stopLoading();
    setTimeout(() => scrollToSection('results-view-section'), 200);
  }
}

function triggerSuccessCelebration(msg) {
  try {
    if (window.confetti) {
      window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#10b981','#3b82f6','#f59e0b','#14b8a6'] });
    }
  } catch (_) {}
  showToast(msg);
}

// ============================================================
// 11. RESULTS PANEL RENDERING
// ============================================================

function renderResultsPanel(plan) {
  // Tags
  const tagsEl = document.getElementById('results-tags');
  let tags = `<span class="results-tag tag-sky">📍 ${plan.destination}</span>`;
  tags += `<span class="results-tag tag-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:.75rem;height:.75rem;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>${plan.durationDays} Days</span>`;
  tags += `<span class="results-tag tag-indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:.75rem;height:.75rem;"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>${plan.style}</span>`;
  tagsEl.innerHTML = tags;

  // Title
  document.getElementById('results-plan-title').textContent = plan.title;

  // Tab content
  document.getElementById('tab-summary-content').innerHTML   = renderMarkdownToHtml(plan.answer || '');
  document.getElementById('tab-itinerary-content').innerHTML = renderMarkdownToHtml(plan.itinerary || '');
  document.getElementById('tab-flights-content').innerHTML   = renderMarkdownToHtml(plan.flightResults || '');
  document.getElementById('tab-hotels-content').innerHTML    = renderMarkdownToHtml(plan.hotelResults || '');

  // Reset to first tab
  switchTab('summary');
  updateSaveButton();
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });
  document.querySelectorAll('.tab-content').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });
}

// ============================================================
// 12. SAVED TRIPS
// ============================================================

function saveSavedTrips() {
  try { localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(state.savedTrips)); } catch (_) {}
}

function updateSaveBadge() {
  const badge = document.getElementById('saved-badge');
  if (state.savedTrips.length > 0) {
    badge.textContent = state.savedTrips.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function updateSaveButton() {
  const btn   = document.getElementById('results-save-btn');
  const label = document.getElementById('save-btn-label');
  if (!state.activePlan) return;
  const isSaved = state.savedTrips.some(t => t.id === state.activePlan.id);
  btn.classList.toggle('is-saved', isSaved);
  label.textContent = isSaved ? 'Saved' : 'Save';
}

function toggleSave() {
  if (!state.activePlan) return;
  const isSaved = state.savedTrips.some(t => t.id === state.activePlan.id);
  if (isSaved) {
    state.savedTrips = state.savedTrips.filter(t => t.id !== state.activePlan.id);
    showToast('Removed trip from bookmarks');
  } else {
    state.savedTrips = [state.activePlan, ...state.savedTrips];
    showToast('Trip saved to your bookmarks!');
  }
  saveSavedTrips();
  updateSaveButton();
  updateSaveBadge();
}

function renderSavedDrawer() {
  const body = document.getElementById('saved-drawer-body');
  if (state.savedTrips.length === 0) {
    body.innerHTML = '<div class="empty-drawer"><p>No saved trips yet.</p><p style="margin-top:.5rem;font-size:.75rem;">Generate a plan and click Save to bookmark it here.</p></div>';
    return;
  }
  body.innerHTML = state.savedTrips.map(trip => `
    <div class="saved-trip-card" onclick="loadSavedTrip('${trip.id}')" role="button" tabindex="0" aria-label="Load trip: ${escapeHtml(trip.title)}">
      <p class="saved-trip-title">${escapeHtml(trip.title)}</p>
      <p class="saved-trip-meta">📍 ${escapeHtml(trip.destination)} • ${trip.durationDays} days</p>
      <p class="saved-trip-meta" style="margin-top:2px;">🗓️ ${new Date(trip.createdAt).toLocaleDateString()}</p>
      <div class="saved-trip-actions">
        <button class="saved-trip-del" onclick="event.stopPropagation();deleteSavedTrip('${trip.id}')" aria-label="Delete trip">🗑 Remove</button>
      </div>
    </div>
  `).join('');
}

function loadSavedTrip(id) {
  const trip = state.savedTrips.find(t => t.id === id);
  if (!trip) return;
  state.activePlan = trip;
  state.activeTab  = 'summary';
  showFlightCanvas();
  renderResultsPanel(trip);
  document.getElementById('results-view-section').classList.remove('hidden');
  showToast(`Loaded "${trip.title}"`);
  closeDrawer();
  setTimeout(() => scrollToSection('results-view-section'), 200);
}

function deleteSavedTrip(id) {
  state.savedTrips = state.savedTrips.filter(t => t.id !== id);
  saveSavedTrips();
  updateSaveBadge();
  renderSavedDrawer();
  if (state.activePlan && state.activePlan.id === id) updateSaveButton();
  showToast('Trip removed');
}

// ============================================================
// 13. SHARE MODAL
// ============================================================

function openShareModal() {
  if (!state.activePlan) return;
  const url = `${window.location.origin}${window.location.pathname}?plan=${encodeURIComponent(state.activePlan.id)}`;
  document.getElementById('share-url-input').value = url;
  document.getElementById('share-copy-feedback').textContent = '';
  openModal('share-modal');
}

function copyShareUrl() {
  const input = document.getElementById('share-url-input');
  navigator.clipboard.writeText(input.value).then(() => {
    document.getElementById('share-copy-feedback').textContent = '✓ Link copied to clipboard!';
  }).catch(() => {
    input.select();
    document.execCommand('copy');
    document.getElementById('share-copy-feedback').textContent = '✓ Copied!';
  });
}

// ============================================================
// 14. COMPARE MODAL
// ============================================================

function renderCompareModal() {
  const body = document.getElementById('compare-modal-body');

  if (!state.activePlan && state.savedTrips.length === 0) {
    body.innerHTML = '<p style="color:var(--text-muted);font-size:.875rem;">Generate a travel plan first to compare trips.</p>';
    return;
  }

  const plans = [...(state.activePlan ? [state.activePlan] : []), ...state.savedTrips.filter(t => !state.activePlan || t.id !== state.activePlan.id)].slice(0, 4);

  if (plans.length < 2) {
    body.innerHTML = `
      <p style="color:var(--text-muted);font-size:.875rem;margin-bottom:1rem;">You need at least 2 plans to compare. Save more trips using the bookmark button.</p>
      ${plans.length === 1 ? `<div class="saved-trip-card"><p class="saved-trip-title">${escapeHtml(plans[0].title)}</p><p class="saved-trip-meta">📍 ${escapeHtml(plans[0].destination)} • ${plans[0].durationDays} days</p></div>` : ''}
    `;
    return;
  }

  body.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(${Math.min(plans.length,2)},1fr);gap:1rem;">
      ${plans.slice(0,2).map(plan => `
        <div style="padding:1rem;border-radius:1rem;background:var(--bg-card);border:1px solid var(--glass-border);">
          <p style="font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem;">${escapeHtml(plan.title)}</p>
          <p style="font-size:.75rem;color:var(--text-muted);">📍 ${escapeHtml(plan.destination)}</p>
          <p style="font-size:.75rem;color:var(--text-muted);">⏱ ${plan.durationDays} days • ${escapeHtml(plan.style)}</p>
          <p style="font-size:.75rem;color:var(--text-muted);">👥 ${escapeHtml(plan.travelers)}</p>
          <button onclick="loadSavedTrip('${plan.id}');closeModal('compare-modal');"
            style="margin-top:.75rem;width:100%;padding:.5rem;border-radius:.5rem;background:var(--accent-sky);color:#0f172a;font-weight:700;font-size:.75rem;">
            View This Plan
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================================
// 15. FAQ RENDERING
// ============================================================

function renderFAQ() {
  const list = document.getElementById('faq-list');
  list.innerHTML = FAQ_DATA.map((item, idx) => `
    <div class="faq-item${idx === 0 ? ' open' : ''}" id="faq-item-${idx}" role="listitem">
      <button class="faq-question" onclick="toggleFAQ(${idx})"
        aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="faq-answer-${idx}">
        <div class="faq-question-left">
          <div class="faq-dot" aria-hidden="true"></div>
          <span class="faq-question-text">${escapeHtml(item.q)}</span>
        </div>
        <div class="faq-chevron" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </button>
      <div class="faq-answer" id="faq-answer-${idx}"><p style="margin-top:.75rem;">${escapeHtml(item.a)}</p></div>
    </div>
  `).join('');
}

function toggleFAQ(idx) {
  const item = document.getElementById(`faq-item-${idx}`);
  const btn  = item.querySelector('.faq-question');
  const isOpen = item.classList.contains('open');
  item.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

// ============================================================
// 16. HUB QUICK BAR RENDERING
// ============================================================

function renderHubQuickbar() {
  const container = document.getElementById('hub-quickbar');
  container.innerHTML = GLOBAL_HUBS.slice(0, 6).map(hub => `
    <button class="hub-quick-btn${hub.isOrigin ? ' is-origin' : ''}"
      onclick="selectHub('${hub.id}')" role="listitem" aria-label="${hub.code} - ${hub.city}">
      <div class="hub-color-dot" style="background:${hub.color};" aria-hidden="true"></div>
      <span>${hub.code}</span>
      <span class="hub-city-label">${hub.city}</span>
    </button>
  `).join('');
}

function selectHub(id) {
  const hub = GLOBAL_HUBS.find(h => h.id === id);
  if (!hub) return;

  // Find matching chip
  const chip = SUGGESTION_CHIPS.find(c =>
    c.destination.toLowerCase().includes(hub.city.toLowerCase())
  );
  if (chip) {
    document.getElementById('destination-prompt-input').value = chip.prompt;
    document.getElementById('adv-duration').value = chip.duration;
    document.getElementById('adv-style').value    = chip.style;
  } else {
    document.getElementById('destination-prompt-input').value =
      `Expedition to ${hub.city}, ${hub.country} exploring iconic architecture, local culinary hotspots, and cultural heritage.`;
  }

  showToast(`Flight corridor to ${hub.city} (${hub.code}) selected!`);
  renderSuggestionChips();
  updateClearBtn();

  const inputEl = document.getElementById('destination-prompt-input');
  inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inputEl.focus();
}

// ============================================================
// 17. FLIGHT CANVAS ANIMATION
// ============================================================

let flightCanvasCleanup = null;

function initFlightCanvas() {
  flightCanvasCleanup?.();
  const canvas = document.getElementById('flight-canvas');
  const wrap   = document.getElementById('flight-canvas-wrap');
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  let rafId = null;
  let resizeObserver = null;
  let destroyed = false;

  // Initialize particles
  const hubs     = GLOBAL_HUBS;
  const addisHub = hubs.find(h => h.id === 'ADD') || hubs[0];
  state.flightParticles = [];

  function createFlightParticle(index, routes) {
    const availableRoutes = routes.length ? routes : FLIGHT_ROUTES;
    const route = index % 3 === 0
      ? availableRoutes.find(([from]) => from === 'ADD') || availableRoutes[0]
      : availableRoutes[Math.floor(Math.random() * availableRoutes.length)];
    const fromHub = hubs.find(hub => hub.id === route[0]) || addisHub;
    const toHub = hubs.find(hub => hub.id === route[1]) || hubs[1];
    return {
      fromHub, toHub,
      progress: Math.random(),
      speed:    0.0012 + Math.random() * 0.002,
      size:     2.5 + Math.random() * 2,
      color:    fromHub.id === 'ADD' ? '#10b981' : fromHub.color,
      altitude: 40 + Math.random() * 60,
    };
  }
  let activeRouteSignature = '';
  function resetFlightParticles(routes) {
    state.flightParticles = [];
    for (let i = 0; i < 24; i++) {
      const particle = createFlightParticle(i, routes);
      state.flightParticles.push(particle);
    }
    activeRouteSignature = routes.map(route => route.join('-')).join('|');
    document.getElementById('active-routes-count').textContent = `${routes.length} Routes`;
  }
  resetFlightParticles(getVisibleFlightRoutes());

  // Resize canvas
  let canvasSize = { width: 0, height: 0 };
  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    canvasSize = { width: rect.width, height: rect.height };
    canvas.width  = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);

  function getHubPoint(hub) {
    return projectHub(hub, canvasSize.width, canvasSize.height);
  }

  function render() {
    const width  = canvasSize.width;
    const height = canvasSize.height;
    const isDark = state.theme === 'dark';
    const visibleRoutes = getVisibleFlightRoutes();
    const visibleRouteSignature = visibleRoutes.map(route => route.join('-')).join('|');
    if (visibleRouteSignature !== activeRouteSignature) resetFlightParticles(visibleRoutes);
    const allRouteSignature = FLIGHT_ROUTES.map(route => route.join('-')).join('|');
    const hasQueryRoutes = Boolean(state.activePlan && visibleRouteSignature !== allRouteSignature);

    ctx.clearRect(0, 0, width, height);

    // 1. Grid
    const gridColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const stepX = width / 12, stepY = height / 8;
    for (let x = stepX; x < width; x += stepX) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = stepY; y < height; y += stepY) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    // 2. Geodesic arcs
    const routeLineColor     = isDark ? 'rgba(56,189,248,0.12)'  : 'rgba(2,132,199,0.1)';
    const highlightRouteColor = isDark ? 'rgba(56,189,248,0.55)' : 'rgba(2,132,199,0.6)';
    const activeDest = state.activePlan ? state.activePlan.destination.toLowerCase() : '';

    visibleRoutes.forEach(([fromId, toId]) => {
        const hubA = hubs.find(hub => hub.id === fromId);
        const hubB = hubs.find(hub => hub.id === toId);
        if (!hubA || !hubB) return;
        const isAddisCorridor = hubA.id === 'ADD' || hubB.id === 'ADD';
        const isHighlighted   =
          hasQueryRoutes ||
          (activeDest && (hubA.city.toLowerCase().includes(activeDest) || hubB.city.toLowerCase().includes(activeDest))) ||
          (state.hoveredHub && (hubA.id === state.hoveredHub.id || hubB.id === state.hoveredHub.id));

        const pointA = getHubPoint(hubA);
        const pointB = getHubPoint(hubB);
        const ax = pointA.x, ay = pointA.y;
        const bx = pointB.x, by = pointB.y;
        const midX = (ax + bx) / 2, midY = (ay + by) / 2;
        const dist = Math.hypot(bx - ax, by - ay);
        const cpX  = midX, cpY = midY - Math.min(dist * 0.25, 80);

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cpX, cpY, bx, by);

        if (isHighlighted) {
          ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.2;
          ctx.shadowColor = 'rgba(56,189,248,0.8)'; ctx.shadowBlur = 10;
        } else if (isAddisCorridor) {
          ctx.strokeStyle = highlightRouteColor; ctx.lineWidth = 1.3; ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = routeLineColor; ctx.lineWidth = 0.8; ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

    // 3. Particles
    if (state.flightPlaying) {
      state.flightParticles.forEach(p => {
        p.progress += p.speed * state.flightSpeed;
        if (p.progress > 1) {
          p.progress = 0;
          const route = visibleRoutes[Math.floor(Math.random() * visibleRoutes.length)];
          p.fromHub = hubs.find(hub => hub.id === route[0]) || addisHub;
          p.toHub = hubs.find(hub => hub.id === route[1]) || hubs[1];
        }
      });
    }

    state.flightParticles.forEach(p => {
      const fromPoint = getHubPoint(p.fromHub);
      const toPoint = getHubPoint(p.toHub);
      const ax = fromPoint.x, ay = fromPoint.y;
      const bx = toPoint.x, by = toPoint.y;
      const midX = (ax + bx) / 2, midY = (ay + by) / 2;
      const dist  = Math.hypot(bx - ax, by - ay);
      const cpX   = midX, cpY = midY - Math.min(dist * 0.25, 80);
      const t     = p.progress;
      const px    = (1-t)*(1-t)*ax + 2*(1-t)*t*cpX + t*t*bx;
      const py    = (1-t)*(1-t)*ay + 2*(1-t)*t*cpY + t*t*by;

      // Trail
      for (let j = 1; j <= 5; j++) {
        const tt = Math.max(0, t - j * 0.015);
        const tx = (1-tt)*(1-tt)*ax + 2*(1-tt)*tt*cpX + tt*tt*bx;
        const ty = (1-tt)*(1-tt)*ay + 2*(1-tt)*tt*cpY + tt*tt*by;
        const alpha = (1 - j/5) * 0.45;
        ctx.beginPath();
        ctx.arc(tx, ty, p.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(56,189,248,${alpha})` : `rgba(2,132,199,${alpha})`;
        ctx.fill();
      }

      // Core dot
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });

    // 4. Ripples
    state.flightRipples = state.flightRipples.filter(r => {
      r.radius += 1.8;
      r.alpha  -= 0.015;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) return false;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? `rgba(56,189,248,${r.alpha})` : `rgba(2,132,199,${r.alpha})`;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      return true;
    });

    // 5. Hub nodes
    const time = Date.now() * 0.003;
    hubs.forEach(hub => {
      const hubPoint = getHubPoint(hub);
      const hx = hubPoint.x, hy = hubPoint.y;
      const isHovered  = state.hoveredHub && state.hoveredHub.id === hub.id;
      const isSelected = activeDest && hub.city.toLowerCase().includes(activeDest);
      const isOrigin   = hub.isOrigin;
      const pulseScale = (Math.sin(time + hub.longitude * 0.1) + 1) * 0.5;

      // Pulse ring
      ctx.beginPath();
      ctx.arc(hx, hy, 8 + pulseScale * 8, 0, Math.PI * 2);
      ctx.strokeStyle = isOrigin ? 'rgba(56,189,248,0.45)' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)');
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core
      ctx.beginPath();
      ctx.arc(hx, hy, isOrigin ? 6 : (isHovered || isSelected ? 5.5 : 4), 0, Math.PI * 2);
      ctx.fillStyle = isOrigin ? '#38bdf8' : (isHovered || isSelected ? '#818cf8' : (isDark ? '#e2e8f0' : '#334155'));
      if (isHovered || isSelected || isOrigin) {
        ctx.shadowColor = isOrigin ? '#38bdf8' : '#818cf8';
        ctx.shadowBlur  = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.font      = '10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = isDark ? (isHovered ? '#ffffff' : 'rgba(255,255,255,0.75)') : (isHovered ? '#000000' : 'rgba(0,0,0,0.75)');
      ctx.textAlign = 'center';
      ctx.fillText(hub.code, hx, hy - 12);
      if (isHovered || isOrigin) {
        ctx.font      = 'bold 9px sans-serif';
        ctx.fillStyle = isOrigin ? '#38bdf8' : (isDark ? '#a5b4fc' : '#4338ca');
        ctx.fillText(hub.city, hx, hy + 18);
      }
    });

    if (!destroyed) rafId = requestAnimationFrame(render);
  }
  render();

  // Mouse interactions
  canvas.addEventListener('mousemove', (e) => {
    const rect   = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    let found = null;
    hubs.forEach(hub => {
      const point = getHubPoint(hub);
      if (Math.hypot(x - point.x, y - point.y) < 20) found = hub;
    });
    state.hoveredHub = found;
    canvas.style.cursor = found ? 'pointer' : 'crosshair';
  });
  canvas.addEventListener('mouseleave', () => { state.hoveredHub = null; canvas.style.cursor = 'crosshair'; });
  canvas.addEventListener('click', (e) => {
    const rect   = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    state.flightRipples.push({ x, y, radius: 5, maxRadius: 80, alpha: 0.8 });
    hubs.forEach(hub => {
      const point = getHubPoint(hub);
      if (Math.hypot(x - point.x, y - point.y) < 25) selectHub(hub.id);
    });
  });

  flightCanvasCleanup = () => {
    destroyed = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    canvas.replaceWith(canvas.cloneNode(true));
    flightCanvasCleanup = null;
  };
}

// ============================================================
// 18. NEURAL CANVAS ANIMATION
// ============================================================

let neuralTime = 0;
let neuralRafId = null;

function createNeuralParticles() {
  return NEURAL_NODES.flatMap((node, nodeIndex) =>
    node.connections.map((targetId, connectionIndex) => {
      const target = NEURAL_NODES.find(candidate => candidate.id === targetId);
      if (!target) return null;
      return {
        fromId: node.id,
        toId: target.id,
        progress: ((nodeIndex + connectionIndex) * 0.17) % 1,
        speed: 0.005 + ((nodeIndex + connectionIndex) % 5) * 0.001,
        color: node.color,
        size: 2.5 + ((nodeIndex + connectionIndex) % 3) * 0.5,
      };
    }).filter(Boolean)
  );
}

let neuralCanvasCleanup = null;

function initNeuralCanvas() {
  neuralCanvasCleanup?.();
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let neuralResizeObserver = null;
  let destroyed = false;
  let nodePositions = new Map();
  const neuralParticles = createNeuralParticles();

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = parent.clientHeight || 280;
    canvas.width  = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width  = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const edgeInset = Math.min(28, width / 2);
    nodePositions = new Map(NEURAL_NODES.map(node => [
      node.id,
      { x: Math.max(edgeInset, Math.min(width - edgeInset, node.x * width)), y: node.y * height },
    ]));
  }
  resize();
  neuralResizeObserver = new ResizeObserver(resize);
  neuralResizeObserver.observe(canvas.parentElement);

  function render() {
    if (state.neuralRunning) neuralTime += 0.02 * state.neuralSpeed;
    const nodes = NEURAL_NODES;
    const w = canvas.parentElement?.clientWidth || 0;
    const h = canvas.parentElement?.clientHeight || 280;

    ctx.clearRect(0, 0, w, h);

    // 1. Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth   = 1;
    for (let x = 0; x < w; x += 28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    // 2. Connections
    nodes.forEach(node => {
      const start = nodePositions.get(node.id);
      if (!start) return;
      const x1 = start.x, y1 = start.y;
      node.connections.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (!target) return;
        const end = nodePositions.get(target.id);
        if (!end) return;
        const x2 = end.x, y2 = end.y;
        const midX = (x1+x2)/2, midY = (y1+y2)/2 - 25 * Math.sin(neuralTime + node.pulsePhase);
        const grad = ctx.createLinearGradient(x1,y1,x2,y2);
        grad.addColorStop(0, `${node.color}55`);
        grad.addColorStop(1, `${target.color}55`);
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.quadraticCurveTo(midX,midY,x2,y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([4,4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    // 3. Particles
    neuralParticles.forEach(p => {
      if (state.neuralRunning) {
        p.progress += p.speed * state.neuralSpeed;
        if (p.progress > 1) p.progress = 0;
      }
      const from = nodes.find(node => node.id === p.fromId);
      const to = nodes.find(node => node.id === p.toId);
      if (!from || !to) return;
      const fromPoint = nodePositions.get(from.id);
      const toPoint = nodePositions.get(to.id);
      if (!fromPoint || !toPoint) return;
      const x1=fromPoint.x, y1=fromPoint.y, x2=toPoint.x, y2=toPoint.y;
      const midX=(x1+x2)/2, midY=(y1+y2)/2-25*Math.sin(neuralTime+from.pulsePhase);
      const t=p.progress;
      const px=(1-t)*(1-t)*x1+2*(1-t)*t*midX+t*t*x2;
      const py=(1-t)*(1-t)*y1+2*(1-t)*t*midY+t*t*y2;

      ctx.beginPath(); ctx.arc(px,py,p.size*2,0,Math.PI*2);
      ctx.fillStyle = `${p.color}33`; ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,p.size,0,Math.PI*2);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 8;
      ctx.fill(); ctx.shadowBlur = 0;
    });

    // 4. Nodes
    nodes.forEach(node => {
      const point = nodePositions.get(node.id);
      if (!point) return;
      const nx = point.x, ny = point.y;
      const isHovered = state.activeNeuralNode && state.activeNeuralNode.id === node.id;
      const pulse     = Math.sin(neuralTime * 2 + node.pulsePhase) * 0.3 + 0.7;

      // Halo
      ctx.beginPath(); ctx.arc(nx,ny,(isHovered?24:18)*pulse,0,Math.PI*2);
      ctx.fillStyle = `${node.color}22`; ctx.fill();

      // Border
      ctx.beginPath(); ctx.arc(nx,ny,isHovered?14:10,0,Math.PI*2);
      ctx.fillStyle   = '#0f172a';
      ctx.strokeStyle = node.color;
      ctx.lineWidth   = isHovered ? 2.5 : 1.5;
      ctx.stroke(); ctx.fill();

      // Center
      ctx.beginPath(); ctx.arc(nx,ny,isHovered?5:3.5,0,Math.PI*2);
      ctx.fillStyle = node.color; ctx.fill();

      // Label
      ctx.font      = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = isHovered ? '#ffffff' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.split(' ')[0], nx, ny + 24);
    });

    if (!destroyed) neuralRafId = requestAnimationFrame(render);
  }
  render();

  neuralCanvasCleanup = () => {
    destroyed = true;
    if (neuralRafId !== null) cancelAnimationFrame(neuralRafId);
    neuralRafId = null;
    neuralResizeObserver?.disconnect();
    canvas.replaceWith(canvas.cloneNode(true));
    neuralCanvasCleanup = null;
  };
}

function setNeuralSpeed(speed) {
  state.neuralSpeed = speed;
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
  });
}

function toggleNeuralPause() {
  state.neuralRunning = !state.neuralRunning;
}

function setActiveNode(id) {
  if (id === null) {
    state.activeNeuralNode = null;
    document.getElementById('neural-footer-text').textContent =
      'Guzo (ጉዞ) means "Journey" in Amharic. We turn spontaneous dreams into seamless, culturally rich expeditions.';
    document.querySelectorAll('.node-chip').forEach(c => c.classList.remove('active'));
  } else {
    const node = NEURAL_NODES.find(n => n.id === id);
    state.activeNeuralNode = node || null;
    if (node) {
      document.getElementById('neural-footer-text').textContent =
        `${node.name} (${node.amharic}): ${node.description}`;
    }
    document.querySelectorAll('.node-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.nodeId === id);
    });
  }
}

function onNodeChipClick(id) {
  const node = NEURAL_NODES.find(n => n.id === id);
  if (!node) return;
  setActiveNode(id);
  if (node.category === 'flight') {
    const textarea = document.getElementById('destination-prompt-input');
    textarea.value = `5-day cultural trip to ${node.name} with authentic local dining and flight routes.`;
    updateClearBtn();
    renderSuggestionChips();
    scrollToSection('plan-generator-section');
  }
}

// ============================================================
// 19. CLEAR BUTTON & TEXTAREA LISTENER
// ============================================================

function updateClearBtn() {
  const val = document.getElementById('destination-prompt-input').value;
  document.getElementById('clear-prompt-btn').classList.toggle('hidden', !val);
}

// ============================================================
// 20. CANVAS PLAY/SPEED CONTROLS
// ============================================================

function toggleCanvasPlay() {
  state.flightPlaying = !state.flightPlaying;
  document.getElementById('canvas-pause-icon').classList.toggle('hidden', !state.flightPlaying);
  document.getElementById('canvas-play-icon').classList.toggle('hidden', state.flightPlaying);
}

function cycleCanvasSpeed() {
  const speeds = [1, 2, 0.5];
  const idx    = speeds.indexOf(state.flightSpeed);
  state.flightSpeed = speeds[(idx + 1) % speeds.length];
  document.getElementById('canvas-speed-btn').textContent = `${state.flightSpeed}x`;
}

// ============================================================
// 21. DOM BINDINGS
// ============================================================

function bindEvents() {
  // Navbar brand
  document.getElementById('navbar-brand-button').addEventListener('click', () => scrollToSection('plan-generator-section'));
  document.getElementById('navbar-brand-button').addEventListener('keydown', e => { if (e.key === 'Enter') scrollToSection('plan-generator-section'); });

  // Theme
  document.getElementById('theme-toggle-button').addEventListener('click', toggleTheme);

  // Currency
  document.getElementById('currency-selector').addEventListener('change', e => { state.currency = e.target.value; });

  // Saved drawer
  document.getElementById('saved-trips-button').addEventListener('click', openDrawer);

  // Clear prompt
  document.getElementById('clear-prompt-btn').addEventListener('click', () => {
    document.getElementById('destination-prompt-input').value = '';
    updateClearBtn();
    renderSuggestionChips();
  });

  // Textarea input
  document.getElementById('destination-prompt-input').addEventListener('input', () => {
    updateClearBtn();
    renderSuggestionChips();
  });
  // Ctrl+Enter to generate
  document.getElementById('destination-prompt-input').addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleGeneratePlan(); }
  });

  // Voice lang
  document.getElementById('voice-lang-select').addEventListener('change', e => {
    state.speechLang = e.target.value;
    if (state.recognition) state.recognition.lang = e.target.value;
  });

  // Voice button
  document.getElementById('voice-btn').addEventListener('click', toggleVoiceSearch);

  // Advanced toggle
  document.getElementById('advanced-toggle-btn').addEventListener('click', toggleAdvanced);

  // Generate button
  document.getElementById('generate-plan-submit-btn').addEventListener('click', handleGeneratePlan);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Results actions
  document.getElementById('results-save-btn').addEventListener('click', toggleSave);
  document.getElementById('results-share-btn').addEventListener('click', openShareModal);
  document.getElementById('results-export-btn').addEventListener('click', () => openModal('export-modal'));
  document.getElementById('results-compare-btn').addEventListener('click', () => { renderCompareModal(); openModal('compare-modal'); });
  document.getElementById('results-modify-btn').addEventListener('click', () => scrollToSection('plan-generator-section'));

  // Compare buttons in navbar area
  document.getElementById('open-compare-modal-btn').addEventListener('click', () => { renderCompareModal(); openModal('compare-modal'); });

  // Canvas controls
  document.getElementById('canvas-play-btn').addEventListener('click', toggleCanvasPlay);
  document.getElementById('canvas-speed-btn').addEventListener('click', cycleCanvasSpeed);

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Escape to close modals/drawer
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['share-modal','export-modal','compare-modal'].forEach(id => {
        if (!document.getElementById(id).classList.contains('hidden')) closeModal(id);
      });
      if (!document.getElementById('saved-drawer').classList.contains('hidden')) closeDrawer();
    }
  });
}

// ============================================================
// 22. INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Apply theme
  applyTheme(state.theme);

  // Footer year
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  // Render static content
  renderSuggestionChips();
  renderFAQ();
  renderHubQuickbar();
  updateSaveBadge();

  // Bind all events
  bindEvents();

  // Initialize voice
  initVoiceSearch();

  // Initialize canvases
  hideFlightCanvas();
  initNeuralCanvas();

  // Set initial prompt from first chip
  const first = SUGGESTION_CHIPS[0];
  if (first && !document.getElementById('destination-prompt-input').value) {
    document.getElementById('destination-prompt-input').value = first.prompt;
    document.getElementById('adv-duration').value = first.duration;
    document.getElementById('adv-style').value    = first.style;
  }
  updateClearBtn();
  renderSuggestionChips();
});
