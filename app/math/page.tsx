"use client";
import { useRouter } from 'next/navigation';

export default function MathPage() {
    const router = useRouter();

    const startGame = () => {
        router.push('/math/game');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Math</h1>
            <p className="text-xl mb-8">Practice your multiplication skills!</p>
            <button 
                className="m-2 p-4 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer text-2xl w-64"
                onClick={startGame}
            >
                Start
            </button>
        </div>
    );
}
