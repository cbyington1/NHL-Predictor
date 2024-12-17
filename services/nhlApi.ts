// services/nhlApi.ts
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
  record: {
    items: Array<{
      stats: Array<{
        name: string;
        value: number;
      }>;
    }>;
  };
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
  private static getTeamRecord(team: ESPNTeamResponse): { wins: number; losses: number; otl: number } {
    const defaultRecord = { wins: 0, losses: 0, otl: 0 };
    
    if (!team.record?.items?.[0]?.stats) {
      return defaultRecord;
    }

    const stats = team.record.items[0].stats;
    return {
      wins: stats.find(s => s.name === 'wins')?.value || 0,
      losses: stats.find(s => s.name === 'losses')?.value || 0,
      otl: stats.find(s => s.name === 'otlosses')?.value || 0
    };
  }

  private static getTeamLogo(team: ESPNTeamResponse): string {
    // Try to get the logo from ESPN's response first
    if (team.logos && team.logos.length > 0) {
      return team.logos[0].href;
    }

    // Fallback to a different logo format using team ID
    return `https://a.espncdn.com/i/teamlogos/nhl/500/${team.id}.png`;
  }

  private static convertToTeam(espnTeam: ESPNTeamResponse): Team {
    const record = this.getTeamRecord(espnTeam);
    
    return {
      id: parseInt(espnTeam.id),
      name: espnTeam.name,
      city: espnTeam.location,
      abbreviation: espnTeam.abbreviation,
      logo: this.getTeamLogo(espnTeam),
      record
    };
  }

  public static async getUpcomingGames(): Promise<Game[]> {
    try {
      console.log('Fetching games from:', `${NHL_API_BASE}/scoreboard`);
      
      const response = await fetch(`${NHL_API_BASE}/scoreboard`, {
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
      console.log('ESPN API Response:', data);

      const games: Game[] = [];

      data.events.forEach((event) => {
        const competition = event.competitions[0];
        const homeTeamData = competition.competitors.find(c => c.homeAway === 'home');
        const awayTeamData = competition.competitors.find(c => c.homeAway === 'away');

        if (homeTeamData?.team && awayTeamData?.team) {
          const homeTeam = this.convertToTeam(homeTeamData.team);
          const awayTeam = this.convertToTeam(awayTeamData.team);

          console.log('Processing game:', {
            id: event.id,
            homeTeam: {
              name: homeTeam.name,
              city: homeTeam.city,
              record: homeTeam.record,
              logo: homeTeam.logo
            },
            awayTeam: {
              name: awayTeam.name,
              city: awayTeam.city,
              record: awayTeam.record,
              logo: awayTeam.logo
            },
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
      });

      return games;
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