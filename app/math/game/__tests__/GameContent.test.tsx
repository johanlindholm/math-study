import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GameContent from '../GameContent';
import { GameType } from '../types';

// Mock the modules
jest.mock('next/navigation');
jest.mock('next-auth/react');
jest.mock('next-intl');
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti" />;
  };
});

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: { [key: string]: string } = {
      'points': 'Points',
      'score': 'Score',
      'level': 'Level',
      'endGame': 'End Game',
      'gameTypes.multiplication': 'Multiplication',
      'gameTypes.addition': 'Addition',
      'gameTypes.subtraction': 'Subtraction',
      'gameTypes.division': 'Division',
      'gameTypes.game': 'Game',
    };
    return translations[key] || key;
  }
}));

// Use fake timers
jest.useFakeTimers();

describe('GameContent with custom configurations', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseSession.mockReturnValue({ data: null } as any);
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render answer buttons correctly for custom multiplication game', async () => {
    const customConfig = {
      [GameType.MULTIPLICATION]: {
        tables: [2, 3],
        multiplierRange: { min: 1, max: 5 },
        numAnswers: 3
      }
    };
    
    const searchParams = new URLSearchParams();
    searchParams.set('type', GameType.MULTIPLICATION);
    searchParams.set('custom', encodeURIComponent(JSON.stringify(customConfig)));
    
    mockUseSearchParams.mockReturnValue(searchParams as any);

    render(<GameContent />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/Multiplication Game/)).toBeInTheDocument();
    });

    // Check that we have the correct number of answer buttons
    const answerButtons = screen.getAllByRole('button').filter(button => 
      !button.textContent?.includes('End Game')
    );
    
    expect(answerButtons).toHaveLength(3); // Should respect numAnswers config

    // Each button should have a number
    answerButtons.forEach(button => {
      expect(button.textContent).toMatch(/^\d+$/);
    });
  });

  it('should maintain answer buttons after answering correctly', async () => {
    const customConfig = {
      [GameType.ADDITION]: {
        range: { min: 1, max: 5 },
        numAnswers: 2
      }
    };
    
    const searchParams = new URLSearchParams();
    searchParams.set('type', GameType.ADDITION);
    searchParams.set('custom', encodeURIComponent(JSON.stringify(customConfig)));
    
    mockUseSearchParams.mockReturnValue(searchParams as any);

    render(<GameContent />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/Addition Game/)).toBeInTheDocument();
    });

    // Check that we have answer buttons
    let answerButtons = screen.getAllByRole('button').filter(button => 
      !button.textContent?.includes('End Game')
    );
    expect(answerButtons).toHaveLength(2);

    // Find the correct answer by looking for the math problem
    const problemText = screen.getByText(/\d+ \+ \d+/);
    const problemMatch = problemText.textContent?.match(/(\d+) \+ (\d+)/);
    const expectedResult = parseInt(problemMatch![1]) + parseInt(problemMatch![2]);

    // Find the correct button
    const correctButton = answerButtons.find(button => 
      parseInt(button.textContent || '0') === expectedResult
    );
    expect(correctButton).toBeDefined();

    // Click the correct answer
    fireEvent.click(correctButton!);

    // Wait for blinking animation to complete
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Check that we still have answer buttons after answering correctly
    await waitFor(() => {
      const newAnswerButtons = screen.getAllByRole('button').filter(button => 
        !button.textContent?.includes('End Game')
      );
      expect(newAnswerButtons).toHaveLength(2);
      
      // Should have new numbers (buttons should still be visible)
      newAnswerButtons.forEach(button => {
        expect(button.textContent).toMatch(/^\d+$/);
        expect(button).toBeVisible();
      });
    });
  });

  it('should maintain answer buttons after answering incorrectly', async () => {
    const customConfig = {
      [GameType.SUBTRACTION]: {
        range: { min: 5, max: 10 },
        allowNegative: false,
        numAnswers: 4
      }
    };
    
    const searchParams = new URLSearchParams();
    searchParams.set('type', GameType.SUBTRACTION);
    searchParams.set('custom', encodeURIComponent(JSON.stringify(customConfig)));
    
    mockUseSearchParams.mockReturnValue(searchParams as any);

    render(<GameContent />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/Subtraction Game/)).toBeInTheDocument();
    });

    // Check that we have answer buttons
    let answerButtons = screen.getAllByRole('button').filter(button => 
      !button.textContent?.includes('End Game')
    );
    expect(answerButtons).toHaveLength(4);

    // Find the correct answer
    const problemText = screen.getByText(/\d+ - \d+/);
    const problemMatch = problemText.textContent?.match(/(\d+) - (\d+)/);
    const expectedResult = parseInt(problemMatch![1]) - parseInt(problemMatch![2]);

    // Find an incorrect button (any button that isn't the correct answer)
    const incorrectButton = answerButtons.find(button => 
      parseInt(button.textContent || '0') !== expectedResult
    );
    expect(incorrectButton).toBeDefined();

    // Click the incorrect answer
    fireEvent.click(incorrectButton!);

    // Wait for the "show correct" phase
    act(() => {
      jest.advanceTimersByTime(1600); // Should be enough for the full incorrect answer cycle
    });

    // Check that we still have answer buttons after the cycle completes
    await waitFor(() => {
      const newAnswerButtons = screen.getAllByRole('button').filter(button => 
        !button.textContent?.includes('End Game')
      );
      expect(newAnswerButtons).toHaveLength(4);
      
      // Should still be visible
      newAnswerButtons.forEach(button => {
        expect(button.textContent).toMatch(/^\d+$/);
      });
    });
  });

  it('should not flicker buttons during transitions', async () => {
    const customConfig = {
      [GameType.DIVISION]: {
        dividendRange: { min: 10, max: 20 },
        divisorRange: { min: 2, max: 5 },
        numAnswers: 3
      }
    };
    
    const searchParams = new URLSearchParams();
    searchParams.set('type', GameType.DIVISION);
    searchParams.set('custom', encodeURIComponent(JSON.stringify(customConfig)));
    
    mockUseSearchParams.mockReturnValue(searchParams as any);

    render(<GameContent />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/Division Game/)).toBeInTheDocument();
    });

    const initialButtons = screen.getAllByRole('button').filter(button => 
      !button.textContent?.includes('End Game')
    );
    expect(initialButtons).toHaveLength(3);

    // Monitor button visibility during answer
    const problemText = screen.getByText(/\d+ ÷ \d+/);
    const problemMatch = problemText.textContent?.match(/(\d+) ÷ (\d+)/);
    const expectedResult = Math.floor(parseInt(problemMatch![1]) / parseInt(problemMatch![2]));

    const correctButton = initialButtons.find(button => 
      parseInt(button.textContent || '0') === expectedResult
    );

    // Click correct answer
    fireEvent.click(correctButton!);

    // During the blinking period, buttons might be temporarily hidden by opacity
    // but they should still be in the DOM
    act(() => {
      jest.advanceTimersByTime(100); // During blink
    });

    const buttonsAsideDuring = screen.getAllByRole('button').filter(button => 
      !button.textContent?.includes('End Game')
    );
    expect(buttonsAsideDuring).toHaveLength(3); // Still in DOM

    // After blinking completes, buttons should be fully visible
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      const finalButtons = screen.getAllByRole('button').filter(button => 
        !button.textContent?.includes('End Game')
      );
      expect(finalButtons).toHaveLength(3);
      finalButtons.forEach(button => {
        expect(button.textContent).toMatch(/^\d+$/);
      });
    });
  });
});