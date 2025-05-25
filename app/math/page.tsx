"use client";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { GameType } from './game/types';

export default function MathPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    const startGame = (gameType: GameType) => {
        router.push(`/math/game?type=${gameType}`);
    };

    const gameModes = [
        {
            type: GameType.MULTIPLICATION,
            title: 'Multiplication',
            description: 'Practice your multiplication skills!',
            bgColor: 'bg-purple-500',
            hoverBgColor: 'hover:bg-purple-600'
        },
        {
            type: GameType.ADDITION,
            title: 'Addition',
            description: 'Practice your addition skills!',
            bgColor: 'bg-blue-500',
            hoverBgColor: 'hover:bg-blue-600'
        },
        {
            type: GameType.SUBTRACTION,
            title: 'Subtraction',
            description: 'Practice your subtraction skills!',
            bgColor: 'bg-green-500',
            hoverBgColor: 'hover:bg-green-600'
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {status === 'loading' ? (
                <div className="text-xl">Loading...</div>
            ) : status === 'authenticated' ? (
                <>
                    <h1 className="text-4xl font-bold mb-8">Math Games</h1>
                    <p className="text-xl mb-8 text-center">Select a game mode to start practicing!</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                        {gameModes.map((game) => (
                            <div 
                                key={game.type}
                                className={`${game.bgColor} ${game.hoverBgColor} rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                                onClick={() => startGame(game.type)}
                            >
                                <div className="p-8 text-center text-white">
                                    <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
                                    <p className="mb-4">{game.description}</p>
                                    <button 
                                        className={`px-6 py-3 bg-white text-${game.bgColor.split('-')[1]}-600 font-semibold rounded-full hover:bg-opacity-90 transition-colors`}
                                    >
                                        Play Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}
