import { RobotEventsClient } from '../src/index.js';

async function runCacheTests() {
  console.log('⚡ Testing Cache Functionality\n');

  if (!process.env.ROBOTEVENTS_TOKEN) {
    console.log('❌ ROBOTEVENTS_TOKEN not found');
    process.exit(1);
  }

  const client = new RobotEventsClient({
    authToken: process.env.ROBOTEVENTS_TOKEN,
    cacheTimeout: 5000 // 5 seconds for testing
  });

  try {
    console.log('🧪 Test 1: Cache Hit/Miss Performance');
    
    // First call - cache miss
    console.log('   Making first API call (cache miss)...');
    const start1 = Date.now();
    const result1 = await client.getPrograms({ per_page: 5 });
    const time1 = Date.now() - start1;
    console.log(`   ✅ First call: ${time1}ms, found ${result1.data.length} programs`);
    console.log(`   📦 Cache size after first call: ${client.cache.size}`);

    // Second call - cache hit
    console.log('\n   Making second API call (cache hit)...');
    const start2 = Date.now();
    const result2 = await client.getPrograms({ per_page: 5 });
    const time2 = Date.now() - start2;
    console.log(`   ✅ Second call: ${time2}ms, found ${result2.data.length} programs`);
    console.log(`   🚀 Cache speedup: ${Math.round(time1 / time2)}x faster`);
    
    // Verify same data
    const sameData = JSON.stringify(result1) === JSON.stringify(result2);
    console.log(`   ✅ Same data returned: ${sameData}`);

    console.log('\n🧪 Test 2: Different Parameters = Different Cache');
    
    const start3 = Date.now();
    const result3 = await client.getPrograms({ per_page: 10 });
    const time3 = Date.now() - start3;
    console.log(`   Different params call: ${time3}ms, found ${result3.data.length} programs`);
    console.log(`   📦 Cache size: ${client.cache.size}`);

    console.log('\n🧪 Test 3: Cache Timeout');
    console.log('   Waiting for cache to expire (6 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    const start4 = Date.now();
    const result4 = await client.getPrograms({ per_page: 5 });
    const time4 = Date.now() - start4;
    console.log(`   After timeout: ${time4}ms, found ${result4.data.length} programs`);
    console.log(`   ✅ Cache expired and refreshed: ${time4 > time2 * 2}`);

    console.log('\n🧪 Test 4: Manual Cache Clear');
    
    // Fill cache
    await client.getSeasons({ per_page: 3 });
    const sizeBefore = client.cache.size;
    console.log(`   Cache size before clear: ${sizeBefore}`);
    
    client.clearCache();
    console.log(`   Cache size after clear: ${client.cache.size}`);
    console.log(`   ✅ Cache cleared successfully: ${client.cache.size === 0}`);

    console.log('\n🧪 Test 5: Multiple Endpoints Caching');
    
    const endpoints = [
      () => client.getPrograms({ per_page: 2 }),
      () => client.getSeasons({ per_page: 2 }),
      () => client.getEvents({ per_page: 2 })
    ];

    console.log('   Testing multiple endpoints...');
    for (let i = 0; i < endpoints.length; i++) {
      const start = Date.now();
      await endpoints[i]();
      const time = Date.now() - start;
      console.log(`   Endpoint ${i + 1}: ${time}ms`);
    }
    console.log(`   📦 Cache size after multiple endpoints: ${client.cache.size}`);

    // Test cache hits for all endpoints
    console.log('\n   Testing cache hits for all endpoints...');
    for (let i = 0; i < endpoints.length; i++) {
      const start = Date.now();
      await endpoints[i]();
      const time = Date.now() - start;
      console.log(`   Cached endpoint ${i + 1}: ${time}ms`);
    }

    console.log('\n🧪 Test 6: Cache Timeout Configuration');
    
    const shortCacheClient = new RobotEventsClient({
      authToken: process.env.ROBOTEVENTS_TOKEN,
      cacheTimeout: 1000 // 1 second
    });

    await shortCacheClient.getPrograms({ per_page: 1 });
    console.log('   Short cache client cached data...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const start5 = Date.now();
    await shortCacheClient.getPrograms({ per_page: 1 });
    const time5 = Date.now() - start5;
    console.log(`   After 1.5s timeout: ${time5}ms`);
    console.log(`   ✅ Short timeout worked: ${time5 > 50}`); // Should be a fresh API call

    console.log('\n🧪 Test 7: Dynamic Cache Timeout Update');
    
    client.setCacheTimeout(10000); // 10 seconds
    await client.getPrograms({ per_page: 1 });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const start6 = Date.now();
    await client.getPrograms({ per_page: 1 });
    const time6 = Date.now() - start6;
    console.log(`   After cache timeout update: ${time6}ms`);
    console.log(`   ✅ Extended timeout worked: ${time6 < 50}`); // Should be cached

    console.log('\n🧪 Test 8: Complex Query Parameters Caching');
    
    const complexParams = {
      level: ['State', 'National'],
      grade: ['High School'],
      per_page: 3
    };

    const start7 = Date.now();
    await client.getEvents(complexParams);
    const time7 = Date.now() - start7;
    console.log(`   Complex params first call: ${time7}ms`);

    const start8 = Date.now();
    await client.getEvents(complexParams);
    const time8 = Date.now() - start8;
    console.log(`   Complex params cached call: ${time8}ms`);
    console.log(`   ✅ Complex params cached: ${time8 < time7 / 2}`);

    // Test with slightly different params
    const start9 = Date.now();
    await client.getEvents({ ...complexParams, per_page: 4 });
    const time9 = Date.now() - start9;
    console.log(`   Different complex params: ${time9}ms`);
    console.log(`   ✅ Different params not cached: ${time9 > time8 * 2}`);

    console.log(`\n📊 Final Cache Statistics:`);
    console.log(`   Cache entries: ${client.cache.size}`);
    console.log(`   Cache timeout: ${client.cacheTimeout}ms`);

    console.log('\n🎉 All cache tests completed successfully!');

  } catch (error) {
    console.error('❌ Cache test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCacheTests();
}

export { runCacheTests };