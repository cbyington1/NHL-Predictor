// GamesByDay.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { Game, UserPrediction } from '@/types/index';

// Debug helper
const DEBUG = true;
const log = (...args: any[]) => DEBUG && console.log(...args);

const generateWeekDates = (): string[] => {
  const dates: string[] = [];
  const start = new Date();
  // Ensure we're working with midnight in local time
  start.setHours(0, 0, 0, 0);
  
  log('Date generation:');
  log('- Start date:', start.toLocaleString());
  log('- Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    // Always use YYYY-MM-DD format
    const formattedDate = date.toLocaleDateString('en-CA');
    dates.push(formattedDate);
    log(`- Day ${i}:`, formattedDate);
  }
  
  return dates;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00'); // Ensure consistent time
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

interface GamesByDayProps {
  games: Game[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  predictions: UserPrediction[];
  onGameSelect: (gameId: number) => void;
  selectedGame: Game | null;
  renderGameCard: (props: {
    item: Game;
    onSelect: (gameId: number) => void;
    selected: boolean;
    hasPrediction: boolean;
  }) => JSX.Element;
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

  // Generate dates first
  const dates = useMemo(() => {
    const generatedDates = generateWeekDates();
    log('Generated dates:', generatedDates);
    return generatedDates;
  }, []);

 // Group games by date
const gamesByDate = useMemo(() => {
  log('Grouping games by date. Total games:', games.length);
  
  const grouped = games.reduce((acc: Record<string, Game[]>, game) => {
    // Convert UTC time to local date, but preserve the original date
    const utcDate = new Date(game.startTime);
    // Get the date in UTC to avoid timezone shifting
    const dateKey = utcDate.toISOString().split('T')[0];
    
    log('Game date processing:', {
      id: game.id,
      originalStartTime: game.startTime,
      dateKey,
      localTime: utcDate.toLocaleTimeString(),
      utcTime: utcDate.toUTCString()
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(game);
    return acc;
  }, {});

  return grouped;
}, [games]);

  // Set initial date
  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      const today = new Date().toLocaleDateString('en-CA');
      log('Setting initial date:', {
        today,
        hasGames: gamesByDate[today]?.length > 0
      });

      if (gamesByDate[today]?.length > 0) {
        setSelectedDate(today);
      } else {
        const nextDateWithGames = dates.find(date => gamesByDate[date]?.length > 0);
        log('Looking for next date with games:', nextDateWithGames);
        setSelectedDate(nextDateWithGames || dates[0]);
      }
    }
  }, [dates, gamesByDate]);

  // Reset scroll position when date changes
  useEffect(() => {
    log('Date changed to:', selectedDate);
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
  log('Current games for', selectedDate, ':', currentGames.length);

  return (
    <View style={styles.container}>
      <View style={styles.navigationContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {dates.map((date) => (
            <Pressable
              key={date}
              style={[
                styles.dateButton,
                date === selectedDate && styles.selectedDate
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text 
                style={[
                  styles.dateText,
                  date === selectedDate && styles.selectedDateText
                ]}
              >
                {formatDate(date)}
              </Text>
            </Pressable>
          ))}
          
          <View style={styles.arrowsContainer}>
            <Pressable 
              onPress={() => {
                const currentIndex = dates.indexOf(selectedDate);
                if (currentIndex > 0) {
                  setSelectedDate(dates[currentIndex - 1]);
                }
              }}
              disabled={dates.indexOf(selectedDate) === 0}
              style={[styles.arrowButton, dates.indexOf(selectedDate) === 0 && styles.arrowDisabled]}
            >
              <ChevronLeft size={24} color={dates.indexOf(selectedDate) === 0 ? '#94a3b8' : '#2563eb'} />
            </Pressable>

            <Pressable 
              onPress={() => {
                const currentIndex = dates.indexOf(selectedDate);
                if (currentIndex < dates.length - 1) {
                  setSelectedDate(dates[currentIndex + 1]);
                }
              }}
              disabled={dates.indexOf(selectedDate) === dates.length - 1}
              style={[styles.arrowButton, dates.indexOf(selectedDate) === dates.length - 1 && styles.arrowDisabled]}
            >
              <ChevronRight size={24} color={dates.indexOf(selectedDate) === dates.length - 1 ? '#94a3b8' : '#2563eb'} />
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {currentGames.length > 0 ? (
        <FlatList<Game>
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
      ) : (
        <View style={styles.noGamesContainer}>
          <Text style={styles.noGamesText}>
            No games scheduled for {formatDate(selectedDate)}
          </Text>
        </View>
      )}
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
  navigationContainer: {
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingLeft: 8,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 8,
    marginRight: 16, // Add space between dates and arrows
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selectedDate: {
    backgroundColor: '#2563eb',
  },
  dateText: {
    fontSize: 16,
    color: '#4b5563',
  },
  selectedDateText: {
    color: '#fff',
  },
  arrowsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,  // Space after the last date
  },
  arrowButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    opacity: 0.5,
  },
  gamesContainer: {
    paddingBottom: 20,
  },
  noGamesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noGamesText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default GamesByDay;