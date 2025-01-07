// src/models/GameResult.ts
import mongoose from 'mongoose';

const gameResultSchema = new mongoose.Schema({
    gameId: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    seasonId: { 
        type: String, 
        required: true,
        index: true
    },
    date: { 
        type: Date, 
        required: true,
        index: true 
    },
    homeTeam: {
        id: Number,
        stats: {
            basic: {
                goalsForPerGame: Number,
                goalsAgainstPerGame: Number,
                gamesPlayed: Number,
                wins: Number,
                losses: Number,
                otLosses: Number
            },
            shooting: {
                shotsForPerGame: Number,
                shotsAgainstPerGame: Number,
                shootingPct: Number,
                savePct: Number
            },
            special: {
                powerPlayPct: Number,
                penaltyKillPct: Number,
                faceoffWinPct: Number
            }
        }
    },
    awayTeam: {
        id: Number,
        stats: {
            basic: {
                goalsForPerGame: Number,
                goalsAgainstPerGame: Number,
                gamesPlayed: Number,
                wins: Number,
                losses: Number,
                otLosses: Number
            },
            shooting: {
                shotsForPerGame: Number,
                shotsAgainstPerGame: Number,
                shootingPct: Number,
                savePct: Number
            },
            special: {
                powerPlayPct: Number,
                penaltyKillPct: Number,
                faceoffWinPct: Number
            }
        }
    },
    result: {
        homeGoals: Number,
        awayGoals: Number,
        winner: {
            type: String,
            enum: ['home', 'away']
        },
        wasOvertime: Boolean
    }
});

// Add indexes for faster querying
gameResultSchema.index({ 'homeTeam.id': 1, date: -1 });
gameResultSchema.index({ 'awayTeam.id': 1, date: -1 });

const GameResult = mongoose.model('GameResult', gameResultSchema);

export default GameResult;