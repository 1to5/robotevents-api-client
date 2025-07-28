// Vitest global setup file
import { beforeAll, afterAll, beforeEach } from 'vitest';

// Global test setup
beforeAll(async () => {
  // Check if we have required environment variables for integration tests
  if (process.env.CI && !process.env.ROBOTEVENTS_TOKEN) {
    console.warn('⚠️  ROBOTEVENTS_TOKEN not found - some integration tests may be skipped');
  }
});

afterAll(async () => {
  // Global cleanup if needed
});

// Setup for each test
beforeEach(() => {
  // Reset any global state if needed
});