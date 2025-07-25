import { RobotEventsClient } from '../src/index.js';

async function runPaginationTests() {
  console.log('📄 Testing Pagination Functionality\n');

  if (!process.env.ROBOTEVENTS_TOKEN) {
    console.log('❌ ROBOTEVENTS_TOKEN not found');
    process.exit(1);
  }

  const client = new RobotEventsClient({
    authToken: process.env.ROBOTEVENTS_TOKEN
  });

  try {
    console.log('🔍 Testing pagination with small per_page values...\n');

    // Test Programs pagination
    console.log('📋 Programs Pagination Test:');
    const programsPage1 = await client.getPrograms({ page: 1, per_page: 2 });
    console.log(`   Page 1: ${programsPage1.data.length} items`);
    console.log(`   Meta: Page ${programsPage1.meta.current_page}/${programsPage1.meta.last_page}, Total: ${programsPage1.meta.total}`);

    if (programsPage1.meta.last_page > 1) {
      const programsPage2 = await client.getPrograms({ page: 2, per_page: 2 });
      console.log(`   Page 2: ${programsPage2.data.length} items`);
      
      // Check data is different
      const page1Ids = programsPage1.data.map(p => p.id);
      const page2Ids = programsPage2.data.map(p => p.id);
      const isDifferent = !page1Ids.some(id => page2Ids.includes(id));
      console.log(`   ✅ Different data on different pages: ${isDifferent}`);
    }

    // Test getAllPages functionality
    console.log('\n🔄 Testing getAllPages functionality:');
    const startTime = Date.now();
    const allPrograms = await client.getAllPrograms();
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Retrieved ${allPrograms.length} total programs in ${duration}ms`);
    console.log(`   📊 Average: ${Math.round(duration / allPrograms.length)}ms per item`);

    // Verify no duplicates
    const programIds = allPrograms.map(p => p.id);
    const uniqueIds = [...new Set(programIds)];
    const noDuplicates = programIds.length === uniqueIds.length;
    console.log(`   ✅ No duplicates: ${noDuplicates}`);

    // Test with filters to get more data
    console.log('\n🎪 Testing Events pagination with filters:');
    const recentEvents = await client.getEvents({ 
      per_page: 5,
      level: ['State', 'National']
    });
    console.log(`   Found ${recentEvents.data.length} events`);
    console.log(`   Total available: ${recentEvents.meta.total}`);

    if (recentEvents.meta.total > 10) {
      console.log('   Testing getAllEvents for filtered results...');
      const startTime2 = Date.now();
      const allFilteredEvents = await client.getAllEvents({ 
        level: ['State', 'National']
      });
      const duration2 = Date.now() - startTime2;
      console.log(`   ✅ Retrieved ${allFilteredEvents.length} filtered events in ${duration2}ms`);
    }

    // Test Teams pagination
    console.log('\n👥 Testing Teams pagination:');
    const teamsPage = await client.getTeams({ per_page: 3 });
    console.log(`   Found ${teamsPage.data.length} teams on first page`);
    console.log(`   Total teams available: ${teamsPage.meta.total}`);

    if (teamsPage.data.length > 0) {
      const teamId = teamsPage.data[0].id;
      console.log(`\n🏆 Testing team-specific pagination for team ${teamId}:`);
      
      const teamEvents = await client.getTeamEvents(teamId, { per_page: 3 });
      console.log(`   Team events: ${teamEvents.data.length} (of ${teamEvents.meta.total})`);
      
      if (teamEvents.meta.total > 3) {
        const allTeamEvents = await client.getAllTeamEvents(teamId);
        console.log(`   All team events: ${allTeamEvents.length}`);
        console.log(`   ✅ Pagination worked: ${allTeamEvents.length === teamEvents.meta.total}`);
      }
    }

    // Test cache behavior with pagination
    console.log('\n⚡ Testing cache behavior with pagination:');
    console.log('   First call to getPrograms({ per_page: 3 })...');
    const start1 = Date.now();
    await client.getPrograms({ per_page: 3 });
    const time1 = Date.now() - start1;
    console.log(`   First call: ${time1}ms`);

    console.log('   Second call (should be cached)...');
    const start2 = Date.now();
    await client.getPrograms({ per_page: 3 });
    const time2 = Date.now() - start2;
    console.log(`   Second call: ${time2}ms`);
    console.log(`   🚀 Cache speedup: ${Math.round(time1 / time2)}x`);

    console.log('   Different parameters (should not be cached)...');
    const start3 = Date.now();
    await client.getPrograms({ per_page: 5 });
    const time3 = Date.now() - start3;
    console.log(`   Different params: ${time3}ms`);

    console.log(`\n📦 Cache entries: ${client.cache.size}`);

    console.log('\n🎉 All pagination tests completed successfully!');

  } catch (error) {
    console.error('❌ Pagination test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPaginationTests();
}

export { runPaginationTests };