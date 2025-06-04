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

    // Find user's position and surrounding scores
    const userPosition = await prisma.leaderboardEntry.count({
      where: {
        gameType,
        OR: [
          { points: { gt: userPoints } },
          { 
            points: userPoints,
            OR: [
              { score: { gt: userScore } },
              { score: userScore, date: { lt: new Date() } }
            ]
          }
        ]
      }
    }) + 1;

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
      userPoints
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}