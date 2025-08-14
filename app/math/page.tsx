"use client";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { GameType } from './game/types';
import HighScoreModal from './components/HighScoreModal';
import CustomGameModal from './components/CustomGameModal';

export default function MathPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [highScoreModal, setHighScoreModal] = useState<{isOpen: boolean, gameType: GameType | null}>({
        isOpen: false,
        gameType: null
    });
    const [customGameModal, setCustomGameModal] = useState<{isOpen: boolean, gameType: GameType | null}>({
        isOpen: false,
        gameType: null
    });
    
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    const startGame = (gameType: GameType) => {
        router.push(`/math/game?type=${gameType}`);
    };

    const openHighScores = (gameType: GameType) => {
        setHighScoreModal({ isOpen: true, gameType });
    };

    const closeHighScores = () => {
        setHighScoreModal({ isOpen: false, gameType: null });
    };

    const openCustomGame = (gameType: GameType) => {
        setCustomGameModal({ isOpen: true, gameType });
    };

    const closeCustomGame = () => {
        setCustomGameModal({ isOpen: false, gameType: null });
    };

    const gameModes = [
        {
            type: GameType.MULTIPLICATION,
            title: 'Multiplication',
            description: 'Practice your multiplication skills!',
            bgColor: 'bg-purple-500',
            textColor: 'text-purple-500',
            hoverBgColor: 'hover:bg-purple-600'
        },
        {
            type: GameType.ADDITION,
            title: 'Addition',
            description: 'Practice your addition skills!',
            bgColor: 'bg-blue-500',
            textColor: 'text-blue-500',
            hoverBgColor: 'hover:bg-blue-600'
        },
        {
            type: GameType.SUBTRACTION,
            title: 'Subtraction',
            description: 'Practice your subtraction skills!',
            bgColor: 'bg-green-500',
            textColor: 'text-green-500',
            hoverBgColor: 'hover:bg-green-600'
        },
        {
            type: GameType.DIVISION,
            title: 'Division',
            description: 'Practice your division skills!',
            bgColor: 'bg-yellow-500',
            textColor: 'text-yellow-500',
            hoverBgColor: 'hover:bg-yellow-600'
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {status === 'loading' ? (
                <div className="text-xl">Loading...</div>
            ) : status === 'authenticated' ? (
                <>
                    <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Math Games</h1>
                    <p className="text-xl mb-8 text-center text-gray-700 dark:text-gray-300">Select a game mode to start practicing!</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                        {gameModes.map((game) => (
                            <div 
                                key={game.type}
                                className={`${game.bgColor} ${game.hoverBgColor} rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105`}
                            >
                                <div className="p-8 text-center text-white">
                                    <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
                                    <p className="mb-4">{game.description}</p>
                                    <div className="space-y-3">
                                        <button 
                                            className={`px-6 py-3 bg-white ${game.textColor} font-semibold rounded-full hover:bg-opacity-90 transition-colors w-full cursor-pointer`}
                                            onClick={() => startGame(game.type)}
                                        >
                                            Play Now
                                        </button>
                                        <button 
                                            className="px-6 py-2 bg-black/20 hover:bg-black/40 text-white font-medium rounded-full transition-all w-full border-2 border-white/80 hover:border-white shadow-md cursor-pointer"
                                            onClick={() => openCustomGame(game.type)}
                                        >
                                            Custom Mode
                                        </button>
                                        <button 
                                            className="px-6 py-2 bg-black/20 hover:bg-black/40 text-white font-medium rounded-full transition-all w-full border-2 border-white/80 hover:border-white shadow-md cursor-pointer"
                                            onClick={() => openHighScores(game.type)}
                                        >
                                            View High Scores
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* High Score Modal */}
                    {highScoreModal.gameType && (
                        <HighScoreModal 
                            isOpen={highScoreModal.isOpen}
                            onClose={closeHighScores}
                            gameType={highScoreModal.gameType}
                            userId={session?.user?.id}
                        />
                    )}

                    {/* Custom Game Modal */}
                    {customGameModal.gameType && (
                        <CustomGameModal 
                            isOpen={customGameModal.isOpen}
                            onClose={closeCustomGame}
                            gameType={customGameModal.gameType}
                        />
                    )}
                </>
            ) : null}
        </div>
    );
}
