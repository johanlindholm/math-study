/**
 * Test for LeaderboardModal component to ensure it displays rankings correctly
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import LeaderboardModal from '../LeaderboardModal';
import { GameType } from '@/app/math/game/types';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('LeaderboardModal Ranking Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display correct ranking for first entry (#1, not #2)', async () => {
    // Mock the POST response (saving score)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'entry1' })
    } as Response);

    // Mock the GET response (fetching leaderboard) - simulating first entry
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        topEntries: [
          {
            id: 'entry1',
            score: 2,
            points: 18,
            date: '2025-06-04T19:00:00.000Z',
            user: {
              id: 'user1',
              name: 'Johan Lindholm',
              email: 'johan@example.com'
            }
          }
        ],
        userPosition: 1, // This should be 1, not 2!
        contextEntries: [],
        userScore: 2,
        userPoints: 18,
        newEntryId: 'entry1'
      })
    } as Response);

    render(
      <LeaderboardModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.ADDITION}
        finalScore={2}
        finalPoints={18}
        userId="user1"
      />
    );

    // Wait for both the saving and loading to complete
    await waitFor(() => {
      expect(screen.getByText('Ranked #1 in Addition')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that the top scores section shows the correct position
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('Johan Lindholm (You)')).toBeInTheDocument();
    expect(screen.getByText('18 pts')).toBeInTheDocument();
    expect(screen.getByText('2 correct')).toBeInTheDocument();
  });

  it('should display correct ranking when user is not first', async () => {
    // Mock the POST response (saving score)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'entry2' })
    } as Response);

    // Mock the GET response (fetching leaderboard) - user is 2nd place
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        topEntries: [
          {
            id: 'entry1',
            score: 8,
            points: 150,
            date: '2025-06-04T18:00:00.000Z',
            user: {
              id: 'user2',
              name: 'Top Player',
              email: 'top@example.com'
            }
          },
          {
            id: 'entry2',
            score: 2,
            points: 18,
            date: '2025-06-04T19:00:00.000Z',
            user: {
              id: 'user1',
              name: 'Johan Lindholm',
              email: 'johan@example.com'
            }
          }
        ],
        userPosition: 2,
        contextEntries: [],
        userScore: 2,
        userPoints: 18,
        newEntryId: 'entry2'
      })
    } as Response);

    render(
      <LeaderboardModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.ADDITION}
        finalScore={2}
        finalPoints={18}
        userId="user1"
      />
    );

    // Wait for both the saving and loading to complete
    await waitFor(() => {
      expect(screen.getByText('Ranked #2 in Addition')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check the leaderboard display
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('Top Player')).toBeInTheDocument();
    expect(screen.getByText('150 pts')).toBeInTheDocument();

    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Johan Lindholm (You)')).toBeInTheDocument();
    expect(screen.getByText('18 pts')).toBeInTheDocument();
  });

  it('should handle API calls correctly for the ranking fix', async () => {
    // Mock responses
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'entry1' })
    } as Response);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        topEntries: [],
        userPosition: 1,
        contextEntries: [],
        userScore: 2,
        userPoints: 18,
        newEntryId: 'entry1'
      })
    } as Response);

    act(() => {
      render(
        <LeaderboardModal
          isOpen={true}
          onClose={() => {}}
          gameType={GameType.ADDITION}
          finalScore={2}
          finalPoints={18}
          userId="user1"
        />
      );
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Verify the POST call (saving score)
    expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameType: GameType.ADDITION,
        score: 2,
        points: 18,
      }),
    });

    // Verify the GET call (fetching leaderboard)
    expect(mockFetch).toHaveBeenNthCalledWith(2, 
      `/api/leaderboard?gameType=${GameType.ADDITION}&userScore=2&userPoints=18`
    );
  });

  it('should show error state gracefully when API fails', async () => {
    // Mock failed POST response
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    act(() => {
      render(
        <LeaderboardModal
          isOpen={true}
          onClose={() => {}}
          gameType={GameType.ADDITION}
          finalScore={2}
          finalPoints={18}
          userId="user1"
        />
      );
    });

    // Should still show user's performance even if leaderboard fails
    await waitFor(() => {
      expect(screen.getByText('18 Points')).toBeInTheDocument();
      expect(screen.getByText('2 Questions Correct')).toBeInTheDocument();
    });
  });
});
