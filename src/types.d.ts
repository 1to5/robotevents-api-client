export interface RobotEventsClientOptions {
  baseURL?: string;
  authToken?: string;
  cacheTimeout?: number;
}

// Base pagination parameters
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// Core request options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
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
  code?: string | null;
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

export type EventLevel = 'World' | 'National' | 'Regional' | 'State' | 'Signature' | 'Other';
export type EventType = 'tournament' | 'league' | 'workshop' | 'virtual';
export type Grade = 'College' | 'High School' | 'Middle School' | 'Elementary School';
export type SkillType = 'driver' | 'programming' | 'package_delivery_time';
export type AllianceColor = 'red' | 'blue';
export type AwardDesignation = 'tournament' | 'division';
export type AwardClassification = 'champion' | 'finalist' | 'semifinalist' | 'quarterfinalist';

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
  level?: EventLevel;
  ongoing?: boolean;
  awards_finalized?: boolean;
  event_type?: EventType;
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
  grade?: Grade;
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
  color: AllianceColor;
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
  type?: SkillType;
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
  designation?: AwardDesignation | null;
  classification?: AwardClassification | null;
  teamWinners?: TeamAwardWinner[];
  individualWinners?: string[];
}

export interface ApiError {
  code: number;
  message: string;
}

// Parameter interfaces for specific API methods

export interface EventsParams extends PaginationParams {
  id?: number[];
  sku?: string[];
  team?: number[];
  season?: number[];
  start?: string;
  end?: string;
  region?: string;
  level?: EventLevel[];
  myEvents?: boolean;
  eventTypes?: EventType[];
}

export interface TeamsParams extends PaginationParams {
  number?: string[];
  event?: number[];
  registered?: boolean;
  program?: number[];
  grade?: Grade[];
  country?: string[];
  region?: string[];
  myTeams?: boolean;
}

export interface TeamEventsParams extends PaginationParams {
  sku?: string[];
  season?: number[];
  start?: string;
  end?: string;
  level?: EventLevel[];
}

export interface TeamMatchesParams extends PaginationParams {
  event?: number[];
  season?: number[];
  round?: number[];
  instance?: number[];
  matchnum?: number[];
}

export interface TeamRankingsParams extends PaginationParams {
  event?: number[];
  rank?: number[];
  season?: number[];
}

export interface TeamSkillsParams extends PaginationParams {
  event?: number[];
  type?: SkillType[];
  season?: number[];
}

export interface TeamAwardsParams extends PaginationParams {
  event?: number[];
  season?: number[];
}

export interface EventTeamsParams extends PaginationParams {
  number?: string[];
  registered?: boolean;
  grade?: Grade[];
  country?: string[];
}

export interface EventSkillsParams extends PaginationParams {
  type?: SkillType[];
  team?: number[];
}

export interface EventAwardsParams extends PaginationParams {
  team?: number[];
}

export interface EventDivisionMatchesParams extends PaginationParams {
  team?: number[];
  round?: number[];
  instance?: number[];
  matchnum?: number[];
}

export interface EventDivisionRankingsParams extends PaginationParams {
  team?: number[];
  rank?: number[];
}

export interface ProgramsParams extends PaginationParams {
  id?: number[];
}

export interface SeasonsParams extends PaginationParams {
  id?: number[];
  program?: number[];
  team?: number[];
  start?: string;
  end?: string;
  active?: boolean;
}

export interface SeasonEventsParams extends PaginationParams {
  sku?: string[];
  team?: number[];
  start?: string;
  end?: string;
  level?: EventLevel[];
}

export declare class RobotEventsClient {
  public readonly baseURL: string;
  public readonly authToken?: string;
  public cacheTimeout: number;
  public readonly cache: Map<string, { data: any; timestamp: number }>;

  constructor(options?: RobotEventsClientOptions);
  
  // Core methods
  request(endpoint: string, options?: RequestOptions): Promise<any>;
  handleResponse(response: Response): Promise<any>;
  getAllPages<T>(endpoint: string, params?: Record<string, any>): Promise<T[]>;
  clearCache(): void;
  setCacheTimeout(timeout: number): void;

  // Events API
  getEvents(params?: EventsParams): Promise<PaginatedResponse<Event>>;
  getEvent(id: number): Promise<Event>;
  getEventTeams(id: number, params?: EventTeamsParams): Promise<PaginatedResponse<Team>>;
  getEventSkills(id: number, params?: EventSkillsParams): Promise<PaginatedResponse<Skill>>;
  getEventAwards(id: number, params?: EventAwardsParams): Promise<PaginatedResponse<Award>>;
  getEventDivisionMatches(id: number, divisionId: number, params?: EventDivisionMatchesParams): Promise<PaginatedResponse<Match>>;
  getEventDivisionRankings(id: number, divisionId: number, params?: EventDivisionRankingsParams): Promise<PaginatedResponse<Ranking>>;
  getEventDivisionFinalistRankings(id: number, divisionId: number, params?: EventDivisionRankingsParams): Promise<PaginatedResponse<Ranking>>;

  // Teams API
  getTeams(params?: TeamsParams): Promise<PaginatedResponse<Team>>;
  getTeam(id: number): Promise<Team>;
  getTeamEvents(id: number, params?: TeamEventsParams): Promise<PaginatedResponse<Event>>;
  getTeamMatches(id: number, params?: TeamMatchesParams): Promise<PaginatedResponse<Match>>;
  getTeamRankings(id: number, params?: TeamRankingsParams): Promise<PaginatedResponse<Ranking>>;
  getTeamSkills(id: number, params?: TeamSkillsParams): Promise<PaginatedResponse<Skill>>;
  getTeamAwards(id: number, params?: TeamAwardsParams): Promise<PaginatedResponse<Award>>;

  // Programs API
  getPrograms(params?: ProgramsParams): Promise<PaginatedResponse<Program>>;
  getProgram(id: number): Promise<Program>;

  // Seasons API
  getSeasons(params?: SeasonsParams): Promise<PaginatedResponse<Season>>;
  getSeason(id: number): Promise<Season>;
  getSeasonEvents(id: number, params?: SeasonEventsParams): Promise<PaginatedResponse<Event>>;

  // Pagination methods - Get all data across pages
  getAllEvents(params?: Omit<EventsParams, 'page'>): Promise<Event[]>;
  getAllTeams(params?: Omit<TeamsParams, 'page'>): Promise<Team[]>;
  getAllEventTeams(id: number, params?: Omit<EventTeamsParams, 'page'>): Promise<Team[]>;
  getAllEventSkills(id: number, params?: Omit<EventSkillsParams, 'page'>): Promise<Skill[]>;
  getAllEventAwards(id: number, params?: Omit<EventAwardsParams, 'page'>): Promise<Award[]>;
  getAllEventDivisionMatches(id: number, divisionId: number, params?: Omit<EventDivisionMatchesParams, 'page'>): Promise<Match[]>;
  getAllEventDivisionRankings(id: number, divisionId: number, params?: Omit<EventDivisionRankingsParams, 'page'>): Promise<Ranking[]>;
  getAllTeamEvents(id: number, params?: Omit<TeamEventsParams, 'page'>): Promise<Event[]>;
  getAllTeamMatches(id: number, params?: Omit<TeamMatchesParams, 'page'>): Promise<Match[]>;
  getAllTeamRankings(id: number, params?: Omit<TeamRankingsParams, 'page'>): Promise<Ranking[]>;
  getAllTeamSkills(id: number, params?: Omit<TeamSkillsParams, 'page'>): Promise<Skill[]>;
  getAllTeamAwards(id: number, params?: Omit<TeamAwardsParams, 'page'>): Promise<Award[]>;
  getAllPrograms(params?: Omit<ProgramsParams, 'page'>): Promise<Program[]>;
  getAllSeasons(params?: Omit<SeasonsParams, 'page'>): Promise<Season[]>;
  getAllSeasonEvents(id: number, params?: Omit<SeasonEventsParams, 'page'>): Promise<Event[]>;
}

export default RobotEventsClient;