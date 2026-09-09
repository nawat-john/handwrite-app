# 🖋️ CursiveCraft

> **Elegant Adult Cursive Penmanship Practice for iPad & Apple Pencil**  
> Powered by React Native, Expo SDK 57, and Shopify React Native Skia.

[![CursiveCraft CI](https://github.com/nawat-john/handwrite-app/actions/workflows/ci.yml/badge.svg)](https://github.com/nawat-john/handwrite-app/actions/workflows/ci.yml)
[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native 0.86](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript 6.0](https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Shopify Skia](https://img.shields.io/badge/Shopify-React%20Native%20Skia-red.svg)](https://shopify.github.io/react-native-skia/)
[![Deploy to GitHub Pages](https://github.com/nawat-john/handwrite-app/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/nawat-john/handwrite-app/actions/workflows/deploy-pages.yml)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=flat&logo=github)](https://nawat-john.github.io/handwrite-app/)

---

## 📱 Live Demo & Scannable QR Code

| 📷 Scan with iPad / iPhone | 🌐 Direct Browser Access |
| :---: | :--- |
| <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=https://nawat-john.github.io/handwrite-app/" width="190" height="190" alt="CursiveCraft QR Code" /> | **Live Web App:** [https://nawat-john.github.io/handwrite-app/](https://nawat-john.github.io/handwrite-app/)<br><br>Scan the QR code with your iPad camera or open the link to start practicing cursive handwriting in Safari or any browser with touch/mouse support! |

## 📖 Overview

**CursiveCraft** is a digital penmanship practice studio designed from the ground up for **iPad in landscape orientation** with **Apple Pencil**. It bridges classical calligraphic pedagogy with real-time digital image processing to provide instant, actionable feedback on handwriting accuracy, stroke cleanliness, and baseline adherence.

Built entirely with **TypeScript**, **React Native Skia**, **Zustand**, and **AsyncStorage**, CursiveCraft operates **100% offline**, ensuring fluid, private, and sub-16ms latency writing experience without requiring any cloud roundtrips.

---

## ✨ Key Features

### ✍️ 1. Ultra-Low Latency Skia Drawing Engine
- **Catmull-Rom to Cubic Bézier Spline Smoothing:** Raw polyline touch streams are mathematically converted to smooth cubic Bézier curves in real-time, eliminating jagged hand micro-tremors without introducing input lag.
- **Hardware Palm Rejection:** Differentiates Apple Pencil pressure points (`touch.force > 0` & `stylusType === 1`) from accidental palm contact on iPad glass.
- **Stylus Mode Switcher:** Includes a toggle between **"Apple Pencil Only"** (strict palm rejection) and **"Touch Allowed"** (for development on simulators or non-stylus touchscreens).
- **Penmanship Controls:** Undo stack, Clear Canvas, and stroke width selector (Thin, Medium, Bold).

### 📏 2. Classical 4-Line Penmanship Guidelines
- **Standard Calligraphic Proportions:** Strict `1.0 : 1.0 : 0.8` ratio:
  - Ascender line (+40px above Mid line)
  - Mid / Waist line (40px above Base line)
  - Base line (resting line for lower-case bodies)
  - Descender line (-32px below Base line)
- **70° Slant Guidelines:** Slanted reference lines spaced across the canvas guide consistent letter forward tilt.

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
| **Expo SDK** | **SDK 57** | **SDK 57** (`~57.0.21`) | ✅ **100% Match** |
| **React Native** | **0.86** | **0.86.3** | ✅ **100% Match** |
| **React** | **19.2** | **19.2.3** | ✅ **100% Match** |
| **Native Module Support** | Sandboxed Native Set | `@shopify/react-native-skia` | ⚠️ **Requires Development Build** |

### 🔍 Important Note Regarding `@shopify/react-native-skia`
- The Expo Go application available on the Apple App Store uses **React Native 0.86 / Expo SDK 57**, which matches CursiveCraft's core dependencies.
- **However**, `@shopify/react-native-skia` is a high-performance 2D graphics engine written in C++ that uses JSI (JavaScript Interface). As documented by Shopify and the Expo core team, **Skia is not included in the generic Expo Go App Store sandbox**.
- Attempting to load Skia inside standard Expo Go will fail because native Skia bindings are absent from the generic binary.

### 🚀 Recommended Execution Options:
1. **Local Development Build (Recommended for iPad + Apple Pencil):**
   ```bash
   npx expo run:ios
   ```
   This generates the native iOS workspace and installs the app on your connected iPad or simulator with full Apple Pencil pressure sensitivity and native Skia acceleration.
2. **Cloud EAS Development Build:**
   ```bash
   npx eas-cli build --profile development --platform ios
   ```
   Install the resulting build on your iPad via Ad-Hoc provisioning or Apple Developer certificate.
3. **Custom Expo Go (`eas go`):**
   Use `npx eas-cli go` to build a personalized Expo Go client containing Skia for your team.

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
│       └── ci.yml                     # Continuous integration workflow
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
- **macOS** with **Xcode 16+** (for building iOS development client) or **EAS CLI** for cloud builds

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

#### On iPad via Local Development Build:
```bash
npx expo run:ios
```

#### On iOS Simulator:
```bash
npx expo run:ios --simulator "iPad Pro 13-inch (M4)"
```

#### Starting the Metro Dev Server:
```bash
npm start
```

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
- **Pages Deployment ([deploy-pages.yml](.github/workflows/deploy-pages.yml)):** Automatically exports the web build and deploys to **GitHub Pages** on every push to `main`.
  - *Repository Setup:* Go to `Settings` ➔ `Pages` ➔ under **Build and deployment > Source**, select **`GitHub Actions`**.

---

## 📄 License

This project is licensed under the MIT License.
