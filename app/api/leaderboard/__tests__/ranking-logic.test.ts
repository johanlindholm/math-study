/**
 * Test for the leaderboard ranking calculation bug
 * 
 * The issue: First entry shows as ranked #2 instead of #1
 * This test isolates the ranking calculation logic to identify the bug
 */

import { NextRequest } from 'next/server';

// Create a simplified version of the ranking calculation for testing
function calculateUserPosition(userPoints: number, userScore: number, existingEntries: any[]) {
  // This mimics the logic from the GET endpoint in route.ts
  const betterEntriesCount = existingEntries.filter(entry => {
    // Entry has higher points
    if (entry.points > userPoints) return true;
    
    // Entry has same points but higher score
    if (entry.points === userPoints && entry.score > userScore) return true;
    
    // Entry has same points and score but earlier date
    if (entry.points === userPoints && entry.score === userScore) {
      // For this test, we'll assume current date is later than existing entries
      return entry.date < new Date();
    }
    
    return false;
  }).length;
  
  return betterEntriesCount + 1;
}

describe('Leaderboard Ranking Calculation', () => {
  it('should rank first entry as #1', () => {
    const userPoints = 18;
    const userScore = 2;
    const existingEntries: any[] = []; // Empty array = first entry
    
    const position = calculateUserPosition(userPoints, userScore, existingEntries);
    
    expect(position).toBe(1); // Should be 1, not 2
  });
  
  it('should rank user correctly when they have the highest score', () => {
    const userPoints = 150;
    const userScore = 8;
    const existingEntries = [
      { points: 100, score: 5, date: new Date('2025-01-01') },
      { points: 80, score: 3, date: new Date('2025-01-02') }
    ];
    
    const position = calculateUserPosition(userPoints, userScore, existingEntries);
    
    expect(position).toBe(1);
  });
  
  it('should rank user correctly when they have a middle score', () => {
    const userPoints = 100;
    const userScore = 5;
    const existingEntries = [
      { points: 150, score: 8, date: new Date('2025-01-01') }, // Better
      { points: 80, score: 3, date: new Date('2025-01-02') }   // Worse
    ];
    
    const position = calculateUserPosition(userPoints, userScore, existingEntries);
    
    expect(position).toBe(2); // 1 entry is better
  });
  
  it('should handle tie-breaking by points first', () => {
    const userPoints = 100;
    const userScore = 5;
    const existingEntries = [
      { points: 120, score: 5, date: new Date('2025-01-01') }, // Better points
      { points: 80, score: 7, date: new Date('2025-01-02') }   // Worse points, better score
    ];
    
    const position = calculateUserPosition(userPoints, userScore, existingEntries);
    
    expect(position).toBe(2); // Only 1 entry has better points
  });
  
  it('should handle tie-breaking by score when points are equal', () => {
    const userPoints = 100;
    const userScore = 5;
    const existingEntries = [
      { points: 100, score: 7, date: new Date('2025-01-01') }, // Same points, better score
      { points: 100, score: 3, date: new Date('2025-01-02') }  // Same points, worse score
    ];
    
    const position = calculateUserPosition(userPoints, userScore, existingEntries);
    
    expect(position).toBe(2); // 1 entry has better score
  });
    it('should handle tie-breaking by date when points and score are equal', () => {
    const userPoints = 100;
    const userScore = 5;
    const existingEntries = [
      { points: 100, score: 5, date: new Date('2025-01-01') }, // Same points/score, earlier date
      { points: 100, score: 5, date: new Date('2025-01-03') }  // Same points/score, later date  
    ];
    
    const position = calculateUserPosition(userPoints, userScore, existingEntries);
    
    // User's entry would be created "now" (later than both), so should rank after both entries
    expect(position).toBe(3); // Both entries have earlier dates, so user ranks 3rd
  });
});

// Now let's test what the actual problem might be
describe('Debugging the specific bug scenario', () => {
  it('should identify why first entry shows as #2', () => {
    // This is the exact scenario from the bug report:
    // First entry with 18 points, 2 correct answers, showing as ranked #2
    
    const userPoints = 18;
    const userScore = 2;
    const existingEntries: any[] = []; // This should be empty for the first entry
    
    // Test our simplified calculation
    const calculatedPosition = calculateUserPosition(userPoints, userScore, existingEntries);
    console.log('Calculated position:', calculatedPosition);
    console.log('Number of existing entries:', existingEntries.length);
    console.log('Number of better entries should be:', 0);
    
    expect(calculatedPosition).toBe(1);
    
    // The bug is likely in how the database query counts entries
    // The issue might be that the count query includes the user's own entry
    // or there's a problem with the date comparison logic
  });
});
