export enum GameType {
  MULTIPLICATION = 'multiplication',
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  // Add more game types here in the future
}

type GameConfig = {
  operation: (a: number, b: number) => number;
  symbol: string;
  generateIncorrectAnswer: (a: number, b: number, correct: number, existing: number[]) => number;
};

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
      if (existing.includes(incorrect) || incorrect < 0) {
        return correct + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      }
      return incorrect;
    },
  },
};
