// src/config/db.ts
import { PrismaClient } from '@prisma/client';

// Create a single instance to be used throughout the app
const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],  // Add logging for development
});

export const connectDB = async (): Promise<void> => {
    try {
        await prisma.$connect();
        console.log('PostgreSQL Database connected successfully');
        
        // Optional: Test the connection
        const tableCount = await prisma.team.count();
        console.log(`Database contains ${tableCount} teams`);
        
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

// Export prisma instance for use in services
export default prisma;