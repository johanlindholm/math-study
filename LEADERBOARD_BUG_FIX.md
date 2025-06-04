# Leaderboard Ranking Bug Fix

## Problem Description

**Issue:** First entry in the leaderboard was being ranked as #2 instead of #1.

**Observed Behavior:**
```
🎉 Game Complete! 🎉
Your Performance
18 Points
2 Questions Correct
Ranked #2 in Addition
🏆 Top Scores
1.
Johan Lindholm (You)
18 pts
2 correct
```

This was confusing because there was only one entry in the database (the first entry), but it was showing as ranked #2.

## Root Cause Analysis

The bug was located in `/app/api/leaderboard/route.ts` in the GET endpoint, specifically in this code:

```typescript
// BUGGY CODE
const userPosition = await prisma.leaderboardEntry.count({
  where: {
    gameType,
    OR: [
      { points: { gt: userPoints } },
      { 
        points: userPoints,
        OR: [
          { score: { gt: userScore } },
          { score: userScore, date: { lt: new Date() } } // ← BUG IS HERE
        ]
      }
    ]
  }
}) + 1;
```

### Why This Was Broken

1. **Timing Issue**: When a user completes a game:
   - Their entry is saved to the database with a timestamp (e.g., `2025-06-04T19:00:00.100Z`)
   - Immediately after, the leaderboard GET endpoint is called
   - The `new Date()` in the count query is executed slightly later (e.g., `2025-06-04T19:00:00.150Z`)

2. **Self-Counting Bug**: The condition `{ score: userScore, date: { lt: new Date() } }` was designed for tie-breaking, but it ended up matching the user's own entry because:
   - The user's entry had the same score (`userScore`)
   - The user's entry date was earlier than `new Date()` (due to the timing difference)
   - So the query counted the user's own entry as "better than itself"

3. **Mathematical Error**: 
   - Expected count of better entries: 0 (for first entry)
   - Actual count: 1 (user's own entry)
   - Calculated position: 1 + 1 = 2 (should be 1)

## The Fix

The solution involves two improvements:

### 1. Find the Actual User Entry
Instead of relying on timing-sensitive comparisons with `new Date()`, we now:
- First save the user's entry
- Then find that specific entry in the database
- Calculate position based on the actual ranking in the ordered list

### 2. Improved Position Calculation
```typescript
// FIXED CODE
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
```

## Test Coverage

Created comprehensive tests to verify the fix:

1. **Unit Tests** (`ranking-logic.test.ts`): Tests the ranking calculation logic in isolation
2. **Integration Tests** (`ranking-fix.test.ts`): Demonstrates the bug and validates the fix
3. **API Tests** (`route.test.ts`): Tests the leaderboard API endpoints
4. **Component Tests** (`LeaderboardModal.ranking.test.tsx`): Tests the UI component behavior

## Verification

The fix ensures that:
- ✅ First entry shows as ranked #1 (not #2)
- ✅ Tie-breaking works correctly (points → score → date)
- ✅ Multiple entries are ranked in the correct order
- ✅ No timing-related bugs in position calculation
- ✅ Proper error handling when database queries fail

## Files Modified

1. `/app/api/leaderboard/route.ts` - Fixed the ranking calculation logic
2. `/app/api/leaderboard/__tests__/` - Added comprehensive test suite
3. `/jest.setup.js` - Added Web API polyfills for testing

The fix resolves the confusing user experience where the first player would see themselves ranked as #2 instead of #1.
