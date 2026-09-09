export type ExerciseCategory = 'alphabet' | 'combo' | 'word' | 'sentence';

export interface ExerciseItem {
  id: string;
  category: ExerciseCategory;
  text: string;
  subText?: string;
  instruction: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  guidelineHeight: number; // Suggested guideline height in px
  baselineOffset: number;
}

export interface CategoryMeta {
  id: ExerciseCategory;
  level: number;
  title: string;
  subtitle: string;
  icon: string;
  totalCount: number;
}

export const CATEGORY_METAS: CategoryMeta[] = [
  {
    id: 'alphabet',
    level: 1,
    title: 'Single Alphabet',
    subtitle: '52 Upper & Lowercase Letters',
    icon: '🔤',
    totalCount: 52,
  },
  {
    id: 'combo',
    level: 2,
    title: 'Ligature Combos',
    subtitle: '30 Common Letter Connections',
    icon: '🔗',
    totalCount: 30,
  },
  {
    id: 'word',
    level: 3,
    title: 'Essential Words',
    subtitle: '40 Short to Advanced Vocabulary',
    icon: '📖',
    totalCount: 40,
  },
  {
    id: 'sentence',
    level: 4,
    title: 'Full Sentences',
    subtitle: '20 Pangrams & Literature Quotes',
    icon: '✍️',
    totalCount: 20,
  },
];
