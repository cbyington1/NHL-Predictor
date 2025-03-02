// src/index.ts
import express from 'express';
import cors from 'cors';
import HockeyStatsService from './services/HockeyStatsService';
import PredictionService from './services/PredictionService';
import DatabaseService from './services/DatabaseService';
import { getNHLTeamId } from './utils/teamMapping';

const app = express();
const port = 3000;

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
        const nhlHomeId = await getNHLTeamId(homeTeamId);
        const nhlAwayId = await getNHLTeamId(awayTeamId);
        
        const prediction = await PredictionService.getPrediction(
            nhlHomeId.toString(),
            nhlAwayId.toString()
        );
        res.json(prediction);
    } catch (error: unknown) {
        console.error('Error:', error);
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

// Initialize server
async function startServer() {
    try {
        await getNHLTeamId('1'); // This will trigger the initialization

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();