// src/services/DatabaseService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Prediction {
    id: number;
    gameId: number;
    homeTeamId: number;
    awayTeamId: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
    homeWinProbability: number;
    awayWinProbability: number;
    confidence: number;
    createdAt: Date;
    gameStartTime: Date;
    gameStatus: string;
    actualHomeScore: number | null;
    actualAwayScore: number | null;
    wasCorrect: boolean | null;
}

class DatabaseService {
    static async savePrediction(predictionData: {
        gameId: number;
        homeTeamId: number;
        awayTeamId: number;
        predictedHomeScore: number;
        predictedAwayScore: number;
        homeWinProbability: number;
        awayWinProbability: number;
        confidence: number;
        gameStartTime: Date;
        gameStatus: string;
    }) {
        try {
            return await prisma.prediction.create({
                data: predictionData
            });
        } catch (error) {
            console.error('Error saving prediction:', error);
            throw error;
        }
    }

    static async updateGameResult(gameId: number, resultData: {
        actualHomeScore: number;
        actualAwayScore: number;
        wasCorrect: boolean;
        gameStatus: string;
    }) {
        try {
            return await prisma.prediction.updateMany({
                where: { gameId },
                data: resultData
            });
        } catch (error) {
            console.error('Error updating game result:', error);
            throw error;
        }
    }

    static async getPredictionsByGameId(gameId: number) {
        try {
            return await prisma.prediction.findMany({
                where: { gameId }
            });
        } catch (error) {
            console.error('Error fetching predictions:', error);
            throw error;
        }
    }

    static async getRecentPredictions(limit: number = 10) {
        try {
            return await prisma.prediction.findMany({
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error) {
            console.error('Error fetching recent predictions:', error);
            throw error;
        }
    }

    static async getPredictionAccuracy() {
        try {
            const completedGames = await prisma.prediction.findMany({
                where: {
                    gameStatus: 'FINAL',
                    wasCorrect: {
                        not: null
                    }
                }
            });

            const totalGames = completedGames.length;
            const correctPredictions = completedGames.filter((game: Prediction) => game.wasCorrect).length;

            return {
                totalGames,
                correctPredictions,
                accuracy: totalGames > 0 ? (correctPredictions / totalGames) * 100 : 0
            };
        } catch (error) {
            console.error('Error calculating prediction accuracy:', error);
            throw error;
        }
    }
}

export default DatabaseService;