import type { Game } from '../types/index';  // explicit import

export const MOCK_GAMES: Game[] = [
  {
    id: 1,
    homeTeam: {
      id: 1,
      name: "Maple Leafs",
      city: "Toronto",
      abbreviation: "TOR",
      logo: "https://example.com/leafs-logo.png", // placeholder URL
      record: { wins: 15, losses: 10, otl: 5 }
    },
    awayTeam: {
      id: 2,
      name: "Canadiens",
      city: "Montreal",
      abbreviation: "MTL",
      logo: "https://example.com/habs-logo.png", // placeholder URL
      record: { wins: 12, losses: 15, otl: 3 }
    },
    startTime: "2024-12-14T19:00:00Z",
    status: "scheduled",
    odds: {
      homeOdds: 1.85,
      awayOdds: 2.15
    }
  },
  {
    id: 2,
    homeTeam: {
      id: 3,
      name: "Rangers",
      city: "New York",
      abbreviation: "NYR",
      logo: "https://example.com/rangers-logo.png", // placeholder URL
      record: { wins: 18, losses: 8, otl: 4 }
    },
    awayTeam: {
      id: 4,
      name: "Bruins",
      city: "Boston",
      abbreviation: "BOS",
      logo: "https://example.com/bruins-logo.png", // placeholder URL
      record: { wins: 20, losses: 6, otl: 4 }
    },
    startTime: "2024-12-14T19:30:00Z",
    status: "scheduled",
    odds: {
      homeOdds: 2.05,
      awayOdds: 1.95
    }
  }
];