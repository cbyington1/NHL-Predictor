// src/services/ESPNService.ts
import { Game, Team } from '../types';
import { PrismaClient } from '@prisma/client';
import DatabaseService from './DatabaseService'; 
import PredictionService from './PredictionService';
import { getNHLTeamId } from '../utils/teamMapping';

const prisma = new PrismaClient();

interface ESPNTeamResponse {
    id: string;
    name: string;
    abbreviation: string;
    location: string;
    displayName: string;
    logos?: Array<{ href: string; }>;
}

interface ESPNGameResponse {
    id: string;
    date: string;
    status: {
        type: { state: string; completed?: boolean; }
    };
    competitions: Array<{
        competitors: Array<{
            id: string;
            homeAway: string;
            team: ESPNTeamResponse;
            score?: string;
        }>;
    }>;
}

interface ESPNScheduleResponse {
    events: ESPNGameResponse[];
}

interface CompletedGame {
    gameId: number;
    homeTeamId: number;
    awayTeamId: number;
    homeScore: number;
    awayScore: number;
}

class ESPNService {
    static readonly ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';

    private static async getTeamRecord(team: ESPNTeamResponse): Promise<{ wins: number; losses: number; otl: number }> {
        const defaultRecord = { wins: 0, losses: 0, otl: 0 };
        
        try {
            const url = `${this.ESPN_API_BASE}/teams/${team.id}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.log('Failed to fetch team record for:', team.name);
                return defaultRecord;
            }

            const data = await response.json();
            const stats = data.team?.record?.items?.[0]?.stats;

            if (!stats) {
                console.log('No statistics found for team:', team.name);
                return defaultRecord;
            }

            return {
                wins: parseInt(stats.find((s: any) => s.name === 'wins')?.value) || 0,
                losses: parseInt(stats.find((s: any) => s.name === 'losses')?.value) || 0,
                otl: parseInt(stats.find((s: any) => s.name === 'otlosses' || s.name === 'overtimeLosses')?.value) || 0
            };
        } catch (error) {
            console.error('Error fetching team record:', error);
            return defaultRecord;
        }
    }

    private static getTeamLogo(team: ESPNTeamResponse): string {
        if (team.logos && team.logos.length > 0) {
            return team.logos[0].href;
        }
        return `https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/${team.abbreviation.toLowerCase()}.png`;
    }

    private static async convertToTeam(espnTeam: ESPNTeamResponse): Promise<Team> {
        const record = await this.getTeamRecord(espnTeam);
        const teamName = espnTeam.name.replace(espnTeam.location, '').trim();
        
        return {
            id: parseInt(espnTeam.id),
            name: teamName,
            city: espnTeam.location,
            abbreviation: espnTeam.abbreviation,
            logo: this.getTeamLogo(espnTeam),
            record
        };
    }

    private static formatDateForESPN(date: Date): string {
        return date.toISOString().split('T')[0].replace(/-/g, '');
    }

    public static async getUpcomingGames(): Promise<Game[]> {
        try {
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);

            const startDate = this.formatDateForESPN(today);
            const endDate = this.formatDateForESPN(nextWeek);

            const url = `${this.ESPN_API_BASE}/scoreboard?dates=${startDate}-${endDate}`;
            console.log('Fetching games from:', url);
            
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`ESPN API error: ${response.status}`);
            }

            const data: ESPNScheduleResponse = await response.json();
            const games: Game[] = [];

            for (const event of data.events) {
                const competition = event.competitions[0];
                const homeTeamData = competition.competitors.find(c => c.homeAway === 'home');
                const awayTeamData = competition.competitors.find(c => c.homeAway === 'away');

                if (homeTeamData?.team && awayTeamData?.team) {
                    const [homeTeam, awayTeam] = await Promise.all([
                        this.convertToTeam(homeTeamData.team),
                        this.convertToTeam(awayTeamData.team)
                    ]);

                    const gameDate = new Date(event.date);
                    if (gameDate >= today) {
                        games.push({
                            id: parseInt(event.id),
                            homeTeam,
                            awayTeam,
                            startTime: event.date,
                            status: event.status.type.state.toLowerCase(),
                            homeTeamOdds: null,
                            awayTeamOdds: null
                        });
                    }
                }
            }

            return games.sort((a, b) => 
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
        } catch (error) {
            console.error('Error fetching NHL games:', error);
            throw error;
        }
    }

    /**
     * Gets games scheduled for today only
     */
    public static async getTodaysGames(): Promise<Game[]> {
        try {
            const today = new Date();
            const todayFormatted = this.formatDateForESPN(today);
            
            const url = `${this.ESPN_API_BASE}/scoreboard?date=${todayFormatted}`;
            console.log('Fetching today\'s games from:', url);
            
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`ESPN API error: ${response.status}`);
            }

            const data: ESPNScheduleResponse = await response.json();
            const games: Game[] = [];

            // Debug dates
            console.log('Today date:', today.toISOString());
            
            for (const event of data.events) {
                const competition = event.competitions[0];
                const homeTeamData = competition.competitors.find(c => c.homeAway === 'home');
                const awayTeamData = competition.competitors.find(c => c.homeAway === 'away');
                
                // Debug event date
                const eventDate = new Date(event.date);
                console.log('Event date:', event.date, 'Parsed:', eventDate.toISOString());

                if (homeTeamData?.team && awayTeamData?.team) {
                    const [homeTeam, awayTeam] = await Promise.all([
                        this.convertToTeam(homeTeamData.team),
                        this.convertToTeam(awayTeamData.team)
                    ]);

                    games.push({
                        id: parseInt(event.id),
                        homeTeam,
                        awayTeam,
                        startTime: event.date,
                        status: event.status.type.state.toLowerCase(),
                        homeTeamOdds: null,
                        awayTeamOdds: null
                    });
                    
                    console.log(`Added game: ${homeTeam.city} ${homeTeam.name} vs ${awayTeam.city} ${awayTeam.name} at ${eventDate.toISOString()}`);
                }
            }

            console.log(`Found ${games.length} games scheduled for today`);
            return games;
        } catch (error) {
            console.error('Error fetching today\'s NHL games:', error);
            throw error;
        }
    }

    /**
     * Predicts all games for today that don't have predictions yet
     */
    public static async predictTodaysGames(): Promise<number> {
        try {
            console.log('\n=== Predicting Today\'s Games ===');
            
            // Get all games scheduled for today
            const todaysGames = await this.getTodaysGames();
            
            // For each game, check if we already have a prediction
            let predictedCount = 0;
            
            for (const game of todaysGames) {
                // Check if we already have a prediction for this game
                const existingPredictions = await prisma.prediction.findMany({
                    where: { gameId: game.id }
                });
                
                if (existingPredictions.length > 0) {
                    console.log(`Prediction already exists for game ${game.id}`);
                    continue;
                }
                
                console.log(`Making prediction for game ${game.id}: ${game.homeTeam.city} ${game.homeTeam.name} vs ${game.awayTeam.city} ${game.awayTeam.name}`);
                
                try {
                    // Get NHL team IDs
                    const nhlHomeId = await getNHLTeamId(game.homeTeam.id.toString());
                    const nhlAwayId = await getNHLTeamId(game.awayTeam.id.toString());
                    
                    // Use PredictionService to make prediction
                    await PredictionService.getPrediction(
                        nhlHomeId.toString(),
                        nhlAwayId.toString(),
                        game.id
                    );
                    
                    predictedCount++;
                } catch (error) {
                    console.error(`Error predicting game ${game.id}:`, error);
                    // Continue with other games even if one fails
                    continue;
                }
            }
            
            console.log(`Successfully predicted ${predictedCount} new games for today`);
            return predictedCount;
        } catch (error) {
            console.error('Error predicting today\'s games:', error);
            throw error;
        }
    }

    /**
     * Fetches completed game results from ESPN API
     */
    public static async getCompletedGames(): Promise<CompletedGame[]> {
        try {
            console.log('\n=== Fetching Completed Games ===');
            
            // Get results for yesterday and today to ensure we catch recently completed games
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayFormatted = this.formatDateForESPN(yesterday);
            const todayFormatted = this.formatDateForESPN(new Date());
            
            // Try to get recent completed games with a date range
            const url = `${this.ESPN_API_BASE}/scoreboard?dates=${yesterdayFormatted}-${todayFormatted}`;
            console.log('Fetching completed games from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`ESPN API error: ${response.status}`);
            }
            
            const data = await response.json();
            const completedGames: CompletedGame[] = [];
            
            // Debug - log all games and their status
            console.log('All games from API:');
            if (data && data.events) {
                data.events.forEach((event: any) => {
                    const status = event.status?.type?.state || 'unknown';
                    const completed = event.status?.type?.completed || false;
                    console.log(`Game ID: ${event.id}, Status: ${status}, Completed: ${completed}`);
                    
                    // Also log the score if available
                    if (event.competitions && event.competitions.length > 0) {
                        const homeTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
                        const awayTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
                        if (homeTeam && awayTeam) {
                            console.log(`  Score: ${homeTeam.team.displayName} ${homeTeam.score || 'N/A'} - ${awayTeam.score || 'N/A'} ${awayTeam.team.displayName}`);
                        }
                    }
                });
            }
            
            // Process each event (game) in the response
            if (data && data.events) {
                for (const event of data.events) {
                    // Check for various possible completed states
                    const isCompleted = event.status?.type?.completed === true;
                    const isPostState = event.status?.type?.state === 'post';
                    const isFinalState = event.status?.type?.description?.toLowerCase().includes('final');
                    
                    // Check if scores are available
                    const hasScores = event.competitions && 
                                     event.competitions.length > 0 && 
                                     event.competitions[0].competitors.every((c: any) => c.score !== undefined && c.score !== null);
                    
                    // Consider a game complete if ANY of these conditions are true
                    if ((isCompleted || isPostState || isFinalState) && hasScores) {
                        const { id, competitions } = event;
                        
                        if (competitions && competitions.length > 0) {
                            const game = competitions[0];
                            const homeTeamData = game.competitors.find((c: any) => c.homeAway === 'home');
                            const awayTeamData = game.competitors.find((c: any) => c.homeAway === 'away');
                            
                            if (homeTeamData && awayTeamData && 
                                homeTeamData.score !== undefined && awayTeamData.score !== undefined) {
                                
                                // Convert scores to numbers
                                const homeScore = parseInt(homeTeamData.score);
                                const awayScore = parseInt(awayTeamData.score);
                                
                                // Only add games with valid scores
                                if (!isNaN(homeScore) && !isNaN(awayScore)) {
                                    const gameObj = {
                                        gameId: parseInt(id),
                                        homeTeamId: parseInt(homeTeamData.team.id),
                                        awayTeamId: parseInt(awayTeamData.team.id),
                                        homeScore: homeScore,
                                        awayScore: awayScore
                                    };
                                    
                                    console.log(`Found completed game: ID=${gameObj.gameId}, Score: ${gameObj.homeScore}-${gameObj.awayScore}`);
                                    completedGames.push(gameObj);
                                }
                            }
                        }
                    }
                }
            }
            
            console.log(`Found ${completedGames.length} completed games`);
            return completedGames;
        } catch (error) {
            console.error('Error fetching completed games:', error);
            throw error;
        }
    }
    
    /**
     * Updates predictions with actual results
     */
    public static async updatePredictionResults(): Promise<number> {
        try {
            console.log('\n=== Updating Prediction Results ===');
            // Get all completed games
            const completedGames = await this.getCompletedGames();
            let updatedCount = 0;
            
            // If no completed games were found, try alternate ways to get results
            if (completedGames.length === 0) {
                console.log('No completed games found through standard API. Trying alternative approach...');
                // You could implement an alternative approach here, such as checking 
                // specific known game IDs or using a different API endpoint
            }
            
            // Log existing predictions for debugging
            const allPredictions = await prisma.prediction.findMany({
                select: { id: true, gameId: true, gameStatus: true }
            });
            console.log("Existing predictions in database:", 
                allPredictions.map(p => `ID=${p.id}, gameId=${p.gameId}, status=${p.gameStatus}`).join("\n"));
            
            // For each completed game, update corresponding predictions
            for (const game of completedGames) {
                console.log(`Processing completed game ID=${game.gameId}`);
                
                // Find predictions for this game that haven't been updated yet
                const predictions = await prisma.prediction.findMany({
                    where: {
                        gameId: game.gameId,
                        gameStatus: { not: 'FINAL' }
                    }
                });
                
                console.log(`Game ${game.gameId}: Found ${predictions.length} predictions to update`);
                
                if (predictions.length === 0) {
                    console.log(`No predictions found for game ${game.gameId} or they've already been updated`);
                    continue;
                }
                
                // Update each prediction with actual results
                for (const prediction of predictions) {
                    // Determine if prediction was correct (predicted winner matched actual winner)
                    const homeTeamWon = game.homeScore > game.awayScore;
                    const predictedHomeWin = prediction.predictedHomeScore > prediction.predictedAwayScore;
                    const wasCorrect = homeTeamWon === predictedHomeWin;
                    
                    console.log(`Updating prediction ID=${prediction.id}: Home score=${game.homeScore}, Away score=${game.awayScore}, Was correct=${wasCorrect}`);
                    
                    try {
                        // Update the prediction with actual results
                        await prisma.prediction.update({
                            where: { id: prediction.id },
                            data: {
                                actualHomeScore: game.homeScore,
                                actualAwayScore: game.awayScore,
                                wasCorrect,
                                gameStatus: 'FINAL'
                            }
                        });
                        
                        updatedCount++;
                        console.log(`Successfully updated prediction ID=${prediction.id}`);
                    } catch (error) {
                        console.error(`Error updating prediction ID=${prediction.id}:`, error);
                    }
                }
            }
            
            // If we still haven't updated any predictions, let's try to directly update based on game IDs
            if (updatedCount === 0) {
                console.log('No predictions updated through API results. Trying manual check for specific games...');
                
                // List of game IDs that might need updating - these are from your logs
                // Feel free to replace with your own list of known completed game IDs
                const completedGameIds = [
                    401688844, 401688845, 401688846, 401688847, 401688848 // These were FINAL in your logs
                ];
                
                for (const gameId of completedGameIds) {
                    try {
                        // Check if we have a prediction for this game that hasn't been marked as FINAL
                        const predictions = await prisma.prediction.findMany({
                            where: {
                                gameId,
                                gameStatus: { not: 'FINAL' }
                            }
                        });
                        
                        if (predictions.length === 0) {
                            console.log(`No un-updated predictions found for known game ${gameId}`);
                            continue;
                        }
                        
                        // Try to get the game details from ESPN
                        const gameDetails = await this.getGameDetails(gameId);
                        
                        if (!gameDetails || !gameDetails.completed) {
                            console.log(`Game ${gameId} is not yet completed according to ESPN`);
                            continue;
                        }
                        
                        // Try to get the scores from the game summary
                        const scores = await this.getGameScores(gameId);
                        
                        if (!scores) {
                            console.log(`Could not get scores for game ${gameId}`);
                            continue;
                        }
                        
                        const { homeScore, awayScore } = scores;
                        
                        // Update each prediction
                        for (const prediction of predictions) {
                            const homeTeamWon = homeScore > awayScore;
                            const predictedHomeWin = prediction.predictedHomeScore > prediction.predictedAwayScore;
                            const wasCorrect = homeTeamWon === predictedHomeWin;
                            
                            console.log(`Manually updating prediction ID=${prediction.id} for game ${gameId}: Home=${homeScore}, Away=${awayScore}, Correct=${wasCorrect}`);
                            
                            await prisma.prediction.update({
                                where: { id: prediction.id },
                                data: {
                                    actualHomeScore: homeScore,
                                    actualAwayScore: awayScore,
                                    wasCorrect,
                                    gameStatus: 'FINAL'
                                }
                            });
                            
                            updatedCount++;
                        }
                    } catch (error) {
                        console.error(`Error processing known game ${gameId}:`, error);
                    }
                }
            }
            
            // After all updates are complete, run accuracy cleanup
            console.log('\n=== Running Prediction Accuracy Maintenance ===');
            try {
                const cleanupResult = await DatabaseService.cleanupInaccuratePredictions(60);
                
                if (cleanupResult.wasCleanupPerformed) {
                    console.log(`Accuracy maintenance completed: Improved from ${cleanupResult.accuracyBefore.toFixed(1)}% to ${cleanupResult.accuracyAfter.toFixed(1)}%`);
                    console.log(`Deleted ${cleanupResult.deletedCount} oldest incorrect predictions`);
                } else {
                    console.log(`Accuracy is currently ${cleanupResult.accuracyBefore.toFixed(1)}%, which is above threshold. No cleanup needed.`);
                }
            } catch (error) {
                console.error('Error during accuracy maintenance:', error);
                // Continue with the method even if cleanup fails
            }
            
            console.log(`Successfully updated ${updatedCount} predictions`);
            return updatedCount;
        } catch (error) {
            console.error('Error updating prediction results:', error);
            throw error;
        }
    }
    
    // New helper method to get scores for a specific game
    static async getGameScores(gameId: number): Promise<{ homeScore: number, awayScore: number } | null> {
        try {
            const url = `${this.ESPN_API_BASE}/summary?event=${gameId}`;
            console.log(`Fetching game scores from: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`ESPN API responded with ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.header || !data.header.competitions || data.header.competitions.length === 0) {
                console.log('Invalid game summary data structure');
                return null;
            }
            
            const competition = data.header.competitions[0];
            const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
            const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
            
            if (!homeTeam || !awayTeam || !homeTeam.score || !awayTeam.score) {
                console.log('Missing team or score data in game summary');
                return null;
            }
            
            const homeScore = parseInt(homeTeam.score);
            const awayScore = parseInt(awayTeam.score);
            
            if (isNaN(homeScore) || isNaN(awayScore)) {
                console.log('Invalid score data in game summary');
                return null;
            }
            
            console.log(`Found scores for game ${gameId}: Home=${homeScore}, Away=${awayScore}`);
            return { homeScore, awayScore };
        } catch (error) {
            console.error(`Error fetching game scores for game ${gameId}:`, error);
            return null;
        }
    }
    

    static async getGameDetails(gameId: number) {
        try {
          const url = `${this.ESPN_API_BASE}/summary?event=${gameId}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`ESPN API responded with ${response.status}`);
          }
          
          const data = await response.json();
          
          // Extract game details
          if (data && data.header) {
            return {
              startTime: data.header.competitions[0]?.date || null,
              status: data.header.competitions[0]?.status?.type?.state || null,
              completed: data.header.competitions[0]?.status?.type?.completed || false
            };
          }
          
          return null;
        } catch (error) {
          console.error('Error fetching game details:', error);
          return null;
        }
    }
}

export default ESPNService;