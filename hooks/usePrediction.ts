// hooks/usePrediction.ts
import { useState, useEffect } from 'react';
import type { Game } from '@/types/index';

interface PredictionData {
    homeTeamWinProbability: number;
    awayTeamWinProbability: number;
    predictedScore: {
        home: number;
        away: number;
    };
    factors: {
        homeAdvantage: {
            offense: number;
            defense: number;
            special: number;
        };
        awayAdvantage: {
            offense: number;
            defense: number;
            special: number;
        };
    };
}

export function usePrediction(game: Game) {
    const [prediction, setPrediction] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(
                    `http://localhost:3000/api/hockey/predict/${game.homeTeam.id}/${game.awayTeam.id}`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch prediction');
                }

                const data = await response.json();
                setPrediction(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch prediction');
            } finally {
                setLoading(false);
            }
        };

        fetchPrediction();
    }, [game.homeTeam.id, game.awayTeam.id]);

    return { prediction, loading, error };
}