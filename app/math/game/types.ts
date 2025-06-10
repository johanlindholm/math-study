export enum GameType {
  MULTIPLICATION = 'multiplication',
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  DIVISION = 'division',
  // Add more game types here in the future
}

export interface LevelConfig {
  level: number;
  minScore: number;
  maxScore?: number;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, minScore: 0, maxScore: 4 },
  { level: 2, minScore: 5, maxScore: 9 },
  { level: 3, minScore: 10, maxScore: 19 },
  { level: 4, minScore: 20, maxScore: 34 },
  { level: 5, minScore: 35, maxScore: 54 },
  { level: 6, minScore: 55, maxScore: 79 },
  { level: 7, minScore: 80, maxScore: 109 },
  { level: 8, minScore: 110, maxScore: 149 },
  { level: 9, minScore: 150, maxScore: 199 },
  { level: 10, minScore: 200 },
];

export function getCurrentLevel(score: number): number {
  const config = LEVEL_CONFIGS.find(
    (config) => score >= config.minScore && (config.maxScore === undefined || score <= config.maxScore)
  );
  return config?.level ?? 1;
}

// Difficulty settings for each game type
export interface DifficultyRange {
  min: number;
  max: number;
}

export interface MultiplicationDifficulty {
  tables: number[]; // Which multiplication tables to use
}

export interface SubtractionDifficulty {
  range: DifficultyRange;
  allowNegative: boolean; // Whether to allow negative results
}

export interface AdditionDifficulty {
  range: DifficultyRange;
}

export interface DivisionDifficulty {
  dividendRange: DifficultyRange;
  divisorRange: DifficultyRange;
}

export type GameDifficulty = {
  [GameType.MULTIPLICATION]: MultiplicationDifficulty;
  [GameType.ADDITION]: AdditionDifficulty;
  [GameType.SUBTRACTION]: SubtractionDifficulty;
  [GameType.DIVISION]: DivisionDifficulty;
};

// Difficulty progression for each level and game type
export const DIFFICULTY_BY_LEVEL: Record<number, GameDifficulty> = {
  1: {
    [GameType.MULTIPLICATION]: { tables: [1, 2, 3, 4, 5] },
    [GameType.ADDITION]: { range: { min: 0, max: 10 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 10 }, allowNegative: false },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 25 }, divisorRange: { min: 1, max: 5 },}
  },
  2: {
    [GameType.MULTIPLICATION]: { tables: [1, 2, 3, 4, 5] },
    [GameType.ADDITION]: { range: { min: 0, max: 10 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 10 }, allowNegative: false },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 25 }, divisorRange: { min: 1, max: 5 },}
  },
  3: {
    [GameType.MULTIPLICATION]: { tables: [1, 2, 3, 4, 5, 6] },
    [GameType.ADDITION]: { range: { min: 0, max: 20 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 15 }, allowNegative: false },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 25 }, divisorRange: { min: 1, max: 5 },}
  },
  4: {
    [GameType.MULTIPLICATION]: { tables: [1, 2, 3, 4, 5, 6, 7] },
    [GameType.ADDITION]: { range: { min: 0, max: 30 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 20 }, allowNegative: false },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 25 }, divisorRange: { min: 1, max: 5 },}
  },
  5: {
    [GameType.MULTIPLICATION]: { tables: [1, 2, 3, 4, 5, 6, 7, 8] },
    [GameType.ADDITION]: { range: { min: 0, max: 40 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 30 }, allowNegative: false },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 45 }, divisorRange: { min: 1, max: 9 },}
  },
  6: {
    [GameType.MULTIPLICATION]: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    [GameType.ADDITION]: { range: { min: 0, max: 50 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 40 }, allowNegative: true },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 54 }, divisorRange: { min: 1, max: 9 },}
  },
  7: {
    [GameType.MULTIPLICATION]: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    [GameType.ADDITION]: { range: { min: 0, max: 75 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 50 }, allowNegative: true },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 63 }, divisorRange: { min: 1, max: 9 },}
  },
  8: {
    [GameType.MULTIPLICATION]: { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    [GameType.ADDITION]: { range: { min: 0, max: 100 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 75 }, allowNegative: true },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 72 }, divisorRange: { min: 1, max: 9 },}
  },
  9: {
    [GameType.MULTIPLICATION]: { tables: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    [GameType.ADDITION]: { range: { min: 10, max: 150 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 100 }, allowNegative: true },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 81 }, divisorRange: { min: 1, max: 9 },}
  },
  10: {
    [GameType.MULTIPLICATION]: { tables: [4, 5, 6, 7, 8, 9, 10, 11, 12] },
    [GameType.ADDITION]: { range: { min: 20, max: 200 } },
    [GameType.SUBTRACTION]: { range: { min: 0, max: 150 }, allowNegative: true },
    [GameType.DIVISION]: { dividendRange: { min: 1, max: 100 }, divisorRange: { min: 1, max: 9 },}
  },
};

export function getDifficultyForLevel(level: number, gameType: GameType): GameDifficulty[GameType] {
  const difficulty = DIFFICULTY_BY_LEVEL[level] || DIFFICULTY_BY_LEVEL[10];
  return difficulty[gameType];
}

type GameConfig = {
  operation: (a: number, b: number) => number;
  symbol: string;
  generateIncorrectAnswer: (a: number, b: number, correct: number, existing: number[]) => number;
};

// Constant for fallback offset when all other offsets are taken
const FALLBACK_OFFSET = 6;

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  [GameType.MULTIPLICATION]: {
    operation: (a, b) => a * b,
    symbol: '×',
    generateIncorrectAnswer: (a, b, correct, existing) => {
      const modifyFirst = Math.random() < 0.5;
      let offset = Math.floor(Math.random() * 4) - 2;
      if (offset === 0) offset = 1;

      let incorrect = modifyFirst ? (a + offset) * b : a * (b + offset);
      if (incorrect === correct || existing.includes(incorrect)) {
        return incorrect + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      }
      return incorrect;
    },
  },
  [GameType.ADDITION]: {
    operation: (a, b) => a + b,
    symbol: '+',
    generateIncorrectAnswer: (a, b, correct, existing) => {
      let offset = Math.floor(Math.random() * 5) + 1; // 1-5
      if (Math.random() < 0.5) offset *= -1;
      let incorrect = correct + offset;
      if (existing.includes(incorrect) || incorrect < 0) {
        return correct + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      }
      return incorrect;
    },
  },
  [GameType.SUBTRACTION]: {
    operation: (a, b) => a - b,
    symbol: '-',
    generateIncorrectAnswer: (a, b, correct, existing) => {
      let offset = Math.floor(Math.random() * 5) + 1; // 1-5
      if (Math.random() < 0.5) offset *= -1;
      let incorrect = correct + offset;
      if (existing.includes(incorrect)) {
        // Generate a different offset to avoid duplicates
        const offsets = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].filter(o => !existing.includes(correct + o));
        if (offsets.length > 0) {
          return correct + offsets[Math.floor(Math.random() * offsets.length)];
        }
        // Fallback: use larger offset
        return correct + (Math.random() < 0.5 ? FALLBACK_OFFSET : -FALLBACK_OFFSET);
      }
      return incorrect;
    },
  },
  [GameType.DIVISION]: {
    operation: (a, b) => Math.floor(a / b),
    symbol: '÷',
    generateIncorrectAnswer: (a, b, correct, existing) => {
      let offset = Math.floor(Math.random() * 5) + 1;
      if (Math.random() < 0.5) offset *= -1;
      let incorrect = correct + offset;

      // Generate a different offset to avoid duplicates or negative values
      if (existing.includes(incorrect) || incorrect < 0) {
        const offsets = [-3, -2, -1, 1, 2, 3].filter((o) => !existing.includes(correct + o) && correct + o >= 0);
        if (offsets.length > 0) {
          return correct + offsets[Math.floor(Math.random() * offsets.length)];
        }
        // Fallback
        return (
          correct + (Math.random() < 0.5 ? FALLBACK_OFFSET : -FALLBACK_OFFSET)
        );
      }
      return incorrect;
    },
  },
};
