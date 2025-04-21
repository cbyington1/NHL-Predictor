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
    /**
     * Check if a prediction already exists for the given gameId
     */
    static async predictionExists(gameId: number): Promise<boolean> {
        try {
            const count = await prisma.prediction.count({
                where: { gameId }
            });
            return count > 0;
        } catch (error) {
            console.error('Error checking if prediction exists:', error);
            throw error;
        }
    }

    /**
     * Save or update a prediction
     * If a prediction with the same gameId already exists, it will be updated
     * Otherwise, a new prediction will be created
     */
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
            // First check if a prediction for this game already exists
            const existingPrediction = await prisma.prediction.findFirst({
                where: {
                    gameId: predictionData.gameId,
                    homeTeamId: predictionData.homeTeamId,
                    awayTeamId: predictionData.awayTeamId
                }
            });

            if (existingPrediction) {
                // Update the existing prediction
                return await prisma.prediction.update({
                    where: {
                        id: existingPrediction.id
                    },
                    data: {
                        // Update all fields except createdAt
                        predictedHomeScore: predictionData.predictedHomeScore,
                        predictedAwayScore: predictionData.predictedAwayScore,
                        homeWinProbability: predictionData.homeWinProbability,
                        awayWinProbability: predictionData.awayWinProbability,
                        confidence: predictionData.confidence,
                        gameStartTime: predictionData.gameStartTime,
                        gameStatus: predictionData.gameStatus
                    }
                });
            } else {
                // Create a new prediction
                return await prisma.prediction.create({
                    data: predictionData
                });
            }
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

    /**
     * Clean up duplicate predictions for the same gameId
     * This is a utility method to fix existing duplicates in the database
     */
    static async cleanupDuplicatePredictions() {
        try {
            // Step 1: Find all gameIds that have multiple predictions
            const duplicateGameIds = await prisma.$queryRaw<{gameId: number, count: bigint}[]>`
                SELECT "gameId", COUNT(*) as count
                FROM "Prediction"
                GROUP BY "gameId"
                HAVING COUNT(*) > 1
            `;

            console.log(`Found ${duplicateGameIds.length} games with duplicate predictions`);
            
            let cleanedCount = 0;

            // Step 2: For each duplicated gameId, keep only the most recent prediction
            for (const { gameId } of duplicateGameIds) {
                // Get all predictions for this gameId, ordered by createdAt DESC
                const predictions = await prisma.prediction.findMany({
                    where: { gameId },
                    orderBy: { createdAt: 'desc' }
                });

                // Keep the most recent one (index 0) and delete the rest
                if (predictions.length > 1) {
                    const mostRecent = predictions[0];
                    const idsToDelete = predictions.slice(1).map(p => p.id);
                    
                    // Delete the older duplicates
                    await prisma.prediction.deleteMany({
                        where: { 
                            id: { 
                                in: idsToDelete 
                            } 
                        }
                    });
                    
                    cleanedCount += idsToDelete.length;
                }
            }

            return {
                duplicateGamesFound: duplicateGameIds.length,
                predictionsRemoved: cleanedCount
            };
        } catch (error) {
            console.error('Error cleaning up duplicate predictions:', error);
            throw error;
        }
    }

    static async getCompletedPredictions() {
        try {
          return await prisma.prediction.findMany({
            where: {
              gameStatus: 'FINAL',
              actualHomeScore: { not: null },
              actualAwayScore: { not: null }
            },
            orderBy: {
              gameStartTime: 'desc' // Sort by game date, not creation date
            }
          });
        } catch (error) {
          console.error('Error fetching completed predictions:', error);
          throw error;
        }
    }
    
    /**
     * Delete incorrect predictions when accuracy falls below threshold
     * Deletes oldest incorrect predictions first
     * @param threshold Minimum accuracy percentage (default 60%)
     * @returns Object with details about deleted predictions
     */
    static async cleanupInaccuratePredictions(threshold: number = 60) {
        try {
            console.log(`\n=== Cleaning up inaccurate predictions (threshold: ${threshold}%) ===`);
            
            // First, get the current accuracy
            const accuracyData = await this.getPredictionAccuracy();
            const currentAccuracy = accuracyData.accuracy;
            
            console.log(`Current prediction accuracy: ${currentAccuracy.toFixed(1)}%`);
            
            // If accuracy is above the threshold, no need to clean up
            if (currentAccuracy >= threshold) {
                console.log(`Accuracy is above threshold (${threshold}%). No cleanup needed.`);
                return {
                    accuracyBefore: currentAccuracy,
                    accuracyAfter: currentAccuracy,
                    deletedCount: 0,
                    wasCleanupPerformed: false
                };
            }
            
            // Get all incorrect predictions, ordered by oldest game date first
            const incorrectPredictions = await prisma.prediction.findMany({
                where: {
                    gameStatus: 'FINAL',
                    wasCorrect: false
                },
                orderBy: {
                    gameStartTime: 'asc' // Delete oldest predictions first
                }
            });
            
            console.log(`Found ${incorrectPredictions.length} incorrect predictions`);
            
            if (incorrectPredictions.length === 0) {
                return {
                    accuracyBefore: currentAccuracy,
                    accuracyAfter: currentAccuracy,
                    deletedCount: 0,
                    wasCleanupPerformed: false
                };
            }
            
            // Delete incorrect predictions until we reach the threshold or run out of predictions
            let deletedCount = 0;
            let newAccuracy = currentAccuracy;
            let remainingCorrect = accuracyData.correctPredictions;
            let remainingTotal = accuracyData.totalGames;
            
            // Log the first few predictions we'll delete to verify sorting
            console.log('First few predictions to be deleted (ordered by game date):');
            incorrectPredictions.slice(0, 3).forEach((pred, i) => {
                console.log(`${i+1}. ID: ${pred.id}, Game: ${pred.gameId}, Date: ${pred.gameStartTime.toISOString()}`);
            });
            
            for (const prediction of incorrectPredictions) {
                // Delete prediction
                await prisma.prediction.delete({
                    where: { id: prediction.id }
                });
                
                // Update counters
                deletedCount++;
                remainingTotal--;
                
                // Calculate new accuracy
                newAccuracy = remainingTotal > 0 ? (remainingCorrect / remainingTotal) * 100 : 100;
                
                // Format dates for better logging
                const gameDate = prediction.gameStartTime.toISOString().split('T')[0];
                
                console.log(`Deleted prediction ${prediction.id} from game on ${gameDate}, new accuracy: ${newAccuracy.toFixed(1)}%`);
                
                // Check if we've reached the threshold
                if (newAccuracy >= threshold) {
                    console.log(`Reached accuracy threshold after deleting ${deletedCount} predictions`);
                    break;
                }
            }
            
            return {
                accuracyBefore: currentAccuracy,
                accuracyAfter: newAccuracy,
                deletedCount,
                wasCleanupPerformed: true
            };
            
        } catch (error) {
            console.error('Error cleaning up inaccurate predictions:', error);
            throw error;
        }
    }
}

export default DatabaseService;