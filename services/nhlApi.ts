import { Platform } from 'react-native';
import { Game, Team } from '../types/index';

const NHL_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';

interface ESPNTeamResponse {
  id: string;
  name: string;
  abbreviation: string;
  location: string;
  logos?: Array<{
    href: string;
  }>;
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

  private static getTeamLogo(team: ESPNTeamResponse): string {
    if (team.logos && team.logos.length > 0) {
      return team.logos[0].href;
    }
    return `https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/${team.abbreviation.toLowerCase()}.png`;
  }

  private static async convertToTeam(espnTeam: ESPNTeamResponse): Promise<Team> {
    const record = await this.getTeamRecord(espnTeam);
    
    // Get just the team name without the city
    const teamName = espnTeam.name.replace(espnTeam.location, '').trim();
    
    return {
      id: parseInt(espnTeam.id),
      name: teamName,  // Now just the team name (e.g., "Maple Leafs" instead of "Toronto Maple Leafs")
      city: espnTeam.location,  // The city/location (e.g., "Toronto")
      abbreviation: espnTeam.abbreviation,
      logo: this.getTeamLogo(espnTeam),
      record
    };
  }

  private static formatDateForESPN(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  public static async getUpcomingGames(): Promise<Game[]> {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const startDate = this.formatDateForESPN(today);
      const endDate = this.formatDateForESPN(nextWeek);

      const url = `${NHL_API_BASE}/scoreboard?dates=${startDate}-${endDate}`;
      console.log('Fetching games from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('NHL API Response not OK:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`NHL API error: ${response.status} ${response.statusText}`);
      }

      const data: ESPNScheduleResponse = await response.json();
      console.log('Raw ESPN response:', JSON.stringify(data, null, 2));

      const games: Game[] = [];

      for (const event of data.events) {
        const competition = event.competitions[0];
        const homeTeamData = competition.competitors.find(c => c.homeAway === 'home');
        const awayTeamData = competition.competitors.find(c => c.homeAway === 'away');

        if (homeTeamData?.team && awayTeamData?.team) {
          const [homeTeam, awayTeam] = await Promise.all([
            this.convertToTeam(homeTeamData.team),
            this.convertToTeam(awayTeamData.team)
          ]);

          const gameDate = new Date(event.date);
          if (gameDate >= today) {
            console.log('Processing upcoming game:', {
              id: event.id,
              date: event.date,
              homeTeam: homeTeam.name,
              awayTeam: awayTeam.name,
              status: event.status.type.state
            });

            games.push({
              id: parseInt(event.id),
              homeTeam,
              awayTeam,
              startTime: event.date,
              status: event.status.type.state.toLowerCase(),
              odds: null
            });
          }
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

  public static async getGameDetails(gameId: number): Promise<any> {
    try {
      const response = await fetch(`${NHL_API_BASE}/summary?event=${gameId}`);
      
      if (!response.ok) {
        throw new Error(`NHL API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching game details for game ${gameId}:`, error);
      throw error;
    }
  }
}

export default NHLApiService;