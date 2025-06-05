import { render, screen, waitFor } from '@testing-library/react';
import { GameType } from '@/app/math/game/types';
import HighScoreModal from '../HighScoreModal';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('HighScoreModal', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <HighScoreModal
        isOpen={false}
        onClose={() => {}}
        gameType={GameType.ADDITION}
        userId="user1"
      />
    );

    expect(screen.queryByText(/High Scores/)).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        topEntries: []
      })
    } as Response);

    render(
      <HighScoreModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.ADDITION}
        userId="user1"
      />
    );

    expect(screen.getByText(/High Scores - Addition/)).toBeInTheDocument();
  });

  it('should display top scores when data is available', async () => {
    // Mock successful API response with data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        topEntries: [
          {
            id: 'entry1',
            score: 10,
            points: 100,
            date: '2025-06-04T19:00:00.000Z',
            user: {
              id: 'user1',
              name: 'Top Player',
              email: 'top@example.com'
            }
          }
        ]
      })
    } as Response);

    render(
      <HighScoreModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.ADDITION}
        userId="user1"
      />
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Top Player (You)')).toBeInTheDocument();
      expect(screen.getByText('100 pts')).toBeInTheDocument();
      expect(screen.getByText('10 correct')).toBeInTheDocument();
    });
  });

  it('should show empty state when no scores exist', async () => {
    // Mock successful API response with no data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        topEntries: []
      })
    } as Response);

    render(
      <HighScoreModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.MULTIPLICATION}
        userId="user1"
      />
    );

    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText(/No high scores yet for Multiplication/)).toBeInTheDocument();
    });
  });
});