import { describe, test, expect, beforeEach, vi } from 'vitest';
import { RobotEventsClient } from '../src/index.js';

describe('RobotEventsClient - Pagination', () => {
  let client;

  beforeEach(() => {
    client = new RobotEventsClient({
      authToken: 'test-token'
    });
  });

  describe('getAllPages Method', () => {
    test('should fetch all pages when multiple pages exist', async () => {
      // Mock responses for multiple pages
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            data: [{ id: 1 }, { id: 2 }],
            meta: { current_page: 1, last_page: 3, total: 5 }
          }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            data: [{ id: 3 }, { id: 4 }],
            meta: { current_page: 2, last_page: 3, total: 5 }
          }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            data: [{ id: 5 }],
            meta: { current_page: 3, last_page: 3, total: 5 }
          }), { status: 200 })
        );

      const result = await client.getAllPages('/test');

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(5);
      expect(result).toEqual([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
      ]);

      fetchSpy.mockRestore();
    });

    test('should handle single page response', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          data: [{ id: 1 }, { id: 2 }],
          meta: { current_page: 1, last_page: 1, total: 2 }
        }), { status: 200 })
      );

      const result = await client.getAllPages('/test');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);

      fetchSpy.mockRestore();
    });

    test('should handle empty response', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          data: [],
          meta: { current_page: 1, last_page: 1, total: 0 }
        }), { status: 200 })
      );

      const result = await client.getAllPages('/test');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(0);

      fetchSpy.mockRestore();
    });

    test('should pass parameters to all page requests', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            data: [{ id: 1 }],
            meta: { current_page: 1, last_page: 2 }
          }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            data: [{ id: 2 }],
            meta: { current_page: 2, last_page: 2 }
          }), { status: 200 })
        );

      const params = { level: ['State'], grade: ['High School'] };
      await client.getAllPages('/test', params);

      // Check that both calls included the original parameters
      const [firstCall, secondCall] = fetchSpy.mock.calls;
      expect(firstCall[0]).toContain('level%5B%5D=State');
      expect(firstCall[0]).toContain('grade%5B%5D=High+School');
      expect(firstCall[0]).toContain('page=1');
      expect(firstCall[0]).toContain('per_page=250');
      
      expect(secondCall[0]).toContain('level%5B%5D=State');
      expect(secondCall[0]).toContain('grade%5B%5D=High+School');
      expect(secondCall[0]).toContain('page=2');
      expect(secondCall[0]).toContain('per_page=250');

      fetchSpy.mockRestore();
    });
  });

  describe('Pagination Helper Methods', () => {
    test('getAllPrograms should use getAllPages', async () => {
      const getAllPagesSpy = vi.spyOn(client, 'getAllPages').mockResolvedValue([
        { id: 1, name: 'VEX IQ' },
        { id: 2, name: 'VEX V5' }
      ]);

      const result = await client.getAllPrograms({ test: 'param' });

      expect(getAllPagesSpy).toHaveBeenCalledWith('/programs', { test: 'param' });
      expect(result).toHaveLength(2);

      getAllPagesSpy.mockRestore();
    });

    test('getAllEvents should use getAllPages', async () => {
      const getAllPagesSpy = vi.spyOn(client, 'getAllPages').mockResolvedValue([
        { id: 1, name: 'Event 1' },
        { id: 2, name: 'Event 2' }
      ]);

      const result = await client.getAllEvents({ level: ['State'] });

      expect(getAllPagesSpy).toHaveBeenCalledWith('/events', { level: ['State'] });
      expect(result).toHaveLength(2);

      getAllPagesSpy.mockRestore();
    });

    test('getAllTeams should use getAllPages', async () => {
      const getAllPagesSpy = vi.spyOn(client, 'getAllPages').mockResolvedValue([
        { id: 1, number: '123A' },
        { id: 2, number: '456B' }
      ]);

      const result = await client.getAllTeams({ grade: ['High School'] });

      expect(getAllPagesSpy).toHaveBeenCalledWith('/teams', { grade: ['High School'] });
      expect(result).toHaveLength(2);

      getAllPagesSpy.mockRestore();
    });
  });

  describe('Pagination Error Handling', () => {
    test('should handle API errors during pagination', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({
            data: [{ id: 1 }],
            meta: { current_page: 1, last_page: 2 }
          }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 })
        );

      await expect(client.getAllPages('/test')).rejects.toThrow('API Error 500');

      fetchSpy.mockRestore();
    });

    test('should handle malformed pagination metadata', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          data: [{ id: 1 }],
          // Missing meta object
        }), { status: 200 })
      );

      const result = await client.getAllPages('/test');

      expect(result).toHaveLength(1);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });

    test('should handle non-array data response', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          data: null, // Non-array data
          meta: { current_page: 1, last_page: 1 }
        }), { status: 200 })
      );

      const result = await client.getAllPages('/test');

      expect(result).toHaveLength(0);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });
  });

  describe('Pagination Performance', () => {
    test('should use maximum per_page for efficiency', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          data: [],
          meta: { current_page: 1, last_page: 1 }
        }), { status: 200 })
      );

      await client.getAllPages('/test');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('per_page=250'),
        expect.any(Object)
      );

      fetchSpy.mockRestore();
    });

    test('should preserve existing per_page if provided', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          data: [],
          meta: { current_page: 1, last_page: 1 }
        }), { status: 200 })
      );

      await client.getAllPages('/test', { per_page: 50 });

      // Check that the URL contains per_page=50
      const [[url]] = fetchSpy.mock.calls;
      expect(url).toContain('per_page=50');

      fetchSpy.mockRestore();
    });
  });
});