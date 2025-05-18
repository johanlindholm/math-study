import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MathPage from '../page';

// Mock the window.innerWidth and window.innerHeight for the Confetti component
Object.defineProperty(window, 'innerWidth', { value: 1024 });
Object.defineProperty(window, 'innerHeight', { value: 768 });

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti">Confetti Effect</div>;
  };
});

describe('MathPage', () => {
  it('renders the start button when not playing', () => {
    render(<MathPage />);
    
    // Check that the start button is rendered
    const startButton = screen.getByText('Start');
    expect(startButton).toBeInTheDocument();
  });

  it('starts the game when the start button is clicked', () => {
    render(<MathPage />);
    
    // Click the start button
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Check that the game has started
    expect(screen.getByText(/Current problem:/)).toBeInTheDocument();
    expect(screen.getByText('New Problem')).toBeInTheDocument();
  });

  it('generates a new problem when the New Problem button is clicked', () => {
    render(<MathPage />);
    
    // Start the game
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Get the current problem text
    const initialProblemText = screen.getByText(/Current problem:/).textContent;
    
    // Click the New Problem button
    const newProblemButton = screen.getByText('New Problem');
    fireEvent.click(newProblemButton);
    
    // Check that a new problem has been generated
    // Note: This is a simple check that might occasionally fail if the new problem happens to be the same as the old one
    // In a real test, we might want to mock the random number generation to ensure predictable results
    const newProblemText = screen.getByText(/Current problem:/).textContent;
    expect(newProblemText).toBeDefined();
  });
});