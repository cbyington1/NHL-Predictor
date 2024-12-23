import { Game, Team } from '../types/index';

const NHL_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';

interface ESPNTeamResponse {
  id: string;
  name: string;
  abbreviation: string;
  location: string;
  logos?: Array<{ href: string }>;
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
  private static formatDateForESPN(date: Date): string {
    // ESPN expects dates in YYYYMMDD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    console.log('Formatting date for ESPN:', {
      inputDate: date,
      formatted: `${year}${month}${day}`
    });
    
    return `${year}${month}${day}`;
  }

  private static convertGameTime(utcDateString: string): string {
    // ESPN provides dates in UTC, we'll keep them in UTC and let the UI handle display
    return new Date(utcDateString).toISOString();
  }

  public static async getUpcomingGames(): Promise<Game[]> {
    try {
      // Get the date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const startDate = this.formatDateForESPN(today);
      const endDate = this.formatDateForESPN(nextWeek);

      console.log('Fetching games with date range:', {
        startDate,
        endDate,
        todayFormatted: today.toISOString()
      });

      const url = `${NHL_API_BASE}/scoreboard?dates=${startDate}-${endDate}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NHL API error: ${response.status}`);
      }

      const data: ESPNScheduleResponse = await response.json();

      console.log('Raw ESPN response first few games:', 
        data.events.slice(0, 3).map(event => ({
          id: event.id,
          date: event.date,
          convertedDate: this.convertGameTime(event.date)
        }))
      );

      const games: Game[] = [];

      for (const event of data.events) {
        const competition = event.competitions[0];
        const homeTeamData = competition.competitors.find(c => c.homeAway === 'home')?.team;
        const awayTeamData = competition.competitors.find(c => c.homeAway === 'away')?.team;

        if (homeTeamData && awayTeamData) {
          const homeTeam: Team = {
            id: parseInt(homeTeamData.id),
            name: homeTeamData.name.replace(homeTeamData.location, '').trim(),
            city: homeTeamData.location,
            abbreviation: homeTeamData.abbreviation,
            logo: homeTeamData.logos?.[0]?.href || 
                  `https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/${homeTeamData.abbreviation.toLowerCase()}.png`,
            record: { wins: 0, losses: 0, otl: 0 }
          };

          const awayTeam: Team = {
            id: parseInt(awayTeamData.id),
            name: awayTeamData.name.replace(awayTeamData.location, '').trim(),
            city: awayTeamData.location,
            abbreviation: awayTeamData.abbreviation,
            logo: awayTeamData.logos?.[0]?.href || 
                  `https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/${awayTeamData.abbreviation.toLowerCase()}.png`,
            record: { wins: 0, losses: 0, otl: 0 }
          };

          const startTime = this.convertGameTime(event.date);
          
          console.log('Processing game:', {
            id: event.id,
            originalDate: event.date,
            convertedDate: startTime,
            teams: `${homeTeam.name} vs ${awayTeam.name}`
          });

          games.push({
            id: parseInt(event.id),
            homeTeam,
            awayTeam,
            startTime,
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
}

export default NHLApiService;