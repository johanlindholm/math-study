import { renderHook, act, waitFor } from '@testing-library/react';
import { useMathGame } from '../useMathGame';
import { GameType } from '../types';

// Mock setTimeout and setInterval
jest.useFakeTimers();

describe('useMathGame', () => {
  const mockOnGameOver = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // Reset the random number generator for consistent tests
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      expect(result.current.score).toBe(0);
      expect(result.current.points).toBe(0);
      expect(result.current.timeLeft).toBe(10);
      expect(result.current.gameOver).toBe(false);
      expect(result.current.isShaking).toBe(false);
      expect(result.current.symbol).toBe('+');
    });

    it('should generate a problem on initialization', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.MULTIPLICATION, onGameOver: mockOnGameOver })
      );

      expect(result.current.numberOne).toBeGreaterThan(0);
      expect(result.current.numberTwo).toBeGreaterThan(0);
      expect(result.current.result).toBe(result.current.numberOne * result.current.numberTwo);
      expect(result.current.answers.length).toBeGreaterThan(0);
    });

    it('should set correct symbol for each game type', () => {
      const { result: multiplicationResult } = renderHook(() => 
        useMathGame({ gameType: GameType.MULTIPLICATION, onGameOver: mockOnGameOver })
      );
      expect(multiplicationResult.current.symbol).toBe('×');

      const { result: additionResult } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );
      expect(additionResult.current.symbol).toBe('+');

      const { result: subtractionResult } = renderHook(() => 
        useMathGame({ gameType: GameType.SUBTRACTION, onGameOver: mockOnGameOver })
      );
      expect(subtractionResult.current.symbol).toBe('-');
    });
  });

  describe('Answer Generation', () => {
    it('should generate correct number of answers based on score', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      // Initial: score 0-4 = 2 answers
      expect(result.current.answers.length).toBe(2);

      // Simulate score increase to 4 (still 2 answers)
      act(() => {
        for (let i = 0; i < 4; i++) {
          result.current.handleCorrectAnswer();
        }
      });
      expect(result.current.score).toBe(4);
      expect(result.current.answers.length).toBe(2);

      // One more correct answer to reach score 5 (should now have 3 answers)
      act(() => {
        result.current.handleCorrectAnswer();
      });
      expect(result.current.score).toBe(5);
      expect(result.current.answers.length).toBe(3);

      // Simulate score increase to 9 (still 3 answers)
      act(() => {
        for (let i = 0; i < 4; i++) {
          result.current.handleCorrectAnswer();
        }
      });
      expect(result.current.score).toBe(9);
      expect(result.current.answers.length).toBe(3);

      // One more correct answer to reach score 10 (should now have 4 answers)
      act(() => {
        result.current.handleCorrectAnswer();
      });
      expect(result.current.score).toBe(10);
      expect(result.current.answers.length).toBe(4);
    });

    it('should always include exactly one correct answer', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      const correctAnswers = result.current.answers.filter(answer => answer.isCorrect);
      expect(correctAnswers.length).toBe(1);
      expect(correctAnswers[0].value).toBe(result.current.result);
    });

    it('should generate unique answer values', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.MULTIPLICATION, onGameOver: mockOnGameOver })
      );

      const answerValues = result.current.answers.map(answer => answer.value);
      const uniqueValues = new Set(answerValues);
      expect(uniqueValues.size).toBe(answerValues.length);
    });
  });

  describe('Subtraction Game', () => {
    it('should ensure first number is greater than or equal to second number', () => {
      // Mock random to generate num1 < num2 initially
      jest.spyOn(global.Math, 'random')
        .mockReturnValueOnce(0.2) // num1 = 3
        .mockReturnValueOnce(0.8) // num2 = 9
        .mockReturnValue(0.5);

      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.SUBTRACTION, onGameOver: mockOnGameOver })
      );

      // Numbers should be swapped so num1 >= num2
      expect(result.current.numberOne).toBeGreaterThanOrEqual(result.current.numberTwo);
      expect(result.current.result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Timer Functionality', () => {
    it('should decrease timer by 0.1 every 100ms', async () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      expect(result.current.timeLeft).toBe(10);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.timeLeft).toBe(9.9);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.timeLeft).toBe(9.8);
    });

    it('should trigger game over when timer reaches 0', async () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      act(() => {
        // Advance timer to almost 0
        jest.advanceTimersByTime(9900);
      });

      expect(result.current.timeLeft).toBeCloseTo(0.1);
      expect(result.current.gameOver).toBe(false);

      act(() => {
        // Final tick to 0
        jest.advanceTimersByTime(100);
      });

      // Wait for shake animation
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.gameOver).toBe(true);
      expect(mockOnGameOver).toHaveBeenCalledWith(0, 0); // score, points
    });

    it('should stop timer when game is over', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      act(() => {
        result.current.handleIncorrectAnswer();
        jest.advanceTimersByTime(500); // Wait for shake animation
      });

      const timeLeftAfterGameOver = result.current.timeLeft;

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeLeft).toBe(timeLeftAfterGameOver);
    });
  });

  describe('Answer Handling', () => {
    it('should increase score and generate new problem on correct answer', () => {
      // Use a seeded random to ensure different numbers are generated
      let callCount = 0;
      jest.spyOn(global.Math, 'random').mockImplementation(() => {
        callCount++;
        return (callCount % 10) / 10; // Cycles through 0.1, 0.2, 0.3, etc.
      });

      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.MULTIPLICATION, onGameOver: mockOnGameOver })
      );

      const initialScore = result.current.score;
      const initialNumbers = {
        num1: result.current.numberOne,
        num2: result.current.numberTwo
      };

      act(() => {
        result.current.handleCorrectAnswer();
      });

      expect(result.current.score).toBe(initialScore + 1);
      // Should generate new problem
      expect(
        result.current.numberOne !== initialNumbers.num1 || 
        result.current.numberTwo !== initialNumbers.num2
      ).toBe(true);
      expect(result.current.timeLeft).toBe(10); // Timer reset
    });

    it('should trigger shake animation and game over on incorrect answer', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      const finalScore = 5;
      // Simulate some correct answers first
      for (let i = 0; i < finalScore; i++) {
        act(() => {
          result.current.handleCorrectAnswer();
        });
      }

      act(() => {
        result.current.handleIncorrectAnswer();
      });

      expect(result.current.isShaking).toBe(true);
      expect(result.current.gameOver).toBe(false); // Not yet, waiting for animation

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.gameOver).toBe(true);
      expect(mockOnGameOver).toHaveBeenCalledWith(finalScore, expect.any(Number)); // score, points
    });
  });

  describe('Visual Effects', () => {
    it('should trigger blink animation when generating new problem', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      // Initially blinking from initialization
      expect(result.current.isBlinking).toBe(true);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.isBlinking).toBe(false);

      // Trigger new problem
      act(() => {
        result.current.handleCorrectAnswer();
      });

      expect(result.current.isBlinking).toBe(true);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.isBlinking).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid correct answers', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.MULTIPLICATION, onGameOver: mockOnGameOver })
      );

      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.handleCorrectAnswer();
        });
      }

      expect(result.current.score).toBe(10);
      expect(result.current.gameOver).toBe(false);
    });

    it('should properly handle game over state', () => {
      const { result } = renderHook(() => 
        useMathGame({ gameType: GameType.ADDITION, onGameOver: mockOnGameOver })
      );

      const initialScore = 3;
      // Get some score first
      for (let i = 0; i < initialScore; i++) {
        act(() => {
          result.current.handleCorrectAnswer();
        });
      }

      expect(result.current.score).toBe(initialScore);
      expect(result.current.gameOver).toBe(false);

      // Trigger game over
      act(() => {
        result.current.handleIncorrectAnswer();
        jest.advanceTimersByTime(500);
      });

      expect(result.current.gameOver).toBe(true);
      expect(mockOnGameOver).toHaveBeenCalledWith(initialScore, expect.any(Number)); // score, points
    });
  });
});