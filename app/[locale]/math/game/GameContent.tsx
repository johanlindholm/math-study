"use client";
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import AnswerButtons from '../components/AnswerButtons';
import { useMathGame } from '@/app/math/game/useMathGame';
import { GameType } from '@/app/math/game/types';
import { useTranslations } from 'next-intl';

const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

// Add the shake keyframes animation
const shakeAnimation = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
`;

export default function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = (searchParams.get('type') as GameType) || GameType.MULTIPLICATION;
  const t = useTranslations('math');
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [confettiKey, setConfettiKey] = useState(0);
  const [showPoints, setShowPoints] = useState(false);

  const handleGameOver = useCallback((finalScore: number) => {
    // You could add game over logic here, like saving high scores
    console.log(`Game over! Final score: ${finalScore}`);
  }, []);

  const {
    numberOne,
    numberTwo,
    answers,
    score,
    correctAnswers,
    timeLeft,
    isBlinking,
    isShaking,
    symbol,
    handleCorrectAnswer: onCorrectAnswer,
    handleIncorrectAnswer: onIncorrectAnswer,
    lastPointsEarned,
  } = useMathGame({
    gameType,
    onGameOver: handleGameOver,
  });

  const handleCorrectAnswer = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    setConfettiPosition({
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    });

    // Trigger confetti animation
    if (showConfetti) {
      setShowConfetti(false);
      setConfettiKey(prev => prev + 1);
      setTimeout(() => {
        setShowConfetti(true);
      }, 50);
    } else {
      setShowConfetti(true);
    }

    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, 1500);

    // Show points earned
    setShowPoints(true);
    setTimeout(() => {
      setShowPoints(false);
    }, 1500);

    // Call the original handler
    onCorrectAnswer();
  }, [onCorrectAnswer, showConfetti]);

  const handleIncorrectAnswer = useCallback(() => {
    onIncorrectAnswer();
    router.push('/math');
  }, [onIncorrectAnswer, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <style jsx global>{shakeAnimation}</style>
      {showConfetti && (
        <Confetti 
          key={confettiKey}
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
          recycle={false}
          numberOfPieces={200}
          confettiSource={{
            x: confettiPosition.x,
            y: confettiPosition.y,
            w: 0,
            h: 0
          }}
          initialVelocityY={20}
          gravity={0.5}
          tweenDuration={100}
        />
      )}
      <div className="absolute top-8 right-8">
        <div className="text-4xl font-bold">
          {t('game.score')}: {score}
        </div>
        <div className="text-2xl text-gray-600 mt-1">
          {t('game.correct')}: {correctAnswers}
        </div>
        {showPoints && (
          <div className="text-2xl font-bold text-green-500 animate-bounce mt-2">
            +{lastPointsEarned} {t('game.points', { points: lastPointsEarned })}
          </div>
        )}
      </div>
      <div className="w-full max-w-xl px-4 mb-8">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-purple-500 h-4 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">{t(`games.${gameType}.title`)}</h1>
      <p className={`mb-4 transition-opacity duration-300 ${isBlinking ? 'opacity-0' : 'opacity-100'} text-4xl`}>
        {numberOne} {symbol} {numberTwo}
      </p>
      <div className="flex flex-col gap-4 items-center">
        <AnswerButtons 
          answers={answers}
          onCorrectAnswer={handleCorrectAnswer}
          onIncorrectAnswer={handleIncorrectAnswer}
          isBlinking={isBlinking}
          isShaking={isShaking}
        />
        <button 
          className="m-2 p-4 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer text-2xl w-64"
          onClick={() => router.push('/math')}
        >
          {t('game.endGame')}
        </button>
      </div>
    </div>
  );
}