import type { ExerciseCategory, ExerciseItem } from '../types/curriculum';

// ---------------------------------------------------------
// Level 1: Single Alphabet (52 items: 26 lowercase + 26 uppercase)
// ---------------------------------------------------------
const LOWERCASE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const UPPERCASE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const level1Exercises: ExerciseItem[] = [
  ...LOWERCASE_ALPHABET.map((char) => ({
    id: `alpha-lower-${char}`,
    category: 'alphabet' as ExerciseCategory,
    text: char,
    subText: `Lowercase letter '${char}'`,
    instruction: `Trace the lowercase cursive letter '${char}'. Pay attention to smooth entrance and exit strokes.`,
    difficulty: 1 as const,
    guidelineHeight: 112,
    baselineOffset: 0,
  })),
  ...UPPERCASE_ALPHABET.map((char) => ({
    id: `alpha-upper-${char}`,
    category: 'alphabet' as ExerciseCategory,
    text: char,
    subText: `Uppercase letter '${char}'`,
    instruction: `Practice the capital cursive letter '${char}', maintaining proper height and graceful slant.`,
    difficulty: 2 as const,
    guidelineHeight: 112,
    baselineOffset: 0,
  })),
];

// ---------------------------------------------------------
// Level 2: Common Ligatures & Combos (30 items)
// ---------------------------------------------------------
const LIGATURE_COMBOS = [
  // Initial Consonants & Blends (13)
  { text: 'th', desc: 'Consonant blend: t into h' },
  { text: 'ch', desc: 'Consonant blend: c into h' },
  { text: 'sh', desc: 'Consonant blend: s into h' },
  { text: 'wh', desc: 'Consonant blend: w into h' },
  { text: 'ph', desc: 'Consonant blend: p into h' },
  { text: 'st', desc: 'Ligature: s connecting to t' },
  { text: 'br', desc: 'Blend: b into rolling r' },
  { text: 'cl', desc: 'Blend: c into tall loop l' },
  { text: 'fl', desc: 'Descending loop f into tall l' },
  { text: 'gl', desc: 'Descending g into tall l' },
  { text: 'pr', desc: 'Descender p into rolling r' },
  { text: 'tr', desc: 'Crossed t into r' },
  { text: 'qu', desc: 'Oval q into undercurve u' },

  // Vowel Pairs (8)
  { text: 'ee', desc: 'Double loop e to e' },
  { text: 'oo', desc: 'Double oval o to high connector o' },
  { text: 'ea', desc: 'Loop e into oval a' },
  { text: 'ai', desc: 'Oval a into dot-ready i' },
  { text: 'ou', desc: 'Oval o high connector into u' },
  { text: 'oi', desc: 'Oval o high connector into i' },
  { text: 'oy', desc: 'Oval o into descending tail y' },
  { text: 'oa', desc: 'Oval o high connector into oval a' },

  // Suffixes & Endings (9)
  { text: 'ing', desc: 'Common suffix: i-n-g' },
  { text: 'tion', desc: 'Flowing suffix: t-i-o-n' },
  { text: 'sion', desc: 'Smooth suffix: s-i-o-n' },
  { text: 'ness', desc: 'Ending ligature: n-e-s-s' },
  { text: 'ment', desc: 'Flowing suffix: m-e-n-t' },
  { text: 'able', desc: 'Loop suffix: a-b-l-e' },
  { text: 'ful', desc: 'Loop ending: f-u-l' },
  { text: 'ly', desc: 'Graceful ending: l-y' },
  { text: 'ty', desc: 'Ascender t into descending y' },
];

const level2Exercises: ExerciseItem[] = LIGATURE_COMBOS.map((combo, idx) => ({
  id: `combo-${idx + 1}-${combo.text}`,
  category: 'combo',
  text: combo.text,
  subText: combo.desc,
  instruction: `Focus on the smooth linking stroke between letters without lifting your pen.`,
  difficulty: 2,
  guidelineHeight: 112,
  baselineOffset: 0,
}));

// ---------------------------------------------------------
// Level 3: Essential Words (40 items)
// ---------------------------------------------------------
const ESSENTIAL_WORDS = [
  // Short Words (3-4 characters) - 14
  { word: 'the', cat: 'Short' },
  { word: 'and', cat: 'Short' },
  { word: 'flow', cat: 'Short' },
  { word: 'hand', cat: 'Short' },
  { word: 'mind', cat: 'Short' },
  { word: 'calm', cat: 'Short' },
  { word: 'pure', cat: 'Short' },
  { word: 'line', cat: 'Short' },
  { word: 'form', cat: 'Short' },
  { word: 'soul', cat: 'Short' },
  { word: 'time', cat: 'Short' },
  { word: 'warm', cat: 'Short' },
  { word: 'gentle', cat: 'Short' },
  { word: 'hope', cat: 'Short' },

  // Medium Words (5-7 characters) - 14
  { word: 'rhythm', cat: 'Medium' },
  { word: 'balance', cat: 'Medium' },
  { word: 'cursive', cat: 'Medium' },
  { word: 'quality', cat: 'Medium' },
  { word: 'smooth', cat: 'Medium' },
  { word: 'beauty', cat: 'Medium' },
  { word: 'elegance', cat: 'Medium' },
  { word: 'freedom', cat: 'Medium' },
  { word: 'clarity', cat: 'Medium' },
  { word: 'nature', cat: 'Medium' },
  { word: 'serene', cat: 'Medium' },
  { word: 'poetic', cat: 'Medium' },
  { word: 'artist', cat: 'Medium' },
  { word: 'journey', cat: 'Medium' },

  // Advanced / Adult Penmanship - 12
  { word: 'signature', cat: 'Adult' },
  { word: 'manuscript', cat: 'Adult' },
  { word: 'sophisticated', cat: 'Adult' },
  { word: 'calligraphy', cat: 'Adult' },
  { word: 'penmanship', cat: 'Adult' },
  { word: 'flourish', cat: 'Adult' },
  { word: 'composition', cat: 'Adult' },
  { word: 'inspiration', cat: 'Adult' },
  { word: 'harmony', cat: 'Adult' },
  { word: 'perfection', cat: 'Adult' },
  { word: 'masterpiece', cat: 'Adult' },
  { word: 'expressive', cat: 'Adult' },
];

const level3Exercises: ExerciseItem[] = ESSENTIAL_WORDS.map((item, idx) => ({
  id: `word-${idx + 1}-${item.word}`,
  category: 'word',
  text: item.word,
  subText: `${item.cat} Cursive Vocabulary`,
  instruction: `Maintain even letter spacing and keep the baseline resting steadily on the base guideline.`,
  difficulty: item.cat === 'Short' ? 2 : item.cat === 'Medium' ? 3 : 4,
  guidelineHeight: 112,
  baselineOffset: 0,
}));

// ---------------------------------------------------------
// Level 4: Full Sentences (20 items: 10 Pangrams + 10 Quotes)
// ---------------------------------------------------------
const FULL_SENTENCES = [
  // Pangrams (10)
  {
    text: 'The quick brown fox jumps over the lazy dog.',
    author: 'Classic English Pangram',
  },
  {
    text: 'Pack my box with five dozen liquor jugs.',
    author: 'Compact Alphabet Pangram',
  },
  {
    text: 'Sphinx of black quartz, judge my vow.',
    author: 'Poetic Pangram',
  },
  {
    text: 'How vexingly quick daft zebras jump!',
    author: 'Alphabet Pangram',
  },
  {
    text: 'Bright vixens jump; dozy fowl quack.',
    author: 'Playful Pangram',
  },
  {
    text: 'Jackdaws love my big sphinx of quartz.',
    author: 'Traditional Pangram',
  },
  {
    text: 'The five boxing wizards jump quickly.',
    author: 'Whimsical Pangram',
  },
  {
    text: 'Crazy Fredrick bought many very exquisite opal jewels.',
    author: 'Flowing Pangram',
  },
  {
    text: 'We promptly judged antique ivory buckles for the next prize.',
    author: 'Formal Pangram',
  },
  {
    text: 'Jaded zombies quintessentially vex my capering freak.',
    author: 'Challenging Pangram',
  },

  // Adult Literature Quotes (10)
  {
    text: 'Simplicity is the ultimate sophistication.',
    author: 'Leonardo da Vinci',
  },
  {
    text: 'A smooth sea never made a skilled sailor.',
    author: 'Franklin D. Roosevelt',
  },
  {
    text: 'The pen is the tongue of the mind.',
    author: 'Miguel de Cervantes',
  },
  {
    text: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein',
  },
  {
    text: 'Art is not what you see, but what you make others see.',
    author: 'Edgar Degas',
  },
  {
    text: 'Patience and persistence have a magical effect.',
    author: 'John Quincy Adams',
  },
  {
    text: 'The rhythm of cursive handwriting brings peace to the restless soul.',
    author: 'Penman Aphorism',
  },
  {
    text: 'Every stroke tells a story of intention and grace.',
    author: 'Calligrapher Note',
  },
  {
    text: 'Quiet the mind and let the fountain pen dance across the paper.',
    author: 'Mindful Writing',
  },
  {
    text: 'True elegance consists in simplicity and genuine thought.',
    author: 'Classic Maxim',
  },
];

const level4Exercises: ExerciseItem[] = FULL_SENTENCES.map((item, idx) => ({
  id: `sentence-${idx + 1}`,
  category: 'sentence',
  text: item.text,
  subText: item.author,
  instruction: `Write steadily across the page, balancing uniform slant, fluid ligatures, and baseline posture.`,
  difficulty: (idx < 10 ? 4 : 5) as 4 | 5,
  guidelineHeight: 112,
  baselineOffset: 0,
}));

// Combined 142 exercises
export const ALL_EXERCISES: ExerciseItem[] = [
  ...level1Exercises,
  ...level2Exercises,
  ...level3Exercises,
  ...level4Exercises,
];

// Helper functions
export function getExercisesByCategory(category: ExerciseCategory): ExerciseItem[] {
  return ALL_EXERCISES.filter((ex) => ex.category === category);
}

export function getExerciseById(id: string): ExerciseItem | undefined {
  return ALL_EXERCISES.find((ex) => ex.id === id);
}

export function getNextExercise(currentId: string): ExerciseItem {
  const currentIndex = ALL_EXERCISES.findIndex((ex) => ex.id === currentId);
  if (currentIndex === -1 || currentIndex === ALL_EXERCISES.length - 1) {
    return ALL_EXERCISES[0]; // Loop back to beginning
  }
  return ALL_EXERCISES[currentIndex + 1];
}

export function getPrevExercise(currentId: string): ExerciseItem {
  const currentIndex = ALL_EXERCISES.findIndex((ex) => ex.id === currentId);
  if (currentIndex <= 0) {
    return ALL_EXERCISES[ALL_EXERCISES.length - 1]; // Loop to end
  }
  return ALL_EXERCISES[currentIndex - 1];
}
