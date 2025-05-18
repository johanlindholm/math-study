"use client";

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
}

export default function AnswerButtons({
  answers,
  onCorrectAnswer,
  onIncorrectAnswer,
  isBlinking,
  isShaking
}: AnswerButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {answers.map((answer, index) => (
        <button
          key={`answer-${answer.value}-${index}`}
          className={`m-2 p-4 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer transition-opacity duration-300 ${isBlinking ? 'opacity-0' : 'opacity-100'} text-2xl w-32 ${answer.isCorrect ? '' : isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
          onClick={answer.isCorrect ? onCorrectAnswer : onIncorrectAnswer}
        >
          {answer.value}
        </button>
      ))}
    </div>
  );
}
