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
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { Game, UserPrediction } from '@/types/index';

// Debug helper
const DEBUG = true;
const log = (...args: any[]) => DEBUG && console.log(...args);

// Web style injection moved to a useEffect hook
const useWebStyles = () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if the style element already exists
      const existingStyle = document.getElementById('games-by-day-styles');
      if (existingStyle) return;

      const style = document.createElement('style');
      style.id = 'games-by-day-styles';
      style.textContent = `
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
          border: 1px solid #1e293b;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #475569 #1e293b;
        }

        /* Focus effect styles */
        .games-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .games-container.focused {
          background-color: rgba(15, 23, 42, 0.97);
        }
        
        .games-container.focused .navigation-container {
          opacity: 0.3;
          transform: translateY(-10px);
        }
        
        .games-container.focused .game-wrapper:not(:hover) {
          opacity: 0.5;
          transform: scale(0.98);
          filter: saturate(0.8);
        }

        .navigation-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .game-wrapper {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .game-wrapper:hover {
          transform: translateY(-4px);
        }
      `;
      document.head.appendChild(style);

      // Cleanup function to remove the style when component unmounts
      return () => {
        const styleElement = document.getElementById('games-by-day-styles');
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, []); // Empty dependency array since this should only run once
};

const generateWeekDates = (): string[] => {
  const dates: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  log('Date generation:');
  log('- Start date:', start.toLocaleString());
  log('- Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const formattedDate = date.toLocaleDateString('en-CA');
    dates.push(formattedDate);
    log(`- Day ${i}:`, formattedDate);
  }
  
  return dates;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
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
  // Initialize web styles
  useWebStyles();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isHovering, setIsHovering] = useState(false);
  const gamesListRef = useRef<any>(null);

  const dates = useMemo(() => {
    const generatedDates = generateWeekDates();
    log('Generated dates:', generatedDates);
    return generatedDates;
  }, []);

  const gamesByDate = useMemo(() => {
    log('Grouping games by date. Total games:', games.length);
    
    const grouped = games.reduce((acc: Record<string, Game[]>, game) => {
      const utcDate = new Date(game.startTime);
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

  useEffect(() => {
    log('Date changed to:', selectedDate);
    gamesListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [selectedDate]);

  // Add hover handlers for game cards
  const handleGameHover = (isHovered: boolean) => {
    if (Platform.OS === 'web') {
      setIsHovering(isHovered);
    }
  };

  // Wrap each game card with hover detection
  const renderGameWrapper = (props: {
    item: Game;
    onSelect: (gameId: number) => void;
    selected: boolean;
    hasPrediction: boolean;
  }) => {
    return (
      <View
        style={styles.gameWrapper}
        onMouseEnter={() => handleGameHover(true)}
        onMouseLeave={() => handleGameHover(false)}
        className="game-wrapper"
      >
        {renderGameCard(props)}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  const currentGames = selectedDate ? gamesByDate[selectedDate] || [] : [];
  log('Current games for', selectedDate, ':', currentGames.length);

  return (
    <View 
      style={styles.container}
      className={`games-container ${isHovering ? 'focused' : ''}`}
    >
      <View 
        style={styles.navigationContainer}
        className="navigation-container"
      >
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
              <ChevronLeft size={24} color={dates.indexOf(selectedDate) === 0 ? '#94a3b8' : '#60a5fa'} />
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
              <ChevronRight size={24} color={dates.indexOf(selectedDate) === dates.length - 1 ? '#94a3b8' : '#60a5fa'} />
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {currentGames.length > 0 ? (
        <FlatList<Game>
          ref={gamesListRef}
          data={currentGames}
          renderItem={({ item }: { item: Game }) =>
            renderGameWrapper({
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
              colors={['#60a5fa']}
              tintColor="#60a5fa"
              progressBackgroundColor="#1e293b"
            />
          }
          style={Platform.OS === 'web' ? { outline: 'none' } : {}}
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
    ...(Platform.OS === 'web' && {
      height: 'calc(100vh - 60px)', // Account for tab bar
      overflow: 'auto',
    }),
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    height: 60,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingLeft: 8,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }),
  },
  scrollContent: {
    paddingVertical: 8,
    marginRight: 16,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#334155',
  },
  selectedDate: {
    backgroundColor: '#2563eb',
  },
  dateText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  selectedDateText: {
    color: '#fff',
  },
  arrowsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
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
    paddingBottom: 80,
  },
  gameWrapper: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  noGamesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 60,
  },
  noGamesText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default GamesByDay;