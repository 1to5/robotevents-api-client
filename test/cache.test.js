import { describe, test, expect, beforeEach, vi } from 'vitest';
import { RobotEventsClient } from '../src/index.js';

// Helper function to create mock responses
const createMockResponse = (data = { data: [] }, status = 200) => {
  return new Response(JSON.stringify(data), { 
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

describe('RobotEventsClient - Cache Functionality', () => {
  let client;

  beforeEach(() => {
    client = new RobotEventsClient({
      authToken: 'test-token',
      cacheTimeout: 1000 // 1 second for testing
    });
  });

  describe('Cache Hit/Miss', () => {
    test('should cache successful API responses', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Test' }], meta: { total: 1 } };
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(createMockResponse(mockResponse))
        .mockResolvedValueOnce(createMockResponse(mockResponse));

      // First call - should make API request
      const result1 = await client.request('/test', { params: { per_page: 5 } });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(client.cache.size).toBe(1);

      // Second call - should use cache
      const result2 = await client.request('/test', { params: { per_page: 5 } });
      expect(fetchSpy).toHaveBeenCalledTimes(1); // Still 1, no new call
      expect(result1).toEqual(result2);

      fetchSpy.mockRestore();
    });

    test('should create separate cache entries for different parameters', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse());

      await client.request('/test', { params: { per_page: 5 } });
      await client.request('/test', { params: { per_page: 10 } });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(client.cache.size).toBe(2);

      fetchSpy.mockRestore();
    });

    test('should not cache failed requests', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        createMockResponse({ message: 'Not found' }, 404)
      );

      await expect(client.request('/invalid')).rejects.toThrow();
      expect(client.cache.size).toBe(0);

      fetchSpy.mockRestore();
    });
  });

  describe('Cache Expiration', () => {
    test('should expire cache after timeout', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse());

      // First call
      await client.request('/test');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Second call after expiration
      await client.request('/test');
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });

    test('should handle dynamic cache timeout updates', async () => {
      const longCacheClient = new RobotEventsClient({
        authToken: 'test-token',
        cacheTimeout: 5000 // 5 seconds
      });

      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse());

      await longCacheClient.request('/test');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Update timeout to 1ms and wait
      longCacheClient.setCacheTimeout(1);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should make new request due to expired cache
      await longCacheClient.request('/test');
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });
  });

  describe('Cache Key Generation', () => {
    test('should generate unique keys for different endpoints', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse());

      await client.request('/events');
      await client.request('/teams');
      await client.request('/programs');

      expect(client.cache.size).toBe(3);
      fetchSpy.mockRestore();
    });

    test('should handle complex parameter objects', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse());

      const complexParams = {
        level: ['State', 'National'],
        grade: ['High School'],
        country: ['United States'],
        registered: true,
        per_page: 25
      };

      await client.request('/test', { params: complexParams });
      expect(client.cache.size).toBe(1);

      // Same params should use cache (no new fetch call)
      await client.request('/test', { params: complexParams });
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Different params should create new cache entry
      await client.request('/test', { params: { ...complexParams, per_page: 50 } });
      expect(client.cache.size).toBe(2);
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });
  });

  describe('Cache Management', () => {
    test('should clear all cache entries', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse())
        .mockResolvedValueOnce(createMockResponse());

      // Fill cache with multiple entries
      await client.request('/test1');
      await client.request('/test2');
      await client.request('/test3');

      expect(client.cache.size).toBe(3);

      client.clearCache();
      expect(client.cache.size).toBe(0);

      fetchSpy.mockRestore();
    });

    test('should handle cache operations safely', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValue(createMockResponse());

      // First request should create cache entry
      await client.request('/test');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(client.cache.size).toBe(1);

      // Second request should use cache
      await client.request('/test');
      expect(fetchSpy).toHaveBeenCalledTimes(1); // No additional calls
      expect(client.cache.size).toBe(1);

      fetchSpy.mockRestore();
    });
  });
});