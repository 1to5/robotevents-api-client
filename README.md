# RobotEvents API Client

A JavaScript wrapper for the RoboEvents API with built-in caching and pagination support. This client provides a simple interface to access RoboEvents data with automatic pagination handling and response caching for improved performance.

## Features

- ✅ Complete coverage of RoboEvents API v2 endpoints
- 🚀 Built-in response caching with configurable timeout
- 📄 Automatic pagination handling with `getAllX()` methods  
- 🔐 Bearer token authentication support
- 🌐 Cross-environment compatibility (Node.js & Browser)
- 📝 Simple, intuitive API interface

## Installation

This is a private package. Install it in your project:

```bash
npm install /path/to/robotevents-api-client
# or if published to a private registry:
npm install @your-org/robotevents-api-client
```

## Quick Start

```javascript
// ES Modules (recommended)
import { RobotEventsClient } from 'robotevents-api-client';
// or default import
import RobotEventsClient from 'robotevents-api-client';

const client = new RobotEventsClient({
  authToken: 'your-bearer-token', // Optional for public data
  cacheTimeout: 5 * 60 * 1000    // 5 minutes (default)
});

// Get events
const events = await client.getEvents({ level: ['State'] });

// Get all teams (handles pagination automatically)
const allTeams = await client.getAllTeams({ grade: ['High School'] });

// Get specific team
const team = await client.getTeam(12345);
```

## Authentication

The RoboEvents API requires authentication for most endpoints. Get your bearer token from the [RoboEvents API portal](https://www.robotevents.com/api/v2).

### Using .env file (Recommended)

Node.js 20.6.0+ has native support for .env files:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Add your token to `.env`:
   ```env
   ROBOTEVENTS_TOKEN=your_bearer_token_here
   ```

3. Run with native Node.js .env support:
   ```bash
   # Using npm scripts (recommended)
   npm test
   npm run example
   
   # Or directly
   node --env-file=.env your-script.js
   ```

### In your code:
```javascript
import { RobotEventsClient } from 'robotevents-api-client';

const client = new RobotEventsClient({
  authToken: process.env.ROBOTEVENTS_TOKEN
});
```

## API Methods

### Events
- `getEvents(params)` - Get list of events
- `getEvent(id)` - Get single event
- `getEventTeams(id, params)` - Get teams at event
- `getEventSkills(id, params)` - Get skills runs at event
- `getEventAwards(id, params)` - Get awards at event
- `getEventDivisionMatches(id, divisionId, params)` - Get matches for division
- `getEventDivisionRankings(id, divisionId, params)` - Get rankings for division
- `getEventDivisionFinalistRankings(id, divisionId, params)` - Get finalist rankings

### Teams  
- `getTeams(params)` - Get list of teams
- `getTeam(id)` - Get single team
- `getTeamEvents(id, params)` - Get team's events
- `getTeamMatches(id, params)` - Get team's matches
- `getTeamRankings(id, params)` - Get team's rankings
- `getTeamSkills(id, params)` - Get team's skills runs
- `getTeamAwards(id, params)` - Get team's awards

### Programs & Seasons
- `getPrograms(params)` - Get list of programs
- `getProgram(id)` - Get single program  
- `getSeasons(params)` - Get list of seasons
- `getSeason(id)` - Get single season
- `getSeasonEvents(id, params)` - Get events in season

### Pagination Methods
All list endpoints have corresponding `getAll*()` methods that automatically handle pagination:

- `getAllEvents(params)` - Get all events across all pages
- `getAllTeams(params)` - Get all teams across all pages
- `getAllEventTeams(id, params)` - Get all teams at event
- And more...

## Usage Examples

### Filter Events by Level and Date
```javascript
import { RobotEventsClient } from 'robotevents-api-client';

const client = new RobotEventsClient({ authToken: 'your-token' });

const events = await client.getEvents({
  level: ['State', 'Signature'],
  start: '2024-01-01T00:00:00Z',
  end: '2024-12-31T23:59:59Z',
  per_page: 50
});
```

### Get All High School Teams in a Country
```javascript
const teams = await client.getAllTeams({
  grade: ['High School'],
  country: ['United States'],
  registered: true
});
```

### Get Team Performance Data
```javascript
const teamId = 12345;

// Get basic team info
const team = await client.getTeam(teamId);

// Get all events they've participated in
const events = await client.getAllTeamEvents(teamId);

// Get all their awards
const awards = await client.getAllTeamAwards(teamId);

// Get their skills runs
const skills = await client.getAllTeamSkills(teamId, {
  type: ['driver', 'programming']
});
```

### Get Event Details and Results
```javascript
const eventId = 54321;
const event = await client.getEvent(eventId);

// Get all teams at the event
const teams = await client.getAllEventTeams(eventId);

// Get matches for first division
if (event.divisions && event.divisions.length > 0) {
  const divisionId = event.divisions[0].id;
  const matches = await client.getAllEventDivisionMatches(eventId, divisionId);
  const rankings = await client.getAllEventDivisionRankings(eventId, divisionId);
}
```

## Caching

The client includes automatic response caching to improve performance and reduce API calls:

```javascript
import { RobotEventsClient } from 'robotevents-api-client';

// Configure cache timeout (default: 5 minutes)
const client = new RobotEventsClient({
  cacheTimeout: 10 * 60 * 1000 // 10 minutes
});

// Clear cache manually
client.clearCache();

// Update cache timeout
client.setCacheTimeout(2 * 60 * 1000); // 2 minutes
```

## Error Handling

```javascript
import { RobotEventsClient } from 'robotevents-api-client';

const client = new RobotEventsClient({ authToken: 'your-token' });

try {
  const event = await client.getEvent(999999);
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

## Parameter Reference

### Common Filter Parameters

- `id[]` - Filter by ID(s)
- `sku[]` - Filter by SKU(s) 
- `season[]` - Filter by season ID(s)
- `team[]` - Filter by team ID(s)
- `event[]` - Filter by event ID(s)
- `start` - Filter by start date (ISO 8601)
- `end` - Filter by end date (ISO 8601)
- `page` - Page number (handled automatically by `getAll*()` methods)
- `per_page` - Items per page (max 250, default 25)

### Event-specific Parameters
- `level[]` - Event level: `World`, `National`, `State`, `Signature`, `Other`
- `eventTypes[]` - Event type: `tournament`, `league`, `workshop`, `virtual`
- `region` - Filter by region
- `myEvents` - Show only user's events (requires auth)

### Team-specific Parameters  
- `number[]` - Filter by team number(s)
- `grade[]` - Team grade: `College`, `High School`, `Middle School`, `Elementary School`
- `country[]` - Filter by country
- `registered` - Filter by registration status
- `myTeams` - Show only user's teams (requires auth)

## Testing

The package includes comprehensive tests for all functionality:

```bash
# Basic functionality tests (no API calls required)
npm test

# Full integration tests with real API calls
npm run test:integration

# Pagination functionality tests
npm run test:pagination

# Cache performance and behavior tests  
npm run test:cache

# Error handling and resilience tests
npm run test:errors

# Run all tests
npm run test:all

# Run examples
npm run example
npm run example:simple
```

### Test Coverage

- ✅ **Basic Tests**: Client creation, method definitions, cache functionality
- ✅ **Integration Tests**: All API endpoints with real data (23 tests)
- ✅ **Pagination Tests**: Single page, multi-page, getAllX() methods
- ✅ **Cache Tests**: Hit/miss performance, timeout, parameter variations
- ✅ **Error Tests**: 404s, 403s, network errors, concurrent error handling

### Test Requirements

- **Basic tests**: No authentication required
- **All other tests**: Require `ROBOTEVENTS_TOKEN` in `.env` file
- **Node.js**: Version 20.6.0+ for native .env support

## TypeScript Support

This package includes TypeScript definitions:

```typescript
import { RobotEventsClient, Event, Team, RobotEventsClientOptions } from 'robotevents-api-client';

const options: RobotEventsClientOptions = {
  authToken: 'your-token',
  cacheTimeout: 5 * 60 * 1000
};

const client = new RobotEventsClient(options);

// Fully typed responses
const events: PaginatedResponse<Event> = await client.getEvents();
const teams: Team[] = await client.getAllTeams();
```

## Private Package Usage

As a private package, you can:

1. **Local installation**: 
   ```bash
   npm install file:../path/to/robotevents-api-client
   ```

2. **Private registry**:
   ```bash
   npm install @your-org/robotevents-api-client
   ```

3. **Git dependency**:
   ```json
   {
     "dependencies": {
       "robotevents-api-client": "git+https://github.com/your-org/robotevents-api-client.git"
     }
   }
   ```

## Development

The client is built following the "less is more" philosophy with:
- ✅ ES Modules (modern JavaScript)
- ✅ TypeScript definitions included
- ✅ **Zero dependencies** (only uses native Node.js features)
- ✅ Native .env support (Node.js 20.6.0+)
- ✅ Simple, obvious implementation
- ✅ Cross-environment compatibility
- ✅ Comprehensive error handling

### Environment Files
- `.env.example` - Template with all available options
- `.env` - Your actual configuration (git-ignored)
- `.gitignore` - Protects sensitive information

## License

MIT