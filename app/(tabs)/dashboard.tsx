import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import GameCard from '../../components/GameCard';
import PredictionModal from '../../components/PredictionModal';
import NHLApiService from '../../services/nhlApi';
import type { Game, UserPrediction } from '../../types/index';
import type { RootState } from '@/store';

interface RenderItemProps {
  item: Game;
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

  const renderItem = ({ item }: RenderItemProps) => (
    <GameCard
      game={item}
      onSelect={handleGameSelect}
      selected={selectedGame?.id === item.id}
      hasPrediction={predictions.some(pred => pred.gameId === item.id)}
    />
  );

  const ListHeader = () => (
    <View className="p-4 bg-gray-100">
      <Text className="text-2xl font-bold text-blue-900">
        NHL Predictions
      </Text>
      {games.length > 0 && (
        <Text className="text-sm text-gray-600 mt-1">
          {games.length} upcoming games
        </Text>
      )}
    </View>
  );

  const ListEmptyComponent = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-lg text-gray-600 text-center">
        No upcoming games available
      </Text>
      <Text 
        className="text-blue-600 font-semibold mt-2"
        onPress={handleRefresh}
      >
        Pull to refresh
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-4">
        <Text className="text-red-600 mb-4 text-center">{error}</Text>
        <Text 
          className="text-blue-600 font-semibold"
          onPress={fetchGames}
        >
          Try Again
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList<Game>
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmptyComponent}
        data={games}
        renderItem={renderItem}
        keyExtractor={(item: Game) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      />

      {selectedGame && (
        <PredictionModal
          visible={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          game={selectedGame}
        />
      )}
    </SafeAreaView>
  );
}