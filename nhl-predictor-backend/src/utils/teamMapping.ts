// Define a type for the team mapping
type TeamMapping = {
    [key: string]: number;
};

// Map of ESPN team IDs to NHL team IDs
const TEAM_MAPPING: TeamMapping = {
    '25': 24,    // Anaheim Ducks
    '1': 6,      // Boston Bruins
    '2': 7,      // Buffalo Sabres
    '3': 20,     // Calgary Flames
    '7': 12,     // Carolina Hurricanes
    '4': 16,     // Chicago Blackhawks
    '17': 21,    // Colorado Avalanche
    '29': 29,    // Columbus Blue Jackets
    '9': 25,     // Dallas Stars
    '5': 17,     // Detroit Red Wings
    '6': 22,     // Edmonton Oilers
    '26': 13,    // Florida Panthers
    '8': 26,     // Los Angeles Kings
    '30': 30,    // Minnesota Wild
    '10': 8,     // Montreal Canadiens
    '27': 18,    // Nashville Predators
    '11': 1,     // New Jersey Devils
    '12': 2,     // New York Islanders
    '13': 3,     // New York Rangers
    '14': 9,     // Ottawa Senators
    '15': 4,     // Philadelphia Flyers
    '16': 5,     // Pittsburgh Penguins
    '18': 28,    // San Jose Sharks
    '124292': 55,// Seattle Kraken
    '19': 19,    // St. Louis Blues
    '20': 14,    // Tampa Bay Lightning
    '21': 10,    // Toronto Maple Leafs
    '129764': 53,// Utah Hockey Club (formerly Arizona Coyotes)
    '22': 23,    // Vancouver Canucks
    '37': 54,    // Vegas Golden Knights
    '23': 15,    // Washington Capitals
    '28': 52,    // Winnipeg Jets
};

async function getNHLTeamId(espnId: string | number): Promise<number> {
    const id = espnId.toString();
    const nhlId = TEAM_MAPPING[id];
    
    if (!nhlId) {
        console.log(`Missing ESPN to NHL ID mapping for ESPN ID: ${espnId}`);
        throw new Error(`Invalid team ID: ${espnId}`);
    }
    
    return nhlId;
}

export { getNHLTeamId };