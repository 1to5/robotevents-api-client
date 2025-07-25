export interface RobotEventsClientOptions {
  baseURL?: string;
  authToken?: string;
  cacheTimeout?: number;
}

export interface PageMeta {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PageMeta;
}

export interface IdInfo {
  id: number;
  name: string;
  code?: string;
}

export interface Location {
  venue?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface Division {
  id: number;
  name: string;
  order: number;
}

export interface Event {
  id: number;
  sku: string;
  name: string;
  start?: string;
  end?: string;
  season: IdInfo;
  program: IdInfo;
  location: Location;
  locations?: Record<string, Location>;
  divisions?: Division[];
  level?: 'World' | 'National' | 'Regional' | 'State' | 'Signature' | 'Other';
  ongoing?: boolean;
  awards_finalized?: boolean;
  event_type?: 'tournament' | 'league' | 'workshop' | 'virtual';
}

export interface Team {
  id: number;
  number: string;
  team_name?: string;
  robot_name?: string;
  organization?: string;
  location?: Location;
  registered?: boolean;
  program: IdInfo;
  grade?: 'College' | 'High School' | 'Middle School' | 'Elementary School';
}

export interface Program {
  id: number;
  abbr?: string;
  name: string;
}

export interface Season {
  id: number;
  name: string;
  program: IdInfo;
  start?: string;
  end?: string;
  years_start?: number;
  years_end?: number;
}

export interface AllianceTeam {
  team: IdInfo;
  sitting?: boolean;
}

export interface Alliance {
  color: 'red' | 'blue';
  score: number;
  teams: AllianceTeam[];
}

export interface Match {
  id: number;
  event: IdInfo;
  division: IdInfo;
  round: number;
  instance: number;
  matchnum: number;
  scheduled?: string;
  started?: string;
  field?: string;
  scored: boolean;
  name: string;
  alliances: Alliance[];
}

export interface Ranking {
  id?: number;
  event?: IdInfo;
  division?: IdInfo;
  rank?: number;
  team?: IdInfo;
  wins?: number;
  losses?: number;
  ties?: number;
  wp?: number;
  ap?: number;
  sp?: number;
  high_score?: number;
  average_points?: number;
  total_points?: number;
}

export interface Skill {
  id?: number;
  event?: IdInfo;
  team?: IdInfo;
  type?: 'driver' | 'programming' | 'package_delivery_time';
  season?: IdInfo;
  division?: IdInfo;
  rank?: number;
  score?: number;
  attempts?: number;
}

export interface TeamAwardWinner {
  division?: IdInfo;
  team: IdInfo;
}

export interface Award {
  id?: number;
  event?: IdInfo;
  order?: number;
  title?: string;
  qualifications?: string[];
  designation?: 'tournament' | 'division';
  classification?: 'champion' | 'finalist' | 'semifinalist' | 'quarterfinalist';
  teamWinners?: TeamAwardWinner[];
  individualWinners?: string[];
}

export interface ApiError {
  code: number;
  message: string;
}

export declare class RobotEventsClient {
  constructor(options?: RobotEventsClientOptions);
  
  // Core methods
  request(endpoint: string, options?: any): Promise<any>;
  handleResponse(response: Response): Promise<any>;
  getAllPages(endpoint: string, params?: any): Promise<any[]>;
  clearCache(): void;
  setCacheTimeout(timeout: number): void;

  // Events API
  getEvents(params?: any): Promise<PaginatedResponse<Event>>;
  getEvent(id: number): Promise<Event>;
  getEventTeams(id: number, params?: any): Promise<PaginatedResponse<Team>>;
  getEventSkills(id: number, params?: any): Promise<PaginatedResponse<Skill>>;
  getEventAwards(id: number, params?: any): Promise<PaginatedResponse<Award>>;
  getEventDivisionMatches(id: number, divisionId: number, params?: any): Promise<PaginatedResponse<Match>>;
  getEventDivisionRankings(id: number, divisionId: number, params?: any): Promise<PaginatedResponse<Ranking>>;
  getEventDivisionFinalistRankings(id: number, divisionId: number, params?: any): Promise<PaginatedResponse<Ranking>>;

  // Teams API
  getTeams(params?: any): Promise<PaginatedResponse<Team>>;
  getTeam(id: number): Promise<Team>;
  getTeamEvents(id: number, params?: any): Promise<PaginatedResponse<Event>>;
  getTeamMatches(id: number, params?: any): Promise<PaginatedResponse<Match>>;
  getTeamRankings(id: number, params?: any): Promise<PaginatedResponse<Ranking>>;
  getTeamSkills(id: number, params?: any): Promise<PaginatedResponse<Skill>>;
  getTeamAwards(id: number, params?: any): Promise<PaginatedResponse<Award>>;

  // Programs API
  getPrograms(params?: any): Promise<PaginatedResponse<Program>>;
  getProgram(id: number): Promise<Program>;

  // Seasons API
  getSeasons(params?: any): Promise<PaginatedResponse<Season>>;
  getSeason(id: number): Promise<Season>;
  getSeasonEvents(id: number, params?: any): Promise<PaginatedResponse<Event>>;

  // Pagination methods
  getAllEvents(params?: any): Promise<Event[]>;
  getAllTeams(params?: any): Promise<Team[]>;
  getAllEventTeams(id: number, params?: any): Promise<Team[]>;
  getAllEventSkills(id: number, params?: any): Promise<Skill[]>;
  getAllEventAwards(id: number, params?: any): Promise<Award[]>;
  getAllEventDivisionMatches(id: number, divisionId: number, params?: any): Promise<Match[]>;
  getAllEventDivisionRankings(id: number, divisionId: number, params?: any): Promise<Ranking[]>;
  getAllTeamEvents(id: number, params?: any): Promise<Event[]>;
  getAllTeamMatches(id: number, params?: any): Promise<Match[]>;
  getAllTeamRankings(id: number, params?: any): Promise<Ranking[]>;
  getAllTeamSkills(id: number, params?: any): Promise<Skill[]>;
  getAllTeamAwards(id: number, params?: any): Promise<Award[]>;
  getAllPrograms(params?: any): Promise<Program[]>;
  getAllSeasons(params?: any): Promise<Season[]>;
  getAllSeasonEvents(id: number, params?: any): Promise<Event[]>;
}

export default RobotEventsClient;