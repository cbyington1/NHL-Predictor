// src/index.ts
import express from 'express';
import cors from 'cors';
import HockeyStatsService from './services/HockeyStatsService';
import PredictionService from './services/PredictionService';
import DatabaseService from './services/DatabaseService';
import ESPNService from './services/ESPNService';
import { getNHLTeamId } from './utils/teamMapping';

const app = express();
const port = 3000;

// 12 hours in milliseconds
const UPDATE_INTERVAL = 12 * 60 * 60 * 1000;
// 24 hours in milliseconds
const DAILY_INTERVAL = 24 * 60 * 60 * 1000;

app.use(cors());
app.use(express.json());

// Get current season stats
app.get('/api/hockey/stats/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        console.log('\n=== Fetching Team Stats ===');
        console.log('Team ID:', teamId);
        
        const stats = await HockeyStatsService.getTeamStats(teamId);
        console.log('Stats successfully fetched');
        res.json(stats);
    } catch (error: unknown) {
        console.error('\n=== Team Stats Error ===');
        console.error('Team ID:', req.params.teamId);
        if (error instanceof Error) {
            console.error('Error Type:', error.constructor.name);
            console.error('Error Message:', error.message);
            console.error('Stack Trace:', error.stack);
        } else {
            console.error('Unknown error:', error);
        }
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get historical stats if needed
app.get('/api/hockey/history/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        console.log('\n=== Fetching Historical Stats ===');
        console.log('Team ID:', teamId);
        
        const stats = await HockeyStatsService.getHistoricalStats(teamId);
        console.log('Historical stats successfully fetched');
        res.json(stats);
    } catch (error: unknown) {
        console.error('\n=== Historical Stats Error ===');
        console.error('Team ID:', req.params.teamId);
        if (error instanceof Error) {
            console.error('Error Type:', error.constructor.name);
            console.error('Error Message:', error.message);
            console.error('Stack Trace:', error.stack);
        } else {
            console.error('Unknown error:', error);
        }
        res.status(500).json({ error: 'Failed to fetch historical stats' });
    }
});

// List all teams and their IDs
app.get('/api/hockey/teams', async (req, res) => {
    try {
        const url = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams';
        const response = await fetch(url);
        const data = await response.json();

        const teams = data.sports[0].leagues[0].teams.map((team: any) => ({
            name: team.team.displayName,
            abbreviation: team.team.abbreviation,
            espnId: team.team.id,
            nhlId: null
        }));

        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Prediction endpoint
app.get('/api/hockey/predict/:homeTeamId/:awayTeamId', async (req, res) => {
    try {
        const { homeTeamId, awayTeamId } = req.params;
        const espnGameId = req.query.espnGameId ? parseInt(req.query.espnGameId as string) : undefined;
        
        const nhlHomeId = await getNHLTeamId(homeTeamId);
        const nhlAwayId = await getNHLTeamId(awayTeamId);
        
        const prediction = await PredictionService.getPrediction(
            nhlHomeId.toString(),
            nhlAwayId.toString(),
            espnGameId
        );
        res.json(prediction);
    } catch (error: unknown) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate prediction' });
    }
});

// Enhanced prediction endpoint that accepts ESPN game ID directly
app.get('/api/hockey/predict-game/:espnGameId', async (req, res) => {
    try {
        const { espnGameId } = req.params;
        console.log(`Making prediction for ESPN game ID: ${espnGameId}`);
        
        // Get the game data first
        const games = await ESPNService.getUpcomingGames();
        const game = games.find(g => g.id === parseInt(espnGameId));
        
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        const nhlHomeId = await getNHLTeamId(game.homeTeam.id.toString());
        const nhlAwayId = await getNHLTeamId(game.awayTeam.id.toString());
        
        console.log(`Making prediction for teams: ${nhlHomeId} vs ${nhlAwayId} for ESPN game ${espnGameId}`);
        
        const prediction = await PredictionService.getPrediction(
            nhlHomeId.toString(),
            nhlAwayId.toString(),
            parseInt(espnGameId)
        );
        res.json(prediction);
    } catch (error: unknown) {
        console.error('Error making prediction:', error);
        res.status(500).json({ error: 'Failed to generate prediction' });
    }
});

// New database-related endpoints
app.get('/api/predictions/recent', async (req, res) => {
    try {
        const predictions = await DatabaseService.getRecentPredictions();
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching recent predictions:', error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});

app.get('/api/predictions/accuracy', async (req, res) => {
    try {
        const accuracy = await DatabaseService.getPredictionAccuracy();
        res.json(accuracy);
    } catch (error) {
        console.error('Error fetching prediction accuracy:', error);
        res.status(500).json({ error: 'Failed to fetch accuracy' });
    }
});

// Add this to your index.ts file
app.get('/api/debug/games', async (req, res) => {
    try {
        const url = `${ESPNService.ESPN_API_BASE}/scoreboard`;
        console.log('Fetching games from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`ESPN API error: ${response.status}`);
        }
        
        const data = await response.json();
        const games = [];
        
        if (data && data.events) {
            for (const event of data.events) {
                const status = event.status?.type?.state || 'unknown';
                const completed = event.status?.type?.completed || false;
                
                let homeScore = 'N/A';
                let awayScore = 'N/A';
                let homeTeam = 'Unknown';
                let awayTeam = 'Unknown';
                
                if (event.competitions && event.competitions.length > 0) {
                    const competition = event.competitions[0];
                    const homeTeamData = competition.competitors.find((c: any) => c.homeAway === 'home');
                    const awayTeamData = competition.competitors.find((c: any) => c.homeAway === 'away');
                    
                    if (homeTeamData) {
                        homeScore = homeTeamData.score || 'N/A';
                        homeTeam = homeTeamData.team.displayName;
                    }
                    
                    if (awayTeamData) {
                        awayScore = awayTeamData.score || 'N/A';
                        awayTeam = awayTeamData.team.displayName;
                    }
                }
                
                games.push({
                    id: event.id,
                    status,
                    completed,
                    date: event.date,
                    homeTeam,
                    awayTeam,
                    score: `${homeScore}-${awayScore}`
                });
            }
        }
        
        res.json(games);
    } catch (error) {
        console.error('Error fetching games for debugging:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

app.get('/api/predictions/completed', async (req, res) => {
    try {
      const predictions = await DatabaseService.getCompletedPredictions();
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching completed predictions:', error);
      res.status(500).json({ error: 'Failed to fetch completed predictions' });
    }
  });

app.post('/api/predictions/update-result/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { actualHomeScore, actualAwayScore, wasCorrect, gameStatus } = req.body;
        
        const updated = await DatabaseService.updateGameResult(parseInt(gameId), {
            actualHomeScore,
            actualAwayScore,
            wasCorrect,
            gameStatus
        });
        
        res.json(updated);
    } catch (error) {
        console.error('Error updating game result:', error);
        res.status(500).json({ error: 'Failed to update game result' });
    }
});

// New endpoint to manually trigger game result updates
app.post('/api/update-results', async (req, res) => {
    try {
        console.log('Manual update of game results triggered via API');
        const updatedCount = await ESPNService.updatePredictionResults();
        
        res.json({
            success: true,
            updatedCount,
            message: `Successfully updated ${updatedCount} prediction results`
        });
    } catch (error) {
        console.error('Error updating game results:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update game results'
        });
    }
});

// Endpoint to predict all of today's games
app.post('/api/predict-today', async (req, res) => {
    try {
        console.log('Automatic prediction of today\'s games triggered via API');
        const predictedCount = await ESPNService.predictTodaysGames();
        
        res.json({
            success: true,
            predictedCount,
            message: `Successfully predicted ${predictedCount} new games for today`
        });
    } catch (error) {
        console.error('Error predicting today\'s games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to predict today\'s games'
        });
    }
});

// Function to set up automatic updates
function setupAutomaticUpdates() {
    // First predict today's games, then update existing predictions with results
    
    // Run initial prediction for today's games
    console.log('\n=== Starting Initial Today\'s Games Prediction ===');
    ESPNService.predictTodaysGames()
        .then(count => {
            console.log(`Initial prediction completed. Predicted ${count} games for today.`);
            
            // After predicting today's games, update completed games
            console.log('\n=== Starting Initial Game Result Update ===');
            return ESPNService.updatePredictionResults();
        })
        .then(count => {
            console.log(`Initial update completed. Updated ${count} predictions.`);
        })
        .catch(error => {
            console.error('Error during initial setup:', error);
        });
    
    // Set up recurring predictions for new games every 24 hours
    setInterval(() => {
        const now = new Date();
        console.log(`\n=== Running Scheduled Daily Game Prediction at ${now.toISOString()} ===`);
        
        // First predict new games, then update results
        ESPNService.predictTodaysGames()
            .then(predictCount => {
                console.log(`Scheduled prediction completed. Predicted ${predictCount} new games.`);
                
                // After predicting, update results
                console.log(`\n=== Running Scheduled Game Results Update at ${now.toISOString()} ===`);
                return ESPNService.updatePredictionResults();
            })
            .then(updateCount => {
                console.log(`Scheduled update completed. Updated ${updateCount} predictions.`);
            })
            .catch(error => {
                console.error('Error during scheduled updates:', error);
            });
    }, DAILY_INTERVAL);
    
    console.log(`Automatic daily updates scheduled to run every 24 hours`);
}

// Initialize server
async function startServer() {
    try {
        await getNHLTeamId('1'); // This will trigger the initialization

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
            
            // Start automatic updates after server is running
            setupAutomaticUpdates();
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();