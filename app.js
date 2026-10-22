/**
 * Chinese Practice - Chinese Vocabulary & Grammar Practice
 * Supports Book 1 & Book 2 with independent lesson selection,
 * Local vocab_images/*.png with Unsplash fallback,
 * and Grammar Sentence Cloze with full Pinyin & manual advance.
 */

// App State
const state = {
  activeTab: 'practice', // 'practice' | 'vocab' | 'grammar'
  selectedBook: 'all', // 'all' | 1 | 2
  selectedLessonsB1: new Set(), // Book 1: 1..15
  selectedLessonsB2: new Set(), // Book 2: 1..15
  modalBook: 1, // Active book tab inside lesson picker modal (1 or 2)
  mode: 'photo', // 'photo' | 'zh2en' | 'en2zh' | 'grammar' | 'mixed'
  questionCount: 10,
  pinyinSetting: 'on-answer', // 'always' | 'on-answer' | 'hidden'
  soundEnabled: true,
  theme: 'dark',

  // Active Round State
  roundItems: [],
  currentIndex: 0,
  streak: 0,
  maxStreak: 0,
  correctCount: 0,
  wrongCount: 0,
  startTime: 0,
  questionStartTime: 0,
  timerInterval: null,
  elapsedMs: 0,
  results: [],
  isAnswerLocked: false,
  cachedImages: new Map(),

  isRetryRound: false,
  autoNextTimeout: null,

  // Vocabulary Explorer State
  vocabFilter: {
    book: 'all', // 'all' | 1 | 2
    lesson: 'all', // 'all' | 1..15
    photosOnly: false,
    search: '',
    renderedCount: 0,
    batchSize: 60
  },

  // Grammar Reference State
  grammarFilter: {
    book: 'all', // 'all' | 1 | 2
    lesson: 'all', // 'all' | 1..15
    search: '',
    renderedCount: 0,
    batchSize: 30
  },

  activeModalItem: null
};

// Common Grammar Target Markers for Cloze Extraction
const GRAMMAR_TARGET_KEYWORDS = [
  "一點也不", "看起來", "聽起來", "聞起來", "吃起來", "做起來", "笑起來", "一邊", "往前", "往後", "往左", "往右",
  "越來越", "沒想到", "過", "著", "了", "把", "被", "比", "離", "從", "往", "得", "的", "地",
  "也", "都", "常", "才", "就", "呢", "嗎", "吧", "啊", "只要", "應該", "本來", "完全", "給", "讓",
  "不見", "看見", "想起", "繼續", "下去", "起來", "左右", "高高興興", "舒舒服服", "漂漂亮亮", "乾乾淨淨",
  "快一點", "慢一點", "好一點", "多一點", "少一點", "多", "少", "要不要", "是不是", "有沒有", "喜不喜歡"
];

// Plausible grammar distractors by category
const GRAMMAR_DISTRACTOR_SETS = {
  "particles": ["得", "的", "地", "在"],
  "disposal": ["把", "被", "給", "讓"],
  "direction": ["往前", "往後", "往左", "往右"],
  "question_particles": ["嗎", "呢", "吧", "啊"],
  "adverbs": ["也", "都", "常", "才", "就"],
  "distance": ["離", "從", "往", "在"],
  "aspect": ["了", "著", "過", "在"],
  "comparison": ["比", "跟", "像", "有"],
  "adjustment": ["快一點", "慢一點", "好一點", "多一點"],
  "sensory": ["看起來", "聽起來", "聞起來", "吃起來"]
};

// Full Term Definitions for Grammar Options (Hanzi -> Pinyin + Meaning)
const GRAMMAR_TERMS_MAP = {
  "得": { pinyin: "de", english: "complement marker (verb degree/manner)" },
  "的": { pinyin: "de", english: "possessive / modifier marker" },
  "地": { pinyin: "de", english: "adverbial marker (-ly)" },
  "在": { pinyin: "zài", english: "at / in / ongoing action" },
  "把": { pinyin: "bǎ", english: "disposal marker (handle/move object)" },
  "被": { pinyin: "bèi", english: "passive marker (by)" },
  "讓": { pinyin: "ràng", english: "to let / allow / make" },
  "給": { pinyin: "gěi", english: "to give / on behalf of / by" },
  "比": { pinyin: "bǐ", english: "compare with / more than" },
  "跟": { pinyin: "gēn", english: "with / and / as... as" },
  "像": { pinyin: "xiàng", english: "like / resemble" },
  "離": { pinyin: "lí", english: "distance from (away from)" },
  "從": { pinyin: "cóng", english: "from (starting point)" },
  "往": { pinyin: "wǎng", english: "toward / heading to" },
  "了": { pinyin: "le", english: "completed action / change of situation" },
  "著": { pinyin: "zhe", english: "ongoing action / continuing state" },
  "過": { pinyin: "guò", english: "experiential aspect (have done before)" },
  "也": { pinyin: "yě", english: "also / too" },
  "都": { pinyin: "dōu", english: "all / both" },
  "常": { pinyin: "cháng", english: "often" },
  "才": { pinyin: "cái", english: "only then / not until" },
  "就": { pinyin: "jiù", english: "then / right away / as early as" },
  "呢": { pinyin: "ne", english: "contrastive question (what about...?)" },
  "嗎": { pinyin: "ma", english: "yes/no question particle" },
  "吧": { pinyin: "ba", english: "suggestion particle" },
  "啊": { pinyin: "a", english: "exclamation particle" },
  "往前": { pinyin: "wǎng qián", english: "forward / ahead" },
  "往後": { pinyin: "wǎng hòu", english: "backward / behind" },
  "往左": { pinyin: "wǎng zuǒ", english: "turn left" },
  "往右": { pinyin: "wǎng yòu", english: "turn right" },
  "一點也不": { pinyin: "yì diǎn yě bù", english: "not at all (emphatic negation)" },
  "看起來": { pinyin: "kàn qǐ lái", english: "looks like / it seems" },
  "聽起來": { pinyin: "tīng qǐ lái", english: "sounds like" },
  "聞起來": { pinyin: "wén qǐ lái", english: "smells like" },
  "吃起來": { pinyin: "chī qǐ lái", english: "tastes like" },
  "做起來": { pinyin: "zuò qǐ lái", english: "to do / execute in practice" },
  "笑起來": { pinyin: "xiào qǐ lái", english: "when smiling / to smile" },
  "一邊": { pinyin: "yī biān", english: "at the same time / while" },
  "越來越": { pinyin: "yuè lái yuè", english: "more and more" },
  "沒想到": { pinyin: "méi xiǎng dào", english: "unexpectedly / didn't expect" },
  "只要": { pinyin: "zhǐ yào", english: "as long as" },
  "應該": { pinyin: "yīng gāi", english: "should / ought to" },
  "本來": { pinyin: "běn lái", english: "originally" },
  "完全": { pinyin: "wán quán", english: "completely" },
  "快一點": { pinyin: "kuài yì diǎn", english: "a bit faster" },
  "慢一點": { pinyin: "màn yì diǎn", english: "a bit slower" },
  "好一點": { pinyin: "hǎo yì diǎn", english: "a bit better" },
  "多一點": { pinyin: "duō yì diǎn", english: "a bit more" },
  "少一點": { pinyin: "shǎo yì diǎn", english: "a bit less" },
  "高高興興": { pinyin: "gāo gāo xìng xìng", english: "happily / delightfully" },
  "舒舒服服": { pinyin: "shū shū fú fú", english: "comfortably" },
  "漂漂亮亮": { pinyin: "piào piào liàng liàng", english: "prettily / beautifully" },
  "乾乾淨淨": { pinyin: "gān gān jìng jìng", english: "cleanly / neatly" },
  "要不要": { pinyin: "yào bú yào", english: "want or not want" },
  "是不是": { pinyin: "shì bú shì", english: "is or is not" },
  "有沒有": { pinyin: "yǒu méi yǒu", english: "have or not have" },
  "喜不喜歡": { pinyin: "xǐ bù xǐ huān", english: "like or not like" },
  "想起": { pinyin: "xiǎng qǐ", english: "to recall / remember" },
  "看見": { pinyin: "kàn jiàn", english: "to see / catch sight of" },
  "不見": { pinyin: "bú jiàn", english: "disappear / lost" },
  "繼續": { pinyin: "jì xù", english: "to continue" },
  "下去": { pinyin: "xià qù", english: "continue on (downward)" },
  "起來": { pinyin: "qǐ lái", english: "start to / upward" }
};

function lookupTermInfo(term) {
  if (GRAMMAR_TERMS_MAP[term]) {
    return GRAMMAR_TERMS_MAP[term];
  }
  if (typeof VOCAB_DATA !== 'undefined') {
    const found = VOCAB_DATA.find(v => v.traditional === term);
    if (found) {
      return { pinyin: found.pinyin, english: found.english };
    }
  }
  return null;
}

// Sound Synthesizer using Web Audio API
const soundEngine = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playCorrect() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

    osc2.frequency.setValueAtTime(1318.5, now + 0.05);

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  },
  playWrong() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }
};

// Mandarin Text-to-Speech Engine
const ttsEngine = {
  speak(text, { force = false } = {}) {
    if (!state.soundEnabled && !force) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.92;

      const voices = window.speechSynthesis.getVoices() || [];
      const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

      let chosenVoice = null;
      if (isOnline) {
        // Preferred default: use natural cloud voices when connected
        chosenVoice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang.startsWith('zh'));
      } else {
        // Offline / Airplane mode: select an on-device local voice
        chosenVoice = voices.find(v => v.localService && (v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang.startsWith('zh')));
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      } else if (!isOnline) {
        // When offline and no local Chinese voice is installed, fail gracefully (no voice)
        return;
      }

      utterance.onerror = (e) => {
        // Safely catch any audio abort or network voice interruption
        console.warn('TTS playback notification:', e.error || e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable:', err);
    }
  }
};

// DOM Elements
const elements = {
  // Navigation & Screens
  mainNavTabs: document.querySelectorAll('#mainNavTabs .nav-tab-btn'),
  setupScreen: document.getElementById('setupScreen'),
  precacheScreen: document.getElementById('precacheScreen'),
  quizScreen: document.getElementById('quizScreen'),
  resultsScreen: document.getElementById('resultsScreen'),
  vocabScreen: document.getElementById('vocabScreen'),
  grammarScreen: document.getElementById('grammarScreen'),

  vocabNavCount: document.getElementById('vocabNavCount'),
  grammarNavCount: document.getElementById('grammarNavCount'),

  menuToggleBtn: document.getElementById('menuToggleBtn'),
  settingsDropdownMenu: document.getElementById('settingsDropdownMenu'),
  soundToggleBtns: document.querySelectorAll('.sound-toggle-btn'),
  themeToggleBtns: document.querySelectorAll('.theme-toggle-btn'),

  modeCards: document.querySelectorAll('.mode-card-compact'),
  questionChips: document.querySelectorAll('#questionCountChips .chip-btn-c'),
  pinyinChips: document.querySelectorAll('#pinyinChips .chip-btn-c'),
  openLessonModalBtn: document.getElementById('openLessonModalBtn'),
  lessonTriggerTitle: document.getElementById('lessonTriggerTitle'),
  lessonTriggerSub: document.getElementById('lessonTriggerSub'),
  lessonTriggerBadges: document.getElementById('lessonTriggerBadges'),
  quickSelectAllBtn: document.getElementById('quickSelectAllBtn'),
  quickClearBtn: document.getElementById('quickClearBtn'),
  poolStats: document.getElementById('poolStats'),
  startQuizBtn: document.getElementById('startQuizBtn'),

  // Lesson Picker Modal Elements
  lessonPickerModal: document.getElementById('lessonPickerModal'),
  lessonModalBackdrop: document.getElementById('lessonModalBackdrop'),
  closeLessonModalBtn: document.getElementById('closeLessonModalBtn'),
  applyLessonModalBtn: document.getElementById('applyLessonModalBtn'),
  modalBookTabs: document.querySelectorAll('.modal-book-tab'),
  modalSelectAllBtn: document.getElementById('modalSelectAllBtn'),
  modalClearBtn: document.getElementById('modalClearBtn'),
  modalLessonList: document.getElementById('modalLessonList'),
  modalSelectedSummary: document.getElementById('modalSelectedSummary'),
  modalWordsSummary: document.getElementById('modalWordsSummary'),

  // Vocab Explorer Elements
  vocabFilterStats: document.getElementById('vocabFilterStats'),
  vocabBookChips: document.querySelectorAll('#vocabBookFilter .chip-btn-c'),
  vocabLessonFilter: document.getElementById('vocabLessonFilter'),
  vocabPrevLessonBtn: document.getElementById('vocabPrevLessonBtn'),
  vocabNextLessonBtn: document.getElementById('vocabNextLessonBtn'),
  vocabPhotoFilterBtn: document.getElementById('vocabPhotoFilterBtn'),
  vocabSearchInput: document.getElementById('vocabSearchInput'),
  vocabSearchClear: document.getElementById('vocabSearchClear'),
  vocabGrid: document.getElementById('vocabGrid'),
  vocabLoadMoreWrap: document.getElementById('vocabLoadMoreWrap'),
  vocabLoadMoreBtn: document.getElementById('vocabLoadMoreBtn'),
  vocabRemainingCount: document.getElementById('vocabRemainingCount'),

  // Grammar Reference Elements
  grammarFilterStats: document.getElementById('grammarFilterStats'),
  grammarBookChips: document.querySelectorAll('#grammarBookFilter .chip-btn-c'),
  grammarLessonFilter: document.getElementById('grammarLessonFilter'),
  grammarPrevLessonBtn: document.getElementById('grammarPrevLessonBtn'),
  grammarNextLessonBtn: document.getElementById('grammarNextLessonBtn'),
  grammarSearchInput: document.getElementById('grammarSearchInput'),
  grammarSearchClear: document.getElementById('grammarSearchClear'),
  grammarLessonFocusBanner: document.getElementById('grammarLessonFocusBanner'),
  grammarFocusBadge: document.getElementById('grammarFocusBadge'),
  grammarFocusTitle: document.getElementById('grammarFocusTitle'),
  grammarFocusList: document.getElementById('grammarFocusList'),
  grammarList: document.getElementById('grammarList'),
  grammarLoadMoreWrap: document.getElementById('grammarLoadMoreWrap'),
  grammarLoadMoreBtn: document.getElementById('grammarLoadMoreBtn'),
  grammarRemainingCount: document.getElementById('grammarRemainingCount'),

  // Lightbox Modal Elements
  imageLightboxModal: document.getElementById('imageLightboxModal'),
  lightboxBackdrop: document.getElementById('lightboxBackdrop'),
  lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),
  lightboxImg: document.getElementById('lightboxImg'),
  lightboxHanzi: document.getElementById('lightboxHanzi'),
  lightboxPinyin: document.getElementById('lightboxPinyin'),
  lightboxEnglish: document.getElementById('lightboxEnglish'),
  lightboxBadge: document.getElementById('lightboxBadge'),
  lightboxAudioBtn: document.getElementById('lightboxAudioBtn'),

  precacheProgressBar: document.getElementById('precacheProgressBar'),
  precacheStatusText: document.getElementById('precacheStatusText'),
  precacheProgressPct: document.getElementById('precacheProgressPct'),

  hudProgress: document.getElementById('hudProgress'),
  hudTimer: document.getElementById('hudTimer'),
  hudStreak: document.getElementById('hudStreak'),
  quizProgressBar: document.getElementById('quizProgressBar'),

  imagePromptContainer: document.getElementById('imagePromptContainer'),
  quizImage: document.getElementById('quizImage'),
  imageLoaderOverlay: document.getElementById('imageLoaderOverlay'),

  textPromptContainer: document.getElementById('textPromptContainer'),
  promptModeTag: document.getElementById('promptModeTag'),
  promptMainText: document.getElementById('promptMainText'),
  promptPinyinText: document.getElementById('promptPinyinText'),
  promptAudioBtn: document.getElementById('promptAudioBtn'),

  grammarPromptContainer: document.getElementById('grammarPromptContainer'),
  grammarBookLessonTag: document.getElementById('grammarBookLessonTag'),
  grammarPointPill: document.getElementById('grammarPointPill'),
  grammarSentenceDisplay: document.getElementById('grammarSentenceDisplay'),
  grammarEnglishHint: document.getElementById('grammarEnglishHint'),
  grammarAudioBtn: document.getElementById('grammarAudioBtn'),

  promptInstruction: document.getElementById('promptInstruction'),
  optionsGrid: document.getElementById('optionsGrid'),
  feedbackBanner: document.getElementById('feedbackBanner'),
  feedbackIcon: document.getElementById('feedbackIcon'),
  feedbackTitle: document.getElementById('feedbackTitle'),
  feedbackDetails: document.getElementById('feedbackDetails'),
  nextQuestionBtn: document.getElementById('nextQuestionBtn'),

  resultsBadgeIcon: document.getElementById('resultsBadgeIcon'),
  resultsHeadline: document.getElementById('resultsHeadline'),
  resultsSubhead: document.getElementById('resultsSubhead'),
  statAccuracy: document.getElementById('statAccuracy'),
  statTotalTime: document.getElementById('statTotalTime'),
  statAvgSpeed: document.getElementById('statAvgSpeed'),
  statMaxStreak: document.getElementById('statMaxStreak'),

  retryMistakesBtn: document.getElementById('retryMistakesBtn'),
  mistakeCountBadge: document.getElementById('mistakeCountBadge'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  changeSettingsBtn: document.getElementById('changeSettingsBtn'),

  reviewCountPill: document.getElementById('reviewCountPill'),
  tabCountAll: document.getElementById('tabCountAll'),
  tabCountWrong: document.getElementById('tabCountWrong'),
  tabCountCorrect: document.getElementById('tabCountCorrect'),
  reviewList: document.getElementById('reviewList'),
  reviewTabs: document.querySelectorAll('.review-filter-tabs-c .tab-btn-c')
};

// ==========================================================================
// PERSISTENCE (LOCALSTORAGE)
// ==========================================================================
const SETTINGS_STORAGE_KEY = 'chinese_quiz_user_prefs';

function saveSettings() {
  try {
    const data = {
      selectedLessonsB1: Array.from(state.selectedLessonsB1),
      selectedLessonsB2: Array.from(state.selectedLessonsB2),
      mode: state.mode,
      questionCount: state.questionCount,
      pinyinSetting: state.pinyinSetting,
      soundEnabled: state.soundEnabled,
      theme: state.theme
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save settings to localStorage:', e);
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data.selectedLessonsB1)) {
        state.selectedLessonsB1 = new Set(data.selectedLessonsB1);
      }
      if (Array.isArray(data.selectedLessonsB2)) {
        state.selectedLessonsB2 = new Set(data.selectedLessonsB2);
      }
      if (data.mode) state.mode = data.mode;
      if (data.questionCount !== undefined) state.questionCount = data.questionCount;
      if (data.pinyinSetting) state.pinyinSetting = data.pinyinSetting;
      if (typeof data.soundEnabled === 'boolean') state.soundEnabled = data.soundEnabled;
      if (data.theme) state.theme = data.theme;
      return true;
    }
  } catch (e) {
    console.warn('Could not load settings from localStorage:', e);
  }
  return false;
}

// ==========================================================================
// SOUND & THEME UI SYNCHRONIZATION
// ==========================================================================
function updateSoundUI() {
  const isMuted = !state.soundEnabled;
  const soundIcon = isMuted ? '🔇' : '🔊';
  const statusText = isMuted ? 'OFF' : 'ON';

  elements.soundToggleBtns.forEach(b => {
    const icon = b.querySelector('.icon');
    if (icon) icon.textContent = soundIcon;
    b.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
    b.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
    b.classList.toggle('muted', isMuted);
  });

  const soundMenuIcon = document.getElementById('soundMenuIcon');
  if (soundMenuIcon) soundMenuIcon.textContent = soundIcon;

  const soundStatusBadge = document.getElementById('soundStatusBadge');
  if (soundStatusBadge) {
    soundStatusBadge.textContent = statusText;
    soundStatusBadge.classList.toggle('muted', isMuted);
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  if (!state.soundEnabled) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (soundEngine.ctx && soundEngine.ctx.state === 'running') {
      soundEngine.ctx.suspend().catch(() => {});
    }
  } else {
    if (soundEngine.ctx && soundEngine.ctx.state === 'suspended') {
      soundEngine.ctx.resume().catch(() => {});
    }
  }
  updateSoundUI();
  saveSettings();
}

function updateThemeUI() {
  const isLight = state.theme === 'light';
  const themeIcon = isLight ? '☀️' : '🌙';
  const themeText = isLight ? 'Light' : 'Dark';

  document.body.classList.toggle('dark-theme', !isLight);
  document.body.classList.toggle('light-theme', isLight);

  elements.themeToggleBtns.forEach(b => {
    const icon = b.querySelector('.icon');
    if (icon) icon.textContent = themeIcon;
    b.title = isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme';
    b.setAttribute('aria-label', isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme');
  });

  const themeMenuIcon = document.getElementById('themeMenuIcon');
  if (themeMenuIcon) themeMenuIcon.textContent = themeIcon;

  const themeStatusBadge = document.getElementById('themeStatusBadge');
  if (themeStatusBadge) {
    themeStatusBadge.textContent = themeText;
  }
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  updateThemeUI();
  saveSettings();
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
function init() {
  const loaded = loadSettings();

  // If no lessons selected (e.g. first visit), default to Book 1 Lesson 1
  if (state.selectedLessonsB1.size === 0 && state.selectedLessonsB2.size === 0) {
    state.selectedLessonsB1.add(1);
  }

  // Synchronize UI active states with restored state
  elements.modeCards.forEach(c => c.classList.toggle('active', c.dataset.mode === state.mode));
  elements.questionChips.forEach(c => c.classList.toggle('active', c.dataset.count == state.questionCount || (c.dataset.count === 'all' && state.questionCount === 'all')));
  elements.pinyinChips.forEach(c => c.classList.toggle('active', c.dataset.pinyin === state.pinyinSetting));

  updateSoundUI();
  updateThemeUI();

  updateLessonSummaryCard();
  updatePoolStats();
  bindEvents();
  bindLessonModalEvents();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

// Format number arrays into readable ranges e.g. "1–3, 5, 8"
function formatLessonNumberRanges(nums) {
  if (nums.length === 0) return '';
  if (nums.length <= 4) return nums.join(', ');
  const ranges = [];
  let start = nums[0];
  let prev = start;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === prev + 1) {
      prev = nums[i];
    } else {
      ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
      start = nums[i];
      prev = start;
    }
  }
  ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
  return ranges.join(', ');
}

// Jump to Nth grammar card from Grammar Focus Banner
function jumpToGrammarCard(idx) {
  const cards = elements.grammarList.querySelectorAll('.grammar-card');
  if (!cards || cards.length === 0) return;
  const targetCard = cards[Math.min(idx, cards.length - 1)];
  if (!targetCard) return;

  targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Trigger pulse highlight animation
  targetCard.classList.remove('grammar-card-highlight');
  void targetCard.offsetWidth; // force reflow
  targetCard.classList.add('grammar-card-highlight');
  setTimeout(() => {
    targetCard.classList.remove('grammar-card-highlight');
  }, 2000);
}

// Update the Main Setup Screen Lesson Trigger Card
function updateLessonSummaryCard() {
  if (!elements.lessonTriggerTitle) return;

  const b1Arr = Array.from(state.selectedLessonsB1).sort((a, b) => a - b);
  const b2Arr = Array.from(state.selectedLessonsB2).sort((a, b) => a - b);
  const total = b1Arr.length + b2Arr.length;

  if (total === 0) {
    elements.lessonTriggerTitle.textContent = 'No Lessons Selected';
    elements.lessonTriggerSub.textContent = 'Click to choose lessons for your practice pool';
    elements.lessonTriggerBadges.innerHTML = `<span class="trigger-book-badge" style="opacity: 0.6;">0 lessons active</span>`;
    return;
  }

  if (b1Arr.length === 15 && b2Arr.length === 15) {
    elements.lessonTriggerTitle.textContent = 'All Lessons Selected (30)';
    elements.lessonTriggerSub.textContent = 'Book 1 (1–15) • Book 2 (1–15)';
    elements.lessonTriggerBadges.innerHTML = `
      <span class="trigger-book-badge">Book 1: All 15</span>
      <span class="trigger-book-badge b2">Book 2: All 15</span>
    `;
    return;
  }

  elements.lessonTriggerTitle.textContent = `${total} Lesson${total === 1 ? '' : 's'} Selected`;

  let subText = '';
  if (b1Arr.length > 0 && b2Arr.length > 0) {
    subText = `Book 1 (${b1Arr.length}/15) • Book 2 (${b2Arr.length}/15)`;
  } else if (b1Arr.length > 0) {
    subText = `Book 1 (${b1Arr.length}/15 lessons)`;
  } else {
    subText = `Book 2 (${b2Arr.length}/15 lessons)`;
  }
  elements.lessonTriggerSub.textContent = subText;

  let badgesHtml = '';
  if (b1Arr.length > 0) {
    const listStr = b1Arr.length === 15 ? 'All 15' : formatLessonNumberRanges(b1Arr);
    badgesHtml += `<span class="trigger-book-badge">B1: ${listStr}</span>`;
  }
  if (b2Arr.length > 0) {
    const listStr = b2Arr.length === 15 ? 'All 15' : formatLessonNumberRanges(b2Arr);
    badgesHtml += `<span class="trigger-book-badge b2">B2: ${listStr}</span>`;
  }
  elements.lessonTriggerBadges.innerHTML = badgesHtml;
}

// Update Modal Summary Footer Counter
function updateModalSummaryFooter() {
  if (!elements.modalSelectedSummary || !elements.modalWordsSummary) return;
  const b1Count = state.selectedLessonsB1.size;
  const b2Count = state.selectedLessonsB2.size;
  const total = b1Count + b2Count;

  elements.modalSelectedSummary.textContent = `${total} lesson${total === 1 ? '' : 's'} selected (B1: ${b1Count}, B2: ${b2Count})`;

  const pool = getFilteredPool();
  const grammarPool = getFilteredGrammar();
  elements.modalWordsSummary.textContent = `${pool.length} vocab words • ${grammarPool.length} grammar points`;
}

// Render the 15 lesson items inside the overlay for active modal book tab
function renderModalLessons() {
  if (!elements.modalLessonList) return;
  const currentBook = state.modalBook || 1;
  const targetSet = currentBook === 1 ? state.selectedLessonsB1 : state.selectedLessonsB2;

  if (elements.modalBookTabs) {
    elements.modalBookTabs.forEach(tab => {
      const b = parseInt(tab.dataset.book, 10);
      tab.classList.toggle('active', b === currentBook);
    });
  }

  elements.modalLessonList.innerHTML = '';

  for (let l = 1; l <= 15; l++) {
    const isSelected = targetSet.has(l);
    const meta = (typeof LESSON_METADATA !== 'undefined' && LESSON_METADATA[currentBook] && LESSON_METADATA[currentBook][l]) || {
      title: `Lesson ${l}`,
      objectives: [],
      grammar: []
    };

    const card = document.createElement('div');
    card.className = `lesson-item-card ${isSelected ? 'selected' : ''}`;
    card.dataset.lesson = l;

    const hasObjectives = meta.objectives && meta.objectives.length > 0;
    const hasGrammar = meta.grammar && meta.grammar.length > 0;
    const hasDetails = hasObjectives || hasGrammar;

    const mainRow = document.createElement('div');
    mainRow.className = 'lesson-item-main-row';

    const checkboxWrap = document.createElement('div');
    checkboxWrap.className = 'lesson-checkbox-wrap';
    checkboxWrap.innerHTML = `
      <div class="lesson-custom-checkbox">${isSelected ? '✓' : ''}</div>
      <div class="lesson-card-labels">
        <div class="lesson-card-num-title">
          <span class="lesson-num-pill">L${l}</span>
          <span>${escapeHtml(meta.title)}</span>
        </div>
      </div>
    `;

    checkboxWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (targetSet.has(l)) {
        targetSet.delete(l);
        card.classList.remove('selected');
        const cb = card.querySelector('.lesson-custom-checkbox');
        if (cb) cb.textContent = '';
      } else {
        targetSet.add(l);
        card.classList.add('selected');
        const cb = card.querySelector('.lesson-custom-checkbox');
        if (cb) cb.textContent = '✓';
      }
      updatePoolStats();
      updateLessonSummaryCard();
      updateModalSummaryFooter();
      saveSettings();
    });

    mainRow.appendChild(checkboxWrap);

    if (hasDetails) {
      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'lesson-expand-btn';
      expandBtn.title = 'View learning objectives and grammar focus';
      expandBtn.innerHTML = '▼';
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('expanded');
      });
      mainRow.appendChild(expandBtn);
    }

    card.appendChild(mainRow);

    if (hasDetails) {
      const drawer = document.createElement('div');
      drawer.className = 'lesson-item-drawer';

      let drawerHtml = '';
      if (hasObjectives) {
        drawerHtml += `
          <div class="drawer-section">
            <div class="drawer-section-title">🎯 Learning Objectives</div>
            <ul class="drawer-list">
              ${meta.objectives.map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      if (hasGrammar) {
        drawerHtml += `
          <div class="drawer-section grammar-sec">
            <div class="drawer-section-title">📝 Grammar Focus</div>
            <ul class="drawer-list">
              ${meta.grammar.map(pt => `<li>${escapeHtml(pt)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      drawer.innerHTML = drawerHtml;
      card.appendChild(drawer);
    }

    elements.modalLessonList.appendChild(card);
  }

  updateModalSummaryFooter();
}

function openLessonModal() {
  if (!elements.lessonPickerModal) return;
  state.modalBook = state.modalBook || 1;
  renderModalLessons();
  elements.lessonPickerModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLessonModal() {
  if (!elements.lessonPickerModal) return;
  elements.lessonPickerModal.style.display = 'none';
  document.body.style.overflow = '';
  updateLessonSummaryCard();
  updatePoolStats();
  saveSettings();
}

function bindLessonModalEvents() {
  if (elements.openLessonModalBtn) {
    elements.openLessonModalBtn.addEventListener('click', openLessonModal);
    elements.openLessonModalBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLessonModal();
      }
    });
  }

  if (elements.quickSelectAllBtn) {
    elements.quickSelectAllBtn.addEventListener('click', () => {
      for (let l = 1; l <= 15; l++) {
        state.selectedLessonsB1.add(l);
        state.selectedLessonsB2.add(l);
      }
      updateLessonSummaryCard();
      updatePoolStats();
      saveSettings();
    });
  }

  if (elements.quickClearBtn) {
    elements.quickClearBtn.addEventListener('click', () => {
      state.selectedLessonsB1.clear();
      state.selectedLessonsB2.clear();
      updateLessonSummaryCard();
      updatePoolStats();
      saveSettings();
    });
  }

  if (elements.closeLessonModalBtn) {
    elements.closeLessonModalBtn.addEventListener('click', closeLessonModal);
  }
  if (elements.applyLessonModalBtn) {
    elements.applyLessonModalBtn.addEventListener('click', closeLessonModal);
  }
  if (elements.lessonModalBackdrop) {
    elements.lessonModalBackdrop.addEventListener('click', closeLessonModal);
  }

  if (elements.modalBookTabs) {
    elements.modalBookTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.modalBook = parseInt(tab.dataset.book, 10);
        renderModalLessons();
      });
    });
  }

  if (elements.modalSelectAllBtn) {
    elements.modalSelectAllBtn.addEventListener('click', () => {
      const currentBook = state.modalBook || 1;
      const targetSet = currentBook === 1 ? state.selectedLessonsB1 : state.selectedLessonsB2;
      for (let l = 1; l <= 15; l++) targetSet.add(l);
      renderModalLessons();
      updateLessonSummaryCard();
      updatePoolStats();
      saveSettings();
    });
  }

  if (elements.modalClearBtn) {
    elements.modalClearBtn.addEventListener('click', () => {
      const currentBook = state.modalBook || 1;
      const targetSet = currentBook === 1 ? state.selectedLessonsB1 : state.selectedLessonsB2;
      targetSet.clear();
      renderModalLessons();
      updateLessonSummaryCard();
      updatePoolStats();
      saveSettings();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.lessonPickerModal && elements.lessonPickerModal.style.display === 'flex') {
      closeLessonModal();
    }
  });
}

// Filtered Vocabulary Pool
function getFilteredPool() {
  if (typeof VOCAB_DATA === 'undefined') return [];
  return VOCAB_DATA.filter(item => {
    const book = item.book || 1;
    if (book === 1) return state.selectedLessonsB1.has(item.lesson);
    if (book === 2) return state.selectedLessonsB2.has(item.lesson);
    return false;
  });
}

// Filtered Grammar Pool
function getFilteredGrammar() {
  if (typeof GRAMMAR_DATA === 'undefined') return [];
  return GRAMMAR_DATA.filter(item => {
    const book = item.book || 1;
    if (book === 1) return state.selectedLessonsB1.has(item.chapter);
    if (book === 2) return state.selectedLessonsB2.has(item.chapter);
    return false;
  });
}

// Update Pool Counts
function updatePoolStats() {
  const pool = getFilteredPool();
  const grammarPool = getFilteredGrammar();
  const b1Count = pool.filter(w => (w.book || 1) === 1).length;
  const b2Count = pool.filter(w => w.book === 2).length;
  elements.poolStats.innerHTML = `Pool: <strong>${pool.length} vocab</strong> (B1: ${b1Count}, B2: ${b2Count}) • <strong>${grammarPool.length} grammar points</strong>`;
  updateLessonSummaryCard();
}

// Event Bindings
function bindEvents() {

  // Mode selection
  elements.modeCards.forEach(card => {
    card.addEventListener('click', () => {
      elements.modeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.mode = card.dataset.mode;
      saveSettings();
    });
  });

  // Question count
  elements.questionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.questionChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const count = chip.dataset.count;
      state.questionCount = count === 'all' ? 'all' : parseInt(count, 10);
      saveSettings();
    });
  });

  // Pinyin setting
  elements.pinyinChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.pinyinChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.pinyinSetting = chip.dataset.pinyin;
      saveSettings();
    });
  });

  // Sound toggles (desktop & mobile sync)
  elements.soundToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSound();
    });
  });

  const soundMenuRow = document.getElementById('soundMenuRow');
  if (soundMenuRow) {
    soundMenuRow.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSound();
    });
  }

  // Theme toggles (desktop & mobile sync)
  elements.themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme();
    });
  });

  const themeMenuRow = document.getElementById('themeMenuRow');
  if (themeMenuRow) {
    themeMenuRow.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme();
    });
  }

  // Start button
  elements.startQuizBtn.addEventListener('click', () => {
    startRound(false);
  });

  // Next button
  elements.nextQuestionBtn.addEventListener('click', () => {
    advanceToNextQuestion();
  });

  // Results Actions
  elements.playAgainBtn.addEventListener('click', () => {
    startRound(false);
  });

  elements.retryMistakesBtn.addEventListener('click', () => {
    startRound(true);
  });

  elements.changeSettingsBtn.addEventListener('click', () => {
    switchScreen('setupScreen');
  });

  // Review Filter Tabs
  elements.reviewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.reviewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderReviewList(tab.dataset.filter);
    });
  });

  // Prompt Audio Buttons
  elements.promptAudioBtn.addEventListener('click', () => {
    const currentQ = state.roundItems[state.currentIndex];
    if (currentQ && currentQ.traditional) {
      ttsEngine.speak(currentQ.traditional, { force: true });
    }
  });

  elements.grammarAudioBtn.addEventListener('click', () => {
    const currentQ = state.roundItems[state.currentIndex];
    if (currentQ && currentQ.fullSentence) {
      ttsEngine.speak(currentQ.fullSentence, { force: true });
    }
  });

  // Main Navigation Tabs
  elements.mainNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      if (target === 'practice') {
        if (elements.quizScreen.classList.contains('active')) {
          switchScreen('quizScreen');
        } else if (elements.resultsScreen.classList.contains('active')) {
          switchScreen('resultsScreen');
        } else {
          switchScreen('setupScreen');
        }
      } else if (target === 'vocab') {
        switchScreen('vocabScreen');
        renderVocabExplorer(true);
      } else if (target === 'grammar') {
        switchScreen('grammarScreen');
        renderGrammarExplorer(true);
      }
    });
  });

  // Hamburger Settings Menu Toggle
  if (elements.menuToggleBtn && elements.settingsDropdownMenu) {
    elements.menuToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = elements.settingsDropdownMenu.style.display === 'flex';
      elements.settingsDropdownMenu.style.display = isVisible ? 'none' : 'flex';
      elements.menuToggleBtn.classList.toggle('active', !isVisible);
    });

    const closeDropdown = (e) => {
      if (!elements.settingsDropdownMenu.contains(e.target) && !elements.menuToggleBtn.contains(e.target)) {
        elements.settingsDropdownMenu.style.display = 'none';
        elements.menuToggleBtn.classList.remove('active');
      }
    };
    document.addEventListener('click', closeDropdown);
    document.addEventListener('touchend', closeDropdown);
  }

  // Vocab Explorer Book Chips
  elements.vocabBookChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.vocabBookChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const b = chip.dataset.book;
      state.vocabFilter.book = b === 'all' ? 'all' : parseInt(b, 10);
      renderVocabExplorer(true);
    });
  });

  // Helper to step a select element forward or backward
  function stepSelect(selectEl, delta) {
    const total = selectEl.options.length;
    if (total === 0) return;
    let nextIdx = (selectEl.selectedIndex + delta) % total;
    if (nextIdx < 0) nextIdx += total;
    selectEl.selectedIndex = nextIdx;
    selectEl.dispatchEvent(new Event('change'));
  }

  // Vocab Explorer Lesson Filter & Step Buttons
  elements.vocabLessonFilter.addEventListener('change', (e) => {
    const val = e.target.value;
    state.vocabFilter.lesson = val === 'all' ? 'all' : parseInt(val, 10);
    renderVocabExplorer(true);
  });

  elements.vocabPrevLessonBtn.addEventListener('click', () => {
    stepSelect(elements.vocabLessonFilter, -1);
  });

  elements.vocabNextLessonBtn.addEventListener('click', () => {
    stepSelect(elements.vocabLessonFilter, 1);
  });

  // Vocab Photos Only Toggle
  elements.vocabPhotoFilterBtn.addEventListener('click', () => {
    state.vocabFilter.photosOnly = !state.vocabFilter.photosOnly;
    elements.vocabPhotoFilterBtn.classList.toggle('active', state.vocabFilter.photosOnly);
    renderVocabExplorer(true);
  });

  // Vocab Search Input
  elements.vocabSearchInput.addEventListener('input', (e) => {
    state.vocabFilter.search = e.target.value;
    elements.vocabSearchClear.style.display = e.target.value ? 'flex' : 'none';
    renderVocabExplorer(true);
  });

  elements.vocabSearchClear.addEventListener('click', () => {
    elements.vocabSearchInput.value = '';
    state.vocabFilter.search = '';
    elements.vocabSearchClear.style.display = 'none';
    elements.vocabSearchInput.focus();
    renderVocabExplorer(true);
  });

  // Vocab Load More
  elements.vocabLoadMoreBtn.addEventListener('click', () => {
    renderVocabExplorer(false);
  });

  // Grammar Reference Book Chips
  elements.grammarBookChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.grammarBookChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const b = chip.dataset.book;
      state.grammarFilter.book = b === 'all' ? 'all' : parseInt(b, 10);
      renderGrammarExplorer(true);
    });
  });

  // Grammar Reference Lesson Filter & Step Buttons
  elements.grammarLessonFilter.addEventListener('change', (e) => {
    const val = e.target.value;
    state.grammarFilter.lesson = val === 'all' ? 'all' : parseInt(val, 10);
    renderGrammarExplorer(true);
  });

  elements.grammarPrevLessonBtn.addEventListener('click', () => {
    stepSelect(elements.grammarLessonFilter, -1);
  });

  elements.grammarNextLessonBtn.addEventListener('click', () => {
    stepSelect(elements.grammarLessonFilter, 1);
  });

  // Grammar Search Input
  elements.grammarSearchInput.addEventListener('input', (e) => {
    state.grammarFilter.search = e.target.value;
    elements.grammarSearchClear.style.display = e.target.value ? 'flex' : 'none';
    renderGrammarExplorer(true);
  });

  elements.grammarSearchClear.addEventListener('click', () => {
    elements.grammarSearchInput.value = '';
    state.grammarFilter.search = '';
    elements.grammarSearchClear.style.display = 'none';
    elements.grammarSearchInput.focus();
    renderGrammarExplorer(true);
  });

  // Grammar Load More
  elements.grammarLoadMoreBtn.addEventListener('click', () => {
    renderGrammarExplorer(false);
  });

  // Grammar Focus Banner Jump to Card
  if (elements.grammarFocusList) {
    elements.grammarFocusList.addEventListener('click', (e) => {
      const item = e.target.closest('li[data-index]');
      if (!item) return;
      const idx = parseInt(item.dataset.index, 10);
      jumpToGrammarCard(idx);
    });
  }

  // Lightbox Modal Listeners
  elements.lightboxCloseBtn.addEventListener('click', closeImageLightbox);
  elements.lightboxBackdrop.addEventListener('click', closeImageLightbox);
  elements.lightboxAudioBtn.addEventListener('click', () => {
    if (state.activeModalItem && state.activeModalItem.traditional) {
      ttsEngine.speak(state.activeModalItem.traditional, { force: true });
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.imageLightboxModal.style.display === 'flex') {
      closeImageLightbox();
      return;
    }

    if (!elements.quizScreen.classList.contains('active')) return;

    if (['1', '2', '3', '4'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      const buttons = elements.optionsGrid.querySelectorAll('.option-btn');
      if (buttons[idx] && !buttons[idx].disabled && !state.isAnswerLocked) {
        buttons[idx].click();
      }
    } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
      const map = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      const idx = map[e.key.toLowerCase()];
      const buttons = elements.optionsGrid.querySelectorAll('.option-btn');
      if (buttons[idx] && !buttons[idx].disabled && !state.isAnswerLocked) {
        buttons[idx].click();
      }
    } else if (e.code === 'Space' || e.key === 'Enter') {
      if (state.isAnswerLocked) {
        e.preventDefault();
        advanceToNextQuestion();
      }
    }
  });
}

function switchScreen(screenName) {
  ['setupScreen', 'precacheScreen', 'quizScreen', 'resultsScreen', 'vocabScreen', 'grammarScreen'].forEach(id => {
    if (elements[id]) elements[id].classList.remove('active');
  });
  if (elements[screenName]) {
    elements[screenName].classList.add('active');
  }

  // Update nav tabs active indicator
  elements.mainNavTabs.forEach(tab => {
    const target = tab.dataset.tab;
    if (target === 'vocab' && screenName === 'vocabScreen') {
      tab.classList.add('active');
      state.activeTab = 'vocab';
    } else if (target === 'grammar' && screenName === 'grammarScreen') {
      tab.classList.add('active');
      state.activeTab = 'grammar';
    } else if (target === 'practice' && ['setupScreen', 'precacheScreen', 'quizScreen', 'resultsScreen'].includes(screenName)) {
      tab.classList.add('active');
      state.activeTab = 'practice';
    } else {
      tab.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// ROUND INITIALIZATION & IMAGE RESOLUTION
// ==========================================================================
async function startRound(isRetryMistakes = false) {
  state.isRetryRound = isRetryMistakes;
  let itemsToPlay = [];

  if (isRetryMistakes) {
    const wrongResults = state.results.filter(r => !r.isCorrect);
    if (wrongResults.length === 0) return;
    itemsToPlay = shuffleArray([...wrongResults.map(r => r.item)]);
  } else {
    const hasLessons = state.selectedLessonsB1.size > 0 || state.selectedLessonsB2.size > 0;

    if (!hasLessons) {
      alert('Please select at least one lesson before starting.');
      return;
    }

    if (state.mode === 'grammar') {
      const grammarPool = getFilteredGrammar();
      if (grammarPool.length === 0) {
        alert('No grammar points found for your selection.');
        return;
      }
      const questions = [];
      grammarPool.forEach(g => {
        if (g.exampleDetails && g.exampleDetails.length > 0) {
          g.exampleDetails.forEach((exDetail, exIdx) => {
            const trans = exDetail.english || (g.exampleTranslations && g.exampleTranslations[exIdx]) || '';
            const q = createGrammarClozeQuestion(g, exDetail.chinese, exDetail.pinyin, exDetail.charDetails, trans);
            if (q) questions.push(q);
          });
        } else {
          g.examples.forEach((ex, exIdx) => {
            const trans = (g.exampleTranslations && g.exampleTranslations[exIdx]) || '';
            const q = createGrammarClozeQuestion(g, ex, '', [], trans);
            if (q) questions.push(q);
          });
        }
      });
      const shuffled = shuffleArray(questions);
      const count = state.questionCount === 'all' ? shuffled.length : Math.min(state.questionCount, shuffled.length);
      itemsToPlay = shuffled.slice(0, count);

    } else if (state.mode === 'photo') {
      let pool = getFilteredPool().filter(item => item.isVisual || item.localImage || item.photoUrl);
      if (pool.length === 0) {
        alert('No visual objects found for your selection. Please select more lessons or switch modes.');
        return;
      }
      const shuffled = shuffleArray([...pool]);
      const count = state.questionCount === 'all' ? shuffled.length : Math.min(state.questionCount, shuffled.length);
      itemsToPlay = shuffled.slice(0, count);

    } else if (state.mode === 'mixed') {
      // Blend Vocab + Grammar
      const vocabPool = getFilteredPool();
      const grammarPool = getFilteredGrammar();
      const grammarQuestions = [];
      grammarPool.forEach(g => {
        if (g.exampleDetails && g.exampleDetails.length > 0) {
          g.exampleDetails.forEach((exDetail, exIdx) => {
            const trans = exDetail.english || (g.exampleTranslations && g.exampleTranslations[exIdx]) || '';
            const q = createGrammarClozeQuestion(g, exDetail.chinese, exDetail.pinyin, exDetail.charDetails, trans);
            if (q) grammarQuestions.push(q);
          });
        } else {
          g.examples.forEach((ex, exIdx) => {
            const trans = (g.exampleTranslations && g.exampleTranslations[exIdx]) || '';
            const q = createGrammarClozeQuestion(g, ex, '', [], trans);
            if (q) grammarQuestions.push(q);
          });
        }
      });

      const combined = [...vocabPool, ...grammarQuestions];
      if (combined.length === 0) {
        alert('No items found for your selection.');
        return;
      }
      const shuffled = shuffleArray(combined);
      const count = state.questionCount === 'all' ? shuffled.length : Math.min(state.questionCount, shuffled.length);
      itemsToPlay = shuffled.slice(0, count);

    } else {
      // zh2en or en2zh
      const pool = getFilteredPool();
      if (pool.length === 0) {
        alert('No vocabulary items found for your selection.');
        return;
      }
      const shuffled = shuffleArray([...pool]);
      const count = state.questionCount === 'all' ? shuffled.length : Math.min(state.questionCount, shuffled.length);
      itemsToPlay = shuffled.slice(0, count);
    }
  }

  state.roundItems = itemsToPlay;
  state.currentIndex = 0;
  state.streak = 0;
  state.maxStreak = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.results = [];
  state.isAnswerLocked = false;

  const requiresPhotos = state.roundItems.some(i => i.isVisual || i.localImage || i.photoUrl);

  if (requiresPhotos && (state.mode === 'photo' || state.mode === 'mixed')) {
    switchScreen('precacheScreen');
    await precacheRoundImages(state.roundItems.filter(i => i.photoUrl || i.localImage));
  }

  switchScreen('quizScreen');
  startQuizClock();
  loadQuestion(0);
}

// Convert a Grammar point & sentence into a cloze question with full Pinyin & charDetails
function createGrammarClozeQuestion(grammarPoint, sentence, sentencePinyin = '', charDetails = [], sentenceTranslation = '') {
  let target = null;
  for (const kw of GRAMMAR_TARGET_KEYWORDS) {
    if (sentence.includes(kw)) {
      target = kw;
      break;
    }
  }

  if (!target) {
    const cleanPoint = grammarPoint.pointZh.replace(/[^一-龥]/g, '');
    if (cleanPoint && sentence.includes(cleanPoint)) {
      target = cleanPoint;
    } else {
      return null;
    }
  }

  const blankSentence = sentence.replace(target, " ____ ");

  let distractors = [];
  for (const [cat, list] of Object.entries(GRAMMAR_DISTRACTOR_SETS)) {
    if (list.includes(target)) {
      distractors = list.filter(w => w !== target);
      break;
    }
  }

  if (distractors.length < 3) {
    const otherKeywords = GRAMMAR_TARGET_KEYWORDS.filter(w => w !== target && w.length === target.length);
    distractors = shuffleArray(otherKeywords).slice(0, 3);
  }

  return {
    isGrammar: true,
    id: `g_${grammarPoint.id}_${Math.random()}`,
    book: grammarPoint.book,
    chapter: grammarPoint.chapter,
    grammarPoint: grammarPoint.pointZh,
    pinyin: grammarPoint.pinyin,
    english: grammarPoint.english,
    explanation: grammarPoint.explanation,
    fullSentence: sentence,
    sentencePinyin: sentencePinyin,
    sentenceTranslation: sentenceTranslation,
    charDetails: charDetails,
    blankSentence: blankSentence,
    target: target,
    distractors: distractors.slice(0, 3)
  };
}

// Try local vocab_images first, with graceful local SVG fallback
async function resolveItemImage(item) {
  if (state.cachedImages.has(item.id)) {
    return state.cachedImages.get(item.id);
  }

  if (item.localImage) {
    const works = await testImageLoads(item.localImage);
    if (works) {
      state.cachedImages.set(item.id, item.localImage);
      return item.localImage;
    }
  }

  const cleanEng = (item.searchTerm || item.english || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const candidates = [
    `vocab_images/${cleanEng}.png`,
    `vocab_images/${cleanEng.replace(/^to\s+/, '')}.png`,
    `vocab_images/${cleanEng.replace(/^(a|an)\s+/, '')}.png`
  ];

  for (const cPath of candidates) {
    const works = await testImageLoads(cPath);
    if (works) {
      state.cachedImages.set(item.id, cPath);
      return cPath;
    }
  }

  if (item.photoUrl) {
    const isRemote = item.photoUrl.startsWith('http://') || item.photoUrl.startsWith('https://');
    if (!isRemote || (typeof navigator === 'undefined' || navigator.onLine !== false)) {
      const works = await testImageLoads(item.photoUrl);
      if (works) {
        state.cachedImages.set(item.id, item.photoUrl);
        return item.photoUrl;
      }
    }
  }

  const fallbackUrl = 'vocab_images/placeholder.svg';
  state.cachedImages.set(item.id, fallbackUrl);
  return fallbackUrl;
}

function testImageLoads(url) {
  if (!url) return Promise.resolve(false);
  const isRemote = url.startsWith('http://') || url.startsWith('https://');
  if (isRemote && typeof navigator !== 'undefined' && navigator.onLine === false) {
    // Instantly bypass external network requests in airplane mode without waiting 1.2s timeout
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    const timer = setTimeout(() => resolve(false), 1200);

    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

// Pre-cache all round images
async function precacheRoundImages(items) {
  if (items.length === 0) return;

  let loadedCount = 0;
  const total = items.length;

  elements.precacheProgressBar.style.width = '0%';
  elements.precacheProgressPct.textContent = '0%';
  elements.precacheStatusText.textContent = `Loading 0 of ${total} images...`;

  const promises = items.map(async (item) => {
    try {
      const url = await resolveItemImage(item);
      state.cachedImages.set(item.id, url);
    } catch (e) {
      console.warn('Preload error for', item.english, e);
    } finally {
      loadedCount++;
      const pct = Math.round((loadedCount / total) * 100);
      elements.precacheProgressBar.style.width = `${pct}%`;
      elements.precacheProgressPct.textContent = `${pct}%`;
      elements.precacheStatusText.textContent = `Loaded ${loadedCount} of ${total} images...`;
    }
  });

  await Promise.all(promises);
  await new Promise(r => setTimeout(r, 100));
}

// ==========================================================================
// TIMER & HUD
// ==========================================================================
function startQuizClock() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.startTime = performance.now();
  state.elapsedMs = 0;

  state.timerInterval = setInterval(() => {
    state.elapsedMs = performance.now() - state.startTime;
    elements.hudTimer.textContent = formatTime(state.elapsedMs);
  }, 100);
}

function stopQuizClock() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function formatTime(ms) {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((ms % 1000) / 100);

  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');
  return `${mStr}:${sStr}.${tenths}`;
}

// ==========================================================================
// QUESTION DISPLAY & GAMEPLAY
// ==========================================================================
function loadQuestion(index) {
  clearTimeout(state.autoNextTimeout);
  state.currentIndex = index;
  state.isAnswerLocked = false;
  state.questionStartTime = performance.now();

  const total = state.roundItems.length;
  const currentItem = state.roundItems[index];

  // Update HUD
  elements.hudProgress.textContent = `${index + 1}/${total}`;
  elements.hudStreak.textContent = state.streak;
  elements.quizProgressBar.style.width = `${((index) / total) * 100}%`;

  elements.feedbackBanner.className = 'feedback-banner-compact';
  elements.feedbackBanner.classList.remove('active', 'correct', 'wrong');

  elements.imagePromptContainer.style.display = 'none';
  elements.textPromptContainer.style.display = 'none';
  elements.grammarPromptContainer.style.display = 'none';

  let qType = state.mode;
  if (currentItem.isGrammar) {
    qType = 'grammar';
  } else if (state.mode === 'mixed') {
    const hasImage = currentItem.isVisual || currentItem.localImage || currentItem.photoUrl;
    const modes = hasImage ? ['photo', 'zh2en', 'en2zh'] : ['zh2en', 'en2zh'];
    qType = modes[Math.floor(Math.random() * modes.length)];
  }

  // Setup Layout based on question type
  if (qType === 'grammar') {
    elements.grammarPromptContainer.style.display = 'block';
    elements.grammarBookLessonTag.textContent = `BOOK ${currentItem.book} • LESSON ${currentItem.chapter}`;
    elements.grammarPointPill.textContent = currentItem.grammarPoint;

    if (state.pinyinSetting === 'always') {
      elements.grammarSentenceDisplay.innerHTML = renderQuestionSentenceWithCharPinyin(
        currentItem.fullSentence,
        currentItem.charDetails,
        currentItem.target
      );
    } else {
      const parts = currentItem.blankSentence.split('____');
      elements.grammarSentenceDisplay.innerHTML = `
        ${parts[0]}<span class="grammar-blank-slot">____</span>${parts[1] || ''}
      `;
    }

    elements.grammarEnglishHint.textContent = `${currentItem.english}`;
    elements.promptInstruction.textContent = 'Choose the word that correctly completes the sentence:';

    const options = generateGrammarOptions(currentItem);
    renderGrammarOptions(options, currentItem);

  } else if (qType === 'photo') {
    elements.imagePromptContainer.style.display = 'flex';
    elements.promptInstruction.textContent = 'Select the correct Chinese word/phrase:';

    const photoUrl = state.cachedImages.get(currentItem.id) || currentItem.localImage || currentItem.photoUrl || 'vocab_images/placeholder.svg';
    elements.quizImage.onerror = () => {
      elements.quizImage.src = 'vocab_images/placeholder.svg';
    };
    elements.quizImage.src = photoUrl;

    const options = generateOptions(currentItem, qType);
    renderOptions(options, currentItem, qType);

  } else if (qType === 'zh2en') {
    elements.textPromptContainer.style.display = 'block';
    elements.promptModeTag.textContent = `CHINESE (B${currentItem.book || 1} • L${currentItem.lesson})`;
    elements.promptMainText.textContent = currentItem.traditional;
    elements.promptPinyinText.textContent = currentItem.pinyin;
    elements.promptInstruction.textContent = 'Select the correct English meaning:';

    if (state.pinyinSetting === 'hidden') {
      elements.promptPinyinText.classList.add('hidden-pinyin');
    } else {
      elements.promptPinyinText.classList.remove('hidden-pinyin');
    }

    const options = generateOptions(currentItem, qType);
    renderOptions(options, currentItem, qType);

  } else if (qType === 'en2zh') {
    elements.textPromptContainer.style.display = 'block';
    elements.promptModeTag.textContent = `ENGLISH (B${currentItem.book || 1} • L${currentItem.lesson})`;
    elements.promptMainText.textContent = currentItem.english;
    elements.promptPinyinText.textContent = `Lesson ${currentItem.lesson}`;
    elements.promptInstruction.textContent = 'Select the correct Chinese Hanzi:';

    const options = generateOptions(currentItem, qType);
    renderOptions(options, currentItem, qType);
  }
}

// Generate Grammar Options
function generateGrammarOptions(currentItem) {
  const correct = currentItem.target;
  let distractors = [...(currentItem.distractors || [])];

  if (distractors.length < 3) {
    const extra = GRAMMAR_TARGET_KEYWORDS.filter(w => w !== correct && !distractors.includes(w));
    distractors = [...distractors, ...shuffleArray(extra).slice(0, 3 - distractors.length)];
  }

  const all4 = [correct, ...distractors.slice(0, 3)];
  return shuffleArray(all4);
}

// Render Grammar Option Buttons
function renderGrammarOptions(options, currentItem) {
  elements.optionsGrid.innerHTML = '';
  const keyShortcuts = ['1', '2', '3', '4'];

  options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.dataset.index = idx;

    let secHtml = '';
    if (state.pinyinSetting === 'always') {
      const info = lookupTermInfo(optText);
      if (info) {
        secHtml = `<div class="option-secondary">${info.pinyin}</div>`;
      }
    }

    btn.innerHTML = `
      <div class="option-key">${keyShortcuts[idx]}</div>
      <div class="option-content">
        <div class="option-primary">${optText}</div>
        ${secHtml}
      </div>
    `;

    btn.addEventListener('click', () => {
      handleGrammarAnswer(optText, currentItem, btn);
    });

    elements.optionsGrid.appendChild(btn);
  });
}

// Helper: Render Question Sentence with Blank Slot and Pinyin under each known character
function renderQuestionSentenceWithCharPinyin(sentence, charDetails, target) {
  if (!charDetails || charDetails.length === 0) {
    const parts = sentence.split(target);
    return `${parts[0]}<span class="grammar-blank-slot">____</span>${parts[1] || ''}`;
  }

  const targetStartIndex = sentence.indexOf(target);
  const targetEndIndex = targetStartIndex >= 0 ? targetStartIndex + target.length : -1;

  let html = '<div class="sentence-char-group">';
  let inTargetSlot = false;

  charDetails.forEach((item, idx) => {
    const isPunct = !item.pinyin || "，。！？、,!?.;:…—（）() ".includes(item.char);
    const isTargetChar = (targetStartIndex >= 0 && idx >= targetStartIndex && idx < targetEndIndex);

    if (isTargetChar) {
      if (!inTargetSlot) {
        inTargetSlot = true;
        html += `
          <div class="char-unit char-blank-unit" style="align-self: center;">
            <span class="grammar-blank-slot">____</span>
            <span class="char-pinyin" style="visibility: hidden;">____</span>
          </div>
        `;
      }
    } else {
      let extraClass = isPunct ? ' char-punct' : '';
      html += `
        <div class="char-unit${extraClass}">
          <span class="char-hanzi">${item.char}</span>
          ${item.pinyin ? `<span class="char-pinyin">${item.pinyin}</span>` : ''}
        </div>
      `;
    }
  });
  html += '</div>';
  return html;
}

// Helper: Render Sentence with Character-by-Character Pinyin Grid
function renderSentenceWithCharPinyin(sentence, charDetails, target, isCorrect) {
  if (!charDetails || charDetails.length === 0) {
    return sentence.replace(
      target,
      `<span style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 800; text-decoration: underline;">${target}</span>`
    );
  }

  const targetStartIndex = sentence.indexOf(target);
  const targetEndIndex = targetStartIndex >= 0 ? targetStartIndex + target.length : -1;

  let html = '<div class="sentence-char-group">';
  charDetails.forEach((item, idx) => {
    const isPunct = !item.pinyin || "，。！？、,!?.;:…—（）() ".includes(item.char);
    const isTargetChar = (targetStartIndex >= 0 && idx >= targetStartIndex && idx < targetEndIndex);

    let extraClass = '';
    if (isPunct) extraClass += ' char-punct';
    if (isTargetChar) {
      extraClass += isCorrect ? ' target-char' : ' target-char wrong-choice';
    }

    html += `
      <div class="char-unit${extraClass}">
        <span class="char-hanzi">${item.char}</span>
        ${item.pinyin ? `<span class="char-pinyin">${item.pinyin}</span>` : ''}
      </div>
    `;
  });
  html += '</div>';
  return html;
}

// Handle Grammar Answer Click (NO AUTO-ADVANCE: USER CLICKS NEXT OR PRESSES SPACE)
function handleGrammarAnswer(selectedText, currentItem, clickedBtn) {
  if (state.isAnswerLocked) return;
  state.isAnswerLocked = true;

  const timeSpentMs = performance.now() - state.questionStartTime;
  const isCorrect = selectedText === currentItem.target;

  if (state.soundEnabled && currentItem.fullSentence) {
    ttsEngine.speak(currentItem.fullSentence);
  }

  if (isCorrect) {
    state.correctCount++;
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    soundEngine.playCorrect();
    clickedBtn.style.borderColor = 'var(--success)';
    clickedBtn.style.background = 'var(--success-bg)';
  } else {
    state.wrongCount++;
    state.streak = 0;
    soundEngine.playWrong();
    clickedBtn.style.borderColor = 'var(--error)';
    clickedBtn.style.background = 'var(--error-bg)';
  }

  // Update all 4 option buttons to reveal Pinyin and English translation
  const allButtons = elements.optionsGrid.querySelectorAll('.option-btn');
  allButtons.forEach(b => {
    const optHanzi = b.querySelector('.option-primary').textContent.trim();
    const info = lookupTermInfo(optHanzi);

    if (info) {
      let sec = b.querySelector('.option-secondary');
      if (!sec) {
        sec = document.createElement('div');
        sec.className = 'option-secondary';
        b.querySelector('.option-content').appendChild(sec);
      }
      sec.textContent = `${info.pinyin} • ${info.english}`;
    }

    if (optHanzi === currentItem.target) {
      b.style.borderColor = 'var(--success)';
      b.style.background = 'var(--success-bg)';
    }
  });

  elements.hudStreak.textContent = state.streak;

  // Reveal filled sentence with Pinyin directly under each Hanzi character!
  elements.grammarSentenceDisplay.innerHTML = renderSentenceWithCharPinyin(
    currentItem.fullSentence,
    currentItem.charDetails,
    currentItem.target,
    isCorrect
  );

  state.results.push({
    item: currentItem,
    isGrammar: true,
    promptType: 'grammar',
    userChoice: selectedText,
    isCorrect,
    timeSpentMs
  });

  elements.feedbackBanner.className = `feedback-banner-compact active ${isCorrect ? 'correct' : 'wrong'}`;
  elements.feedbackIcon.textContent = isCorrect ? '✅' : '❌';
  elements.feedbackTitle.textContent = isCorrect ? `Correct! (${currentItem.target})` : `Incorrect (Answer: ${currentItem.target})`;
  
  const transHtml = currentItem.sentenceTranslation ? `
    <div class="feedback-sentence-translation">“${escapeHtml(currentItem.sentenceTranslation)}”</div>
  ` : '';

  elements.feedbackDetails.innerHTML = `
    ${transHtml}
    <div class="feedback-grammar-rule"><strong>${escapeHtml(currentItem.grammarPoint)}</strong> (${escapeHtml(currentItem.pinyin)}) — ${escapeHtml(currentItem.explanation)}</div>
  `;

  // Note: NO auto-advance timer for grammar mode so user can comfortably read the explanation and pinyin!
}

// Generate Vocab Options
function generateOptions(correctItem, qType) {
  let pool = getFilteredPool();

  if (qType === 'photo') {
    pool = pool.filter(w => w.isVisual || w.localImage);
  }

  const sameLesson = pool.filter(w => w.id !== correctItem.id && w.lesson === correctItem.lesson);
  const otherLessons = pool.filter(w => w.id !== correctItem.id && w.lesson !== correctItem.lesson);

  const shuffledDistractors = [
    ...shuffleArray(sameLesson),
    ...shuffleArray(otherLessons)
  ];

  const chosenDistractors = [];
  const usedLabels = new Set();

  const getLabel = (item) => qType === 'zh2en' ? item.english : item.traditional;
  usedLabels.add(getLabel(correctItem));

  for (const item of shuffledDistractors) {
    const label = getLabel(item);
    if (!usedLabels.has(label)) {
      usedLabels.add(label);
      chosenDistractors.push(item);
      if (chosenDistractors.length === 3) break;
    }
  }

  const all4 = [correctItem, ...chosenDistractors];
  return shuffleArray(all4);
}

// Render Vocab Option Buttons
function renderOptions(options, correctItem, qType) {
  elements.optionsGrid.innerHTML = '';
  const keyShortcuts = ['1', '2', '3', '4'];

  options.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.dataset.index = idx;
    btn._vocabItem = item;

    let primaryText = '';
    let secondaryText = '';

    if (qType === 'photo' || qType === 'en2zh') {
      primaryText = item.traditional;
      if (state.pinyinSetting === 'always') {
        secondaryText = item.pinyin;
      }
    } else {
      primaryText = item.english;
    }

    btn.innerHTML = `
      <div class="option-key">${keyShortcuts[idx]}</div>
      <div class="option-content">
        <div class="option-primary">${primaryText}</div>
        ${secondaryText ? `<div class="option-secondary">${secondaryText}</div>` : ''}
      </div>
    `;

    btn.addEventListener('click', () => {
      handleAnswer(item, correctItem, btn, qType);
    });

    elements.optionsGrid.appendChild(btn);
  });
}

// Handle Vocab Answer Click
function handleAnswer(selectedItem, correctItem, clickedBtn, qType) {
  if (state.isAnswerLocked) return;
  state.isAnswerLocked = true;

  const timeSpentMs = performance.now() - state.questionStartTime;
  const isCorrect = selectedItem.id === correctItem.id;

  if (state.soundEnabled && correctItem.traditional) {
    ttsEngine.speak(correctItem.traditional);
  }

  if (isCorrect) {
    state.correctCount++;
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    soundEngine.playCorrect();
    clickedBtn.style.borderColor = 'var(--success)';
    clickedBtn.style.background = 'var(--success-bg)';
  } else {
    state.wrongCount++;
    state.streak = 0;
    soundEngine.playWrong();
    clickedBtn.style.borderColor = 'var(--error)';
    clickedBtn.style.background = 'var(--error-bg)';

    const allButtons = elements.optionsGrid.querySelectorAll('.option-btn');
    allButtons.forEach(b => {
      if (b._vocabItem && b._vocabItem.id === correctItem.id) {
        b.style.borderColor = 'var(--success)';
        b.style.background = 'var(--success-bg)';
      }
    });
  }

  // Update all 4 option buttons to reveal Pinyin and translations upon answering
  const allButtons = elements.optionsGrid.querySelectorAll('.option-btn');
  allButtons.forEach(b => {
    if (!b._vocabItem) return;
    let sec = b.querySelector('.option-secondary');
    if (!sec) {
      sec = document.createElement('div');
      sec.className = 'option-secondary';
      b.querySelector('.option-content').appendChild(sec);
    }

    if (qType === 'en2zh' || qType === 'photo') {
      // Primary is Hanzi -> Reveal: Pinyin • English translation
      if (state.pinyinSetting !== 'hidden') {
        sec.textContent = `${b._vocabItem.pinyin} • ${b._vocabItem.english}`;
      } else {
        sec.textContent = b._vocabItem.english;
      }
    } else if (qType === 'zh2en') {
      // Primary is English -> Reveal: Hanzi (Pinyin)
      if (state.pinyinSetting !== 'hidden') {
        sec.textContent = `${b._vocabItem.traditional} (${b._vocabItem.pinyin})`;
      } else {
        sec.textContent = b._vocabItem.traditional;
      }
    }
  });

  elements.hudStreak.textContent = state.streak;

  state.results.push({
    item: correctItem,
    promptType: qType,
    userChoice: selectedItem,
    isCorrect,
    timeSpentMs,
    imageSrc: qType === 'photo' ? (state.cachedImages.get(correctItem.id) || correctItem.localImage || correctItem.photoUrl) : null
  });

  if (qType === 'zh2en' && (state.pinyinSetting === 'on-answer' || state.pinyinSetting === 'always')) {
    elements.promptPinyinText.classList.remove('hidden-pinyin');
  }

  elements.feedbackBanner.className = `feedback-banner-compact active ${isCorrect ? 'correct' : 'wrong'}`;
  elements.feedbackIcon.textContent = isCorrect ? '✅' : '❌';
  elements.feedbackTitle.textContent = isCorrect ? 'Correct!' : 'Incorrect';
  elements.feedbackDetails.textContent = `${correctItem.traditional} (${correctItem.pinyin}) — ${correctItem.english}`;

  // Advance behavior: Auto-advance only when correct; require clicking Next button when incorrect!
  clearTimeout(state.autoNextTimeout);
  if (isCorrect) {
    state.autoNextTimeout = setTimeout(() => {
      if (state.isAnswerLocked && elements.quizScreen.classList.contains('active')) {
        advanceToNextQuestion();
      }
    }, 850);
  }
}

function advanceToNextQuestion() {
  clearTimeout(state.autoNextTimeout);
  if (state.currentIndex + 1 < state.roundItems.length) {
    loadQuestion(state.currentIndex + 1);
  } else {
    finishRound();
  }
}

// ==========================================================================
// RESULTS & REVIEW
// ==========================================================================
function finishRound() {
  stopQuizClock();
  elements.quizProgressBar.style.width = '100%';

  const total = state.roundItems.length;
  const accuracyPct = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;
  const totalSeconds = (state.elapsedMs / 1000).toFixed(1);
  const avgSeconds = total > 0 ? ((state.elapsedMs / 1000) / total).toFixed(1) : 0;

  elements.statAccuracy.textContent = `${accuracyPct}%`;
  elements.statTotalTime.textContent = `${totalSeconds}s`;
  elements.statAvgSpeed.textContent = `${avgSeconds}s`;
  elements.statMaxStreak.textContent = state.maxStreak;

  if (accuracyPct === 100) {
    elements.resultsBadgeIcon.textContent = '🏆';
    elements.resultsHeadline.textContent = 'Flawless!';
    elements.resultsSubhead.textContent = `100% accuracy in ${totalSeconds}s.`;
  } else if (accuracyPct >= 80) {
    elements.resultsBadgeIcon.textContent = '🌟';
    elements.resultsHeadline.textContent = 'Great Round!';
    elements.resultsSubhead.textContent = `${state.correctCount} of ${total} correct.`;
  } else {
    elements.resultsBadgeIcon.textContent = '💪';
    elements.resultsHeadline.textContent = 'Good Effort!';
    elements.resultsSubhead.textContent = `Review mistakes below or retry.`;
  }

  const wrongCount = state.results.filter(r => !r.isCorrect).length;
  elements.mistakeCountBadge.textContent = wrongCount;
  elements.retryMistakesBtn.style.display = wrongCount > 0 ? 'inline-flex' : 'none';

  elements.reviewCountPill.textContent = `${total} items`;
  elements.tabCountAll.textContent = total;
  elements.tabCountWrong.textContent = wrongCount;
  elements.tabCountCorrect.textContent = state.correctCount;

  elements.reviewTabs.forEach(t => t.classList.remove('active'));
  elements.reviewTabs[0].classList.add('active');
  renderReviewList('all');

  switchScreen('resultsScreen');
}

function renderReviewList(filterType) {
  elements.reviewList.innerHTML = '';

  let items = state.results;
  if (filterType === 'wrong') {
    items = state.results.filter(r => !r.isCorrect);
  } else if (filterType === 'correct') {
    items = state.results.filter(r => r.isCorrect);
  }

  if (items.length === 0) {
    elements.reviewList.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
        No items.
      </div>
    `;
    return;
  }

  items.forEach(res => {
    const { item, userChoice, isCorrect, timeSpentMs, imageSrc, promptType, isGrammar } = res;
    const itemEl = document.createElement('div');
    itemEl.className = 'review-item';
    const timeSec = (timeSpentMs / 1000).toFixed(1);

    if (isGrammar) {
      let grammarChoiceHtml = '';
      if (!isCorrect) {
        grammarChoiceHtml = `
          <div style="margin-top: 0.2rem; font-size: 0.75rem;">
            <span style="color: var(--error);">❌ Your answer: <strong>${userChoice}</strong></span> • <span style="color: var(--success);">✅ Correct: <strong>${item.target}</strong></span>
          </div>
        `;
      }

      const sentenceCharGrid = renderSentenceWithCharPinyin(item.fullSentence, item.charDetails, item.target, isCorrect);

      itemEl.innerHTML = `
        <div style="font-size: 1.15rem; flex-shrink: 0; align-self: flex-start; margin-top: 0.2rem;">${isCorrect ? '✅' : '❌'}</div>
        <div class="review-details">
          <div class="review-word-row" style="margin-bottom: 0.35rem;">
            <span class="review-lesson-badge">B${item.book} • L${item.chapter}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: auto;">⏱️ ${timeSec}s</span>
          </div>
          <div style="margin-bottom: 0.35rem;">${sentenceCharGrid}</div>
          ${item.sentenceTranslation ? `<div class="review-sentence-translation">“${escapeHtml(item.sentenceTranslation)}”</div>` : ''}
          <div class="review-english"><strong>${escapeHtml(item.grammarPoint)}</strong> (${escapeHtml(item.pinyin)}) — ${escapeHtml(item.explanation)}</div>
          ${grammarChoiceHtml}
        </div>
        <div style="flex-shrink: 0; align-self: flex-start; margin-top: 0.2rem;">
          <button type="button" class="review-audio-btn" title="Pronounce">🔊</button>
        </div>
      `;
      itemEl.querySelector('.review-audio-btn').addEventListener('click', () => {
        ttsEngine.speak(item.fullSentence, { force: true });
      });

    } else {
      const thumbHtml = imageSrc
        ? `<div class="review-thumb-frame"><img src="${imageSrc}" alt="${item.english}" class="review-thumb" referrerpolicy="no-referrer" /></div>`
        : '';

      let choiceComparisonHtml = '';
      if (!isCorrect) {
        const chosenText = promptType === 'zh2en' ? userChoice.english : `${userChoice.traditional} (${userChoice.pinyin})`;
        const correctText = promptType === 'zh2en' ? item.english : `${item.traditional} (${item.pinyin})`;
        choiceComparisonHtml = `
          <div style="margin-top: 0.2rem; font-size: 0.75rem;">
            <span style="color: var(--error);">❌ ${chosenText}</span> • <span style="color: var(--success);">✅ ${correctText}</span>
          </div>
        `;
      }

      itemEl.innerHTML = `
        <div style="font-size: 1.15rem; flex-shrink: 0;">${isCorrect ? '✅' : '❌'}</div>
        ${thumbHtml}
        <div class="review-details">
          <div class="review-word-row">
            <span class="review-hanzi">${item.traditional}</span>
            <span class="review-pinyin">${item.pinyin}</span>
            <span class="review-lesson-badge">B${item.book || 1} • L${item.lesson}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: auto;">⏱️ ${timeSec}s</span>
          </div>
          <div class="review-english">${item.english}</div>
          ${choiceComparisonHtml}
        </div>
        <div style="flex-shrink: 0;">
          <button type="button" class="review-audio-btn" title="Pronounce">🔊</button>
        </div>
      `;
      itemEl.querySelector('.review-audio-btn').addEventListener('click', () => {
        ttsEngine.speak(item.traditional, { force: true });
      });
    }

    elements.reviewList.appendChild(itemEl);
  });
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==========================================================================
// VOCABULARY & GRAMMAR EXPLORER ENGINE
// ==========================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizePinyin(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip tone marks/diacritics
    .toLowerCase()
    .replace(/ü/g, 'u')
    .replace(/v/g, 'u');
}

function matchPinyin(source, query) {
  if (!source || !query) return false;
  const normSource = normalizePinyin(source);
  const normQuery = normalizePinyin(query);

  if (normSource.includes(normQuery)) return true;

  // Also match ignoring spaces, hyphens, and apostrophes (e.g. "kafei" matches "kā fēi")
  const compactSource = normSource.replace(/[\s\-_'’]/g, '');
  const compactQuery = normQuery.replace(/[\s\-_'’]/g, '');
  if (compactQuery.length > 0 && compactSource.includes(compactQuery)) {
    return true;
  }

  return false;
}

function openImageLightbox(item) {
  state.activeModalItem = item;
  const imgSrc = item.localImage || item.photoUrl || 'vocab_images/placeholder.svg';
  elements.lightboxImg.onerror = () => {
    elements.lightboxImg.src = 'vocab_images/placeholder.svg';
  };
  elements.lightboxImg.src = imgSrc;
  elements.lightboxImg.alt = item.traditional;
  elements.lightboxHanzi.textContent = item.traditional;
  elements.lightboxPinyin.textContent = item.pinyin;
  elements.lightboxEnglish.textContent = item.english;
  elements.lightboxBadge.textContent = `Book ${item.book} • Lesson ${item.lesson}`;
  elements.imageLightboxModal.style.display = 'flex';
}

function closeImageLightbox() {
  elements.imageLightboxModal.style.display = 'none';
  state.activeModalItem = null;
}

// Vocabulary Explorer
function getExplorerVocabList() {
  if (typeof VOCAB_DATA === 'undefined') return [];
  const q = state.vocabFilter.search.trim().toLowerCase();
  const book = state.vocabFilter.book;
  const lesson = state.vocabFilter.lesson;
  const photosOnly = state.vocabFilter.photosOnly;

  return VOCAB_DATA.filter(item => {
    if (book !== 'all' && item.book !== book) return false;
    if (lesson !== 'all' && item.lesson !== lesson) return false;
    if (photosOnly && !item.localImage && !item.photoUrl) return false;
    if (q) {
      const matchZh = item.traditional && item.traditional.toLowerCase().includes(q);
      const matchPy = matchPinyin(item.pinyin, q);
      const matchEn = item.english && item.english.toLowerCase().includes(q);
      if (!matchZh && !matchPy && !matchEn) return false;
    }
    return true;
  });
}

function renderVocabExplorer(reset = true) {
  const filtered = getExplorerVocabList();
  elements.vocabFilterStats.textContent = `Showing ${filtered.length.toLocaleString()} word${filtered.length === 1 ? '' : 's'}`;

  if (reset) {
    elements.vocabGrid.innerHTML = '';
    state.vocabFilter.renderedCount = 0;
  }

  if (filtered.length === 0) {
    elements.vocabGrid.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">No vocabulary words match your search or filter.</div>
      </div>
    `;
    elements.vocabLoadMoreWrap.style.display = 'none';
    return;
  }

  const start = state.vocabFilter.renderedCount;
  const end = Math.min(start + state.vocabFilter.batchSize, filtered.length);
  const chunk = filtered.slice(start, end);

  const fragment = document.createDocumentFragment();
  chunk.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vocab-card';

    const imgSrc = item.localImage || item.photoUrl;
    const hasImg = Boolean(imgSrc);

    card.innerHTML = `
      <div class="vocab-card-body">
        <div class="vocab-card-text">
          <div class="vocab-hanzi-row">
            <span class="vocab-hanzi">${escapeHtml(item.traditional)}</span>
          </div>
          <div class="vocab-pinyin">${escapeHtml(item.pinyin)}</div>
          <div class="vocab-english">${escapeHtml(item.english)}</div>
        </div>
        ${hasImg ? `
          <div class="vocab-thumb-wrap" title="Click to view image">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.traditional)}" class="vocab-thumb-img" loading="lazy" />
          </div>
        ` : ''}
      </div>
      <div class="vocab-card-footer">
        <span class="vocab-lesson-pill b${item.book}">Book ${item.book} • L${item.lesson}</span>
        <button type="button" class="vocab-audio-btn" title="Pronounce ${escapeHtml(item.traditional)}">🔊</button>
      </div>
    `;

    // Audio click
    card.querySelector('.vocab-audio-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      ttsEngine.speak(item.traditional, { force: true });
    });

    // Thumb click for modal
    if (hasImg) {
      card.querySelector('.vocab-thumb-wrap').addEventListener('click', (e) => {
        e.stopPropagation();
        openImageLightbox(item);
      });
    }

    fragment.appendChild(card);
  });

  elements.vocabGrid.appendChild(fragment);
  state.vocabFilter.renderedCount = end;

  const remaining = filtered.length - end;
  if (remaining > 0) {
    elements.vocabLoadMoreWrap.style.display = 'flex';
    elements.vocabRemainingCount.textContent = remaining.toLocaleString();
  } else {
    elements.vocabLoadMoreWrap.style.display = 'none';
  }
}

// Grammar Reference Explorer
function getExplorerGrammarList() {
  if (typeof GRAMMAR_DATA === 'undefined') return [];
  const q = state.grammarFilter.search.trim().toLowerCase();
  const book = state.grammarFilter.book;
  const lesson = state.grammarFilter.lesson;

  return GRAMMAR_DATA.filter(item => {
    if (book !== 'all' && item.book !== book) return false;
    if (lesson !== 'all' && item.chapter !== lesson) return false;
    if (q) {
      const matchZh = item.pointZh && item.pointZh.toLowerCase().includes(q);
      const matchEn = item.english && item.english.toLowerCase().includes(q);
      const matchPy = matchPinyin(item.pinyin, q);
      const matchExpl = item.explanation && item.explanation.toLowerCase().includes(q);
      // Example sentences are intentionally excluded from search per user specification
      if (!matchZh && !matchEn && !matchPy && !matchExpl) return false;
    }
    return true;
  });
}

// Update Grammar Lesson Focus Banner at top of Grammar Reference Page
function updateGrammarLessonFocusBanner() {
  if (!elements.grammarLessonFocusBanner) return;
  const lesson = state.grammarFilter.lesson;
  if (lesson === 'all') {
    elements.grammarLessonFocusBanner.style.display = 'none';
    return;
  }

  const book = state.grammarFilter.book === 2 ? 2 : 1;
  const meta = (typeof LESSON_METADATA !== 'undefined' && LESSON_METADATA[book] && LESSON_METADATA[book][lesson]);

  if (!meta || !meta.grammar || meta.grammar.length === 0) {
    elements.grammarLessonFocusBanner.style.display = 'none';
    return;
  }

  elements.grammarFocusBadge.textContent = `BOOK ${book} • LESSON ${lesson}`;
  elements.grammarFocusTitle.textContent = `Lesson ${lesson}: ${meta.title}`;
  elements.grammarFocusList.innerHTML = meta.grammar.map((pt, idx) => 
    `<li class="grammar-focus-item" data-index="${idx}" title="Jump to rule ${idx + 1}">${escapeHtml(pt)}</li>`
  ).join('');
  elements.grammarLessonFocusBanner.style.display = 'block';
}

function renderGrammarExplorer(reset = true) {
  updateGrammarLessonFocusBanner();

  const filtered = getExplorerGrammarList();
  elements.grammarFilterStats.textContent = `Showing ${filtered.length.toLocaleString()} rule${filtered.length === 1 ? '' : 's'}`;

  if (reset) {
    elements.grammarList.innerHTML = '';
    state.grammarFilter.renderedCount = 0;
  }

  if (filtered.length === 0) {
    elements.grammarList.innerHTML = `
      <div class="empty-state-card">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">No grammar rules match your search or filter.</div>
      </div>
    `;
    elements.grammarLoadMoreWrap.style.display = 'none';
    return;
  }

  const start = state.grammarFilter.renderedCount;
  const end = Math.min(start + state.grammarFilter.batchSize, filtered.length);
  const chunk = filtered.slice(start, end);

  const fragment = document.createDocumentFragment();
  chunk.forEach(item => {
    const card = document.createElement('div');
    card.className = 'grammar-card';

    // Build example items
    let examplesHtml = '';
    if (item.exampleDetails && item.exampleDetails.length > 0) {
      examplesHtml = item.exampleDetails.map(ex => `
        <div class="grammar-example-item">
          <div class="grammar-example-lines">
            <div class="grammar-example-zh">${escapeHtml(ex.chinese)}</div>
            <div class="grammar-example-pinyin">${escapeHtml(ex.pinyin)}</div>
            ${ex.english ? `<div class="grammar-example-en">“${escapeHtml(ex.english)}”</div>` : ''}
          </div>
          <button type="button" class="grammar-example-audio" title="Listen" data-sentence="${escapeHtml(ex.chinese)}">🔊</button>
        </div>
      `).join('');
    } else if (item.examples && item.examples.length > 0) {
      examplesHtml = item.examples.map((ex, exIdx) => {
        const trans = (item.exampleTranslations && item.exampleTranslations[exIdx]) || '';
        return `
        <div class="grammar-example-item">
          <div class="grammar-example-lines">
            <div class="grammar-example-zh">${escapeHtml(ex)}</div>
            ${trans ? `<div class="grammar-example-en">“${escapeHtml(trans)}”</div>` : ''}
          </div>
          <button type="button" class="grammar-example-audio" title="Listen" data-sentence="${escapeHtml(ex)}">🔊</button>
        </div>
      `;
      }).join('');
    }

    card.innerHTML = `
      <div class="grammar-card-header">
        <div>
          <div class="grammar-point-title">${escapeHtml(item.pointZh)}</div>
          <div class="grammar-sub-row">
            ${item.pinyin ? `<span class="grammar-pinyin-pill">${escapeHtml(item.pinyin)}</span>` : ''}
            <span class="grammar-english-tag">${escapeHtml(item.english)}</span>
          </div>
        </div>
        <span class="vocab-lesson-pill b${item.book}">Book ${item.book} • L${item.chapter}</span>
      </div>

      ${item.explanation ? `
        <div class="grammar-explanation-box">${escapeHtml(item.explanation)}</div>
      ` : ''}

      ${examplesHtml ? `
        <div class="grammar-examples-container">
          <div class="grammar-examples-label">Example Sentences</div>
          <div class="grammar-examples-list">
            ${examplesHtml}
          </div>
        </div>
      ` : ''}
    `;

    // Example audio click listeners
    card.querySelectorAll('.grammar-example-audio').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentence = btn.dataset.sentence;
        if (sentence) ttsEngine.speak(sentence, { force: true });
      });
    });

    fragment.appendChild(card);
  });

  elements.grammarList.appendChild(fragment);
  state.grammarFilter.renderedCount = end;

  const remaining = filtered.length - end;
  if (remaining > 0) {
    elements.grammarLoadMoreWrap.style.display = 'flex';
    elements.grammarRemainingCount.textContent = remaining.toLocaleString();
  } else {
    elements.grammarLoadMoreWrap.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', init);

// Register Service Worker and Manifest for Offline / Airplane Mode Support (HTTP/HTTPS only)
if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = 'manifest.json';
  document.head.appendChild(manifestLink);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('ServiceWorker registered successfully with scope:', reg.scope);
        })
        .catch(err => {
          console.warn('ServiceWorker registration error:', err);
        });
    });
  }
}

// Ensure speech synthesis voices are ready when loaded asynchronously by browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices list loaded
  };
}

