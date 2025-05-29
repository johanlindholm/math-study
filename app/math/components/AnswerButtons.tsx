"use client";
import { useState } from 'react';

interface Answer {
  value: number;
  isCorrect: boolean;
}

interface AnswerButtonsProps {
  answers: Answer[];
  onCorrectAnswer: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onIncorrectAnswer: () => void;
  isBlinking: boolean;
  isShaking: boolean;
  showCorrect: boolean;
}

export default function AnswerButtons({
  answers,
  onCorrectAnswer,
  onIncorrectAnswer,
  isBlinking,
  isShaking,
  showCorrect
}: AnswerButtonsProps) {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const handleClick = (answer: Answer, index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (answer.isCorrect) {
      onCorrectAnswer(event);
    } else {
      setClickedIndex(index);
      onIncorrectAnswer();
    }
  };

  // Reset clicked index when showCorrect changes back to false
  if (!showCorrect && clickedIndex !== null) {
    setClickedIndex(null);
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {answers.map((answer, index) => (
        <button
          key={`answer-${answer.value}-${index}`}
          className={`m-2 p-4 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer transition-all duration-300 ${isBlinking ? 'opacity-0' : 'opacity-100'} text-2xl w-32 ${answer.isCorrect ? '' : isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''} ${showCorrect && answer.isCorrect ? 'transform scale-125 bg-green-500 hover:bg-green-500' : ''} ${showCorrect && !answer.isCorrect && clickedIndex === index ? 'bg-red-500 hover:bg-red-500' : ''} ${showCorrect && !answer.isCorrect && clickedIndex !== index ? 'opacity-80' : ''}`}
          onClick={(e) => handleClick(answer, index, e)}
          disabled={showCorrect}
        >
          {answer.value}
        </button>
      ))}
    </div>
  );
}
