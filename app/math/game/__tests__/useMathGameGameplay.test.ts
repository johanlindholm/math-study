import { renderHook, act } from '@testing-library/react';
import { useMathGame } from '../useMathGame';
import { GameType } from '../types';

// Mock the timer to control timing in tests
jest.useFakeTimers();

describe('useMathGame gameplay simulation', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should play a full multiplication game with correct answers', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.MULTIPLICATION]: {
        tables: [2, 3],
        multiplierRange: { min: 1, max: 5 },
        numAnswers: 3
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.MULTIPLICATION,
        onGameOver,
        customConfig,
      })
    );

    // Initial state checks
    expect(result.current.score).toBe(0);
    expect(result.current.points).toBe(0);
    expect(result.current.lives).toBe(3);
    expect(result.current.answers).toHaveLength(3); // Should respect numAnswers config
    expect(result.current.timeLeft).toBe(10);

    // First question
    const initialQuestion = {
      numberOne: result.current.numberOne,
      numberTwo: result.current.numberTwo,
      answers: [...result.current.answers]
    };

    // Find and answer correctly
    const correctAnswer = result.current.answers.find(answer => answer.isCorrect);
    expect(correctAnswer).toBeDefined();

    act(() => {
      result.current.handleCorrectAnswer();
    });

    // Advance time to let the new problem generate
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Score should increase
    expect(result.current.score).toBe(1);
    expect(result.current.points).toBeGreaterThan(0);

    // New question should be generated
    const secondQuestion = {
      numberOne: result.current.numberOne,
      numberTwo: result.current.numberTwo,
      answers: [...result.current.answers]
    };

    // Should have new numbers or answers (unlikely to be identical)
    const sameQuestion = (
      initialQuestion.numberOne === secondQuestion.numberOne &&
      initialQuestion.numberTwo === secondQuestion.numberTwo
    );
    
    // Should have answers after the second question
    expect(result.current.answers).toHaveLength(3);
    expect(result.current.answers.every(answer => typeof answer.value === 'number')).toBe(true);
    
    // Should still have correct timer (might have decreased slightly due to test timing)
    expect(result.current.timeLeft).toBeLessThanOrEqual(10);
    expect(result.current.timeLeft).toBeGreaterThan(9);
  });

  it('should play a game with wrong answers and lose lives', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.ADDITION]: {
        range: { min: 1, max: 5 },
        numAnswers: 2
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.ADDITION,
        onGameOver,
        customConfig,
      })
    );

    expect(result.current.lives).toBe(3);
    expect(result.current.answers).toHaveLength(2);

    // Answer incorrectly
    act(() => {
      result.current.handleIncorrectAnswer();
    });

    // Should lose a life
    expect(result.current.lives).toBe(2);
    expect(result.current.showCorrect).toBe(true);

    // Advance time to let the game continue
    act(() => {
      jest.advanceTimersByTime(1600); // More than the 1500ms timeout
    });

    // Should have a new question after the delay
    expect(result.current.answers).toHaveLength(2);
    expect(result.current.showCorrect).toBe(false);
  });

  it('should handle timeout correctly', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.SUBTRACTION]: {
        range: { min: 1, max: 10 },
        allowNegative: false,
        numAnswers: 4
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.SUBTRACTION,
        onGameOver,
        customConfig,
      })
    );

    expect(result.current.timeLeft).toBe(10);
    expect(result.current.lives).toBe(3);
    expect(result.current.answers).toHaveLength(4);

    // Let time run out
    act(() => {
      jest.advanceTimersByTime(10100); // Just over 10 seconds
    });

    // Should lose a life due to timeout
    expect(result.current.lives).toBe(2);
    expect(result.current.timeLeft).toBe(0);
  });

  it('should trigger game over after losing all lives', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.DIVISION]: {
        dividendRange: { min: 10, max: 20 },
        divisorRange: { min: 2, max: 5 },
        numAnswers: 2
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.DIVISION,
        onGameOver,
        customConfig,
      })
    );

    expect(result.current.lives).toBe(3);

    // Lose all 3 lives
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.handleIncorrectAnswer();
      });
      
      if (i < 2) {
        // Advance time to continue to next question (except for the last life)
        act(() => {
          jest.advanceTimersByTime(1600);
        });
      }
    }

    // Advance time to trigger game over
    act(() => {
      jest.advanceTimersByTime(1600);
    });

    expect(result.current.lives).toBe(0);
    expect(onGameOver).toHaveBeenCalledWith(
      expect.any(Number), // score
      expect.any(Number)  // points
    );
  });

  it('should maintain answer buttons visibility throughout gameplay', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.MULTIPLICATION]: {
        tables: [5],
        multiplierRange: { min: 1, max: 3 },
        numAnswers: 2
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.MULTIPLICATION,
        onGameOver,
        customConfig,
      })
    );

    // Check initial answers
    expect(result.current.answers).toHaveLength(2);
    expect(result.current.answers.every(answer => typeof answer.value === 'number')).toBe(true);

    // Play through several questions to ensure answers persist
    for (let questionNum = 0; questionNum < 5; questionNum++) {
      // Verify we have answers before answering
      expect(result.current.answers).toHaveLength(2);
      expect(result.current.answers.some(answer => answer.isCorrect)).toBe(true);

      // Answer correctly
      act(() => {
        result.current.handleCorrectAnswer();
      });

      // Advance time to let new question generate
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Verify we still have answers after the new question
      expect(result.current.answers).toHaveLength(2);
      expect(result.current.answers.every(answer => typeof answer.value === 'number')).toBe(true);
      expect(result.current.answers.some(answer => answer.isCorrect)).toBe(true);
    }

    expect(result.current.score).toBe(5);
  });

  it('should respect custom numAnswers configuration', async () => {
    const testCases = [2, 3, 4];
    
    for (const numAnswers of testCases) {
      const onGameOver = jest.fn();
      const customConfig = {
        [GameType.ADDITION]: {
          range: { min: 1, max: 10 },
          numAnswers
        }
      };

      const { result } = renderHook(() =>
        useMathGame({
          gameType: GameType.ADDITION,
          onGameOver,
          customConfig,
        })
      );

      expect(result.current.answers).toHaveLength(numAnswers);
      expect(result.current.answers.some(answer => answer.isCorrect)).toBe(true);
      
      // Answer correctly and check that next question also respects numAnswers
      act(() => {
        result.current.handleCorrectAnswer();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.answers).toHaveLength(numAnswers);
    }
  });
});