// types/index.ts
export interface Team {
    id: number;
    name: string;
    city: string;
    abbreviation: string;
    logo: string;
    record: {
      wins: number;
      losses: number;
      otl: number;
    };
  }
  
  export interface Game {
    id: number;
    homeTeam: Team;
    awayTeam: Team;
    startTime: string;
    status: string;
    odds: {
      homeOdds: number;
      awayOdds: number;
    } | null;
    score?: {
      home: number;
      away: number;
    };
  }
  
  export interface UserPrediction {
    gameId: number;
    selectedTeamId: number;
    confidence: number;
    timestamp: string;
    result?: 'win' | 'loss' | null;
  }