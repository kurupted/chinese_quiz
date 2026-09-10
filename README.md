
An interactive, zero-scroll web application for rapid Mandarin Chinese vocabulary acquisition, visual object recognition, and sentence grammar practice based on **Book 1** and **Book 2** of A Course in Contemporary Chinese.

---

## 🌟 Key Features

### 1. 🎯 Multiple Practice Modes
- **📸 Photo → Chinese**: Timed visual object recognition using over **700+ local custom icons and photos** from `vocab_images/`, with automatic Unsplash fallback.
- **🀄 Chinese → English**: Rapid Hanzi recognition testing comprehension of Traditional characters.
- **🇬🇧 English → Chinese**: English definition to Hanzi character selection.
- **📝 Grammar & Sentence Cloze**: Interactive fill-in-the-blank exercises covering **206 grammar points** and **618 textbook example sentences**.
  - **Character-by-Character Pinyin Grid**: Spaced layout aligning tone-marked Pinyin directly underneath each Hanzi character.
  - **Literal Sentence Translations**: Somewhat literal English translations displayed immediately upon answering (right/wrong feedback toast), in the end-of-round review list, and inside the Grammar Reference tab.
  - **Grammar Explanations**: Instant rule breakdowns, pattern tags, and full structural explanations.
- **⚡ Mixed Mastery**: Fast-paced combined sprint mixing photo prompts, vocabulary questions, and grammar.

### 2. 📚 Complete Book 1 & Book 2 'A Course in Contemporary Chinese' Curriculum
- **1,198 Vocabulary Items**: Full vocabulary sets from Lessons 1–15 of both Book 1 and Book 2.
- **Independent Book & Lesson Selectors**:
  - Filter by **All (B1 + B2)**, **Book 1 only**, or **Book 2 only**.
  - Independent lesson grids allowing custom combinations (e.g. Book 1 Lesson 4 + Book 2 Lesson 8).

### 3. 🧠 Smart Study Flow
- **Auto-Advance on Correct (✅)**: Fast ~850ms transition on correct answers to keep round momentum.
- **Manual Advance on Mistakes (❌)**: When an answer is missed, auto-advance pauses so you can study the correct Hanzi, Pinyin, literal translation, and grammar explanation at your own pace before clicking **Next ➔** (or pressing <kbd>Space</kbd> / <kbd>Enter</kbd>).
- **All-Option Translation Reveal**: Upon answering, all 4 option buttons dynamically expand to show their corresponding Pinyin and English translations (or Hanzi/Pinyin in Chinese $\rightarrow$ English mode).

### 4. 🔊 Audio & Accessibility
- **Mandarin TTS Pronunciation**: Integrated speech synthesis for full sentences and individual vocabulary items.
- **Web Audio Sound Effects**: Custom synthesized audio cues for correct/incorrect answers.
- **Pinyin Display Settings**: Toggle between *Always*, *On Answer*, or *Hidden*.
- **Zero-Scroll Compact Layout**: Responsive glassmorphism interface optimized for single-screen viewports on desktop and mobile.

### 5. 📊 Analytics & Review
- **Round Stats**: Real-time accuracy %, elapsed time, average speed per question, and max streak.
- **Mistake Retry**: One-click round generation to re-test only the questions you missed.
- **Interactive Review List**: Filterable table showing all questions, mistake comparisons, full sentences with character Pinyin, literal translations, and audio playback.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> / <kbd>4</kbd> | Select Option 1, 2, 3, or 4 |
| <kbd>A</kbd> / <kbd>B</kbd> / <kbd>C</kbd> / <kbd>D</kbd> | Select Option A, B, C, or D |
| <kbd>Space</kbd> or <kbd>Enter</kbd> | Advance to Next Question |

---

## 📁 Project Structure

```
chinese/
├── Book 1 vocab and grammar.txt   # Raw textbook source for Book 1
├── Book 2 vocab and grammar.txt   # Raw textbook source for Book 2
├── index.html                     # Application UI structure
├── style.css                      # Modern zero-scroll glassmorphic design system
├── app.js                         # Application state, gameplay loop, TTS & audio engine
├── vocab_data.js                  # Compiled vocabulary dataset with image mappings
├── vocab_data.json                # JSON vocabulary dataset
├── grammar_data.js                # Compiled grammar points & example sentences with Pinyin & translations
├── grammar_data.json              # JSON grammar dataset
├── grammar_translations.json      # Master lookup of literal English translations for all 618 grammar sentences
├── parse_all_data.py              # Primary build parser generating datasets and mapping local images
├── vocab_images/                  # 700+ local PNG/JPG images and icons
│
├── Data & Image Utilities:
├── download_opensymbols.py        # Automated batch downloader querying OpenSymbols API
├── get_missing_images.py          # Image search and retrieval helper for missing vocab items
├── get_images.py                  # Image fetcher script for target vocabulary terms
├── map_local_images.py            # Local image mapping and synonym matcher
├── curate_vocab.py                # Vocabulary curation and verified image mapping tool
├── generate_grammar_pinyin.py     # Helper to generate tone-marked Pinyin for grammar sentences
│
├── Testing & Verification:
├── check_all.py                   # Comprehensive asset and link verification suite
├── test_grammar.py                # Test runner verifying grammar cloze question generation
├── test_images.py                 # Test runner checking image availability and resolution
└── README.md                      # Project documentation
```

---

## 🛠️ Data Scripts & Utilities

### 1. Build & Parsing
- **`parse_all_data.py`**: The primary compilation script. Reads `Book 1 vocab and grammar.txt` and `Book 2 vocab and grammar.txt`, generates tone-marked Pinyin via `pypinyin`, attaches English translations from `grammar_translations.json`, maps image files from `vocab_images/`, and writes `vocab_data.js/json` and `grammar_data.js/json`.

```bash
python parse_all_data.py
```

### 2. Grammar Translations
- **`grammar_translations.json`**: Master translation file containing somewhat literal English translations for all 618 textbook example sentences across 206 grammar points. It is automatically consumed by `parse_all_data.py` to populate `english` in `exampleDetails` and `exampleTranslations`.

### 3. Adding or Updating Images
- **`download_opensymbols.py`**: Queries the OpenSymbols AAC API for missing vocabulary items and downloads icons directly to `vocab_images/`.

```bash
# Download all missing vocabulary images from OpenSymbols
python download_opensymbols.py

# Or download in batches (e.g. next 25 items)
python download_opensymbols.py 25
```

- **`get_missing_images.py`** / **`get_images.py`**: Target specific missing words to find and fetch relevant visual assets.
- **`map_local_images.py`** / **`curate_vocab.py`**: Manage image synonym mappings and local filenames.

### 4. Testing & Verification
- **`test_grammar.py`**: Tests cloze extraction logic and target keyword matching across all grammar points.
- **`test_images.py`**: Verifies that local and remote image URLs resolve properly.
- **`check_all.py`**: Runs end-to-end dataset validation across all vocabulary and grammar entries.

---

## 🚀 Getting Started

Simply open `index.html` in your web browser. No web server or build step is required!
