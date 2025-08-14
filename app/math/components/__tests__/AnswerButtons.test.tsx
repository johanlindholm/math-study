import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AnswerButtons from '../AnswerButtons';

describe('AnswerButtons', () => {
  const mockOnCorrectAnswer = jest.fn();
  const mockOnIncorrectAnswer = jest.fn();
  
  const testAnswers = [
    { value: 12, isCorrect: true },
    { value: 15, isCorrect: false },
    { value: 18, isCorrect: false }
  ];
  
  beforeEach(() => {
    mockOnCorrectAnswer.mockClear();
    mockOnIncorrectAnswer.mockClear();
  });
  
  it('renders all answer buttons', () => {
    render(
      <AnswerButtons
        answers={testAnswers}
        onCorrectAnswer={mockOnCorrectAnswer}
        onIncorrectAnswer={mockOnIncorrectAnswer}
        isBlinking={false}
        isShaking={false}
      />
    );
    
    // Check that all answer buttons are rendered
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });
  
  it('calls onCorrectAnswer when correct answer is clicked', () => {
    render(
      <AnswerButtons
        answers={testAnswers}
        onCorrectAnswer={mockOnCorrectAnswer}
        onIncorrectAnswer={mockOnIncorrectAnswer}
        isBlinking={false}
        isShaking={false}
      />
    );
    
    // Click the correct answer
    fireEvent.click(screen.getByText('12'));
    
    // Check that onCorrectAnswer was called
    expect(mockOnCorrectAnswer).toHaveBeenCalledTimes(1);
    expect(mockOnIncorrectAnswer).not.toHaveBeenCalled();
  });
  
  it('calls onIncorrectAnswer when incorrect answer is clicked', () => {
    render(
      <AnswerButtons
        answers={testAnswers}
        onCorrectAnswer={mockOnCorrectAnswer}
        onIncorrectAnswer={mockOnIncorrectAnswer}
        isBlinking={false}
        isShaking={false}
      />
    );
    
    // Click an incorrect answer
    fireEvent.click(screen.getByText('15'));
    
    // Check that onIncorrectAnswer was called
    expect(mockOnIncorrectAnswer).toHaveBeenCalledTimes(1);
    expect(mockOnCorrectAnswer).not.toHaveBeenCalled();
  });
  
  it('applies blinking style when isBlinking is true', () => {
    render(
      <AnswerButtons
        answers={testAnswers}
        onCorrectAnswer={mockOnCorrectAnswer}
        onIncorrectAnswer={mockOnIncorrectAnswer}
        isBlinking={true}
        isShaking={false}
      />
    );
    
    // Check that all buttons have opacity-0 class
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button.className).toContain('opacity-70');
    });
  });
  
  it('applies shaking style to incorrect answers when isShaking is true', () => {
    render(
      <AnswerButtons
        answers={testAnswers}
        onCorrectAnswer={mockOnCorrectAnswer}
        onIncorrectAnswer={mockOnIncorrectAnswer}
        isBlinking={false}
        isShaking={true}
      />
    );
    
    // Check that incorrect answer buttons have shake animation class
    const incorrectButtons = [
      screen.getByText('15'),
      screen.getByText('18')
    ];
    
    incorrectButtons.forEach(button => {
      expect(button.className).toContain('animate-[shake_0.5s_ease-in-out]');
    });
    
    // Check that correct answer button does not have shake animation class
    const correctButton = screen.getByText('12');
    expect(correctButton.className).not.toContain('animate-[shake_0.5s_ease-in-out]');
  });
});