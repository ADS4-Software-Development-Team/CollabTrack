// src/config/env.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Construct an absolute path to the .env file in the project root (the 'backend' folder)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '..', '.env');

// Load environment variables from .env file
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('🔴 Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully.');
  // Optional: Uncomment the line below to see which variables were loaded
  // console.log('Loaded environment variables:', result.parsed);
}