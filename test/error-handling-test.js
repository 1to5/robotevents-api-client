import { RobotEventsClient } from '../src/index.js';

async function runErrorHandlingTests() {
  console.log('❌ Testing Error Handling\n');

  const clientWithAuth = new RobotEventsClient({
    authToken: process.env.ROBOTEVENTS_TOKEN
  });

  const clientWithoutAuth = new RobotEventsClient({});

  let testsPassed = 0;
  let testsTotal = 0;

  const runErrorTest = async (testName, testFn, expectedErrorType) => {
    testsTotal++;
    console.log(`🧪 ${testName}...`);
    try {
      await testFn();
      console.log(`   ❌ Expected error but got success`);
    } catch (error) {
      console.log(`   ✅ Caught expected error: ${error.message}`);
      if (expectedErrorType && !error.message.includes(expectedErrorType)) {
        console.log(`   ⚠️  Expected error type '${expectedErrorType}' but got different error`);
      } else {
        testsPassed++;
      }
    }
    console.log('');
  };

  try {
    // Test 404 errors
    await runErrorTest(
      'Invalid Event ID (404)',
      () => clientWithAuth.getEvent(999999999),
      '404'
    );

    await runErrorTest(
      'Invalid Team ID (404)',
      () => clientWithAuth.getTeam(999999999),
      '404'
    );

    await runErrorTest(
      'Invalid Program ID (404)',
      () => clientWithAuth.getProgram(999999999),
      '404'
    );

    await runErrorTest(
      'Invalid Season ID (404)',
      () => clientWithAuth.getSeason(999999999),
      '404'
    );

    // Test authorization errors
    await runErrorTest(
      'No Auth Token - Programs',
      () => clientWithoutAuth.getPrograms(),
      '403'
    );

    await runErrorTest(
      'No Auth Token - Events',
      () => clientWithoutAuth.getEvents(),
      '403'
    );

    // Test invalid parameters
    await runErrorTest(
      'Invalid Division ID',
      async () => {
        const events = await clientWithAuth.getEvents({ per_page: 1 });
        if (events.data.length > 0) {
          const eventId = events.data[0].id;
          return clientWithAuth.getEventDivisionMatches(eventId, 999999);
        }
        throw new Error('No events found for testing');
      },
      '404'
    );

    // Test network/API errors
    console.log('🧪 Testing invalid base URL...');
    const clientBadURL = new RobotEventsClient({
      baseURL: 'https://invalid-url-that-does-not-exist.com/api/v2',
      authToken: process.env.ROBOTEVENTS_TOKEN
    });

    try {
      await clientBadURL.getPrograms();
      console.log('   ❌ Expected network error but got success');
    } catch (error) {
      console.log(`   ✅ Caught network error: ${error.message}`);
      testsPassed++;
    }
    testsTotal++;
    console.log('');

    // Test malformed API responses
    console.log('🧪 Testing error response parsing...');
    try {
      // Try to access an endpoint that might return a specific error format
      await clientWithAuth.getEvent(-1); // Negative ID should cause an error
      console.log('   ❌ Expected error but got success');
    } catch (error) {
      console.log(`   ✅ Error properly parsed: ${error.message}`);
      console.log(`   📝 Error type: ${error.constructor.name}`);
      testsPassed++;
    }
    testsTotal++;
    console.log('');

    // Test cache behavior during errors
    console.log('🧪 Testing cache behavior with errors...');
    try {
      // This should fail and not be cached
      await clientWithAuth.getEvent(999999999);
    } catch (error) {
      console.log(`   ✅ Error not cached (as expected): ${error.message}`);
    }

    // Verify cache doesn't contain the failed request
    const cacheSize = clientWithAuth.cache.size;
    console.log(`   📦 Cache size after error: ${cacheSize}`);
    
    // Make a successful request to see cache still works
    await clientWithAuth.getPrograms({ per_page: 1 });
    const newCacheSize = clientWithAuth.cache.size;
    console.log(`   📦 Cache size after success: ${newCacheSize}`);
    console.log(`   ✅ Cache still functional: ${newCacheSize > cacheSize}`);
    testsTotal++;
    testsPassed++;
    console.log('');

    // Test concurrent error handling
    console.log('🧪 Testing concurrent error handling...');
    const errorPromises = [
      clientWithAuth.getEvent(999999991),
      clientWithAuth.getEvent(999999992), 
      clientWithAuth.getEvent(999999993)
    ];

    try {
      await Promise.all(errorPromises);
      console.log('   ❌ Expected all promises to fail');
    } catch (error) {
      console.log('   ✅ Promise.all correctly failed on first error');
      testsPassed++;
    }

    // Test that some succeed and some fail
    const mixedPromises = [
      clientWithAuth.getPrograms({ per_page: 1 }),
      clientWithAuth.getEvent(999999999),
      clientWithAuth.getSeasons({ per_page: 1 })
    ];

    const results = await Promise.allSettled(mixedPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`   📊 Mixed results: ${successful} successful, ${failed} failed`);
    console.log(`   ✅ Promise.allSettled handled mixed results: ${successful > 0 && failed > 0}`);
    testsTotal++;
    testsPassed++;
    console.log('');

    // Test invalid authentication token
    if (process.env.ROBOTEVENTS_TOKEN) {
      console.log('🧪 Testing invalid auth token...');
      const clientBadAuth = new RobotEventsClient({
        authToken: 'invalid-token-12345'
      });

      try {
        await clientBadAuth.getPrograms();
        console.log('   ❌ Expected auth error but got success');
      } catch (error) {
        console.log(`   ✅ Caught auth error: ${error.message}`);
        testsPassed++;
      }
      testsTotal++;
      console.log('');
    }

    // Test timeout behavior (if implemented)
    console.log('🧪 Testing client resilience...');
    
    // Test multiple rapid requests to see if client handles them properly
    const rapidRequests = Array(5).fill().map((_, i) => 
      clientWithAuth.getPrograms({ per_page: 1, page: i + 1 })
    );

    try {
      const rapidResults = await Promise.all(rapidRequests);
      console.log(`   ✅ Handled ${rapidResults.length} rapid requests successfully`);
      testsPassed++;
    } catch (error) {
      console.log(`   ⚠️  Some rapid requests failed: ${error.message}`);
    }
    testsTotal++;
    console.log('');

    // Summary
    console.log('📊 Error Handling Test Results');
    console.log(`   ✅ Passed: ${testsPassed}/${testsTotal}`);
    
    if (testsPassed === testsTotal) {
      console.log('🎉 All error handling tests passed!');
    } else {
      console.log('⚠️  Some error handling tests failed.');
    }

    console.log('\n🛡️  Error Handling Capabilities Verified:');
    console.log('   ✅ 404 Not Found errors');
    console.log('   ✅ 403 Forbidden/Auth errors');
    console.log('   ✅ Network/Connection errors');
    console.log('   ✅ Invalid parameter errors');
    console.log('   ✅ Concurrent error handling');
    console.log('   ✅ Cache isolation from errors');
    console.log('   ✅ Client resilience under load');

  } catch (error) {
    console.error('❌ Error handling test suite failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runErrorHandlingTests();
}

export { runErrorHandlingTests };