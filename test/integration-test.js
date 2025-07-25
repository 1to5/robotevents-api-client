import { RobotEventsClient } from '../src/index.js';

async function runIntegrationTests() {
  console.log('🚀 Running RobotEvents API Integration Tests\n');

  if (!process.env.ROBOTEVENTS_TOKEN) {
    console.log('❌ ROBOTEVENTS_TOKEN not found in environment variables');
    console.log('   Run: npm run test:integration to use .env file');
    process.exit(1);
  }

  const client = new RobotEventsClient({
    authToken: process.env.ROBOTEVENTS_TOKEN,
    cacheTimeout: 30000 // 30 seconds for testing
  });

  let testsPassed = 0;
  let testsTotal = 0;

  const runTest = async (testName, testFn) => {
    testsTotal++;
    console.log(`🧪 ${testName}...`);
    try {
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      console.log(`   ✅ Passed (${duration}ms)`);
      if (result && typeof result === 'object') {
        if (result.data && Array.isArray(result.data)) {
          console.log(`   📊 Found ${result.data.length} items`);
        }
        if (result.meta) {
          console.log(`   📄 Page ${result.meta.current_page}/${result.meta.last_page}, Total: ${result.meta.total}`);
        }
      } else if (Array.isArray(result)) {
        console.log(`   📊 Found ${result.length} items (all pages)`);
      }
      testsPassed++;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    console.log('');
  };

  // Test Programs API
  await runTest('Getting Programs', async () => {
    return await client.getPrograms({ per_page: 10 });
  });

  let programId = null;
  await runTest('Getting Single Program', async () => {
    const programs = await client.getPrograms({ per_page: 1 });
    if (programs.data && programs.data.length > 0) {
      programId = programs.data[0].id;
      return await client.getProgram(programId);
    }
    throw new Error('No programs found');
  });

  // Test Seasons API
  let seasonId = null;
  await runTest('Getting Seasons', async () => {
    const seasons = await client.getSeasons({ per_page: 10 });
    if (seasons.data && seasons.data.length > 0) {
      seasonId = seasons.data[0].id;
    }
    return seasons;
  });

  if (seasonId) {
    await runTest('Getting Single Season', async () => {
      return await client.getSeason(seasonId);
    });

    await runTest('Getting Season Events', async () => {
      return await client.getSeasonEvents(seasonId, { per_page: 5 });
    });
  }

  // Test Events API
  let eventId = null;
  await runTest('Getting Events', async () => {
    const events = await client.getEvents({ per_page: 10 });
    if (events.data && events.data.length > 0) {
      eventId = events.data[0].id;
    }
    return events;
  });

  if (eventId) {
    await runTest('Getting Single Event', async () => {
      return await client.getEvent(eventId);
    });

    await runTest('Getting Event Teams', async () => {
      return await client.getEventTeams(eventId, { per_page: 5 });
    });

    await runTest('Getting Event Skills', async () => {
      return await client.getEventSkills(eventId, { per_page: 5 });
    });

    await runTest('Getting Event Awards', async () => {
      return await client.getEventAwards(eventId, { per_page: 5 });
    });

    // Test division-specific endpoints if divisions exist
    const event = await client.getEvent(eventId);
    if (event.divisions && event.divisions.length > 0) {
      const divisionId = event.divisions[0].id;
      
      await runTest('Getting Division Matches', async () => {
        return await client.getEventDivisionMatches(eventId, divisionId, { per_page: 5 });
      });

      await runTest('Getting Division Rankings', async () => {
        return await client.getEventDivisionRankings(eventId, divisionId, { per_page: 5 });
      });
    }
  }

  // Test Teams API
  let teamId = null;
  await runTest('Getting Teams', async () => {
    const teams = await client.getTeams({ per_page: 10 });
    if (teams.data && teams.data.length > 0) {
      teamId = teams.data[0].id;
    }
    return teams;
  });

  if (teamId) {
    await runTest('Getting Single Team', async () => {
      return await client.getTeam(teamId);
    });

    await runTest('Getting Team Events', async () => {
      return await client.getTeamEvents(teamId, { per_page: 5 });
    });

    await runTest('Getting Team Matches', async () => {
      return await client.getTeamMatches(teamId, { per_page: 5 });
    });

    await runTest('Getting Team Rankings', async () => {
      return await client.getTeamRankings(teamId, { per_page: 5 });
    });

    await runTest('Getting Team Skills', async () => {
      return await client.getTeamSkills(teamId, { per_page: 5 });
    });

    await runTest('Getting Team Awards', async () => {
      return await client.getTeamAwards(teamId, { per_page: 5 });
    });
  }

  console.log('🔄 Testing Pagination...');
  await runTest('Getting All Programs (Pagination)', async () => {
    return await client.getAllPrograms();
  });

  console.log('⚡ Testing Cache Performance...');
  let firstCallTime, secondCallTime;
  
  await runTest('First API Call (Cache Miss)', async () => {
    const startTime = Date.now();
    const result = await client.getPrograms({ per_page: 5 });
    firstCallTime = Date.now() - startTime;
    console.log(`   ⏱️  First call took ${firstCallTime}ms`);
    return result;
  });

  await runTest('Second API Call (Cache Hit)', async () => {
    const startTime = Date.now();
    const result = await client.getPrograms({ per_page: 5 });
    secondCallTime = Date.now() - startTime;
    console.log(`   ⏱️  Second call took ${secondCallTime}ms`);
    console.log(`   🚀 Cache speedup: ${Math.round(firstCallTime / secondCallTime)}x faster`);
    return result;
  });

  console.log('❌ Testing Error Handling...');
  await runTest('Invalid Event ID (404)', async () => {
    try {
      await client.getEvent(999999999);
      throw new Error('Should have thrown an error');
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { error: 'Expected 404 error' };
      }
      throw error;
    }
  });

  // Summary
  console.log('📊 Test Results Summary');
  console.log(`   ✅ Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   📦 Cache entries: ${client.cache.size}`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All integration tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().catch(error => {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  });
}

export { runIntegrationTests };