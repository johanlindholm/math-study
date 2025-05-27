import React from 'react';
import { Answer } from '@/app/math/game/useMathGame';

interface AnswerButtonsProps {
  answers: Answer[];
  onCorrectAnswer: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onIncorrectAnswer: () => void;
  isBlinking: boolean;
  isShaking: boolean;
}

export default function AnswerButtons({ 
  answers, 
  onCorrectAnswer, 
  onIncorrectAnswer, 
  isBlinking,
  isShaking 
}: AnswerButtonsProps) {
  const handleClick = (answer: Answer) => (event: React.MouseEvent<HTMLButtonElement>) => {
    if (answer.isCorrect) {
      onCorrectAnswer(event);
    } else {
      onIncorrectAnswer();
    }
  };

  return (
    <div 
      className={`
        grid gap-4 
        ${answers.length === 2 ? 'grid-cols-2' : ''}
        ${answers.length === 3 ? 'grid-cols-3' : ''}
        ${answers.length === 4 ? 'grid-cols-2' : ''}
        ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}
      `}
    >
      {answers.map((answer, index) => (
        <button
          key={index}
          onClick={handleClick(answer)}
          className={`
            p-4 bg-blue-500 text-white rounded hover:bg-blue-600 
            cursor-pointer text-2xl w-32 h-20
            transition-opacity duration-300
            ${isBlinking ? 'opacity-0' : 'opacity-100'}
          `}
        >
          {answer.value}
        </button>
      ))}
    </div>
  );
}