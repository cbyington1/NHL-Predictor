import { Game, Team } from '../types/index';

const NHL_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';

interface ESPNTeamResponse {
  id: string;
  name: string;
  abbreviation: string;
  location: string;
  logos?: Array<{ href: string }>;
  statistics?: Array<{
    name: string;
    value: number;
    displayValue: string;
  }>;
}

interface ESPNGameResponse {
  id: string;
  date: string;
  status: {
    type: {
      state: string;
    };
  };
  competitions: Array<{
    competitors: Array<{
      id: string;
      homeAway: string;
      team: ESPNTeamResponse;
      score?: string;
    }>;
  }>;
}

interface ESPNScheduleResponse {
  events: ESPNGameResponse[];
}


interface SeasonStatus {
  isOffSeason: boolean;
  message: string;
  nextSeasonInfo?: string;
}

class NHLApiService {
  private static async getTeamRecord(team: ESPNTeamResponse): Promise<{ wins: number; losses: number; otl: number }> {
    const defaultRecord = { wins: 0, losses: 0, otl: 0 };
    
    try {
      const url = `${NHL_API_BASE}/teams/${team.id}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log('Failed to fetch team record for:', team.name);
        return defaultRecord;
      }

      const data = await response.json();
      const stats = data.team?.record?.items?.[0]?.stats;

      if (!stats) {
        console.log('No statistics found for team:', team.name);
        return defaultRecord;
      }

      return {
        wins: parseInt(stats.find((s: any) => s.name === 'wins')?.value) || 0,
        losses: parseInt(stats.find((s: any) => s.name === 'losses')?.value) || 0,
        otl: parseInt(stats.find((s: any) => s.name === 'otlosses' || s.name === 'overtimeLosses')?.value) || 0
      };
    } catch (error) {
      console.error('Error fetching team record:', error);
      return defaultRecord;
    }
  }

  private static async convertToTeam(espnTeam: ESPNTeamResponse): Promise<Team> {
    const record = await this.getTeamRecord(espnTeam);
    
    return {
      id: parseInt(espnTeam.id),
      name: espnTeam.name.replace(espnTeam.location, '').trim(),
      city: espnTeam.location,
      abbreviation: espnTeam.abbreviation,
      logo: espnTeam.logos?.[0]?.href || 
            `https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/${espnTeam.abbreviation.toLowerCase()}.png`,
      record
    };
  }

  private static formatDateForESPN(date: Date): string {
    // ESPN expects dates in YYYYMMDD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private static parseGameDate(utcDateString: string): string {
    // Create a date object from the UTC string
    // ESPN provides dates in UTC format (e.g., "2024-12-23T18:00Z")
    const date = new Date(utcDateString);
    
    // Get the user's timezone offset in minutes
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    
    // Create a new date considering the timezone offset
    const localDate = new Date(date.getTime() - timezoneOffset);
    
    // Return the ISO string which will be used for display
    return localDate.toISOString();
  }

  public static async getUpcomingGames(): Promise<Game[]> {
    try {
      // Get today's date at midnight in local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const startDate = this.formatDateForESPN(today);
      const endDate = this.formatDateForESPN(nextWeek);

      const url = `${NHL_API_BASE}/scoreboard?dates=${startDate}-${endDate}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NHL API error: ${response.status}`);
      }

      const data: ESPNScheduleResponse = await response.json();
      const games: Game[] = [];

      for (const event of data.events) {
        const competition = event.competitions[0];
        const homeTeamData = competition.competitors.find(c => c.homeAway === 'home')?.team;
        const awayTeamData = competition.competitors.find(c => c.homeAway === 'away')?.team;

        if (homeTeamData && awayTeamData) {
          const [homeTeam, awayTeam] = await Promise.all([
            this.convertToTeam(homeTeamData),
            this.convertToTeam(awayTeamData)
          ]);

          games.push({
            id: parseInt(event.id),
            homeTeam,
            awayTeam,
            startTime: this.parseGameDate(event.date),
            status: event.status.type.state.toLowerCase(),
            odds: null
          });
        }
      }

      return games.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } catch (error) {
      console.error('Error fetching NHL games:', error);
      throw error;
    }
  }

  public static async getSeasonStatus(): Promise<SeasonStatus> {
    try {
      // First approach: Try to get upcoming games
      const games = await this.getUpcomingGames();
      
      // If we have games in the next week, it's not off-season
      if (games.length > 0) {
        return { 
          isOffSeason: false, 
          message: "NHL season is currently active."
        };
      }
      
      // If no games found, check the league info
      const url = `${NHL_API_BASE}/scoreboard`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the API explicitly indicates off-season
      const leagueInfo = data?.leagues?.[0];
      const seasonType = leagueInfo?.season?.type?.name || '';
      const seasonState = leagueInfo?.season?.state || '';
      
      // Calculate next season info if we're in off-season
      let nextSeasonInfo = '';
      if (seasonState === 'off' || games.length === 0) {
        const currentYear = new Date().getFullYear();
        const nextSeasonYear = currentYear + (new Date().getMonth() >= 9 ? 0 : 1);
        const nextSeasonStart = `October ${nextSeasonYear}`;
        nextSeasonInfo = `The ${nextSeasonYear-1}-${nextSeasonYear} NHL season is expected to begin in ${nextSeasonStart}.`;
      }
      
      return {
        isOffSeason: seasonState === 'off' || games.length === 0,
        message: seasonState === 'off' ? 
          "NHL is currently in the off-season." : 
          (seasonType ? `NHL is currently in ${seasonType}.` : "No games are currently scheduled."),
        nextSeasonInfo: nextSeasonInfo || undefined
      };
    } catch (error) {
      console.error('Error checking if NHL is in off-season:', error);
      // Default to false if there's an error to avoid incorrectly showing off-season message
      return { 
        isOffSeason: false, 
        message: "Unable to determine NHL season status. Assuming season is active." 
      };
    }
  }
}

export default NHLApiService;