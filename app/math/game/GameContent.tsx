"use client";
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import AnswerButtons from '../components/AnswerButtons';
import { useMathGame } from './useMathGame';
import { GameType } from './types';
import { useTranslations } from 'next-intl';

const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

// Add the shake and floating points animations
const animations = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1.5);
  }
}
`;

interface FloatingPoint {
  id: number;
  value: number;
  x: number;
  y: number;
}

export default function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = (searchParams.get('type') as GameType) || GameType.MULTIPLICATION;
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [confettiKey, setConfettiKey] = useState(0);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

  const handleGameOver = useCallback((finalScore: number) => {
    // You could add game over logic here, like saving high scores
    console.log(`Game over! Final score: ${finalScore}`);
  }, []);

  const {
    numberOne,
    numberTwo,
    answers,
    score,
    points,
    timeLeft,
    isBlinking,
    isShaking,
    symbol,
    handleCorrectAnswer: onCorrectAnswer,
    handleIncorrectAnswer: onIncorrectAnswer,
  } = useMathGame({
    gameType,
    onGameOver: handleGameOver,
  });

  const handleCorrectAnswer = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    
    setConfettiPosition({
      x: centerX,
      y: centerY
    });

    // Add floating points indicator
    const pointsEarned = Math.round(timeLeft);
    const newFloatingPoint: FloatingPoint = {
      id: Date.now(),
      value: pointsEarned,
      x: centerX,
      y: centerY
    };
    
    setFloatingPoints(prev => [...prev, newFloatingPoint]);
    
    // Remove floating point after animation completes
    setTimeout(() => {
      setFloatingPoints(prev => prev.filter(p => p.id !== newFloatingPoint.id));
    }, 2000);

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

    // Call the original handler
    onCorrectAnswer();
  }, [onCorrectAnswer, showConfetti, timeLeft]);

  const handleIncorrectAnswer = useCallback(() => {
    onIncorrectAnswer();
    router.push('/math');
  }, [onIncorrectAnswer, router]);
  
  const t = useTranslations('GamePage');
  
  // Get game title from translations
  const gameTypeMap = {
    [GameType.MULTIPLICATION]: t('gameTypes.multiplication'),
    [GameType.ADDITION]: t('gameTypes.addition'),
    [GameType.SUBTRACTION]: t('gameTypes.subtraction'),
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <style jsx global>{animations}</style>
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
      {floatingPoints.map((point) => (
        <div
          key={point.id}
          className="fixed pointer-events-none text-4xl font-bold text-green-600 z-50"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            animation: 'floatUp 2s ease-out forwards',
            transform: 'translate(-50%, -50%)'
          }}
        >
          +{point.value}
        </div>
      ))}
      <div className="absolute top-8 right-8 flex flex-col items-end">
        <div className="text-5xl font-bold text-purple-600">
          {t('points')}: {points}
        </div>
        <div className="text-2xl font-semibold text-gray-600">
          {t('score')}: {score}
        </div>
      </div>
      <div className="w-full max-w-xl px-4 mb-8">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-purple-500 h-4 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4">{gameTypeMap[gameType]} {t('gameTypes.game')}</h1>
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
          {t('endGame')}
        </button>
      </div>
    </div>
  );
}