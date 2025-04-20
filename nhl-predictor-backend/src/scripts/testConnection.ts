import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
    try {
        console.log('Testing database connection and operations...');
        
        // Create a test prediction
        const prediction = await prisma.prediction.create({
            data: {
                gameId: 99999, // Test ID
                homeTeamId: 10,
                awayTeamId: 20,
                predictedHomeScore: 3.5,
                predictedAwayScore: 2.2,
                homeWinProbability: 65.5,
                awayWinProbability: 34.5,
                confidence: 0.75,
                gameStartTime: new Date(),
                gameStatus: 'SCHEDULED'
            }
        });
        
        console.log('\nCreated test prediction:', JSON.stringify(prediction, null, 2));
        
        // Query the prediction back
        const queriedPrediction = await prisma.prediction.findUnique({
            where: { id: prediction.id }
        });
        
        console.log('\nQueried prediction data:', JSON.stringify(queriedPrediction, null, 2));
        
        // Clean up
        console.log('\nCleaning up test data...');
        await prisma.prediction.delete({
            where: { id: prediction.id }
        });
        
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase()
    .catch(console.error)
    .finally(() => process.exit(0));