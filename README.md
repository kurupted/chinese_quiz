
An interactive, zero-scroll web application for rapid Mandarin Chinese vocabulary acquisition, visual object recognition, and sentence grammar practice based on **Book 1** and **Book 2** of A Course in Contemporary Chinese.

---

## 🌟 Key Features

### 1. 🎯 Multiple Practice Modes
- **📸 Photo → Chinese**: Timed visual object recognition using over 420+ local custom icons and photos from `vocab_images/`, with automatic Unsplash fallback.
- **🀄 Chinese → English**: Rapid Hanzi recognition testing comprehension of Traditional characters.
- **🇬🇧 English → Chinese**: English definition to Hanzi character selection.
- **📝 Grammar & Sentence Cloze**: Interactive fill-in-the-blank exercises covering **206 grammar points** and **500+ textbook sentences**.
  - **Character-by-Character Pinyin Grid**: Spaced layout aligning tone-marked Pinyin directly underneath each Hanzi character.
  - **Grammar Explanations**: Instant rule breakdowns, pattern tags, and complete sentence translations.
- **⚡ Mixed Mastery**: Fast-paced combined sprint mixing photo prompts, vocabulary questions, and grammar.

### 2. 📚 Complete Book 1 & Book 2  'A Course in Contemporary Chinese' Curriculum
- **1,190 Vocabulary Items**: Full vocabulary sets from Lessons 1–15 of both Book 1 and Book 2.
- **Independent Book & Lesson Selectors**:
  - Filter by **All (B1 + B2)**, **Book 1 only**, or **Book 2 only**.
  - Independent lesson grids allowing custom combinations (e.g. Book 1 Lesson 4 + Book 2 Lesson 8).

### 3. 🧠 Smart Study Flow
- **Auto-Advance on Correct (✅)**: Fast ~850ms transition on correct answers to keep round momentum.
- **Manual Advance on Mistakes (❌)**: When an answer is missed, auto-advance pauses so you can study the correct Hanzi, Pinyin, and grammar explanation at your own pace before clicking **Next ➔** (or pressing <kbd>Space</kbd> / <kbd>Enter</kbd>).
- **All-Option Translation Reveal**: Upon answering, all 4 option buttons dynamically expand to show their corresponding Pinyin and English translations (or Hanzi/Pinyin in Chinese $\rightarrow$ English mode).

### 4. 🔊 Audio & Accessibility
- **Mandarin TTS Pronunciation**: Integrated speech synthesis for full sentences and individual vocabulary items.
- **Web Audio Sound Effects**: Custom synthesized audio cues for correct/incorrect answers.
- **Pinyin Display Settings**: Toggle between *Always*, *On Answer*, or *Hidden*.
- **Zero-Scroll Compact Layout**: Responsive glassmorphism interface optimized for single-screen viewports on desktop and mobile.

### 5. 📊 Analytics & Review
- **Round Stats**: Real-time accuracy %, elapsed time, average speed per question, and max streak.
- **Mistake Retry**: One-click round generation to re-test only the questions you missed.
- **Interactive Review List**: Filterable table showing all questions, mistake comparisons, full sentences with character Pinyin, and audio playback.

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
├── grammar_data.js                # Compiled grammar points & example sentences with character Pinyin
├── grammar_data.json              # JSON grammar dataset
├── parse_all_data.py              # Parser generating datasets and mapping local images
├── vocab_images/                  # 420+ local PNG/JPG images and icons
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

Simply open index.html in your browser.

## Adding or Updating Images

### 1. Automatically Download Missing Images from OpenSymbols
You can run the automated downloader script, which queries OpenSymbols for all missing vocabulary items and saves the results directly to `vocab_images/`:

```bash
# Download all missing vocabulary images from OpenSymbols
python download_opensymbols.py

# Or download in batches (e.g. next 25 items)
python download_opensymbols.py 25
```

### 2. Manual Image Updates
When manually adding or renaming images in `vocab_images/`:

```bash
python parse_all_data.py
```

This will automatically map the images to the corresponding vocabulary entries across Book 1 and Book 2, generate character-level Pinyin, and update `vocab_data.js` and `grammar_data.js`.

This will automatically map the new images to the corresponding vocabulary entries across Book 1 and Book 2, generate character-level Pinyin, and update `vocab_data.js` and `grammar_data.js`.
