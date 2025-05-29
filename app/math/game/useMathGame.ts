import { useState, useEffect, useCallback } from 'react';
import { GameType, GAME_CONFIGS } from './types';

export interface Answer {
  value: number;
  isCorrect: boolean;
}

interface UseMathGameProps {
  gameType: GameType;
  onGameOver: (score: number) => void;
}

export const useMathGame = ({ gameType, onGameOver }: UseMathGameProps) => {
  const [numberOne, setNumberOne] = useState(0);
  const [numberTwo, setNumberTwo] = useState(0);
  const [result, setResult] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const config = GAME_CONFIGS[gameType];

  const generateIncorrectResult = useCallback((num1: number, num2: number, existingResults: number[] = []) => {
    const correct = config.operation(num1, num2);
    return config.generateIncorrectAnswer(num1, num2, correct, existingResults);
  }, [config]);

  const generateAnswers = useCallback((num1: number, num2: number) => {
    const correctResult = config.operation(num1, num2);
    const numAnswers = Math.min(2 + Math.floor(score / 5), 4);

    const answers: Answer[] = [
      { value: correctResult, isCorrect: true }
    ];

    const existingResults = [correctResult];

    // Generate incorrect answers
    for (let i = 1; i < numAnswers; i++) {
      const incorrectResult = generateIncorrectResult(num1, num2, existingResults);
      existingResults.push(incorrectResult);
      answers.push({ value: incorrectResult, isCorrect: false });
    }

    // Shuffle the answers
    return answers.sort(() => Math.random() - 0.5);
  }, [score, generateIncorrectResult, config]);

  const generateNewProblem = useCallback(() => {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    
    // For subtraction, ensure num1 >= num2 to always have positive results
    if (gameType === GameType.SUBTRACTION && num1 < num2) {
      [num1, num2] = [num2, num1]; // Swap numbers
    }
    
    setNumberOne(num1);
    setNumberTwo(num2);
    setResult(config.operation(num1, num2));
    setAnswers(generateAnswers(num1, num2));
    setTimeLeft(10);
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 300);
  }, [generateAnswers, config, gameType]);

  const handleCorrectAnswer = useCallback(() => {
    setScore(prev => prev + 1);
    // Award points based on remaining time (rounded to nearest integer)
    setPoints(prev => prev + Math.round(timeLeft));
    generateNewProblem();
  }, [generateNewProblem, timeLeft]);

  const handleIncorrectAnswer = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => {
      setGameOver(true);
      onGameOver(score);
    }, 500);
  }, [onGameOver, score]);

  // Timer effect
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          handleIncorrectAnswer();
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameOver, handleIncorrectAnswer]);

  // Initialize game
  useEffect(() => {
    generateNewProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    numberOne,
    numberTwo,
    result,
    answers,
    score,
    points,
    timeLeft,
    isBlinking,
    isShaking,
    gameOver,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    symbol: config.symbol,
  };
};
