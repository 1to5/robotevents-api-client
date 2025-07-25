export class RobotEventsClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'https://www.robotevents.com/api/v2';
    this.authToken = options.authToken;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes default
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${url}?${new URLSearchParams(options.params || {})}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers
    };

    const config = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(`${key}[]`, v));
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, value);
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        const separator = url.includes('?') ? '&' : '?';
        const finalUrl = `${url}${separator}${queryString}`;
        const response = await fetch(finalUrl, config);
        const data = await this.handleResponse(response);
        
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    }

    const response = await fetch(url, config);
    const data = await this.handleResponse(response);
    
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error ${response.status}: ${error.message || response.statusText}`);
    }
    return response.json();
  }

  async getAllPages(endpoint, params = {}) {
    let allData = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.request(endpoint, {
        params: { ...params, page, per_page: 250 }
      });

      if (response.data && Array.isArray(response.data)) {
        allData = allData.concat(response.data);
        
        if (response.meta) {
          hasMore = response.meta.current_page < response.meta.last_page;
          page++;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    return allData;
  }

  // Events API
  async getEvents(params = {}) {
    return this.request('/events', { params });
  }

  async getEvent(id) {
    return this.request(`/events/${id}`);
  }

  async getEventTeams(id, params = {}) {
    return this.request(`/events/${id}/teams`, { params });
  }

  async getEventSkills(id, params = {}) {
    return this.request(`/events/${id}/skills`, { params });
  }

  async getEventAwards(id, params = {}) {
    return this.request(`/events/${id}/awards`, { params });
  }

  async getEventDivisionMatches(id, divisionId, params = {}) {
    return this.request(`/events/${id}/divisions/${divisionId}/matches`, { params });
  }

  async getEventDivisionRankings(id, divisionId, params = {}) {
    return this.request(`/events/${id}/divisions/${divisionId}/rankings`, { params });
  }

  async getEventDivisionFinalistRankings(id, divisionId, params = {}) {
    return this.request(`/events/${id}/divisions/${divisionId}/finalistRankings`, { params });
  }

  // Teams API
  async getTeams(params = {}) {
    return this.request('/teams', { params });
  }

  async getTeam(id) {
    return this.request(`/teams/${id}`);
  }

  async getTeamEvents(id, params = {}) {
    return this.request(`/teams/${id}/events`, { params });
  }

  async getTeamMatches(id, params = {}) {
    return this.request(`/teams/${id}/matches`, { params });
  }

  async getTeamRankings(id, params = {}) {
    return this.request(`/teams/${id}/rankings`, { params });
  }

  async getTeamSkills(id, params = {}) {
    return this.request(`/teams/${id}/skills`, { params });
  }

  async getTeamAwards(id, params = {}) {
    return this.request(`/teams/${id}/awards`, { params });
  }

  // Programs API
  async getPrograms(params = {}) {
    return this.request('/programs', { params });
  }

  async getProgram(id) {
    return this.request(`/programs/${id}`);
  }

  // Seasons API
  async getSeasons(params = {}) {
    return this.request('/seasons', { params });
  }

  async getSeason(id) {
    return this.request(`/seasons/${id}`);
  }

  async getSeasonEvents(id, params = {}) {
    return this.request(`/seasons/${id}/events`, { params });
  }

  // Utility methods for getting all data across pages
  async getAllEvents(params = {}) {
    return this.getAllPages('/events', params);
  }

  async getAllTeams(params = {}) {
    return this.getAllPages('/teams', params);
  }

  async getAllEventTeams(id, params = {}) {
    return this.getAllPages(`/events/${id}/teams`, params);
  }

  async getAllEventSkills(id, params = {}) {
    return this.getAllPages(`/events/${id}/skills`, params);
  }

  async getAllEventAwards(id, params = {}) {
    return this.getAllPages(`/events/${id}/awards`, params);
  }

  async getAllEventDivisionMatches(id, divisionId, params = {}) {
    return this.getAllPages(`/events/${id}/divisions/${divisionId}/matches`, params);
  }

  async getAllEventDivisionRankings(id, divisionId, params = {}) {
    return this.getAllPages(`/events/${id}/divisions/${divisionId}/rankings`, params);
  }

  async getAllTeamEvents(id, params = {}) {
    return this.getAllPages(`/teams/${id}/events`, params);
  }

  async getAllTeamMatches(id, params = {}) {
    return this.getAllPages(`/teams/${id}/matches`, params);
  }

  async getAllTeamRankings(id, params = {}) {
    return this.getAllPages(`/teams/${id}/rankings`, params);
  }

  async getAllTeamSkills(id, params = {}) {
    return this.getAllPages(`/teams/${id}/skills`, params);
  }

  async getAllTeamAwards(id, params = {}) {
    return this.getAllPages(`/teams/${id}/awards`, params);
  }

  async getAllPrograms(params = {}) {
    return this.getAllPages('/programs', params);
  }

  async getAllSeasons(params = {}) {
    return this.getAllPages('/seasons', params);
  }

  async getAllSeasonEvents(id, params = {}) {
    return this.getAllPages(`/seasons/${id}/events`, params);
  }

  clearCache() {
    this.cache.clear();
  }

  setCacheTimeout(timeout) {
    this.cacheTimeout = timeout;
  }
}

export { RobotEventsClient as default };