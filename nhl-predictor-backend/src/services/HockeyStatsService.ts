// services/HockeyStatsService.ts
class HockeyStatsService {
    private static readonly NHL_STATS_API = 'https://api.nhle.com/stats/rest/en/team';

    static async getTeamStats(teamId: string) {
        console.log(`\nFetching stats for team ID: ${teamId}`);
        try {
            const url = `${this.NHL_STATS_API}/summary?cayenneExp=teamId=${teamId}`;
            console.log('API URL:', url);
            
            const response = await fetch(url);
            console.log('API Response Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`NHL API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Raw API Response Data Length:', data.data?.length || 0);
            console.log('Available Season IDs:', data.data?.map((s: any) => s.seasonId).join(', '));
            
            if (!data.data || data.data.length === 0) {
                throw new Error('No data returned from NHL API');
            }
            
            // Get current season's stats
            const currentStats = data.data.find((season: any) => season.seasonId === 20242025) || data.data[0];
            console.log('Selected Season ID:', currentStats?.seasonId);
            
            if (!currentStats) {
                throw new Error('No current season stats found');
            }

            // Log the actual values we're trying to access
            console.log('\nKey Stats Values:');
            console.log('Games Played:', currentStats.gamesPlayed);
            console.log('Goals For:', currentStats.goalsFor);
            console.log('Goals Against:', currentStats.goalsAgainst);
            console.log('Shots For Per Game:', currentStats.shotsForPerGame);
            console.log('Shots Against Per Game:', currentStats.shotsAgainstPerGame);
            console.log('Power Play %:', currentStats.powerPlayPct);
            console.log('Penalty Kill %:', currentStats.penaltyKillPct);
            
            return {
                basic: {
                    gamesPlayed: currentStats.gamesPlayed || 0,
                    wins: currentStats.wins || 0,
                    losses: currentStats.losses || 0,
                    otLosses: currentStats.otLosses || 0,
                    points: currentStats.points || 0,
                    goalsFor: currentStats.goalsFor || 0,
                    goalsAgainst: currentStats.goalsAgainst || 0,
                    goalDifferential: (currentStats.goalsFor || 0) - (currentStats.goalsAgainst || 0),
                    goalsForPerGame: currentStats.goalsForPerGame || 0,
                    goalsAgainstPerGame: currentStats.goalsAgainstPerGame || 0
                },
                shooting: {
                    shotsForPerGame: currentStats.shotsForPerGame || 0,
                    shotsAgainstPerGame: currentStats.shotsAgainstPerGame || 0,
                    shootingPct: Number(((currentStats.goalsForPerGame / currentStats.shotsForPerGame) * 100).toFixed(2)) || 0,
                    savePct: Number((((currentStats.shotsAgainstPerGame - currentStats.goalsAgainstPerGame) / currentStats.shotsAgainstPerGame) * 100).toFixed(2)) || 0,
                },
                special: {
                    powerPlayPct: currentStats.powerPlayPct || 0,
                    penaltyKillPct: currentStats.penaltyKillPct || 0,
                    faceoffWinPct: currentStats.faceoffWinPct || 0
                }
            };
        } catch (error: unknown) {
            console.error('\nError in getTeamStats:');
            console.error('Team ID:', teamId);
            if (error instanceof Error) {
                console.error('Error Type:', error.constructor.name);
                console.error('Error Message:', error.message);
                console.error('Stack Trace:', error.stack);
            } else {
                console.error('Unknown error:', error);
            }
            throw error;
        }
    }

    static async getHistoricalStats(teamId: string) {
        console.log(`\nFetching historical stats for team ID: ${teamId}`);
        try {
            const url = `${this.NHL_STATS_API}/summary?cayenneExp=teamId=${teamId}`;
            console.log('API URL:', url);
            
            const response = await fetch(url);
            console.log('API Response Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`NHL API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Historical Data Seasons:', data.data?.length || 0);
            
            return data.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error fetching historical stats:', {
                    type: error.constructor.name,
                    message: error.message,
                    stack: error.stack
                });
            } else {
                console.error('Unknown error fetching historical stats:', error);
            }
            throw error;
        }
    }
}

export default HockeyStatsService;