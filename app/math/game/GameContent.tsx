"use client";
import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AnswerButtons from '../components/AnswerButtons';
import LeaderboardModal from '../components/LeaderboardModal';
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

@keyframes starShake {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(0.8) rotate(-10deg); }
  75% { transform: scale(0.8) rotate(10deg); }
}

@keyframes levelBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
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
  const { data: session } = useSession();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiOpacity, setConfettiOpacity] = useState(1);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [animatingStarIndex, setAnimatingStarIndex] = useState<number | null>(null);
  const [isLevelAnimating, setIsLevelAnimating] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [gameOverData, setGameOverData] = useState<{ score: number; points: number } | null>(null);
  const [previousLevel, setPreviousLevel] = useState(1);
  const floatingPointTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const confettiTimers = useRef<NodeJS.Timeout[]>([]);
  const starAnimationTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      // Copy refs to local variables to avoid stale closure warnings
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentFloatingTimers = floatingPointTimers.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentConfettiTimers = confettiTimers.current;
      const currentStarTimer = starAnimationTimer.current;
      
      // Clear all floating point timers
      currentFloatingTimers.forEach(timer => clearTimeout(timer));
      currentFloatingTimers.clear();
      
      // Clear all confetti timers
      currentConfettiTimers.forEach(timer => clearTimeout(timer));
      
      // Clear star animation timer
      if (currentStarTimer) {
        clearTimeout(currentStarTimer);
      }
    };
  }, []);

  const handleGameOver = useCallback((finalScore: number, finalPoints: number) => {
    // Store game over data and show leaderboard modal
    setGameOverData({ score: finalScore, points: finalPoints });
    setShowLeaderboardModal(true);
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
    lives,
    showCorrect,
    level,
    handleCorrectAnswer: onCorrectAnswer,
    handleIncorrectAnswer: onIncorrectAnswer,
  } = useMathGame({
    gameType,
    onGameOver: handleGameOver,
  });

  // Track level changes and trigger confetti on level up
  useEffect(() => {
    if (level > previousLevel) {
      // Level increased! Trigger level animation
      setIsLevelAnimating(true);
      
      // Stop level animation after bounce completes
      const levelAnimTimer = setTimeout(() => {
        setIsLevelAnimating(false);
      }, 600); // Animation duration
      confettiTimers.current.push(levelAnimTimer);
      
      // Show confetti from center of screen
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
      
      setConfettiPosition({
        x: centerX,
        y: centerY
      });

      // Trigger confetti animation
      if (showConfetti) {
        setShowConfetti(false);
        setConfettiKey(prev => prev + 1);
        const timer1 = setTimeout(() => {
          setShowConfetti(true);
          setConfettiOpacity(1);
        }, 50);
        confettiTimers.current.push(timer1);
      } else {
        setShowConfetti(true);
        setConfettiOpacity(1);
      }

      // Start fade out after 1 second
      const fadeTimer = setTimeout(() => {
        setConfettiOpacity(0);
      }, 1000);
      confettiTimers.current.push(fadeTimer);

      // Hide confetti after fade completes
      const timer2 = setTimeout(() => {
        setShowConfetti(false);
      }, 2000); // Match tween duration
      confettiTimers.current.push(timer2);
    }
    setPreviousLevel(level);
  }, [level, previousLevel, showConfetti]);

  const handleCorrectAnswer = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

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
    const timerId = setTimeout(() => {
      setFloatingPoints(prev => prev.filter(p => p.id !== newFloatingPoint.id));
      floatingPointTimers.current.delete(newFloatingPoint.id);
    }, 2000);
    
    floatingPointTimers.current.set(newFloatingPoint.id, timerId);

    // Call the original handler
    onCorrectAnswer();
  }, [onCorrectAnswer, timeLeft]);

  const handleIncorrectAnswer = useCallback(() => {
    // Animate the star that will be lost
    const starToAnimate = lives - 1;
    if (starToAnimate >= 0) {
      setAnimatingStarIndex(starToAnimate);
      if (starAnimationTimer.current) {
        clearTimeout(starAnimationTimer.current);
      }
      starAnimationTimer.current = setTimeout(() => {
        setAnimatingStarIndex(null);
      }, 300);
    }
    onIncorrectAnswer();
  }, [onIncorrectAnswer, lives]);
  
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
        <div 
          style={{ 
            opacity: confettiOpacity,
            transition: 'opacity 1s ease-out',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <Confetti 
            key={confettiKey}
            width={typeof window !== 'undefined' ? window.innerWidth : 0}
            height={typeof window !== 'undefined' ? window.innerHeight : 0}
            recycle={false}
            numberOfPieces={400}
            confettiSource={{
              x: confettiPosition.x - 400,
              y: confettiPosition.y - 150,
              w: 800,
              h: 300
            }}
            initialVelocityX={12}
            initialVelocityY={20}
            gravity={0.2}
            tweenDuration={2000}
            opacity={1}
            wind={0.02}
            friction={0.95}
          />
        </div>
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
      <div className="absolute top-8 left-8 flex flex-col items-start gap-2">
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`text-5xl transition-colors duration-300 ${index < lives ? 'text-yellow-400' : 'text-gray-400'}`}
              style={{
                animation: animatingStarIndex === index ? 'starShake 0.3s ease-in-out' : 'none'
              }}
            >
              ★
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-8 right-8 flex flex-col items-end">
        <div className="text-5xl font-bold text-purple-600">
          {t('points')}: {points}
        </div>
        <div className="text-2xl font-semibold text-gray-600">
          {t('score')}: {score}
        </div>
      </div>
      <div className="text-center mb-4">
        <h2 
          className="text-3xl font-bold text-yellow-500 dark:text-yellow-400"
          style={{
            animation: isLevelAnimating ? 'levelBounce 0.6s ease-in-out' : 'none'
          }}
        >
          {t('level')} {level}
        </h2>
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
          showCorrect={showCorrect}
        />
        <button 
          className="m-2 p-4 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer text-2xl w-64"
          onClick={() => router.push('/math')}
        >
          {t('endGame')}
        </button>
      </div>

      {/* Leaderboard Modal */}
      {session?.user?.id && gameOverData && (
        <LeaderboardModal
          isOpen={showLeaderboardModal}
          onClose={() => {
            setShowLeaderboardModal(false);
            router.push('/math');
          }}
          gameType={gameType}
          finalScore={gameOverData.score}
          finalPoints={gameOverData.points}
          userId={session.user.id}
        />
      )}
    </div>
  );
}