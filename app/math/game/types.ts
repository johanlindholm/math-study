export enum GameType {
  MULTIPLICATION = 'multiplication',
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction'
}

export interface Answer {
  value: string | number;
  isCorrect: boolean;
}