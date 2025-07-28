import { describe, test, expect, beforeAll, skipIf } from 'vitest';
import { RobotEventsClient } from '../src/index.js';

// Skip integration tests if no auth token is provided
const skipIntegration = !process.env.ROBOTEVENTS_TOKEN;

describe('RobotEventsClient - Integration Tests', () => {
  let client;

  beforeAll(() => {
    if (!skipIntegration) {
      client = new RobotEventsClient({
        authToken: process.env.ROBOTEVENTS_TOKEN,
        cacheTimeout: 10000 // 10 seconds for integration tests
      });
    }
  });

  describe.skipIf(skipIntegration)('Programs API', () => {
    test('should fetch programs successfully', async () => {
      const result = await client.getPrograms({ per_page: 5 });
      
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBeGreaterThan(0);
    }, 10000);

    test('should fetch single program', async () => {
      const programs = await client.getPrograms({ per_page: 1 });
      expect(programs.data.length).toBeGreaterThan(0);
      
      const programId = programs.data[0].id;
      const program = await client.getProgram(programId);
      
      expect(program).toBeDefined();
      expect(program.id).toBe(programId);
      expect(program.name).toBeDefined();
    }, 10000);

    test('should fetch all programs using pagination', async () => {
      const allPrograms = await client.getAllPrograms();
      
      expect(allPrograms).toBeInstanceOf(Array);
      expect(allPrograms.length).toBeGreaterThan(0);
      
      // Verify no duplicates
      const ids = allPrograms.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    }, 15000);
  });

  describe.skipIf(skipIntegration)('Seasons API', () => {
    test('should fetch seasons successfully', async () => {
      const result = await client.getSeasons({ per_page: 10 });
      
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
    }, 10000);

    test('should fetch single season', async () => {
      const seasons = await client.getSeasons({ per_page: 1 });
      if (seasons.data.length > 0) {
        const seasonId = seasons.data[0].id;
        const season = await client.getSeason(seasonId);
        
        expect(season).toBeDefined();
        expect(season.id).toBe(seasonId);
      }
    }, 10000);
  });

  describe.skipIf(skipIntegration)('Events API', () => {
    test('should fetch events successfully', async () => {
      const result = await client.getEvents({ per_page: 5 });
      
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
    }, 10000);

    test('should fetch single event', async () => {
      const events = await client.getEvents({ per_page: 1 });
      if (events.data.length > 0) {
        const eventId = events.data[0].id;
        const event = await client.getEvent(eventId);
        
        expect(event).toBeDefined();
        expect(event.id).toBe(eventId);
        expect(event.name).toBeDefined();
      }
    }, 10000);

    test('should fetch event teams', async () => {
      const events = await client.getEvents({ per_page: 1 });
      if (events.data.length > 0) {
        const eventId = events.data[0].id;
        const teams = await client.getEventTeams(eventId, { per_page: 5 });
        
        expect(teams).toBeDefined();
        expect(teams.data).toBeInstanceOf(Array);
        expect(teams.meta).toBeDefined();
      }
    }, 10000);

    test('should handle events with filters', async () => {
      const result = await client.getEvents({
        level: ['State'],
        per_page: 5
      });
      
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
    }, 10000);
  });

  describe.skipIf(skipIntegration)('Teams API', () => {
    test('should fetch teams successfully', async () => {
      const result = await client.getTeams({ per_page: 5 });
      
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBeGreaterThan(0);
    }, 10000);

    test('should fetch single team', async () => {
      const teams = await client.getTeams({ per_page: 1 });
      if (teams.data.length > 0) {
        const teamId = teams.data[0].id;
        const team = await client.getTeam(teamId);
        
        expect(team).toBeDefined();
        expect(team.id).toBe(teamId);
        expect(team.number).toBeDefined();
      }
    }, 10000);

    test('should fetch team events', async () => {
      const teams = await client.getTeams({ per_page: 1 });
      if (teams.data.length > 0) {
        const teamId = teams.data[0].id;
        const events = await client.getTeamEvents(teamId, { per_page: 5 });
        
        expect(events).toBeDefined();
        expect(events.data).toBeInstanceOf(Array);
      }
    }, 10000);
  });

  describe.skipIf(skipIntegration)('Cache Performance', () => {
    test('should demonstrate cache performance improvement', async () => {
      // Clear cache first
      client.clearCache();
      
      // First call - cache miss
      const start1 = Date.now();
      const result1 = await client.getPrograms({ per_page: 5 });
      const time1 = Date.now() - start1;
      
      // Second call - cache hit
      const start2 = Date.now();
      const result2 = await client.getPrograms({ per_page: 5 });
      const time2 = Date.now() - start2;
      
      expect(result1).toEqual(result2);
      expect(time2).toBeLessThan(time1 / 2); // Cache should be significantly faster
      expect(client.cache.size).toBeGreaterThan(0);
    }, 15000);
  });

  describe.skipIf(skipIntegration)('Error Handling', () => {
    test('should handle 404 errors correctly', async () => {
      await expect(client.getEvent(999999999)).rejects.toThrow(/404/);
    }, 10000);

    test('should handle invalid team IDs', async () => {
      await expect(client.getTeam(999999999)).rejects.toThrow(/404/);
    }, 10000);
  });

  describe.skipIf(skipIntegration)('Real Data Validation', () => {
    test('should return properly structured program data', async () => {
      const programs = await client.getPrograms({ per_page: 1 });
      
      if (programs.data.length > 0) {
        const program = programs.data[0];
        expect(program).toHaveProperty('id');
        expect(program).toHaveProperty('name');
        expect(typeof program.id).toBe('number');
        expect(typeof program.name).toBe('string');
      }
    }, 10000);

    test('should return properly structured event data', async () => {
      const events = await client.getEvents({ per_page: 1 });
      
      if (events.data.length > 0) {
        const event = events.data[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('name');
        expect(event).toHaveProperty('sku');
        expect(typeof event.id).toBe('number');
        expect(typeof event.name).toBe('string');
        expect(typeof event.sku).toBe('string');
      }
    }, 10000);

    test('should return properly structured team data', async () => {
      const teams = await client.getTeams({ per_page: 1 });
      
      if (teams.data.length > 0) {
        const team = teams.data[0];
        expect(team).toHaveProperty('id');
        expect(team).toHaveProperty('number');
        expect(typeof team.id).toBe('number');
        expect(typeof team.number).toBe('string');
      }
    }, 10000);
  });
});

// Provide helpful message for skipped tests
if (skipIntegration) {
  console.log('⚠️  Integration tests skipped - ROBOTEVENTS_TOKEN not found');
  console.log('   Set ROBOTEVENTS_TOKEN environment variable to run integration tests');
}