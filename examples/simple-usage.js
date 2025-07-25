import RobotEventsClient from '../src/index.js';

// Example using default export
async function simpleExample() {
  const client = new RobotEventsClient({
    authToken: process.env.ROBOTEVENTS_TOKEN,
    cacheTimeout: 2 * 60 * 1000 // 2 minutes
  });

  try {
    console.log('🚀 Simple RobotEvents API example\n');

    // Get some programs
    console.log('📋 Getting programs...');
    const programs = await client.getPrograms({ per_page: 5 });
    console.log(`Found ${programs.data?.length || 0} programs`);

    // Get some seasons  
    console.log('🏆 Getting seasons...');
    const seasons = await client.getSeasons({ per_page: 5 });
    console.log(`Found ${seasons.data?.length || 0} seasons`);

    if (seasons.data && seasons.data.length > 0) {
      const season = seasons.data[0];
      console.log(`Latest season: ${season.name}`);
      console.log(`Second season: ${seasons.data[1].name}`);
      console.log(`Third season: ${seasons.data[2].name}`);
    }

    console.log('✅ Simple example completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  simpleExample();
}