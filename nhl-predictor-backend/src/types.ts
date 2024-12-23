// types.ts
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
    homeTeamOdds: number | null;
    awayTeamOdds: number | null;
}

export interface UserPrediction {
    gameId: number;
    predictedWinner: number;
    confidence: number;
    timestamp: string;
}