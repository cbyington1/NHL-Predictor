// src/scripts/cleanup-duplicates.ts
import DatabaseService from '../services/DatabaseService';

async function cleanupDuplicates() {
    console.log('Starting duplicate prediction cleanup...');
    
    try {
        const result = await DatabaseService.cleanupDuplicatePredictions();
        
        console.log('Cleanup completed successfully:');
        console.log(`- Found ${result.duplicateGamesFound} games with duplicate predictions`);
        console.log(`- Removed ${result.predictionsRemoved} duplicate predictions`);
        
        // Exit successfully
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        
        // Exit with error code
        process.exit(1);
    }
}

// Run the cleanup
cleanupDuplicates();