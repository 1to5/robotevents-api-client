import { RobotEventsClient } from '../src/index.js';

async function example() {
  const client = new RobotEventsClient({
    authToken: process.env.ROBOTEVENTS_TOKEN, // Optional for public data
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  });

  try {
    // Get events with filters
    console.log('Getting events...');
    const events = await client.getEvents({
      level: ['State', 'Signature'],
      per_page: 10
    });
    console.log(`Found ${events.data.length} events`);

    // Get all teams (handles pagination automatically)
    console.log('Getting all teams...');
    const allTeams = await client.getAllTeams({
      grade: ['High School'],
      registered: true
    });
    console.log(`Found ${allTeams.length} registered high school teams`);

    // Get specific team details
    if (allTeams.length > 0) {
      const teamId = allTeams[0].id;
      console.log(`Getting details for team ${teamId}...`);
      
      const team = await client.getTeam(teamId);
      console.log(`Team: ${team.number} - ${team.team_name}`);

      // Get team's events
      const teamEvents = await client.getTeamEvents(teamId);
      console.log(`Team has participated in ${teamEvents.data.length} events`);

      // Get team's awards
      const teamAwards = await client.getAllTeamAwards(teamId);
      console.log(`Team has won ${teamAwards.length} awards`);
    }

    // Get event details and teams
    if (events.data.length > 0) {
      const eventId = events.data[0].id;
      console.log(`Getting details for event ${eventId}...`);
      
      const event = await client.getEvent(eventId);
      console.log(`Event: ${event.name} in ${event.location.city}`);

      // Get all teams at this event (with pagination)
      const eventTeams = await client.getAllEventTeams(eventId);
      console.log(`Event has ${eventTeams.length} teams`);

      // Get skills runs for this event
      const skills = await client.getEventSkills(eventId, { per_page: 5 });
      console.log(`Found ${skills.data.length} skills runs`);

      // If event has divisions, get matches
      if (event.divisions && event.divisions.length > 0) {
        const divisionId = event.divisions[0].id;
        const matches = await client.getEventDivisionMatches(eventId, divisionId, {
          per_page: 5
        });
        console.log(`Found ${matches.data.length} matches in division ${event.divisions[0].name}`);
      }
    }

    // Get programs and seasons
    console.log('Getting programs and seasons...');
    const programs = await client.getAllPrograms();
    const seasons = await client.getAllSeasons();
    
    console.log(`Found ${programs.length} programs`);
    console.log(`Found ${seasons.length} seasons`);

    // Cache status
    console.log(`Cache contains ${client.cache.size} entries`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Error handling example
async function errorHandlingExample() {
  const client = new RobotEventsClient();

  try {
    // This will likely fail with a 404
    await client.getEvent(999999);
  } catch (error) {
    console.log('Caught expected error:', error.message);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example().then(() => {
    console.log('\nRunning error handling example...');
    return errorHandlingExample();
  });
}