"use client";
import { useEffect, useState, useCallback } from 'react';
import { GameType } from '@/app/math/game/types';

interface LeaderboardEntry {
  id: string;
  score: number;
  points: number;
  date: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface HighScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
  userId?: string;
}

export default function HighScoreModal({
  isOpen,
  onClose,
  gameType,
  userId
}: HighScoreModalProps) {
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHighScores = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch only the top scores without saving any score
      const response = await fetch(
        `/api/leaderboard?gameType=${gameType}&userScore=0&userPoints=0`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }

      const data = await response.json();
      setTopEntries(data.topEntries || []);
    } catch (error) {
      console.error('Error fetching high scores:', error);
      setTopEntries([]);
    } finally {
      setLoading(false);
    }
  }, [gameType]);

  useEffect(() => {
    if (isOpen) {
      fetchHighScores();
    }
  }, [isOpen, fetchHighScores]);

  const getGameTypeName = (type: GameType) => {
    const names = {
      [GameType.MULTIPLICATION]: 'Multiplication',
      [GameType.ADDITION]: 'Addition',
      [GameType.SUBTRACTION]: 'Subtraction',
      [GameType.DIVISION]: 'Division'
    };
    return names[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
            🏆 High Scores - {getGameTypeName(gameType)}
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-900 dark:text-gray-100">Loading high scores...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {topEntries.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">🏆 Top Scores</h3>
                  <div className="space-y-2">
                    {topEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded ${
                          entry.user.id === userId 
                            ? 'bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600' 
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg w-6 text-gray-900 dark:text-gray-100">
                            {index + 1}.
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {entry.user.name || entry.user.email}
                            {entry.user.id === userId && ' (You)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">
                            {entry.points} pts
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.score} correct
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No high scores yet for {getGameTypeName(gameType)}.
                  <br />
                  Be the first to play and set a record!
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}