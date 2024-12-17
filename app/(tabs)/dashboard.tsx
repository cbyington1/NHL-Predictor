// app/(tabs)/dashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import GamesByDay from '../../components/GamesByDay';
import GameCard from '../../components/GameCard';
import PredictionModal from '../../components/PredictionModal';
import NHLApiService from '../../services/nhlApi';
import type { Game, UserPrediction } from '@/types/index';
import type { RootState } from '@/store';

interface RenderGameCardProps {
  item: Game;
  onSelect: (gameId: number) => void;
  selected: boolean;
  hasPrediction: boolean;
}

export default function Dashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictions = useSelector((state: RootState) => 
    state.predictions?.predictions ?? []
  ) as UserPrediction[];

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const upcomingGames = await NHLApiService.getUpcomingGames();
      setGames(upcomingGames);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch games. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchGames();
    } finally {
      setRefreshing(false);
    }
  };

  const handleGameSelect = (gameId: number) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
    }
  };

  const renderGameCard = ({ item, onSelect, selected, hasPrediction }: RenderGameCardProps) => (
    <View style={{ 
      backgroundColor: '#fff', 
      marginHorizontal: 10,
      marginVertical: 5,
      padding: 8,
    }}>
      <GameCard
        game={item}
        onSelect={onSelect}
        selected={selected}
        hasPrediction={hasPrediction}
      />
    </View>
  );

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</Text>
        <Text 
          style={{ color: '#2563eb', fontWeight: '600' }}
          onPress={fetchGames}
        >
          Try Again
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <GamesByDay
        games={games}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        predictions={predictions}
        onGameSelect={handleGameSelect}
        selectedGame={selectedGame}
        renderGameCard={renderGameCard}
      />

      {selectedGame && (
        <PredictionModal
          visible={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          game={selectedGame}
        />
      )}
    </View>
  );
}