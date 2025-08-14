import { renderHook, act } from '@testing-library/react';
import { useMathGame } from '../useMathGame';
import { GameType } from '../types';

// Mock the timer to avoid issues with async timing in tests
jest.useFakeTimers();

describe('useMathGame with custom configurations', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should use custom multiplication configuration', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.MULTIPLICATION]: {
        tables: [2, 3],
        multiplierRange: { min: 5, max: 8 }
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.MULTIPLICATION,
        onGameOver,
        customConfig,
      })
    );

    // In custom mode, level should stay at 1
    expect(result.current.level).toBe(1);

    // Check that numbers are within custom range
    // numberOne should be from tables [2, 3]
    expect([2, 3]).toContain(result.current.numberOne);
    
    // numberTwo should be from multiplier range [5, 8]
    expect(result.current.numberTwo).toBeGreaterThanOrEqual(5);
    expect(result.current.numberTwo).toBeLessThanOrEqual(8);
  });

  it('should use custom addition configuration', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.ADDITION]: {
        range: { min: 10, max: 20 }
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.ADDITION,
        onGameOver,
        customConfig,
      })
    );

    expect(result.current.level).toBe(1);
    
    // Both numbers should be within custom range
    expect(result.current.numberOne).toBeGreaterThanOrEqual(10);
    expect(result.current.numberOne).toBeLessThanOrEqual(20);
    expect(result.current.numberTwo).toBeGreaterThanOrEqual(10);
    expect(result.current.numberTwo).toBeLessThanOrEqual(20);
  });

  it('should use custom subtraction configuration with negative allowed', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.SUBTRACTION]: {
        range: { min: 0, max: 10 },
        allowNegative: true
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.SUBTRACTION,
        onGameOver,
        customConfig,
      })
    );

    expect(result.current.level).toBe(1);
    
    // Numbers should be within range
    expect(result.current.numberOne).toBeGreaterThanOrEqual(0);
    expect(result.current.numberOne).toBeLessThanOrEqual(10);
    expect(result.current.numberTwo).toBeGreaterThanOrEqual(0);
    expect(result.current.numberTwo).toBeLessThanOrEqual(10);
  });

  it('should use custom division configuration', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.DIVISION]: {
        dividendRange: { min: 20, max: 50 },
        divisorRange: { min: 2, max: 5 }
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.DIVISION,
        onGameOver,
        customConfig,
      })
    );

    expect(result.current.level).toBe(1);
    
    // Divisor should be within custom range
    expect(result.current.numberTwo).toBeGreaterThanOrEqual(2);
    expect(result.current.numberTwo).toBeLessThanOrEqual(5);
    
    // Dividend should be divisible by divisor and result should be an integer
    expect(result.current.numberOne % result.current.numberTwo).toBe(0);
  });

  it('should fall back to level-based difficulty when no custom config provided', async () => {
    const onGameOver = jest.fn();

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.MULTIPLICATION,
        onGameOver,
        // No custom config provided
      })
    );

    // Should use level-based logic (starts at level 1)
    expect(result.current.level).toBe(1);
  });

  it('should maintain level 1 throughout custom game regardless of score', async () => {
    const onGameOver = jest.fn();
    const customConfig = {
      [GameType.MULTIPLICATION]: {
        tables: [2],
        multiplierRange: { min: 1, max: 3 }
      }
    };

    const { result } = renderHook(() =>
      useMathGame({
        gameType: GameType.MULTIPLICATION,
        onGameOver,
        customConfig,
      })
    );

    expect(result.current.level).toBe(1);

    // Simulate multiple correct answers to increase score
    act(() => {
      // Mock the correct answer button click
      const correctAnswer = result.current.answers.find(answer => answer.isCorrect);
      if (correctAnswer) {
        result.current.handleCorrectAnswer();
      }
    });

    // Fast-forward timers to let the game update
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Level should still be 1 even after score increases
    expect(result.current.level).toBe(1);
  });
});