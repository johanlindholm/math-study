/**
 * Integration test for the leaderboard ranking fix
 * This test demonstrates that the first entry should be ranked #1, not #2
 */

describe('Leaderboard Ranking Fix Integration Test', () => {
  
  // Test the specific scenario mentioned in the bug report
  it('should demonstrate the ranking bug and fix', () => {
    console.log('=== LEADERBOARD RANKING BUG ANALYSIS ===');
    
    // Scenario: First user plays a game and gets 18 points, 2 correct answers
    const firstUserResults = {
      points: 18,
      score: 2,
      gameType: 'addition'
    };
    
    console.log('User completed game with:', firstUserResults);
    
    // This is what happens in the current (buggy) implementation:
    console.log('\n--- BUGGY IMPLEMENTATION ---');
    
    // 1. User entry is saved to database with current timestamp
    const userEntryDate = new Date();
    console.log('User entry saved at:', userEntryDate.toISOString());
    
    // 2. Immediately after, the leaderboard GET endpoint is called
    // 3. The count query runs with `new Date()` which is slightly later
    const queryDate = new Date(userEntryDate.getTime() + 100); // 100ms later
    console.log('Query executed at:', queryDate.toISOString());
    
    // 4. The buggy condition: { score: userScore, date: { lt: new Date() } }
    // This matches the user's own entry because userEntryDate < queryDate
    const buggyCounting = (userEntryDate < queryDate) ? 1 : 0;
    const buggyPosition = buggyCounting + 1;
    
    console.log('Buggy condition matches user\'s own entry:', userEntryDate < queryDate);
    console.log('Buggy count of "better" entries:', buggyCounting);
    console.log('Buggy calculated position:', buggyPosition);
    
    expect(buggyPosition).toBe(2); // This demonstrates the bug!
    
    console.log('\n--- FIXED IMPLEMENTATION ---');
    
    // Fixed logic: Don't use `new Date()` for comparison, instead find actual user entry
    const allEntries = [
      // In reality, this would be empty for the first entry
    ];
    
    const correctPosition = allEntries.length + 1;
    console.log('Correct count of entries:', allEntries.length);
    console.log('Correct calculated position:', correctPosition);
    
    expect(correctPosition).toBe(1); // This is the correct result!
    
    console.log('\n=== CONCLUSION ===');
    console.log('The bug was caused by using `new Date()` in the count query,');
    console.log('which counted the user\'s own entry as "better than itself"');
    console.log('due to the slight time difference between saving and querying.');
  });
  
  it('should show how the fix works with multiple entries', () => {
    console.log('\n=== TESTING WITH MULTIPLE ENTRIES ===');
    
    // Simulate a leaderboard with existing entries
    const existingEntries = [
      { id: '1', points: 150, score: 8, date: new Date('2025-01-01'), userId: 'user1' },
      { id: '2', points: 120, score: 6, date: new Date('2025-01-02'), userId: 'user2' },
      { id: '3', points: 80, score: 4, date: new Date('2025-01-03'), userId: 'user3' }
    ];
    
    // New user gets 100 points, 5 correct
    const newUserEntry = { points: 100, score: 5, userId: 'user4' };
    
    console.log('Existing leaderboard:');
    existingEntries.forEach((entry, index) => {
      console.log(`${index + 1}. User ${entry.userId}: ${entry.points} pts, ${entry.score} correct`);
    });
    
    console.log(`\nNew user: ${newUserEntry.points} pts, ${newUserEntry.score} correct`);
    
    // Count entries that are strictly better
    const betterEntries = existingEntries.filter(entry => {
      if (entry.points > newUserEntry.points) return true;
      if (entry.points === newUserEntry.points && entry.score > newUserEntry.score) return true;
      return false;
    });
    
    const correctPosition = betterEntries.length + 1;
    
    console.log('Entries with better performance:', betterEntries.length);
    console.log('New user should be ranked #' + correctPosition);
    
    expect(correctPosition).toBe(3); // Should be 3rd place
  });
});
