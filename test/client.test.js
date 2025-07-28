import { describe, test, expect, beforeEach, vi } from 'vitest';
import { RobotEventsClient } from '../src/index.js';

describe('RobotEventsClient - Basic Functionality', () => {
  let client;

  beforeEach(() => {
    client = new RobotEventsClient({
      authToken: 'test-token',
      cacheTimeout: 1000
    });
  });

  describe('Constructor', () => {
    test('should create client with default options', () => {
      const defaultClient = new RobotEventsClient();
      
      expect(defaultClient.baseURL).toBe('https://www.robotevents.com/api/v2');
      expect(defaultClient.authToken).toBeUndefined();
      expect(defaultClient.cacheTimeout).toBe(5 * 60 * 1000);
      expect(defaultClient.cache).toBeInstanceOf(Map);
    });

    test('should create client with custom options', () => {
      const customClient = new RobotEventsClient({
        baseURL: 'https://custom.api.com',
        authToken: 'custom-token',
        cacheTimeout: 10000
      });

      expect(customClient.baseURL).toBe('https://custom.api.com');
      expect(customClient.authToken).toBe('custom-token');
      expect(customClient.cacheTimeout).toBe(10000);
    });
  });

  describe('API Methods', () => {
    const apiMethods = [
      'getEvents', 'getEvent', 'getEventTeams', 'getEventSkills', 'getEventAwards',
      'getEventDivisionMatches', 'getEventDivisionRankings', 'getEventDivisionFinalistRankings',
      'getTeams', 'getTeam', 'getTeamEvents', 'getTeamMatches', 'getTeamRankings',
      'getTeamSkills', 'getTeamAwards', 'getPrograms', 'getProgram',
      'getSeasons', 'getSeason', 'getSeasonEvents'
    ];

    const allMethods = [
      'getAllEvents', 'getAllTeams', 'getAllEventTeams', 'getAllEventSkills',
      'getAllEventAwards', 'getAllEventDivisionMatches', 'getAllEventDivisionRankings',
      'getAllTeamEvents', 'getAllTeamMatches', 'getAllTeamRankings',
      'getAllTeamSkills', 'getAllTeamAwards', 'getAllPrograms', 'getAllSeasons',
      'getAllSeasonEvents'
    ];

    test.each(apiMethods)('should have %s method', (methodName) => {
      expect(typeof client[methodName]).toBe('function');
    });

    test.each(allMethods)('should have pagination method %s', (methodName) => {
      expect(typeof client[methodName]).toBe('function');
    });
  });

  describe('Cache Functionality', () => {
    test('should initialize with empty cache', () => {
      expect(client.cache.size).toBe(0);
    });

    test('should clear cache manually', () => {
      client.cache.set('test-key', { data: 'test', timestamp: Date.now() });
      expect(client.cache.size).toBe(1);
      
      client.clearCache();
      expect(client.cache.size).toBe(0);
    });

    test('should update cache timeout', () => {
      expect(client.cacheTimeout).toBe(1000);
      
      client.setCacheTimeout(5000);
      expect(client.cacheTimeout).toBe(5000);
    });
  });

  describe('Request Method', () => {
    test('should build correct URL with parameters', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ data: [], meta: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      await client.request('/test', {
        params: {
          level: ['State', 'National'],
          grade: ['High School'],
          registered: true,
          per_page: 25
        }
      });

      // Check that fetch was called with the correct URL containing parameters
      const [[url, options]] = fetchSpy.mock.calls;
      expect(url).toContain('level%5B%5D=State');
      expect(url).toContain('level%5B%5D=National');
      expect(url).toContain('grade%5B%5D=High+School');
      expect(url).toContain('registered=true');
      expect(url).toContain('per_page=25');
      
      expect(options.headers['Authorization']).toBe('Bearer test-token');
      expect(options.headers['Content-Type']).toBe('application/json');

      fetchSpy.mockRestore();
    });

    test('should handle requests without auth token', async () => {
      const noAuthClient = new RobotEventsClient();
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ data: [] }), { status: 200 })
      );

      await noAuthClient.request('/test');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );

      fetchSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('should throw error for non-200 responses', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ message: 'Not found' }), {
          status: 404,
          statusText: 'Not Found'
        })
      );

      await expect(client.request('/invalid')).rejects.toThrow('API Error 404: Not found');

      fetchSpy.mockRestore();
    });

    test('should handle malformed error responses', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Invalid JSON', {
          status: 500,
          statusText: 'Internal Server Error'
        })
      );

      await expect(client.request('/error')).rejects.toThrow('API Error 500: Internal Server Error');

      fetchSpy.mockRestore();
    });
  });
});