import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment setup
    environment: 'node',
    
    // Global test setup
    setupFiles: ['./test/setup.js'],
    
    // Test file patterns
    include: ['test/**/*.test.js'],
    exclude: ['test/legacy/**'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'test/**',
        'examples/**',
        '*.config.js'
      ]
    },
    
    // Test timeout
    testTimeout: 30000, // 30 seconds for API calls
    
    // Environment variables
    env: {
      NODE_ENV: 'test'
    },
    
    // Reporter configuration
    reporter: ['verbose']
  }
});