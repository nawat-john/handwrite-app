# Software Requirements Specification (SRS) & Agent Implementation Plan
# Project: CursiveCraft iOS (React Native + Expo Go + Apple Pencil)

---

## 1. Executive Summary & Architecture Overview

### 1.1 Project Objective
สร้างแอปพลิเคชันคัดลายมือภาษาอังกฤษแบบลายมือผู้ใหญ่ (Adult Cursive Handwriting) บน iPadOS รองรับ Apple Pencil แบบ Low Latency ด้วย React Native + Expo Go โดยใช้ฟอนต์ **Learning Curve Pro** เป็นเกณฑ์มาตรฐาน พร้อมระบบประเมินความแม่นยำด้วยเทคนิค Image Processing และ Geometric Analysis แบบ On-device โดยไม่ต้องพึ่งพา Cloud Server

### 1.2 Target Hardware & Platform
* **Platform:** iPadOS 16.0+ (Tested on iPad Pro / iPad Air / iPad mini)
* **Framework:** React Native (Expo SDK 51+) บน **Expo Go** (Managed Workflow 100% ปราศจาก Native Module ที่ต้อง build custom dev client)
* **Input Device:** Apple Pencil (1st/2nd Gen, USB-C, Pro) + Touch rejection สำหรับฝ่ามือ (Palm Rejection)
* **Display Rate:** รองรับ 60Hz / 120Hz ProMotion

### 1.3 System Tech Stack
| Component | Selected Technology | Rationale |
| :--- | :--- | :--- |
| **Canvas & Graphics** | `@shopify/react-native-skia` | GPU-accelerated drawing, 120fps capability, Path manipulation, Offscreen surface snapshot สำหรับ Image Processing |
| **Pencil & Gestures** | `react-native-gesture-handler` (Pinch/Pan) | ควบคุม Touch event และจำแนก Stylus กับ Touch point |
| **Font Management** | `expo-font` | โหลด Local Asset: `LearningCurvePro.otf`, `LearningCurvePro-Dashed.otf` |
| **State Management** | `zustand` | น้ำหนักเบา ประสิทธิภาพสูงสำหรับการเก็บคะแนน ประวัติ และการตั้งค่า |
| **Evaluation Engine** | Pure TS / TypedArray / Skia Pixel Buffer | คำนวณ IoU, Chamfer-like distance, Bounding Box, Regression Slope ผ่าน Uint8Array โดยตรงบน JS Runtime |
| **Styling & UI** | Custom Tailored UI (No heavy UI library) | เน้นความคลีน สบายตาแบบแผ่นกระดาษคุณภาพสูง (Paper Notebook aesthetic) |

---

## 2. Typography & Guideline Calibration

### 2.1 Font Specifications
* **Base Font:** `LearningCurvePro.otf` (Solid stroke)
* **Tracing Guide Font:** `LearningCurvePro-Dashed.otf` (Dashed stroke สำหรับโหมดตามรอย)
* **Nature:** Monoline Cursive (ความหนาของเส้นเท่ากันทั้งตัวอักษร ไม่เป็น Calligraphy หัวตัด ทำให้การวัดเส้นด้วย Image Processing ทำได้อย่างเที่ยงตรง)
* **Slant Angle:** ~68° – 72° (เอียงขวาตามหลักมาตรฐานตัวเขียนสากล)

### 2.2 Four-Line Guideline Metrics
การจัดวางตัวอักษรใช้ระบบ 4 บรรทัดมาตรฐาน (French Ruled / American Penmanship Ruled):
1. **Top Ascender Line:** รองรับส่วนบนของตัวพิมพ์ใหญ่และอักษรพิมพ์เล็กที่มีก้านบน (`b`, `d`, `h`, `k`, `l`, `t`)
2. **Mid Line (x-height):** จุดสูงสุดของอักษรฐาน (`a`, `c`, `e`, `m`, `n`, `o`, `r`, `s`, `u`, `v`, `w`, `x`, `z`)
3. **Base Line:** เส้นหลักที่ตัวอักษรทั้งหมดวางอยู่
4. **Bottom Descender Line:** รองรับหางของตัวอักษรที่ห้อยลงมา (`g`, `j`, `p`, `q`, `y`, `z`)

**สัดส่วนความสูง (Vertical Proportion):**
* Ascender Height : Mid Height (x-height) : Descender Depth = `1.0 : 1.0 : 0.8`
* Canvas Guideline Default: `Line Spacing = 40px` (รวมความสูง 3 ช่อง = 112px)

---

## 3. Core Engine Specifications

### 3.1 Apple Pencil & Palm Rejection System
```typescript
// Pseudo-code logic สำหรับ Event Filter
const onTouchStart = (event: GestureResponderEvent) => {
  const touch = event.nativeEvent;
  
  // ตรวจจับความแม่นยำของ Apple Pencil
  // ใน iOS Touch Event: stylusType == 1 (pencil), 0 (finger)
  // หรือตรวจสอบ touch.altitudeAngle / touch.azimuthAngle / touch.force
  const isStylus = touch.force > 0 || (touch as any).stylusType === 1;
  
  if (!isStylus && palmRejectionEnabled) {
    // ปฏิเสธสัมผัสจากอุ้งมือ
    return;
  }
  startNewStroke(touch.locationX, touch.locationY, touch.force);
};
```

### 3.2 Smooth Stroke Interpolation (Catmull-Rom to Cubic Bézier)
เมื่อลากปากกา ข้อมูลดิบจาก Touch Handler จะเป็นจุดต่อเนื่องแบบหักมุม เพื่อให้ได้เส้นโค้งเนียนธรรมชาติ (Anti-aliased natural ink):
1. ทำ Down-sampling จุดที่ใกล้กันเกินไป ($d < 3\text{px}$)
2. แปลงชุดจุด $(P_0, P_1, P_2, P_3)$ ให้เป็น Cubic Bézier Curves:
   $$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t C_1 + 3(1-t)t^2 C_2 + t^3 P_3$$
3. ส่งผลลัพธ์ไปยัง `Skia.Path` สำหรับการเรนเดอร์

---

## 4. Operational Modes & UI Behavior

### 4.1 Mode A: Trace Mode (คัดตามเส้น)
* **เป้าหมาย:** เสริมสร้างกล้ามเนื้อมือและความจำของเส้น (Muscle Memory)
* **การแสดงผล:**
  * พื้นหลังแสดงเส้น Guideline 4 เส้น
  * เรนเดอร์ตัวอักษรโจทย์ด้วยฟอนต์ `LearningCurvePro-Dashed` สีเทาอ่อน (#CBD5E1) ความทึบ 40%
  * ผู้ใช้ลาก Apple Pencil ทับลงบนตัวอักษร
* **การตรวจคะแนน:**
  * เทียบพิกัด 1:1 กับ Template Offscreen Mask โดยตรง

### 4.2 Mode B: Blank Canvas Mode (คัดบนกระดาษเปล่า)
* **เป้าหมาย:** ทดสอบความสามารถในการเขียนจริงโดยไม่มีเส้นประนำ
* **การแสดงผล:**
  * แสดงเฉพาะเส้น Guideline หรือกระดาษเปล่าตามที่ตั้งค่า
  * ด้านบนของจอแสดงโจทย์ขนาดเล็ก (Reference Card)
  * ผู้ใช้เขียนลายมือลงในพื้นที่ว่าง
* **การตรวจคะแนน:**
  * ทำ Auto-Crop / Bounding Box Normalization
  * Scale ลายมือให้เทียบเท่าขนาด Template
  * ตรวจสอบ 2 มิติ: **ความถูกต้องของรูปทรง (Shape Similarity)** และ **ความตรงของบรรทัด (Baseline Adherence)**

---

## 5. Image Processing & Evaluation Engine (No Cloud)

เนื่องจากทำงานบน Expo Go โดยไม่สามารถคอมไพล์ OpenCV C++ ได้ จึงใช้เทคนิค **Offscreen Skia Rendering & TypedArray Mask Processing**:

### 5.1 Pipeline ขั้นตอนการประเมินผล

```
[User Canvas Stroke]            [Target Font Text]
        │                               │
        ▼                               ▼
[Snapshot to 8-bit Alpha]       [Snapshot to 8-bit Alpha]
 (User Binary Mask: U)           (Target Binary Mask: T)
        │                               │
        └───────────────┬───────────────┘
                        ▼
            [Blank Mode Only: Normalization]
            - Bounding Box Detection
            - Aspect-Ratio Preserving Scale
            - Centroid Alignment
                        │
                        ▼
            [Pixel Metric Calculation]
            1. Intersection (U ∩ T)
            2. Target Union (U ∪ T)
            3. Stray/Spill Pixels (U - T)
                        │
                        ▼
            [Baseline Slope Analysis]
            - Linear Regression on Baseline
                        │
                        ▼
            [Score Synthesis (0 - 100)]
```

### 5.2 Mathematical Formulation

#### 1. Coverage / Accuracy Score ($S_{cov}$)
วัดว่าผู้ใช้วาดครอบคลุมโครงสร้างตัวอักษรได้ครบถ้วนเพียงใด:
$$S_{cov} = \frac{\sum_{x,y} (U(x,y) \land T(x,y))}{\sum_{x,y} T(x,y)} \times 100$$
*(เมื่อ $U$ คือมาสก์ของผู้ใช้ที่มีการ Dilate ขยายขอบ 2-3px เพื่ออนุโลมความคลาดเคลื่อนเล็กน้อย และ $T$ คือมาสก์ตัวอักษรต้นแบบ)*

#### 2. Precision / Spill Penalty ($P_{spill}$)
วัดสัดส่วนเส้นที่วาดออกนอกเส้นโครงร่าง (การเลอะเทอะ/หลุดกรอบ):
$$P_{spill} = \frac{\sum_{x,y} (U(x,y) \land \neg T_{dilated}(x,y))}{\sum_{x,y} U(x,y)} \times 100$$

#### 3. Baseline Slope Deviation Penalty ($P_{slope}$) - *เฉพาะ Blank Mode*
คำนวณระนาบเส้นนอนของลายมือผ่านเส้นตรง Least Squares Fitting $y = mx + c$ ของพิกัดต่ำสุดของกลุ่มตัวอักษร:
$$\text{Angle} = |\arctan(m)| \times \frac{180}{\pi}$$
$$P_{slope} = \min(100, \text{Angle} \times 5)$$

#### 4. Final Weighted Score ($S_{final}$)
* **Trace Mode:**
  $$S_{final} = \max(0, \min(100, (S_{cov} \times 0.75) + ((100 - P_{spill}) \times 0.25)))$$
* **Blank Mode:**
  $$S_{final} = \max(0, \min(100, (S_{cov} \times 0.50) + ((100 - P_{spill}) \times 0.30) + ((100 - P_{slope}) \times 0.20)))$$

### 5.3 Rating Scale & Visual Feedback
* **90 – 100:** Master Penman (สีเขียวมรกต `#10B981`)
* **75 – 89:** Proficient (สีฟ้าน้ำทะเล `#0EA5E9`)
* **60 – 74:** Developing (สีเหลืองอำพัน `#F59E0B`)
* **< 60:** Needs Practice (สีแดงกุหลาบ `#EF4444`)

---

## 6. Curriculum & Exercise Database Structure

### 6.1 Data Schema (`src/types/curriculum.ts`)
```typescript
export type ExerciseCategory = 'alphabet' | 'combo' | 'word' | 'sentence';

export interface ExerciseItem {
  id: string;
  category: ExerciseCategory;
  text: string;
  subText?: string;
  instruction: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  guidelineHeight: number; // ความสูงเส้นบรรทัดที่เหมาะสม
  baselineOffset: number;
}
```

### 6.2 Exercise Curriculum Manifest (`src/data/exercises.ts`)
1. **Level 1: Single Alphabet (52 รายการ)**
   * Lowercase: `a` ถึง `z` (เน้นวงรี `a, d, g, q` และห่วงคล้อง `b, f, h, k, l`)
   * Uppercase: `A` ถึง `Z` (เน้นการตวัดเส้นนำแบบผู้ใหญ่)
2. **Level 2: Common Ligature Combos (30 รายการ)**
   * การเชื่อมพยัญชนะต้น: `th`, `ch`, `sh`, `wh`, `ph`, `st`, `br`, `cl`
   * การเชื่อมสระคู่: `ee`, `oo`, `ea`, `ai`, `ou`
   * คำต่อท้าย (Suffixes): `ing`, `tion`, `sion`, `ness`, `ment`, `able`, `ful`, `ly`, `ty`
3. **Level 3: Essential Words (40 รายการ)**
   * สั้น (3-4 ตัว): `the`, `and`, `flow`, `hand`, `mind`, `calm`
   * กลาง (5-7 ตัว): `rhythm`, `balance`, `cursive`, `quality`, `smooth`
   * ศัพท์ผู้ใหญ่: `signature`, `manuscript`, `sophisticated`
4. **Level 4: Full Sentences (20 รายการ)**
   * Pangrams:
     * *"The quick brown fox jumps over the lazy dog."*
     * *"Pack my box with five dozen liquor jugs."*
     * *"Sphinx of black quartz, judge my vow."*
   * Adult Literature Quotes:
     * *"Simplicity is the ultimate sophistication."*
     * *"A smooth sea never made a skilled sailor."*

---

## 7. Directory & Project Structure

```
cursive-craft/
├── assets/
│   ├── fonts/
│   │   ├── LearningCurvePro.otf
│   │   └── LearningCurvePro-Dashed.otf
│   └── icons/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── HandwritingCanvas.tsx     # Skia Canvas component
│   │   │   ├── GuidelineOverlay.tsx      # เส้นบรรทัด 4 เส้น
│   │   │   └── TracingGhost.tsx          # ตัวอักษรสีจาง/เส้นประ
│   │   ├── Common/
│   │   │   ├── HeaderBar.tsx
│   │   │   └── ToolButton.tsx
│   │   └── Evaluation/
│   │       ├── ScoreModal.tsx            # Popup ผลคะแนน & Grade
│   │       └── DiffHeatmapView.tsx       # แสดงจุดที่เขียนหลุดเส้น
│   ├── engine/
│   │   ├── strokeSmoother.ts             # Bézier & Spline algorithm
│   │   ├── maskGenerator.ts              # แปลง Path/Text เป็น Bitmap Buffer
│   │   ├── imageEvaluator.ts             # คำนวณ IoU, Spill, Penalty
│   │   └── baselineDetector.ts           # Linear Regression เช็กแนวราบ
│   ├── store/
│   │   ├── usePracticeStore.ts           # Zustand store เก็บสถานะปัจจุบัน
│   │   └── useHistoryStore.ts            # เก็บสถิติคะแนนย้อนหลัง
│   ├── data/
│   │   └── exercises.ts                  # คลังโจทย์ 4 ระดับ
│   ├── screens/
│   │   ├── PracticeScreen.tsx            # หน้าจอหลักสำหรับการเขียน
│   │   ├── CategorySelectScreen.tsx      # เลือกโหมด Alphabet/Combo/Word/Sentence
│   │   └── StatsScreen.tsx               # รายงานพัฒนาการ
│   └── types/
│       ├── canvas.ts
│       └── curriculum.ts
├── App.tsx                               # Root Entry Point
├── app.json                              # Expo Configuration
├── package.json
└── tsconfig.json
```

---

## 8. Step-by-Step Agent Implementation Tasks (Task Checklist)

AI Agent หรือ Developer สามารถดำเนินการตามคำสั่งเป็นลำดับขั้นตอน (Milestones) ดังต่อไปนี้:

### Task 1: Environment Initialization & Asset Setup
* [x] Initialise project: `npx create-expo-app CursiveCraft --template blank-typescript`
* [x] Install dependencies:
  ```bash
  npx expo install @shopify/react-native-skia react-native-gesture-handler expo-font zustand
  ```
* [x] สร้างโฟลเดอร์ `assets/fonts/` และนำไฟล์ `LearningCurvePro.otf` กับ `LearningCurvePro-Dashed.otf` เข้าไปวาง
* [x] ปรับแต่ง `app.json` กำหนด orientation เป็น `landscape` (เน้นการใช้งานบน iPad แนวนอน)

### Task 2: Drawing Engine with Apple Pencil Support (`HandwritingCanvas.tsx`)
* [x] Implement Skia Canvas รับ Event `TouchHandler` จาก React Native Skia
* [x] เขียนฟังก์ชัน `strokeSmoother.ts` ปรับเส้น Polyline สดให้เป็น Smooth Skia `Path`
* [x] เพิ่มฟังก์ชันจำแนก Apple Pencil (`touch.force > 0`) ป้องกันการลั่นจากฝ่ามือ
* [x] สร้างปุ่มควบคุมพื้นฐาน: **Undo**, **Clear Screen**, **Stroke Width Selector**

### Task 3: Guideline & Ghost Tracing Layer
* [x] สร้าง `GuidelineOverlay.tsx` วาดเส้น 4 เส้น (Top, Mid, Base, Bottom) โดยอิงความสูงสัมพัทธ์
* [x] ในโหมด Trace: เรนเดอร์ตัวหนังสือโจทย์ด้วย Skia `SkFont` โหลดจาก `LearningCurvePro-Dashed` ให้อยู่บนระนาบ Base Line อย่างแม่นยำ

### Task 4: Image Processing & Evaluation Engine
* [x] สร้าง `maskGenerator.ts`:
  * ฟังก์ชันสร้าง In-memory Offscreen Surface ขนาด $W \times H$
  * วาด Target Font ลงบน Surface -> ดึง Pixel Array (Alpha Channel)
  * วาด User Path ลงบน Surface -> ดึง Pixel Array (Alpha Channel)
* [x] สร้าง `imageEvaluator.ts`:
  * วนลูป Uint8Array เปรียบเทียบค่าความหนาแน่นพิกเซล
  * คำนวณค่า $S_{cov}$ (Coverage) และ $P_{spill}$ (Spill)
* [x] สร้าง `baselineDetector.ts` (สำหรับ Blank Mode):
  * สแกนหาพิกัด $Y$ ต่ำสุดของแต่ละกลุ่มตัวอักษรเพื่อหา Baseline Slope

### Task 5: Curriculum Dataset & Mode Switching
* [x] กรอกข้อมูล `src/data/exercises.ts` ให้ครบทั้ง 4 ระดับ (Alphabet, Combo, Word, Sentence)
* [x] ทำ Switcher สลับระหว่างโหมด **Trace Mode** และ **Blank Canvas Mode**
* [x] สร้าง Navigation ให้เลือกบทเรียนและเลื่อนไปยังคำถัดไปเมื่อได้คะแนนเกิน 75%

### Task 6: UI Polish & Feedback Modal
* [x] ออกแบบหน้าจอ Minimalist Paper Aesthetic (พื้นหลังโทนกระดาษถนอมสายตา `#F8FAFC` หรือ `#FDFBF7`)
* [x] สร้าง `ScoreModal.tsx` แสดงผลคะแนนแบบวงแหวนเปอร์เซ็นต์ พร้อมคำแนะนำ (Feedback text เช่น *"พยายามรักษาหางตัว y ให้อยู่ในแนว Descender"*)
* [x] บันทึกคะแนนลงใน Local Storage ด้วย Zustand + AsyncStorage

---

## 9. Verification & Acceptance Criteria

1. **Latency Test:** อัตราการดีเลย์ของการลาก Apple Pencil ต้องต่ำกว่า 16ms (ไม่รู้สึกหน่วงบน iPad 60Hz/120Hz)
2. **Palm Rejection Test:** วางฝ่ามือลงบนจอพร้อมกับเขียน เส้นต้องเกิดขึ้นเฉพาะจุดสัมผัสของ Apple Pencil เท่านั้น
3. **Evaluation Robustness:** 
   * การเขียนทับเส้นตรงจุดได้คะแนน > 90%
   * การเขียนเส้นขยุกขยิกหรือวงกลมทับได้คะแนน < 40%
   * การเขียนตัวอักษรอื่นที่ไม่ตรงโจทย์ได้คะแนน < 20%
4. **Offline Capability:** แอปพลิเคชันต้องทำงานได้อย่างสมบูรณ์บน Expo Go โดยไม่ต้องเชื่อมต่ออินเทอร์เน็ต