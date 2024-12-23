import HockeyStatsService from './HockeyStatsService';

interface TeamStats {
    basic: {
        goalsForPerGame: number;
        goalsAgainstPerGame: number;
        gamesPlayed: number;
        wins: number;
        losses: number;
        otLosses: number;
    };
    shooting: {
        shotsForPerGame: number;
        shotsAgainstPerGame: number;
        shootingPct: number;
        savePct: number;
    };
    special: {
        powerPlayPct: number;
        penaltyKillPct: number;
        faceoffWinPct: number;
    };
}

interface TeamAdvantage {
    offense: number;
    defense: number;
    special: number;
    homeIceBonus?: number;
    efficiencyFactor: number;
    momentumFactor: number;
}

interface PredictionResponse {
    homeTeamWinProbability: number;
    awayTeamWinProbability: number;
    predictedScore: {
        home: number;
        away: number;
    };
    factors: {
        homeAdvantage: TeamAdvantage;
        awayAdvantage: TeamAdvantage;
        gamePace: number;
        confidence: number;
    };
}

class PredictionService {
    private static readonly HOME_ICE_OFFENSE_BOOST = 1.05;
    private static readonly HOME_ICE_DEFENSE_BOOST = 1.03;
    private static readonly DEFAULT_VALUE = 0;
    
    private static safeNumber(value: number | null | undefined): number {
        return typeof value === 'number' && !isNaN(value) ? value : this.DEFAULT_VALUE;
    }

    private static safeToFixed(value: number | null | undefined, decimals: number = 1): number {
        const safeValue = this.safeNumber(value);
        return Number(safeValue.toFixed(decimals));
    }

    private static calculateEfficiency(stats: TeamStats): number {
        try {
            const scoringEfficiency = this.safeNumber(stats.shooting?.shootingPct) / 100;
            const defensiveEfficiency = this.safeNumber(stats.shooting?.savePct) / 100;
            return (scoringEfficiency + defensiveEfficiency) / 2;
        } catch (error) {
            console.error('Error calculating efficiency:', error);
            return this.DEFAULT_VALUE;
        }
    }

    private static calculateMomentumFactor(stats: TeamStats): number {
        try {
            const totalGames = this.safeNumber(stats.basic?.gamesPlayed);
            if (totalGames === 0) return 1;
            
            const wins = this.safeNumber(stats.basic?.wins);
            const winPercentage = wins / totalGames;
            const momentumBase = winPercentage - 0.5;
            return 1 + (momentumBase * 0.2);
        } catch (error) {
            console.error('Error calculating momentum:', error);
            return 1;
        }
    }

    private static calculateGamePace(homeStats: TeamStats, awayStats: TeamStats): number {
        try {
            const homePace = this.safeNumber(homeStats.basic?.goalsForPerGame) + 
                           this.safeNumber(homeStats.basic?.goalsAgainstPerGame);
            const awayPace = this.safeNumber(awayStats.basic?.goalsForPerGame) + 
                           this.safeNumber(awayStats.basic?.goalsAgainstPerGame);
            return (homePace + awayPace) / 2;
        } catch (error) {
            console.error('Error calculating game pace:', error);
            return 5; // Default to league average
        }
    }

    private static calculateTeamAdvantage(teamStats: TeamStats, isHomeTeam: boolean = false): TeamAdvantage {
        try {
            const offense = (
                this.safeNumber(teamStats.basic?.goalsForPerGame) * 0.4 +
                this.safeNumber(teamStats.shooting?.shotsForPerGame) * 0.3 +
                this.safeNumber(teamStats.special?.powerPlayPct) * 0.3
            );

            const defense = (
                (1 / Math.max(this.safeNumber(teamStats.basic?.goalsAgainstPerGame), 1)) * 0.4 +
                (1 / Math.max(this.safeNumber(teamStats.shooting?.shotsAgainstPerGame), 1)) * 0.3 +
                this.safeNumber(teamStats.special?.penaltyKillPct) * 0.3
            );

            const special = (
                this.safeNumber(teamStats.special?.powerPlayPct) * 0.4 +
                this.safeNumber(teamStats.special?.penaltyKillPct) * 0.4 +
                this.safeNumber(teamStats.special?.faceoffWinPct) * 0.2
            );

            const efficiencyFactor = this.calculateEfficiency(teamStats);
            const momentumFactor = this.calculateMomentumFactor(teamStats);

            if (isHomeTeam) {
                return {
                    offense: offense * this.HOME_ICE_OFFENSE_BOOST,
                    defense: defense * this.HOME_ICE_DEFENSE_BOOST,
                    special,
                    homeIceBonus: 0.1,
                    efficiencyFactor,
                    momentumFactor
                };
            }

            return {
                offense,
                defense,
                special,
                efficiencyFactor,
                momentumFactor
            };
        } catch (error) {
            console.error('Error calculating team advantage:', error);
            return {
                offense: this.DEFAULT_VALUE,
                defense: this.DEFAULT_VALUE,
                special: this.DEFAULT_VALUE,
                efficiencyFactor: 1,
                momentumFactor: 1
            };
        }
    }

    private static calculateWinProbability(
        homeAdvantage: TeamAdvantage,
        awayAdvantage: TeamAdvantage,
        gamePace: number
    ): { homeProb: number, awayProb: number, confidence: number } {
        try {
            const homeScore = (
                this.safeNumber(homeAdvantage.offense) * 0.3 +
                this.safeNumber(homeAdvantage.defense) * 0.3 +
                this.safeNumber(homeAdvantage.special) * 0.2 +
                this.safeNumber(homeAdvantage.homeIceBonus) +
                this.safeNumber(homeAdvantage.efficiencyFactor) * 0.1 +
                this.safeNumber(homeAdvantage.momentumFactor) * 0.1
            );

            const awayScore = (
                this.safeNumber(awayAdvantage.offense) * 0.3 +
                this.safeNumber(awayAdvantage.defense) * 0.3 +
                this.safeNumber(awayAdvantage.special) * 0.2 +
                this.safeNumber(awayAdvantage.efficiencyFactor) * 0.1 +
                this.safeNumber(awayAdvantage.momentumFactor) * 0.1
            );

            const differential = homeScore - awayScore;
            const homeProb = 1 / (1 + Math.exp(-differential));
            const awayProb = 1 - homeProb;
            const confidence = Math.min(Math.abs(differential) / (gamePace * 0.1), 1);

            return {
                homeProb: homeProb * 100,
                awayProb: awayProb * 100,
                confidence
            };
        } catch (error) {
            console.error('Error calculating win probability:', error);
            return {
                homeProb: 50,
                awayProb: 50,
                confidence: 0
            };
        }
    }

    static async getPrediction(homeTeamId: string, awayTeamId: string): Promise<PredictionResponse> {
        try {
            const [homeStats, awayStats] = await Promise.all([
                HockeyStatsService.getTeamStats(homeTeamId),
                HockeyStatsService.getTeamStats(awayTeamId)
            ]);

            if (!homeStats || !awayStats) {
                throw new Error('Failed to fetch team stats');
            }

            const homeAdvantage = this.calculateTeamAdvantage(homeStats, true);
            const awayAdvantage = this.calculateTeamAdvantage(awayStats, false);
            const gamePace = this.calculateGamePace(homeStats, awayStats);

            const { homeProb, awayProb, confidence } = this.calculateWinProbability(
                homeAdvantage,
                awayAdvantage,
                gamePace
            );

            const homeScoreFactor = (
                homeAdvantage.offense * 
                homeAdvantage.efficiencyFactor * 
                homeAdvantage.momentumFactor *
                (homeAdvantage.homeIceBonus ? this.HOME_ICE_OFFENSE_BOOST : 1)
            );
            
            const awayScoreFactor = (
                awayAdvantage.offense * 
                awayAdvantage.efficiencyFactor * 
                awayAdvantage.momentumFactor
            );

            return {
                homeTeamWinProbability: this.safeToFixed(homeProb),
                awayTeamWinProbability: this.safeToFixed(awayProb),
                predictedScore: {
                    home: this.safeToFixed((gamePace * homeScoreFactor) / 2),
                    away: this.safeToFixed((gamePace * awayScoreFactor) / 2)
                },
                factors: {
                    homeAdvantage,
                    awayAdvantage,
                    gamePace,
                    confidence
                }
            };
        } catch (error) {
            console.error('Error in prediction service:', error);
            // Return a safe default prediction
            return {
                homeTeamWinProbability: 50,
                awayTeamWinProbability: 50,
                predictedScore: {
                    home: 2.5,
                    away: 2.5
                },
                factors: {
                    homeAdvantage: this.calculateTeamAdvantage({
                        basic: { goalsForPerGame: 0, goalsAgainstPerGame: 0, gamesPlayed: 0, wins: 0, losses: 0, otLosses: 0 },
                        shooting: { shotsForPerGame: 0, shotsAgainstPerGame: 0, shootingPct: 0, savePct: 0 },
                        special: { powerPlayPct: 0, penaltyKillPct: 0, faceoffWinPct: 0 }
                    }, true),
                    awayAdvantage: this.calculateTeamAdvantage({
                        basic: { goalsForPerGame: 0, goalsAgainstPerGame: 0, gamesPlayed: 0, wins: 0, losses: 0, otLosses: 0 },
                        shooting: { shotsForPerGame: 0, shotsAgainstPerGame: 0, shootingPct: 0, savePct: 0 },
                        special: { powerPlayPct: 0, penaltyKillPct: 0, faceoffWinPct: 0 }
                    }, false),
                    gamePace: 5,
                    confidence: 0
                }
            };
        }
    }
}

export default PredictionService;