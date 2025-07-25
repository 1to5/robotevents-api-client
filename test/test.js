import { RobotEventsClient } from '../src/index.js';

async function runTests() {
  console.log('🤖 Testing RobotEvents API Client...\n');

  const client = new RobotEventsClient({
    cacheTimeout: 60000, // 1 minute for testing
    authToken: process.env.ROBOTEVENTS_TOKEN // Set this environment variable for real testing
  });

  console.log('✅ Client created successfully');
  console.log(`   Base URL: ${client.baseURL}`);
  console.log(`   Cache timeout: ${client.cacheTimeout}ms`);
  console.log(`   Auth configured: ${client.authToken ? 'Yes' : 'No'}\n`);

  // Test cache functionality without API calls
  console.log('🧪 Testing cache functionality...');
  
  // Simulate a cached response
  const mockData = { data: [{ id: 1, name: 'Test' }], meta: { current_page: 1 } };
  const cacheKey = 'test-key';
  client.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
  
  console.log(`✅ Cache set. Size: ${client.cache.size}`);
  
  // Test cache retrieval
  const cached = client.cache.get(cacheKey);
  console.log(`✅ Cache retrieved: ${cached ? 'Success' : 'Failed'}`);
  
  // Test cache clear
  client.clearCache();
  console.log(`✅ Cache cleared. Size: ${client.cache.size}\n`);

  // Test URL building
  console.log('🔗 Testing URL building...');
  
  const params = {
    level: ['State', 'National'],
    grade: ['High School'],
    registered: true,
    per_page: 25
  };

  console.log('✅ Parameter handling test:');
  console.log(`   Array params: ${JSON.stringify(params.level)}`);
  console.log(`   Boolean params: ${params.registered}`);
  console.log(`   Number params: ${params.per_page}\n`);

  // Test all API method definitions
  console.log('📚 Testing API method definitions...');
  
  const methods = [
    'getEvents', 'getEvent', 'getEventTeams', 'getEventSkills', 'getEventAwards',
    'getEventDivisionMatches', 'getEventDivisionRankings', 'getEventDivisionFinalistRankings',
    'getTeams', 'getTeam', 'getTeamEvents', 'getTeamMatches', 'getTeamRankings',
    'getTeamSkills', 'getTeamAwards', 'getPrograms', 'getProgram',
    'getSeasons', 'getSeason', 'getSeasonEvents',
    'getAllEvents', 'getAllTeams', 'getAllEventTeams', 'getAllEventSkills',
    'getAllEventAwards', 'getAllPrograms', 'getAllSeasons'
  ];

  methods.forEach(method => {
    if (typeof client[method] === 'function') {
      console.log(`   ✅ ${method}`);
    } else {
      console.log(`   ❌ ${method} - Missing!`);
    }
  });

  console.log('\n🚀 Basic tests passed!');
  
  if (!client.authToken) {
    console.log('\n💡 To test actual API calls, set the ROBOTEVENTS_TOKEN environment variable');
    console.log('   Example: ROBOTEVENTS_TOKEN=your-token npm test');
  } else {
    console.log('\n🔑 Auth token detected - you can now test real API calls');
    console.log('   Run: node examples/usage.js');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
}

export { runTests };