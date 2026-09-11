# 🖋️ CursiveCraft

> **Elegant Adult Cursive Penmanship Practice for iPad & Apple Pencil**  
> Powered by React Native, Expo SDK 57, and Shopify React Native Skia.

[![CursiveCraft CI](https://github.com/nawat-john/handwrite-app/actions/workflows/ci.yml/badge.svg)](https://github.com/nawat-john/handwrite-app/actions/workflows/ci.yml)
[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native 0.86](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript 6.0](https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Shopify Skia](https://img.shields.io/badge/Shopify-React%20Native%20Skia-red.svg)](https://shopify.github.io/react-native-skia/)
[![Deploy to GitHub Pages](https://github.com/nawat-john/handwrite-app/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/nawat-john/handwrite-app/actions/workflows/deploy-pages.yml)
[![Open Web App](https://img.shields.io/badge/Open-Web%20App-success?style=flat&logo=github)](https://nawatpim.com/handwrite-app/)

---

## 📱 Install on iPad (no App Store, no account)

<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=https://nawatpim.com/handwrite-app/" width="160" height="160" alt="QR code for nawatpim.com/handwrite-app" align="right" />

1. On the iPad, open **[nawatpim.com/handwrite-app](https://nawatpim.com/handwrite-app/)** in **Safari** (or scan the QR with the Camera).
2. Tap **Share** ➔ **Add to Home Screen**.
3. Launch **CursiveCraft** from the Home Screen: it opens full screen like a regular app. Write with Apple Pencil; use your fingers for the buttons.

The site is rebuilt on every push to `main` by [deploy-pages.yml](.github/workflows/deploy-pages.yml). Practice history is stored in the browser on the iPad (Home Screen web apps keep their storage; clearing Safari website data erases it). The app needs internet to open (no offline cache yet); scoring itself runs on the iPad.

<br clear="right" />

## 📖 Overview

**CursiveCraft** is a digital penmanship practice studio designed from the ground up for **iPad in landscape orientation** with **Apple Pencil**. It bridges classical calligraphic pedagogy with real-time digital image processing to provide instant, actionable feedback on handwriting accuracy, stroke cleanliness, and baseline adherence.

Built entirely with **TypeScript**, **React Native Skia**, **Zustand**, and **AsyncStorage**, CursiveCraft operates **100% offline**, ensuring fluid, private, and sub-16ms latency writing experience without requiring any cloud roundtrips.

---

## ✨ Key Features

### ✍️ 1. Ultra-Low Latency Skia Drawing Engine
- **Catmull-Rom to Cubic Bézier Spline Smoothing:** Raw polyline touch streams are mathematically converted to smooth cubic Bézier curves in real-time, eliminating jagged hand micro-tremors without introducing input lag.
- **Apple Pencil Writing, Finger UI:** Every touch is tracked by id and only the Apple Pencil draws. Fingers and a resting palm never draw; fingers stay free for the toolbar buttons.
  - *Web app:* DOM pointer events report `pointerType: "pen"` per pointer, so this works even when the palm lands first.
  - *Expo Go:* a `react-native-gesture-handler` Manual gesture checks `PointerType.STYLUS` (reported per event, not per touch; iPadOS cancels resting-palm touches, so this holds in practice).
- **Stylus Mode Switcher:** Includes a toggle between **"Apple Pencil Only"** (default) and **"Touch Allowed"** (for the iOS Simulator or when no Pencil is at hand).
- **Penmanship Controls:** Undo stack, Clear Canvas, and stroke width selector (Thin, Medium, Bold).

### 📏 2. Classical 4-Line Penmanship Guidelines
- **Standard Calligraphic Proportions:** Strict `1.0 : 1.0 : 0.8` ratio:
  - Ascender line (+40px above Mid line)
  - Mid / Waist line (40px above Base line)
  - Base line (resting line for lower-case bodies)
  - Descender line (-32px below Base line)
- **70° Slant Guidelines:** Slanted reference lines spaced across the canvas guide consistent letter forward tilt.
- **Font-Calibrated:** `LearningCurvePro` at 128px has exactly these proportions (x-height 40, ascender 80, descender 32). Words and sentences wider than the canvas are scaled down together with the guidelines and the scoring template, so every exercise fits on one line.

### 👻 3. Dual Practice Modes
- **Trace Mode:** Dashed cursive template rendered directly on the guideline using `LearningCurvePro-Dashed` font. Ideal for developing initial muscle memory.
- **Blank Canvas Mode:** The dashed overlay is removed. A minimalist reference card displays the target text, font specimen, and level metadata, encouraging independent muscle execution.

### 🧠 4. On-Device Evaluation Engine
All scoring is computed locally in memory via Skia rasterization:
- **Mask Generation & 2px Morphological Dilation:** Both the user stroke and template glyphs are rasterized into 1-channel binary pixel masks. The user stroke is dilated by 2px to accommodate natural human variation.
- **Coverage Score ($S_{cov}$):** Ratio of template pixels successfully covered by the user stroke.
- **Spill Penalty ($P_{spill}$):** Percentage of the user stroke that strayed outside the permissible template envelope.
- **OLS Linear Regression Baseline Slope ($P_{slope}$):** In Blank Mode, detects bottom-most coordinates across letter groups and calculates slope angle deviation via Ordinary Least Squares:
  $$\text{Angle} = |\arctan(m)| \times \frac{180}{\pi}, \quad P_{slope} = \min(100, \text{Angle} \times 5)$$
- **Penmanship Rating Grades:**
  - `90 - 100%`: **Master Penman** (`#10B981` Emerald)
  - `75 - 89%`: **Proficient** (`#0EA5E9` Ocean Blue)
  - `60 - 74%`: **Developing** (`#F59E0B` Amber)
  - `< 60%`: **Needs Practice** (`#EF4444` Rose)

### 📚 5. Structured 142-Lesson Curriculum
Categorized across 4 difficulty tiers:
1. **Level 1: Single Alphabet (52 Lessons):** Lowercase `a`–`z` (ellipses & loops) and Uppercase `A`–`Z` (flourished entry strokes).
2. **Level 2: Common Ligature Combos (30 Lessons):** Consonant blends (`th`, `ch`, `sh`, `wh`), vowel pairs (`ee`, `oo`, `ea`, `ai`), and suffixes (`ing`, `tion`, `ness`, `ment`, `able`, `ful`, `ly`).
3. **Level 3: Essential Words (40 Lessons):** 14 short (3–4 chars), 14 medium (5–7 chars), and 12 adult penmanship words (`signature`, `manuscript`, `sophisticated`, `calligraphy`).
4. **Level 4: Sentences & Literature Quotes (20 Lessons):** Famous pangrams (*"The quick brown fox jumps over the lazy dog"*) and quotes from Leonardo da Vinci, Albert Einstein, Eleanor Roosevelt, and Miguel de Cervantes.

### 🏆 6. Visual Score Modal & Persistent History
- **Skia Percentage Ring:** Arc paths rendered with grade-tailored colors.
- **Granular Metric Breakdown Bars:** Coverage Accuracy, Precision & Cleanliness, and Baseline Adherence.
- **Bilingual Contextual Coaching:** Intelligent feedback in Thai and English pinpointing specific areas for improvement.
- **Persistent Storage:** Powered by Zustand + `@react-native-async-storage/async-storage`. Tracks attempt timestamps, scores, ratings, and best scores per lesson with `★ 88%` badges in the curriculum picker.
- **Auto-Advancement:** Achieving $\ge 75\%$ marks the lesson as complete and enables one-tap advancement to the next exercise.

---

## 📱 Expo Go & App Store Compatibility Analysis

| Dimension | App Store Version | CursiveCraft Project | Compatibility Status |
| :--- | :--- | :--- | :--- |
| **Expo SDK** | **SDK 57** (Expo Go 57.0.x) | **SDK 57** (`~57.0.21`) | ✅ Match |
| **React Native** | **0.86** | **0.86.3** | ✅ Match |
| **React** | **19.2** | **19.2.3** | ✅ Match |
| **Native modules** | Bundled in Expo Go | `@shopify/react-native-skia` 2.6.2, `react-native-gesture-handler` 2.32, `@react-native-async-storage/async-storage` 2.2.0, `expo-font` | ✅ All included in Expo Go |

- Every native dependency is on the exact version bundled with SDK 57 (`npx expo install --check` passes), and all of them ship inside Expo Go, so **no development build is needed**.
- Expo Go runs only **one** SDK version at a time. Before upgrading the Expo SDK, check that the App Store Expo Go already supports the new SDK (in 2026 the App Store version lagged behind new SDK releases for months).

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 57)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Graphics & Rendering:** [@shopify/react-native-skia](https://shopify.github.io/react-native-skia/)
- **Gesture Handling:** [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- **State Management:** [Zustand](https://zustand.docs.pmnd.rs/) (v5)
- **Storage:** [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)
- **Typography:** Custom OpenType cursive fonts (`LearningCurvePro.otf` & `LearningCurvePro-Dashed.otf`)

---

## 📂 Project Structure

```
CursiveCraft/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Continuous integration workflow
│       └── deploy-pages.yml           # Web app (PWA) build + GitHub Pages deploy
├── public/
│   ├── index.html                     # Web template: PWA meta, no zoom/selection while writing
│   ├── manifest.json                  # Add to Home Screen manifest
│   └── icon.png                       # Home Screen icon
├── assets/
│   ├── fonts/
│   │   ├── LearningCurvePro.otf       # Solid cursive evaluation template font
│   │   └── LearningCurvePro-Dashed.otf# Dashed ghost tracing font
│   └── ...                            # App icons and splash assets
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── HandwritingCanvas.tsx  # Interactive Skia drawing surface
│   │   │   ├── GuidelineOverlay.tsx   # 4-line penmanship grid & slant guides
│   │   │   └── TracingGhost.tsx       # Dashed reference text renderer
│   │   ├── Common/
│   │   │   ├── HeaderBar.tsx          # Navigation, evaluation trigger & controls
│   │   │   └── CategoryPickerModal.tsx# 142-exercise curriculum browser
│   │   └── Evaluation/
│   │       └── ScoreModal.tsx         # Circular score ring, metrics & coaching
│   ├── engine/
│   │   ├── strokeSmoother.ts          # Catmull-Rom to Bézier curve algorithm
│   │   ├── maskGenerator.ts           # Offscreen surface bitmap mask generator
│   │   ├── baselineDetector.ts        # OLS linear regression slope detector
│   │   └── imageEvaluator.ts          # Coverage & spill mathematical scoring
│   ├── store/
│   │   ├── usePracticeStore.ts        # Canvas & curriculum state (Zustand)
│   │   └── useHistoryStore.ts         # Persistent attempt history (AsyncStorage)
│   ├── data/
│   │   └── exercises.ts               # 142 lessons across 4 categories
│   ├── screens/
│   │   └── PracticeScreen.tsx         # Main landscape practice screen
│   └── types/
│       ├── canvas.ts                  # Point, Stroke, and Touch types
│       └── curriculum.ts              # Exercise item & category schemas
├── App.tsx                            # Root entry component with font loader
├── app.json                           # Expo app manifest (landscape, iPad)
├── package.json                       # Dependencies and NPM scripts
└── tsconfig.json                      # Strict TypeScript compiler options
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** `>= 20.0.0`
- **npm** or **yarn**
- **Safari** on iPad for the web app, or **Expo Go** (SDK 57) from the App Store for native development

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nawat-john/handwrite-app.git
cd handwrite-app/CursiveCraft

# Install dependencies
npm install
```

### 3. Typecheck & Validation
```bash
# Verify TypeScript with 0 errors
npm run typecheck

# Verify Metro bundler exports cleanly
npm run export
```

### 4. Running the App

Web app (same as the GitHub Pages build):
```bash
npm run web
```

Expo Go (for native development):

```bash
npm start
```

Scan the QR code shown in the terminal with the iPad Camera (iPad and computer on the same Wi-Fi, or add `--tunnel`). On the iOS Simulator there is no Apple Pencil: switch the toolbar toggle to **🖐️ Touch** to draw with the mouse.

---

## 📊 Evaluation Algorithm

$$S_{cov} = \frac{\sum_{x,y} (U(x,y) \land T(x,y))}{\sum_{x,y} T(x,y)} \times 100$$

$$P_{spill} = \frac{\sum_{x,y} (U(x,y) \land \neg T_{dilated}(x,y))}{\sum_{x,y} U(x,y)} \times 100$$

- **Trace Mode Weighted Score:**
  $$S_{final} = \max(0, \min(100, (S_{cov} \times 0.75) + ((100 - P_{spill}) \times 0.25)))$$
- **Blank Mode Weighted Score (with Baseline Adherence):**
  $$S_{final} = \max(0, \min(100, (S_{cov} \times 0.50) + ((100 - P_{spill}) \times 0.30) + ((100 - P_{slope}) \times 0.20)))$$

---

## 🤝 Continuous Integration & Deployment

- **CI Pipeline ([ci.yml](.github/workflows/ci.yml)):** Automatically runs on pull requests and pushes to validate TypeScript compilation (`tsc --noEmit`), Expo config, and Metro iOS bundle generation.
- **Web App Deployment ([deploy-pages.yml](.github/workflows/deploy-pages.yml)):** On every push to `main`, exports the web build (`npx expo export -p web`) and deploys it to **GitHub Pages** as an installable web app.
  - *Repository Setup:* `Settings` ➔ `Pages` ➔ **Build and deployment > Source** ➔ **`GitHub Actions`**.
  - `npm install` / `npm ci` runs `setup-skia-web public` (postinstall), which copies Skia's `canvaskit.wasm` into `public/` so it ships with the site.

---

## 📄 License

This project is licensed under the MIT License.
