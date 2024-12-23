// src/config/db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Construct MongoDB URI from Railway's provided variables
const constructMongoURI = (): string => {
  // Check if we have a direct MONGO_URL (preferred)
  if (process.env.MONGO_URL) {
    return process.env.MONGO_URL;
  }
  
  // Otherwise, construct from individual components
  if (process.env.MONGOUSER && 
      process.env.MONGOPASSWORD && 
      process.env.MONGOHOST && 
      process.env.MONGOPORT) {
    return `mongodb://${process.env.MONGOUSER}:${encodeURIComponent(process.env.MONGOPASSWORD)}@${process.env.MONGOHOST}:${process.env.MONGOPORT}`;
  }
  
  // Fallback for local development
  return 'mongodb://localhost:27017/nhl-predictor';
};

export const connectDB = async (): Promise<void> => {
  try {
    const uri = constructMongoURI();
    console.log('Attempting to connect to MongoDB...');
    // Log masked URI for debugging (hiding password)
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('Connection URI (masked):', maskedUri);
    
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};