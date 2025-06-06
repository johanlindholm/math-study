import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameType, score, points } = await request.json();
    
    if (!gameType || typeof score !== 'number' || typeof points !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Save the leaderboard entry
    const entry = await prisma.leaderboardEntry.create({
      data: {
        userId: session.user.id,
        gameType,
        score,
        points,
      },
    });

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    console.error('Error saving leaderboard entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const gameType = url.searchParams.get('gameType');
    const userScore = parseInt(url.searchParams.get('userScore') || '0');
    const userPoints = parseInt(url.searchParams.get('userPoints') || '0');
    
    if (!gameType) {
      return NextResponse.json({ error: 'Game type required' }, { status: 400 });
    }

    // Get top 10 scores for this game type
    const topEntries = await prisma.leaderboardEntry.findMany({
      where: { gameType },
      orderBy: [
        { points: 'desc' },
        { score: 'desc' },
        { date: 'asc' }
      ],
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Get all entries for this game type to calculate position properly
    const allEntries = await prisma.leaderboardEntry.findMany({
      where: { gameType },
      orderBy: [
        { points: 'desc' },
        { score: 'desc' },
        { date: 'asc' }
      ],
      select: {
        id: true,
        points: true,
        score: true,
        date: true,
        userId: true
      }
    });

    // Find user's most recent entry to get the exact position
    const userEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        gameType,
        userId: session.user.id,
        score: userScore,
        points: userPoints
      },
      orderBy: { date: 'desc' }
    });

    // Calculate position based on entries that are strictly better
    let userPosition = 1;
    if (userEntry) {
      userPosition = allEntries.findIndex(entry => entry.id === userEntry.id) + 1;
    } else {
      // Fallback: count entries that are better
      userPosition = allEntries.filter(entry => {
        if (entry.points > userPoints) return true;
        if (entry.points === userPoints && entry.score > userScore) return true;
        if (entry.points === userPoints && entry.score === userScore && entry.date < new Date()) return true;
        return false;
      }).length + 1;
    }

    // Get 3 entries above and below user's position
    const contextEntries = await prisma.leaderboardEntry.findMany({
      where: { gameType },
      orderBy: [
        { points: 'desc' },
        { score: 'desc' }, 
        { date: 'asc' }
      ],
      skip: Math.max(0, userPosition - 4), // 3 above + user position
      take: 7, // 3 above + user + 3 below
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      topEntries,
      userPosition,
      contextEntries,
      userScore,
      userPoints,
      newEntryId: userEntry?.id
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}