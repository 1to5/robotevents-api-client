# RoboEvents API Client

A powerful JavaScript wrapper for the [RoboEvents API](https://www.robotevents.com/api/v2) with built-in caching, pagination support, and TypeScript definitions. This client provides a simple interface to access VEX Robotics competition data including events, teams, matches, rankings, and awards.

## Features

- 🚀 **Simple & Intuitive API** - Clean methods that mirror the RoboEvents API structure
- ⚡ **Built-in Caching** - Configurable caching to reduce API calls and improve performance
- 📄 **Automatic Pagination** - Helper methods to fetch all data across multiple pages
- 🛡️ **TypeScript Support** - Full type definitions for better development experience
- 🌐 **Cross-Platform** - Works in both Node.js and browser environments
- 🔒 **Secure** - Proper auth token handling and error management
- 🧪 **Well Tested** - Comprehensive test suite with 53 test cases
- 📦 **GitHub Packages** - Published as a private package on GitHub Packages

## Installation

This package is published to GitHub Packages. Configure npm and install:

```bash
# Configure npm to use GitHub Packages for @1to5 scope
echo "@1to5:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Install the package
npm install @1to5/robotevents-api-client
```

**Note:** You need a GitHub Personal Access Token with `read:packages` permission. Create one at [GitHub Settings](https://github.com/settings/tokens).

## Quick Start

```javascript
import { RobotEventsClient } from '@1to5/robotevents-api-client';

// Initialize the client
const client = new RobotEventsClient({
  authToken: 'your-api-token', // Optional for public data
  cacheTimeout: 5 * 60 * 1000  // 5 minutes (optional)
});

// Get events
const events = await client.getEvents({ per_page: 10 });
console.log(`Found ${events.data.length} events`);

// Get all teams (handles pagination automatically)
const allTeams = await client.getAllTeams({ grade: ['High School'] });
console.log(`Found ${allTeams.length} high school teams`);
```

## Configuration

### Constructor Options

```javascript
const client = new RobotEventsClient({
  baseURL: 'https://www.robotevents.com/api/v2', // Default API base URL
  authToken: 'your-token-here',                   // Your RoboEvents API token
  cacheTimeout: 5 * 60 * 1000                    // Cache timeout in milliseconds (default: 5 minutes)
});
```

### Authentication

Many API endpoints work without authentication, but some require an API token:

1. Visit [RoboEvents API](https://www.robotevents.com/api/v2) to get your token
2. Pass it to the client constructor or set the `ROBOTEVENTS_TOKEN` environment variable

```javascript
// Method 1: Constructor
const client = new RobotEventsClient({
  authToken: 'your-token-here'
});

// Method 2: Environment variable
// Set ROBOTEVENTS_TOKEN=your-token-here
const client = new RobotEventsClient({
  authToken: process.env.ROBOTEVENTS_TOKEN
});
```

### Using .env file (Recommended)

Node.js 20.6.0+ has native support for .env files:

1. Create a `.env` file in your project root:
   ```env
   ROBOTEVENTS_TOKEN=your_bearer_token_here
   ```

2. Run with native Node.js .env support:
   ```bash
   node --env-file=.env your-script.js
   
   # Or using npm scripts
   npm run example
   npm test
   ```

## API Methods

### Events API

```javascript
// Get events with filters
const events = await client.getEvents({
  level: ['State', 'National'],
  season: [181, 182],
  per_page: 50
});

// Get specific event
const event = await client.getEvent(eventId);

// Get event teams
const teams = await client.getEventTeams(eventId);

// Get event skills
const skills = await client.getAllEventSkills(eventId);

// Get event awards
const awards = await client.getEventAwards(eventId);

// Get division matches
const matches = await client.getEventDivisionMatches(eventId, divisionId);

// Get division rankings
const rankings = await client.getEventDivisionRankings(eventId, divisionId);

// Get finalist rankings
const finalistRankings = await client.getEventDivisionFinalistRankings(eventId, divisionId);
```

### Teams API

```javascript
// Get teams with filters
const teams = await client.getTeams({
  grade: ['High School'],
  country: ['United States'],
  registered: true,
  per_page: 100
});

// Get specific team
const team = await client.getTeam(teamId);

// Get team events
const teamEvents = await client.getAllTeamEvents(teamId);

// Get team matches
const matches = await client.getTeamMatches(teamId);

// Get team rankings
const rankings = await client.getAllTeamRankings(teamId);

// Get team skills
const skills = await client.getTeamSkills(teamId);

// Get team awards
const awards = await client.getAllTeamAwards(teamId);
```

### Programs & Seasons API

```javascript
// Get all programs
const programs = await client.getAllPrograms();

// Get specific program
const program = await client.getProgram(programId);

// Get seasons
const seasons = await client.getSeasons();

// Get specific season
const season = await client.getSeason(seasonId);

// Get season events
const seasonEvents = await client.getAllSeasonEvents(seasonId);
```

## Pagination

The client provides two approaches for handling paginated data:

### 1. Standard Pagination (Manual)

```javascript
// Get first page
const firstPage = await client.getEvents({ per_page: 50, page: 1 });
console.log(firstPage.meta.total); // Total number of events
console.log(firstPage.meta.last_page); // Total number of pages

// Get specific page
const secondPage = await client.getEvents({ per_page: 50, page: 2 });
```

### 2. Automatic Pagination (Get All Data)

```javascript
// Get ALL events across all pages
const allEvents = await client.getAllEvents({
  level: ['State'],
  season: [181]
});

// Get ALL teams
const allTeams = await client.getAllTeams({
  grade: ['High School'],
  registered: true
});
```

**Available `getAll*` methods:**
- `getAllEvents(params)` - Get all events
- `getAllTeams(params)` - Get all teams
- `getAllEventTeams(id, params)` - Get all teams at event
- `getAllEventSkills(id, params)` - Get all skills at event
- `getAllEventAwards(id, params)` - Get all awards at event
- `getAllEventDivisionMatches(id, divisionId, params)` - Get all matches
- `getAllEventDivisionRankings(id, divisionId, params)` - Get all rankings
- `getAllTeamEvents(id, params)` - Get all team events
- `getAllTeamMatches(id, params)` - Get all team matches
- `getAllTeamRankings(id, params)` - Get all team rankings
- `getAllTeamSkills(id, params)` - Get all team skills
- `getAllTeamAwards(id, params)` - Get all team awards
- `getAllPrograms(params)` - Get all programs
- `getAllSeasons(params)` - Get all seasons
- `getAllSeasonEvents(id, params)` - Get all season events

## Caching

The client includes intelligent caching to improve performance:

```javascript
// Cache is automatically used
const events1 = await client.getEvents(); // API call made
const events2 = await client.getEvents(); // Returns cached result

// Manage cache manually
client.clearCache();                    // Clear all cached data
client.setCacheTimeout(10 * 60 * 1000); // Set 10-minute timeout

// Check cache status
console.log(`Cache has ${client.cache.size} entries`);
```

### Cache Behavior

- Successful responses are cached for the configured timeout (default: 5 minutes)
- Failed requests are not cached
- Each unique URL + parameters combination gets its own cache entry
- Cache keys include all query parameters for accurate invalidation

## Error Handling

The client provides detailed error information:

```javascript
try {
  const event = await client.getEvent(999999);
} catch (error) {
  console.error(`API Error: ${error.message}`);
  // Output: "API Error 404: Event not found"
}
```

## Common Use Cases

### 1. Find High-Performing Teams

```javascript
// Get all teams from a specific region
const teams = await client.getAllTeams({
  country: ['United States'],
  region: ['California'],
  grade: ['High School']
});

// Get awards for each team
for (const team of teams.slice(0, 10)) { // First 10 teams
  const awards = await client.getAllTeamAwards(team.id);
  console.log(`${team.number}: ${awards.length} awards`);
}
```

### 2. Analyze Event Results

```javascript
const eventId = 12345;

// Get event details
const event = await client.getEvent(eventId);
console.log(`Event: ${event.name}`);

// Get all teams at the event
const teams = await client.getAllEventTeams(eventId);
console.log(`Teams: ${teams.length}`);

// Get awards
const awards = await client.getAllEventAwards(eventId);
console.log(`Awards given: ${awards.length}`);

// If event has divisions, get matches and rankings
if (event.divisions && event.divisions.length > 0) {
  for (const division of event.divisions) {
    const matches = await client.getAllEventDivisionMatches(eventId, division.id);
    const rankings = await client.getAllEventDivisionRankings(eventId, division.id);
    
    console.log(`Division ${division.name}:`);
    console.log(`  Matches: ${matches.length}`);
    console.log(`  Teams ranked: ${rankings.length}`);
  }
}
```

### 3. Track Team Performance Over Time

```javascript
const teamId = 67890;

// Get team info
const team = await client.getTeam(teamId);
console.log(`Team: ${team.number} - ${team.team_name}`);

// Get all events they've participated in
const events = await client.getAllTeamEvents(teamId);
console.log(`Participated in ${events.length} events`);

// Get all their awards
const awards = await client.getAllTeamAwards(teamId);
const championships = awards.filter(award => 
  award.classification === 'champion'
);
console.log(`Won ${championships.length} championships`);

// Get skills scores
const skills = await client.getAllTeamSkills(teamId);
const driverSkills = skills.filter(skill => skill.type === 'driver');
const bestDriverScore = Math.max(...driverSkills.map(s => s.score || 0));
console.log(`Best driver skills score: ${bestDriverScore}`);
```

### 4. Season Analysis

```javascript
// Get all seasons and find the latest
const seasons = await client.getAllSeasons();
const latestSeason = seasons[0]; // Assuming sorted by recency

console.log(`Latest season: ${latestSeason.name}`);

// Get all events in that season
const seasonEvents = await client.getAllSeasonEvents(latestSeason.id, {
  level: ['State', 'Regional']
});

console.log(`${latestSeason.name} has ${seasonEvents.length} state/regional events`);
```

## Available Filters

### Event Filters
- `sku[]` - Event SKUs
- `team[]` - Team IDs
- `season[]` - Season IDs
- `start` - Start date (YYYY-MM-DD)
- `end` - End date (YYYY-MM-DD)
- `level[]` - Competition levels: `World`, `National`, `Regional`, `State`, `Signature`, `Other`
- `eventTypes[]` - Event types: `tournament`, `league`, `workshop`, `virtual`
- `myEvents` - Your registered events (requires auth)

### Team Filters
- `number[]` - Team numbers
- `event[]` - Event IDs
- `registered` - Registration status (boolean)
- `program[]` - Program IDs
- `grade[]` - Grade levels: `College`, `High School`, `Middle School`, `Elementary School`
- `country[]` - Country names
- `region[]` - State/region names
- `myTeams` - Your teams (requires auth)

### Common Parameters
- `per_page` - Results per page (max: 250, default: 25)
- `page` - Page number (handled automatically by `getAll*` methods)

## TypeScript Support

The client includes comprehensive TypeScript definitions:

```typescript
import { 
  RobotEventsClient, 
  Event, 
  Team, 
  Program, 
  Season,
  PaginatedResponse,
  RobotEventsClientOptions 
} from '@1to5/robotevents-api-client';

const options: RobotEventsClientOptions = {
  authToken: process.env.ROBOTEVENTS_TOKEN,
  cacheTimeout: 10 * 60 * 1000 // 10 minutes
};

const client = new RobotEventsClient(options);

// All responses are properly typed
const events: PaginatedResponse<Event> = await client.getEvents();
const team: Team = await client.getTeam(12345);
const programs: Program[] = await client.getAllPrograms();
```

### Available Types

- `RobotEventsClient` - Main client class
- `RobotEventsClientOptions` - Constructor options
- `PaginatedResponse<T>` - Paginated API response format
- `Event` - Event data structure
- `Team` - Team data structure
- `Program` - Program data structure
- `Season` - Season data structure
- `Match` - Match data structure
- `Ranking` - Ranking data structure
- `Skill` - Skills run data structure
- `Award` - Award data structure
- And more...

## Testing

The project uses **Vitest** as the modern testing framework with comprehensive coverage:

```bash
# Run all unit tests (recommended)
npm test

# Watch mode for development  
npm run test:watch

# Run with coverage report
npm run test:coverage

# Integration tests with real API calls (requires ROBOTEVENTS_TOKEN)
npm run test:integration

# Interactive test UI
npm run test:ui
```

### Test Coverage

The project has **53 test cases** covering:

#### Cache Tests (15 tests)
- Cache hit/miss behavior
- Cache expiration and timeout handling
- Cache key generation for different parameters
- Cache management (clear, update timeout)

#### Client Tests (18 tests)
- Constructor with default and custom options
- API method existence (21 standard methods + 15 pagination methods)
- Cache functionality integration
- Request method with parameter handling
- Error handling for different response types

#### Integration Tests (17 tests)
- Real API calls to all major endpoints
- Programs, Seasons, Events, and Teams APIs
- Cache performance validation
- Error handling with actual API responses
- Data structure validation

#### Pagination Tests (23 tests)
- `getAllPages` method functionality
- Multi-page data fetching
- Parameter preservation across pages
- Error handling during pagination
- Performance optimizations

### Test Requirements

- **Unit tests**: No authentication required (uses mocks)
- **Integration tests**: Require `ROBOTEVENTS_TOKEN` in environment
- **Framework**: Vitest with native ES modules support
- **Node.js**: Version 20.6.0+ for native .env support

## Examples

Check the `/examples` directory for detailed usage examples:

```bash
# Run simple example
npm run example:simple

# Run comprehensive example with error handling
npm run example
```

### Example Files
- `examples/simple-usage.js` - Basic API usage
- `examples/usage.js` - Comprehensive examples with error handling

## Performance Tips

1. **Use caching effectively**: The default 5-minute cache works well for most use cases
2. **Use `getAll*` methods sparingly**: They fetch all pages and can be slow for large datasets
3. **Filter early**: Use API filters instead of filtering results client-side
4. **Batch related requests**: Make multiple API calls concurrently when possible

```javascript
// Good: Concurrent requests
const [events, teams, programs] = await Promise.all([
  client.getEvents({ per_page: 10 }),
  client.getTeams({ per_page: 10 }),
  client.getPrograms({ per_page: 10 })
]);

// Consider: Use filters to reduce data
const highSchoolTeams = await client.getAllTeams({
  grade: ['High School'],
  country: ['United States']
});
```

## Rate Limiting

The RoboEvents API has rate limits. The client doesn't implement rate limiting, so:

1. Use caching to reduce API calls
2. Implement delays between requests if needed
3. Handle 429 (Too Many Requests) errors gracefully

## Development

The client is built following the "less is more" philosophy:

- ✅ **ES Modules** - Modern JavaScript syntax
- ✅ **Zero dependencies** - Only uses native Node.js/browser features
- ✅ **TypeScript definitions** - Full type support included
- ✅ **Cross-environment compatibility** - Works in Node.js and browsers
- ✅ **Native .env support** - Node.js 20.6.0+ native feature
- ✅ **Simple, obvious implementation** - Easy to understand and maintain

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run examples (requires ROBOTEVENTS_TOKEN)
npm run example

# Watch tests during development
npm run test:watch
```

## Private Package Usage

### Alternative Installation Methods

You can also install the package via:

1. **Direct GitHub installation**: 
   ```bash
   npm install github:1to5/robotevents-api-client
   ```

2. **Git dependency in package.json**:
   ```json
   {
     "dependencies": {
       "@1to5/robotevents-api-client": "github:1to5/robotevents-api-client"
     }
   }
   ```

3. **Specific version from GitHub Packages**:
   ```bash
   npm install @1to5/robotevents-api-client@1.0.0
   ```

## Publishing

This package is automatically published to GitHub Packages. For maintainers:

### Quick Publish
```bash
# Run the automated publish script
./scripts/publish.sh
```

### Manual Publish
```bash
# Update version and publish
npm version patch  # or minor/major
npm publish
git push && git push --tags
```

See [PUBLISHING.md](./PUBLISHING.md) for detailed publishing instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Run the test suite (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [RoboEvents API Documentation](https://www.robotevents.com/api/v2)
- 🏆 [VEX Robotics Competition](https://www.vexrobotics.com/)
- 🤖 Built for the VEX Robotics community

---

Built with ❤️ for VEX Robotics teams, coaches, and data enthusiasts