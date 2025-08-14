import { renderHook, act } from '@testing-library/react';
import { useMathGame } from '../useMathGame';
import { GameType } from '../types';

// Integration test to verify the fix solves the user's reported issues
describe('useMathGame user issue reproduction and fix validation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should fix the rapid question changing issue in custom mode', () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.MULTIPLICATION]: {
        tables: [2, 3, 4, 5],
        multiplierRange: { min: 1, max: 10 },
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

    // Capture initial question
    const initialQuestion = {
      numberOne: result.current.numberOne,
      numberTwo: result.current.numberTwo,
      timeLeft: result.current.timeLeft,
      answers: result.current.answers.map(a => a.value).sort()
    };

    expect(initialQuestion.timeLeft).toBe(10);
    expect(initialQuestion.answers).toHaveLength(3);

    // Simulate time passing WITHOUT user interaction
    // The question should remain stable and timer should decrease normally
    act(() => {
      jest.advanceTimersByTime(2000); // 2 seconds
    });

    expect(result.current.numberOne).toBe(initialQuestion.numberOne);
    expect(result.current.numberTwo).toBe(initialQuestion.numberTwo);
    expect(result.current.timeLeft).toBeCloseTo(8.0, 1); // Timer should decrease
    expect(result.current.answers.map(a => a.value).sort()).toEqual(initialQuestion.answers);

    // Simulate more time passing
    act(() => {
      jest.advanceTimersByTime(3000); // 3 more seconds (total 5s)
    });

    // Question should still be the same, timer should continue decreasing
    expect(result.current.numberOne).toBe(initialQuestion.numberOne);
    expect(result.current.numberTwo).toBe(initialQuestion.numberTwo);
    expect(result.current.timeLeft).toBeCloseTo(5.0, 1);

    // Now answer correctly - this SHOULD change the question
    act(() => {
      result.current.handleCorrectAnswer();
    });

    // Allow new problem generation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now we should have a new question with timer properly reset
    expect(result.current.timeLeft).toBeGreaterThan(9.5); // Timer reset (but may have ticked slightly)
    expect(result.current.score).toBe(1); // Score increased
    expect(result.current.answers).toHaveLength(3); // Still have correct number of answers

    // Questions may or may not be different (depends on random generation)
    // but the key is that we have stable, working functionality
    expect(typeof result.current.numberOne).toBe('number');
    expect(typeof result.current.numberTwo).toBe('number');
    expect([2, 3, 4, 5]).toContain(result.current.numberOne);
  });

  it('should maintain stable timer behavior throughout custom game', () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.ADDITION]: {
        range: { min: 1, max: 20 },
        numAnswers: 4
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.ADDITION,
        onGameOver,
        customConfig,
      })
    );

    // Play through multiple rounds to ensure stability
    for (let round = 0; round < 3; round++) {
      const beforeAnswer = {
        timeLeft: result.current.timeLeft,
        score: result.current.score
      };

      // Timer should be properly reset at start of each round (except first)
      if (round > 0) {
        expect(beforeAnswer.timeLeft).toBeGreaterThan(9.5); // Should be close to 10
      }
      expect(beforeAnswer.score).toBe(round);

      // Let some time pass
      act(() => {
        jest.advanceTimersByTime(1500); // 1.5 seconds
      });

      expect(result.current.timeLeft).toBeCloseTo(beforeAnswer.timeLeft - 1.5, 1);

      // Answer correctly
      act(() => {
        result.current.handleCorrectAnswer();
      });

      // Allow state updates
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Verify new round started correctly
      expect(result.current.score).toBe(round + 1);
      expect(result.current.answers).toHaveLength(4);
    }

    expect(result.current.score).toBe(3);
    expect(onGameOver).not.toHaveBeenCalled();
  });
});