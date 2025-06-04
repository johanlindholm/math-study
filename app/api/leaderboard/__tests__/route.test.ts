import { POST, GET } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    leaderboardEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaLeaderboard = (prisma as any).leaderboardEntry;

describe('/api/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST endpoint', () => {
    it('should save a leaderboard entry successfully', async () => {
      // Mock session
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com' }
      } as any);

      // Mock database create
      mockPrismaLeaderboard.create.mockResolvedValue({
        id: 'entry1',
        userId: 'user1',
        gameType: 'addition',
        score: 5,
        points: 100,
        date: new Date(),
        createdAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost/api/leaderboard', {
        method: 'POST',
        body: JSON.stringify({
          gameType: 'addition',
          score: 5,
          points: 100,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.id).toBe('entry1');
      expect(mockPrismaLeaderboard.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          gameType: 'addition',
          score: 5,
          points: 100,
        },
      });
    });

    it('should return 401 for unauthorized user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/leaderboard', {
        method: 'POST',
        body: JSON.stringify({
          gameType: 'addition',
          score: 5,
          points: 100,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('GET endpoint', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com' }
      } as any);
    });

    it('should return correct ranking for first entry', async () => {
      // Mock empty leaderboard (first entry)
      mockPrismaLeaderboard.findMany.mockResolvedValue([]);
      mockPrismaLeaderboard.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=addition&userScore=5&userPoints=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userPosition).toBe(1); // Should be ranked #1, not #2
      expect(data.topEntries).toEqual([]);
    });

    it('should return correct ranking when user has highest score', async () => {
      const existingEntries = [
        {
          id: 'entry1',
          userId: 'user1',
          gameType: 'addition',
          score: 5,
          points: 100,
          date: new Date('2025-01-01'),
          user: { id: 'user1', name: 'User One', email: 'user1@example.com' }
        },
        {
          id: 'entry2',
          userId: 'user2',
          gameType: 'addition',
          score: 3,
          points: 80,
          date: new Date('2025-01-02'),
          user: { id: 'user2', name: 'User Two', email: 'user2@example.com' }
        }
      ];

      mockPrismaLeaderboard.findMany.mockResolvedValue(existingEntries as any);
      mockPrismaLeaderboard.count.mockResolvedValue(0); // No entries better than current user

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=addition&userScore=5&userPoints=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userPosition).toBe(1); // Should be ranked #1
      expect(data.topEntries).toHaveLength(2);
    });

    it('should return correct ranking when user has middle score', async () => {
      const existingEntries = [
        {
          id: 'entry1',
          userId: 'user2',
          gameType: 'addition',
          score: 8,
          points: 150,
          date: new Date('2025-01-01'),
          user: { id: 'user2', name: 'User Two', email: 'user2@example.com' }
        },
        {
          id: 'entry2',
          userId: 'user1',
          gameType: 'addition',
          score: 5,
          points: 100,
          date: new Date('2025-01-02'),
          user: { id: 'user1', name: 'User One', email: 'user1@example.com' }
        },
        {
          id: 'entry3',
          userId: 'user3',
          gameType: 'addition',
          score: 3,
          points: 80,
          date: new Date('2025-01-03'),
          user: { id: 'user3', name: 'User Three', email: 'user3@example.com' }
        }
      ];

      mockPrismaLeaderboard.findMany.mockResolvedValue(existingEntries as any);
      mockPrismaLeaderboard.count.mockResolvedValue(1); // 1 entry better than current user

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=addition&userScore=5&userPoints=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userPosition).toBe(2); // Should be ranked #2
      expect(data.topEntries).toHaveLength(3);
    });

    it('should handle tie-breaking correctly by points first, then score, then date', async () => {
      const existingEntries = [
        {
          id: 'entry1',
          userId: 'user2',
          gameType: 'addition',
          score: 5,
          points: 120, // Higher points - should be #1
          date: new Date('2025-01-02'),
          user: { id: 'user2', name: 'User Two', email: 'user2@example.com' }
        },
        {
          id: 'entry2',
          userId: 'user1',
          gameType: 'addition',
          score: 5,
          points: 100, // Lower points - should be #2
          date: new Date('2025-01-01'),
          user: { id: 'user1', name: 'User One', email: 'user1@example.com' }
        }
      ];

      mockPrismaLeaderboard.findMany.mockResolvedValue(existingEntries as any);
      mockPrismaLeaderboard.count.mockResolvedValue(1); // 1 entry better (higher points)

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=addition&userScore=5&userPoints=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userPosition).toBe(2);
    });

    it('should handle date tie-breaking when points and score are equal', async () => {
      const earlierDate = new Date('2025-01-01');
      const laterDate = new Date('2025-01-02');

      const existingEntries = [
        {
          id: 'entry1',
          userId: 'user2',
          gameType: 'addition',
          score: 5,
          points: 100,
          date: earlierDate, // Earlier date - should rank higher
          user: { id: 'user2', name: 'User Two', email: 'user2@example.com' }
        },
        {
          id: 'entry2',
          userId: 'user1',
          gameType: 'addition',
          score: 5,
          points: 100,
          date: laterDate, // Later date - should rank lower
          user: { id: 'user1', name: 'User One', email: 'user1@example.com' }
        }
      ];

      mockPrismaLeaderboard.findMany.mockResolvedValue(existingEntries as any);
      // Mock count to return 1 because the earlier entry should rank higher
      mockPrismaLeaderboard.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=addition&userScore=5&userPoints=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userPosition).toBe(2);
    });

    it('should filter by game type correctly', async () => {
      mockPrismaLeaderboard.findMany.mockResolvedValue([]);
      mockPrismaLeaderboard.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=multiplication&userScore=5&userPoints=100');
      await GET(request);

      // Verify that all database calls filter by gameType
      expect(mockPrismaLeaderboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { gameType: 'multiplication' }
        })
      );
      expect(mockPrismaLeaderboard.count).toHaveBeenCalledWith({
        where: {
          gameType: 'multiplication',
          OR: expect.any(Array)
        }
      });
    });

    it('should return 400 when gameType is missing', async () => {
      const request = new NextRequest('http://localhost/api/leaderboard?userScore=5&userPoints=100');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Game type required');
    });

    it('should return 401 for unauthorized user', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=addition&userScore=5&userPoints=100');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Ranking calculation edge cases', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com' }
      } as any);
    });

    it('should handle the specific bug case: first entry should be ranked #1', async () => {
      // This test specifically addresses the reported bug
      mockPrismaLeaderboard.findMany.mockResolvedValue([]);
      mockPrismaLeaderboard.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost/api/leaderboard?gameType=addition&userScore=2&userPoints=18');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userPosition).toBe(1); // This should be 1, not 2!
      expect(data.userScore).toBe(2);
      expect(data.userPoints).toBe(18);
    });

    it('should correctly count entries that are strictly better', async () => {
      // Test the counting logic more precisely
      const userPoints = 100;
      const userScore = 5;

      // Mock count call to verify the exact query being made
      mockPrismaLeaderboard.count.mockResolvedValue(0);

      const request = new NextRequest(`http://localhost/api/leaderboard?gameType=addition&userScore=${userScore}&userPoints=${userPoints}`);
      await GET(request);

      // Verify the count query structure
      expect(mockPrismaLeaderboard.count).toHaveBeenCalledWith({
        where: {
          gameType: 'addition',
          OR: [
            { points: { gt: userPoints } }, // Entries with higher points
            { 
              points: userPoints, // Entries with same points but...
              OR: [
                { score: { gt: userScore } }, // Higher score
                { score: userScore, date: { lt: expect.any(Date) } } // Same score but earlier date
              ]
            }
          ]
        }
      });
    });
  });
});
