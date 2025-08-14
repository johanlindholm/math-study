import { useState, useEffect, useCallback } from 'react';
import { GameType, GAME_CONFIGS, getCurrentLevel, getDifficultyForLevel, CustomGameConfig } from './types';

export interface Answer {
  value: number;
  isCorrect: boolean;
}

interface UseMathGameProps {
  gameType: GameType;
  onGameOver: (score: number, points: number) => void;
  customConfig?: Partial<CustomGameConfig>;
}

export const useMathGame = ({ gameType, onGameOver, customConfig }: UseMathGameProps) => {
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
  const [lives, setLives] = useState(3);
  const [showCorrect, setShowCorrect] = useState(false);

  const config = GAME_CONFIGS[gameType];

  const generateIncorrectResult = useCallback((num1: number, num2: number, existingResults: number[] = []) => {
    const correct = config.operation(num1, num2);
    return config.generateIncorrectAnswer(num1, num2, correct, existingResults);
  }, [config]);

  const generateAnswers = useCallback((num1: number, num2: number, currentScore: number) => {
    const correctResult = config.operation(num1, num2);
    
    // Use custom numAnswers if provided, otherwise use score-based progression
    let numAnswers: number;
    if (customConfig && customConfig[gameType] && 'numAnswers' in customConfig[gameType]!) {
      const customNumAnswers = (customConfig[gameType] as any).numAnswers;
      numAnswers = Math.max(2, Math.min(4, customNumAnswers || 2)); // Clamp between 2-4
    } else {
      numAnswers = Math.min(2 + Math.floor(currentScore / 5), 4);
    }

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
  }, [generateIncorrectResult, config, customConfig, gameType]);

  const generateNewProblem = useCallback((currentScore: number = score) => {
    let difficulty: any;
    
    // Use custom config if provided, otherwise use level-based difficulty
    if (customConfig && customConfig[gameType]) {
      difficulty = customConfig[gameType];
    } else {
      const currentLevel = getCurrentLevel(currentScore);
      difficulty = getDifficultyForLevel(currentLevel, gameType);
    }
    
    let num1 = 0;
    let num2 = 0;
    
    switch (gameType) {
      case GameType.MULTIPLICATION: {
        const multiDifficulty = difficulty as { tables: number[]; multiplierRange?: { min: number; max: number } };
        // Pick a random table from available ones
        const table = multiDifficulty.tables[Math.floor(Math.random() * multiDifficulty.tables.length)];
        num1 = table;
        // Use custom multiplier range if provided, otherwise default to 1-10
        const range = multiDifficulty.multiplierRange || { min: 1, max: 10 };
        num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        break;
      }
      
      case GameType.ADDITION: {
        const addDifficulty = difficulty as { range: { min: number; max: number } };
        const range = addDifficulty.range.max - addDifficulty.range.min;
        num1 = Math.floor(Math.random() * range) + addDifficulty.range.min;
        num2 = Math.floor(Math.random() * range) + addDifficulty.range.min;
        break;
      }
      
      case GameType.SUBTRACTION: {
        const subDifficulty = difficulty as { range: { min: number; max: number }; allowNegative: boolean };
        const range = subDifficulty.range.max - subDifficulty.range.min;
        num1 = Math.floor(Math.random() * range) + subDifficulty.range.min;
        num2 = Math.floor(Math.random() * range) + subDifficulty.range.min;
        
        // If negative results aren't allowed, ensure num1 >= num2
        if (!subDifficulty.allowNegative && num1 < num2) {
          [num1, num2] = [num2, num1]; // Swap numbers
        }
        break;
      }

      case GameType.DIVISION: {
        const divDifficulty = difficulty as {
        dividendRange: { min: number; max: number };
        divisorRange: { min: number; max: number };
        };

        // Choose divisor (num2) first
        num2 = Math.floor(Math.random() * (divDifficulty.divisorRange.max - divDifficulty.divisorRange.min + 1)) + divDifficulty.divisorRange.min;

        // Generate a dividend (num1) that is divisible by num2
        const quotientMin = Math.floor(divDifficulty.dividendRange.min / num2);
        const quotientMax = Math.floor(divDifficulty.dividendRange.max / num2);

        // Ensure quotient is at least 1 (avoid quotient = 0)
        const quotient = Math.max(1, Math.floor(Math.random() * (quotientMax - quotientMin + 1)) + quotientMin);
        num1 = quotient * num2;
        break;
      }
    }
    
    setNumberOne(num1);
    setNumberTwo(num2);
    setResult(config.operation(num1, num2));
    setAnswers(generateAnswers(num1, num2, currentScore));
    setTimeLeft(10);
    setShowCorrect(false);
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 300);
  }, [generateAnswers, config, gameType, score, customConfig]);

  const handleCorrectAnswer = useCallback(() => {
    setScore(prev => {
      const newScore = prev + 1;
      // Generate new problem with updated score
      generateNewProblem(newScore);
      return newScore;
    });
    // Award points based on remaining time (rounded to nearest integer)
    setPoints(prev => prev + Math.round(timeLeft));
  }, [generateNewProblem, timeLeft]);

  const handleIncorrectAnswer = useCallback(() => {
    setIsShaking(true);
    setShowCorrect(true);
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setTimeout(() => {
          setGameOver(true);
          onGameOver(score, points);
        }, 1500);
      } else {
        // Continue game with new problem after showing correct answer
        setTimeout(() => {
          setScore(currentScore => {
            generateNewProblem(currentScore);
            return currentScore;
          });
          setIsShaking(false);
        }, 1500);
      }
      return newLives;
    });
  }, [onGameOver, score, points, generateNewProblem]);

  // Timer effect
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Number((prev - 0.1).toFixed(1));
        if (newTime <= 0) {
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameOver]);

  // Handle timeout separately
  useEffect(() => {
    if (timeLeft === 0 && !gameOver) {
      handleIncorrectAnswer();
    }
  }, [timeLeft, gameOver, handleIncorrectAnswer]);

  // Initialize game
  useEffect(() => {
    generateNewProblem(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customConfig]); // Add customConfig as dependency

  const level = customConfig ? 1 : getCurrentLevel(score); // Custom games stay at level 1

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
    lives,
    showCorrect,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    symbol: config.symbol,
    level,
  };
};
