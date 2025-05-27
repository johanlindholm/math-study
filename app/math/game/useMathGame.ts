import { useState, useEffect, useCallback } from 'react';
import { GameType, Answer } from './types';

// Re-export the Answer type
export type { Answer };

interface MathGameProps {
  gameType: GameType;
  onGameOver?: (finalScore: number) => void;
  timeLimit?: number;
}

export interface MathGameState {
  numberOne: number;
  numberTwo: number;
  answers: Answer[];
  score: number;
  correctAnswers: number;
  timeLeft: number;
  isBlinking: boolean;
  isShaking: boolean;
  symbol: string;
  handleCorrectAnswer: () => void;
  handleIncorrectAnswer: () => void;
  lastPointsEarned: number;
}

export function useMathGame({ 
  gameType, 
  onGameOver,
  timeLimit = 10
}: MathGameProps): MathGameState {
  const [numberOne, setNumberOne] = useState(Math.floor(Math.random() * 10) + 1);
  const [numberTwo, setNumberTwo] = useState(Math.floor(Math.random() * 10) + 1);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);

  // Define the symbol based on the game type
  const symbol = gameType === GameType.ADDITION 
    ? '+' 
    : gameType === GameType.SUBTRACTION 
      ? '-' 
      : '×';

  // Generate a correct answer based on the game type
  const generateCorrectAnswer = useCallback(() => {
    if (gameType === GameType.ADDITION) {
      return numberOne + numberTwo;
    } else if (gameType === GameType.SUBTRACTION) {
      return numberOne - numberTwo;
    } else {
      return numberOne * numberTwo;
    }
  }, [gameType, numberOne, numberTwo]);

  // Generate a list of answers
  const generateAnswers = useCallback(() => {
    const correctAnswer = generateCorrectAnswer();
    const incorrectAnswers: number[] = [];
    
    // Generate 3 incorrect answers
    while (incorrectAnswers.length < 3) {
      let incorrectAnswer;
      
      if (gameType === GameType.ADDITION) {
        incorrectAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
        if (Math.random() > 0.5) {
          incorrectAnswer = correctAnswer - Math.floor(Math.random() * 5) - 1;
        }
      } else if (gameType === GameType.SUBTRACTION) {
        incorrectAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
        if (Math.random() > 0.5) {
          incorrectAnswer = correctAnswer - Math.floor(Math.random() * 5) - 1;
        }
      } else {
        incorrectAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
        if (Math.random() > 0.5) {
          incorrectAnswer = correctAnswer - Math.floor(Math.random() * 5) - 1;
        }
      }
      
      // Ensure the answer is positive and not a duplicate
      if (incorrectAnswer > 0 && !incorrectAnswers.includes(incorrectAnswer) && incorrectAnswer !== correctAnswer) {
        incorrectAnswers.push(incorrectAnswer);
      }
    }
    
    // Combine all answers and shuffle them
    const allAnswers: Answer[] = [
      { value: correctAnswer, isCorrect: true },
      ...incorrectAnswers.map(value => ({ value, isCorrect: false }))
    ];
    
    // Shuffle the answers
    return allAnswers.sort(() => Math.random() - 0.5);
  }, [gameType, generateCorrectAnswer]);

  const [answers, setAnswers] = useState<Answer[]>(generateAnswers());

  // Generate a new problem
  const generateNewProblem = useCallback(() => {
    setIsBlinking(true);
    
    setTimeout(() => {
      let newNumberOne, newNumberTwo;
      
      if (gameType === GameType.SUBTRACTION) {
        newNumberOne = Math.floor(Math.random() * 10) + 5; // Higher number to avoid negative results
        newNumberTwo = Math.floor(Math.random() * 5) + 1;  // Lower number
      } else {
        newNumberOne = Math.floor(Math.random() * 10) + 1;
        newNumberTwo = Math.floor(Math.random() * 10) + 1;
      }
      
      setNumberOne(newNumberOne);
      setNumberTwo(newNumberTwo);
      setIsBlinking(false);
    }, 300);
    
    setTimeout(() => {
      setAnswers(generateAnswers());
    }, 300);
  }, [gameType, generateAnswers]);

  // Initialize the game
  useEffect(() => {
    generateNewProblem();
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(timeLimit);
  }, [gameType, generateNewProblem, timeLimit]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onGameOver?.(score);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [score, onGameOver]);

  // Handle correct answer
  const handleCorrectAnswer = useCallback(() => {
    // Calculate points based on time left
    const pointsEarned = Math.max(1, Math.round(timeLeft));
    setLastPointsEarned(pointsEarned);
    
    // Update score and stats
    setScore(prev => prev + pointsEarned);
    setCorrectAnswers(prev => prev + 1);
    
    // Reset timer
    setTimeLeft(timeLimit);
    
    // Generate a new problem
    generateNewProblem();
  }, [timeLeft, timeLimit, generateNewProblem]);

  // Handle incorrect answer
  const handleIncorrectAnswer = useCallback(() => {
    setIsShaking(true);
    
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  }, []);

  return {
    numberOne,
    numberTwo,
    answers,
    score,
    correctAnswers,
    timeLeft,
    isBlinking,
    isShaking,
    symbol,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    lastPointsEarned
  };
}