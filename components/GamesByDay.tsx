// components/GamesByDay.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { Game, UserPrediction } from '@/types/index';

interface RenderGameCardProps {
  item: Game;
  onSelect: (gameId: number) => void;
  selected: boolean;
  hasPrediction: boolean;
}

interface DayNavigatorProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

const DayNavigator: React.FC<DayNavigatorProps> = ({
  dates,
  selectedDate,
  onSelectDate,
}) => {
  const flatListRef = useRef<any>(null);
  const currentDateIndex = dates.indexOf(selectedDate);

  const handlePrevDay = () => {
    if (currentDateIndex > 0) {
      const newDate = dates[currentDateIndex - 1];
      onSelectDate(newDate);
      flatListRef.current?.scrollToIndex({
        index: currentDateIndex - 1,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const handleNextDay = () => {
    if (currentDateIndex < dates.length - 1) {
      const newDate = dates[currentDateIndex + 1];
      onSelectDate(newDate);
      flatListRef.current?.scrollToIndex({
        index: currentDateIndex + 1,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const getItemLayout = (_data: any, index: number) => ({
    length: 80,
    offset: 80 * index,
    index,
  });

  return (
    <View style={styles.dayNavigatorContainer}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={dates}
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        style={styles.dateList}
        renderItem={({ item, index }: { item: string; index: number }) => (
          <>
            <Pressable
              style={[
                styles.dateButton,
                item === selectedDate && styles.selectedDateButton,
              ]}
              onPress={() => onSelectDate(item)}
            >
              <Text
                style={[
                  styles.dateText,
                  item === selectedDate && styles.selectedDateText,
                ]}
              >
                {formatDate(item)}
              </Text>
            </Pressable>
            {index === dates.length - 1 && (
              <View style={styles.arrowButtonsContainer}>
                <Pressable 
                  style={[
                    styles.arrowButton,
                    currentDateIndex === 0 && styles.arrowButtonDisabled
                  ]}
                  onPress={handlePrevDay}
                  disabled={currentDateIndex === 0}
                >
                  <ChevronLeft 
                    size={24} 
                    color={currentDateIndex === 0 ? '#94a3b8' : '#2563eb'} 
                  />
                </Pressable>
                
                <Pressable 
                  style={[
                    styles.arrowButton,
                    currentDateIndex === dates.length - 1 && styles.arrowButtonDisabled
                  ]}
                  onPress={handleNextDay}
                  disabled={currentDateIndex === dates.length - 1}
                >
                  <ChevronRight 
                    size={24} 
                    color={currentDateIndex === dates.length - 1 ? '#94a3b8' : '#2563eb'} 
                  />
                </Pressable>
              </View>
            )}
          </>
        )}
        keyExtractor={(item: string) => item}
      />
    </View>
  );
};

interface GamesByDayProps {
  games: Game[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  predictions: UserPrediction[];
  onGameSelect: (gameId: number) => void;
  selectedGame: Game | null;
  renderGameCard: (props: RenderGameCardProps) => JSX.Element;
}

const GamesByDay: React.FC<GamesByDayProps> = ({
  games,
  loading,
  refreshing,
  onRefresh,
  predictions,
  onGameSelect,
  selectedGame,
  renderGameCard,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const gamesListRef = useRef<any>(null);

  const gamesByDate = useMemo(() => {
    const grouped = games.reduce((acc: Record<string, Game[]>, game) => {
      const date = game.startTime.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(game);
      return acc;
    }, {});

    return grouped;
  }, [games]);

  const dates = useMemo(() => {
    return Object.keys(gamesByDate).sort();
  }, [gamesByDate]);

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates]);

  useEffect(() => {
    gamesListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [selectedDate]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const currentGames = selectedDate ? gamesByDate[selectedDate] || [] : [];

  return (
    <View style={styles.container}>
      <DayNavigator
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <FlatList
        ref={gamesListRef}
        data={currentGames}
        renderItem={({ item }: { item: Game }) =>
          renderGameCard({
            item,
            onSelect: onGameSelect,
            selected: selectedGame?.id === item.id,
            hasPrediction: predictions.some((pred) => pred.gameId === item.id),
          })
        }
        keyExtractor={(item: Game) => item.id.toString()}
        contentContainerStyle={styles.gamesContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNavigatorContainer: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateList: {
    flex: 1,
    paddingLeft: 8,
  },
  arrowButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  arrowButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selectedDateButton: {
    backgroundColor: '#2563eb',
  },
  dateText: {
    fontSize: 16,
    color: '#4b5563',
    userSelect: 'none',
  },
  selectedDateText: {
    color: '#fff',
  },
  gamesContainer: {
    paddingBottom: 20,
  },
});

export default GamesByDay;