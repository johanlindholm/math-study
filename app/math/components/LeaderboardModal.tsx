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

interface LeaderboardData {
  topEntries: LeaderboardEntry[];
  userPosition: number;
  contextEntries: LeaderboardEntry[];
  userScore: number;
  userPoints: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
  finalScore: number;
  finalPoints: number;
  userId: string;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
  gameType,
  finalScore,
  finalPoints,
  userId
}: LeaderboardModalProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveScoreAndFetchLeaderboard = useCallback(async () => {
    setSaving(true);
    setLoading(true);

    try {
      // First save the score
      const saveResponse = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameType,
          score: finalScore,
          points: finalPoints,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save score');
      }

      // Then fetch leaderboard data
      const fetchResponse = await fetch(
        `/api/leaderboard?gameType=${gameType}&userScore=${finalScore}&userPoints=${finalPoints}`
      );

      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await fetchResponse.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error with leaderboard:', error);
      // Still show something even if there's an error
      setLeaderboardData({
        topEntries: [],
        userPosition: 1,
        contextEntries: [],
        userScore: finalScore,
        userPoints: finalPoints
      });
    } finally {
      setSaving(false);
      setLoading(false);
    }
  }, [gameType, finalScore, finalPoints]);

  useEffect(() => {
    if (isOpen) {
      saveScoreAndFetchLeaderboard();
    }
  }, [isOpen, saveScoreAndFetchLeaderboard]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGameTypeName = (type: GameType) => {
    const names = {
      [GameType.MULTIPLICATION]: 'Multiplication',
      [GameType.ADDITION]: 'Addition',
      [GameType.SUBTRACTION]: 'Subtraction'
    };
    return names[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            🎉 Game Complete! 🎉
          </h2>
          
          {saving ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-700 dark:text-gray-300">Saving your score...</div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Your Performance</h3>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                  {finalPoints} Points
                </div>
                <div className="text-lg text-purple-700 dark:text-purple-300">
                  {finalScore} Questions Correct
                </div>
                {leaderboardData && (
                  <div className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    Ranked #{leaderboardData.userPosition} in {getGameTypeName(gameType)}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-lg text-gray-700 dark:text-gray-300">Loading leaderboard...</div>
                </div>
              ) : leaderboardData ? (
                <div className="space-y-6">
                  {/* Top 10 Scores */}
                  {leaderboardData.topEntries.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">🏆 Top Scores</h3>
                      <div className="space-y-2">
                        {leaderboardData.topEntries.map((entry, index) => (
                          <div
                            key={entry.id}
                            className={`flex items-center justify-between p-2 rounded ${
                              entry.user.id === userId 
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600' 
                                : 'bg-gray-50 dark:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-lg w-6 text-gray-900 dark:text-white">
                                {index + 1}.
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {entry.user.name || entry.user.email}
                                {entry.user.id === userId && ' (You)'}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-purple-600 dark:text-purple-300">
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
                  )}

                  {/* Context around user's score (if not in top 10) */}
                  {leaderboardData.userPosition > 10 && leaderboardData.contextEntries.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                        📍 Around Your Position (#{leaderboardData.userPosition})
                      </h3>
                      <div className="space-y-2">
                        {leaderboardData.contextEntries.map((entry, index) => {
                          const actualPosition = leaderboardData.userPosition - 3 + index;
                          return (
                            <div
                              key={entry.id}
                              className={`flex items-center justify-between p-2 rounded ${
                                entry.user.id === userId 
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600' 
                                  : 'bg-gray-50 dark:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="font-bold text-lg w-8 text-gray-900 dark:text-white">
                                  {actualPosition}.
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {entry.user.name || entry.user.email}
                                  {entry.user.id === userId && ' (You)'}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-purple-600 dark:text-purple-300">
                                  {entry.points} pts
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {entry.score} correct
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  Unable to load leaderboard data
                </div>
              )}

              <div className="flex justify-center mt-6">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-purple-600 dark:bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
                >
                  OK
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}