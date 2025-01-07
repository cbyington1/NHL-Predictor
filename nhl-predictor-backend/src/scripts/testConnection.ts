// src/scripts/testConnection.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
    try {
        console.log('Testing database connection and operations...');

        // Create a team with all its stats
        const team = await prisma.team.create({
            data: {
                id: 10, // Using a different ID
                name: 'Maple Leafs',
                city: 'Toronto',
                abbreviation: 'TOR',
                basic: {
                    create: {
                        gamesPlayed: 55,
                        wins: 30,
                        losses: 20,
                        otLosses: 5,
                        points: 65,
                        goalsFor: 180,
                        goalsAgainst: 150,
                        goalDifferential: 30,
                        goalsForPerGame: 3.27,
                        goalsAgainstPerGame: 2.73
                    }
                },
                shooting: {
                    create: {
                        shotsForPerGame: 32.5,
                        shotsAgainstPerGame: 28.7,
                        shootingPct: 10.1,
                        savePct: 90.5
                    }
                },
                special: {
                    create: {
                        powerPlayPct: 22.5,
                        penaltyKillPct: 81.2,
                        faceoffWinPct: 51.3
                    }
                }
            },
            include: {
                basic: true,
                shooting: true,
                special: true
            }
        });

        console.log('\nCreated team with stats:', JSON.stringify(team, null, 2));

        // Query the team back
        const queriedTeam = await prisma.team.findUnique({
            where: { id: 10 },
            include: {
                basic: true,
                shooting: true,
                special: true
            }
        });

        console.log('\nQueried team data:', JSON.stringify(queriedTeam, null, 2));

        // Clean up
        console.log('\nCleaning up test data...');
        await prisma.$transaction([
            prisma.basicStats.deleteMany({ where: { teamId: 10 } }),
            prisma.shootingStats.deleteMany({ where: { teamId: 10 } }),
            prisma.specialStats.deleteMany({ where: { teamId: 10 } }),
            prisma.team.delete({ where: { id: 10 } })
        ]);

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