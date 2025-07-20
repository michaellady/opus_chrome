import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

async function globalSetup(config: FullConfig) {
  console.log('Global setup: Loading environment variables...');
  
  // Validate required environment variables
  const requiredEnvVars = ['OPENAI_API_KEY', 'OPUS_CLIP_EMAIL', 'OPUS_CLIP_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
  
  console.log('Environment variables validated successfully');
}

export default globalSetup; 