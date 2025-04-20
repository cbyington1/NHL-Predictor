// src/scripts/cleanup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    try {
        console.log('Starting database cleanup...');

        // Delete all records from all tables in the correct order
        await prisma.prediction.deleteMany({});
        console.log('All predictions have been deleted');

        console.log('Cleanup completed successfully!');
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup()
    .catch(console.error)
    .finally(() => process.exit(0));