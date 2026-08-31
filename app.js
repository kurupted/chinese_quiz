/**
 * HanziSprint - Chinese Vocabulary & Grammar Practice
 * Supports Book 1 & Book 2 with independent lesson selection,
 * Local vocab_images/*.png with Unsplash fallback,
 * and Grammar Sentence Cloze with full Pinyin & manual advance.
 */

// App State
const state = {
  selectedBook: 'all', // 'all' | 1 | 2
  selectedLessonsB1: new Set(Array.from({ length: 15 }, (_, i) => i + 1)), // Book 1: 1..15
  selectedLessonsB2: new Set(Array.from({ length: 15 }, (_, i) => i + 1)), // Book 2: 1..15
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
  autoNextTimeout: null
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
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang.startsWith('zh'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
};

// DOM Elements
const elements = {
  setupScreen: document.getElementById('setupScreen'),
  precacheScreen: document.getElementById('precacheScreen'),
  quizScreen: document.getElementById('quizScreen'),
  resultsScreen: document.getElementById('resultsScreen'),

  soundToggleBtn: document.getElementById('soundToggleBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),

  bookChips: document.querySelectorAll('#bookFilterChips .chip-btn-c'),
  modeCards: document.querySelectorAll('.mode-card-compact'),
  questionChips: document.querySelectorAll('#questionCountChips .chip-btn-c'),
  pinyinChips: document.querySelectorAll('#pinyinChips .chip-btn-c'),
  lessonsContainer: document.getElementById('lessonsContainer'),
  poolStats: document.getElementById('poolStats'),
  startQuizBtn: document.getElementById('startQuizBtn'),

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
// INITIALIZATION
// ==========================================================================
function init() {
  renderLessonSelectors();
  updatePoolStats();
  bindEvents();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

// Render dynamic lesson selector rows (separate rows for Book 1 & Book 2 when 'all')
function renderLessonSelectors() {
  elements.lessonsContainer.innerHTML = '';

  const renderBookRow = (bookNum, title, setObj) => {
    const block = document.createElement('div');
    block.className = 'lesson-group-block';

    const header = document.createElement('div');
    header.className = 'lesson-header-compact';
    header.innerHTML = `
      <span class="section-label">${title}</span>
      <div class="lesson-actions-compact">
        <button type="button" class="text-link-btn" data-action="all">All</button>
        <span class="sep">•</span>
        <button type="button" class="text-link-btn" data-action="clear">Clear</button>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'lesson-grid-compact';

    for (let l = 1; l <= 15; l++) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `lesson-chip-c ${setObj.has(l) ? 'active' : ''}`;
      chip.textContent = `${l}`;
      chip.addEventListener('click', () => {
        if (setObj.has(l)) {
          if (setObj.size > 1) {
            setObj.delete(l);
            chip.classList.remove('active');
          }
        } else {
          setObj.add(l);
          chip.classList.add('active');
        }
        updatePoolStats();
      });
      grid.appendChild(chip);
    }

    // Header actions
    header.querySelector('[data-action="all"]').addEventListener('click', () => {
      for (let l = 1; l <= 15; l++) setObj.add(l);
      grid.querySelectorAll('.lesson-chip-c').forEach(c => c.classList.add('active'));
      updatePoolStats();
    });

    header.querySelector('[data-action="clear"]').addEventListener('click', () => {
      setObj.clear();
      setObj.add(1); // keep lesson 1
      grid.querySelectorAll('.lesson-chip-c').forEach((c, idx) => {
        if (idx === 0) c.classList.add('active');
        else c.classList.remove('active');
      });
      updatePoolStats();
    });

    block.appendChild(header);
    block.appendChild(grid);
    elements.lessonsContainer.appendChild(block);
  };

  if (state.selectedBook === 'all') {
    renderBookRow(1, 'BOOK 1 LESSONS', state.selectedLessonsB1);
    renderBookRow(2, 'BOOK 2 LESSONS', state.selectedLessonsB2);
  } else if (state.selectedBook === 1) {
    renderBookRow(1, 'BOOK 1 LESSONS', state.selectedLessonsB1);
  } else if (state.selectedBook === 2) {
    renderBookRow(2, 'BOOK 2 LESSONS', state.selectedLessonsB2);
  }
}

// Filtered Vocabulary Pool
function getFilteredPool() {
  if (typeof VOCAB_DATA === 'undefined') return [];
  return VOCAB_DATA.filter(item => {
    if (state.selectedBook === 1) {
      return item.book === 1 && state.selectedLessonsB1.has(item.lesson);
    } else if (state.selectedBook === 2) {
      return item.book === 2 && state.selectedLessonsB2.has(item.lesson);
    } else {
      // 'all'
      if (item.book === 1) return state.selectedLessonsB1.has(item.lesson);
      if (item.book === 2) return state.selectedLessonsB2.has(item.lesson);
      return false;
    }
  });
}

// Filtered Grammar Pool
function getFilteredGrammar() {
  if (typeof GRAMMAR_DATA === 'undefined') return [];
  return GRAMMAR_DATA.filter(item => {
    if (state.selectedBook === 1) {
      return item.book === 1 && state.selectedLessonsB1.has(item.chapter);
    } else if (state.selectedBook === 2) {
      return item.book === 2 && state.selectedLessonsB2.has(item.chapter);
    } else {
      // 'all'
      if (item.book === 1) return state.selectedLessonsB1.has(item.chapter);
      if (item.book === 2) return state.selectedLessonsB2.has(item.chapter);
      return false;
    }
  });
}

// Update Pool Counts
function updatePoolStats() {
  const pool = getFilteredPool();
  const grammarPool = getFilteredGrammar();
  const visualCount = pool.filter(w => w.isVisual || w.localImage).length;

  if (state.selectedBook === 'all') {
    const b1Count = pool.filter(w => w.book === 1).length;
    const b2Count = pool.filter(w => w.book === 2).length;
    elements.poolStats.innerHTML = `Pool: <strong>${pool.length} vocab</strong> (B1: ${b1Count}, B2: ${b2Count}) • <strong>${grammarPool.length} grammar points</strong>`;
  } else {
    elements.poolStats.innerHTML = `Pool (Book ${state.selectedBook}): <strong>${pool.length} vocab</strong> (${visualCount} visual) • <strong>${grammarPool.length} grammar points</strong>`;
  }
}

// Event Bindings
function bindEvents() {
  // Book Filter Chips
  elements.bookChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.bookChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const b = chip.dataset.book;
      state.selectedBook = b === 'all' ? 'all' : parseInt(b, 10);
      renderLessonSelectors();
      updatePoolStats();
    });
  });

  // Mode selection
  elements.modeCards.forEach(card => {
    card.addEventListener('click', () => {
      elements.modeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.mode = card.dataset.mode;
    });
  });

  // Question count
  elements.questionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.questionChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const count = chip.dataset.count;
      state.questionCount = count === 'all' ? 'all' : parseInt(count, 10);
    });
  });

  // Pinyin setting
  elements.pinyinChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.pinyinChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.pinyinSetting = chip.dataset.pinyin;
    });
  });

  // Sound toggle
  elements.soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    elements.soundToggleBtn.querySelector('.icon').textContent = state.soundEnabled ? '🔊' : '🔇';
  });

  // Theme toggle
  elements.themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      elements.themeToggleBtn.querySelector('.icon').textContent = '🌙';
      state.theme = 'dark';
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      elements.themeToggleBtn.querySelector('.icon').textContent = '☀️';
      state.theme = 'light';
    }
  });

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
      ttsEngine.speak(currentQ.traditional);
    }
  });

  elements.grammarAudioBtn.addEventListener('click', () => {
    const currentQ = state.roundItems[state.currentIndex];
    if (currentQ && currentQ.fullSentence) {
      ttsEngine.speak(currentQ.fullSentence);
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
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
  ['setupScreen', 'precacheScreen', 'quizScreen', 'resultsScreen'].forEach(id => {
    elements[id].classList.remove('active');
  });
  elements[screenName].classList.add('active');
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
    if (state.mode === 'grammar') {
      const grammarPool = getFilteredGrammar();
      if (grammarPool.length === 0) {
        alert('No grammar points found for your selection.');
        return;
      }
      const questions = [];
      grammarPool.forEach(g => {
        if (g.exampleDetails && g.exampleDetails.length > 0) {
          g.exampleDetails.forEach(exDetail => {
            const q = createGrammarClozeQuestion(g, exDetail.chinese, exDetail.pinyin, exDetail.charDetails);
            if (q) questions.push(q);
          });
        } else {
          g.examples.forEach(ex => {
            const q = createGrammarClozeQuestion(g, ex, '', []);
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
          g.exampleDetails.forEach(exDetail => {
            const q = createGrammarClozeQuestion(g, exDetail.chinese, exDetail.pinyin, exDetail.charDetails);
            if (q) grammarQuestions.push(q);
          });
        } else {
          g.examples.forEach(ex => {
            const q = createGrammarClozeQuestion(g, ex, '', []);
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
function createGrammarClozeQuestion(grammarPoint, sentence, sentencePinyin = '', charDetails = []) {
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
    charDetails: charDetails,
    blankSentence: blankSentence,
    target: target,
    distractors: distractors.slice(0, 3)
  };
}

// Try local vocab_images first, with fallback to Unsplash CDN
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
    state.cachedImages.set(item.id, item.photoUrl);
    return item.photoUrl;
  }

  const unsplashSearchUrl = `https://images.unsplash.com/photo-1507842229455-7d74900c608f?w=800&auto=format&fit=crop&q=80`;
  state.cachedImages.set(item.id, unsplashSearchUrl);
  return unsplashSearchUrl;
}

function testImageLoads(url) {
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
    elements.promptInstruction.textContent = 'Select the correct Chinese name:';

    const photoUrl = state.cachedImages.get(currentItem.id) || currentItem.localImage || currentItem.photoUrl;
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

  if (currentItem.fullSentence) {
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
  elements.feedbackDetails.innerHTML = `
    <div><strong>${currentItem.grammarPoint}</strong> (${currentItem.pinyin}) — ${currentItem.explanation}</div>
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

  if (correctItem.traditional) {
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
          <div class="review-english"><strong>${item.grammarPoint}</strong> (${item.pinyin}) — ${item.explanation}</div>
          ${grammarChoiceHtml}
        </div>
        <div style="flex-shrink: 0; align-self: flex-start; margin-top: 0.2rem;">
          <button type="button" class="review-audio-btn" title="Pronounce">🔊</button>
        </div>
      `;
      itemEl.querySelector('.review-audio-btn').addEventListener('click', () => {
        ttsEngine.speak(item.fullSentence);
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
        ttsEngine.speak(item.traditional);
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

document.addEventListener('DOMContentLoaded', init);
