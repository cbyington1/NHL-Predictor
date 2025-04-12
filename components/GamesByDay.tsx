import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const scrollViewRef = useRef<any>(null);
  
  // Disable the ScrollViewStyleReset from expo-router on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Find and remove the ScrollViewStyleReset style
      document.querySelectorAll('style').forEach(style => {
        if (style.innerHTML.includes('overflow: hidden') || 
            style.innerHTML.includes('position: fixed')) {
          // Override with our own styles instead of removing
          const overrideStyle = document.createElement('style');
          overrideStyle.innerHTML = `
            html, body {
              overflow: auto !important;
              position: relative !important;
              height: 100% !important;
              width: 100% !important;
            }
            
            #root {
              height: 100%;
              overflow: auto;
            }
            
            .scrollable-container {
              height: calc(100vh - 180px); /* Account for tab bar (60px) + date selector (60px) + extra padding (60px) */
              overflow: auto !important;
              position: relative !important;
              display: block !important;
              padding-bottom: 60px; /* Add padding at the bottom to prevent content from being hidden behind the tab bar */
            }

            /* Custom scrollbar styling */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            
            ::-webkit-scrollbar-track {
              background: #1e293b;
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #3b82f6;
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #60a5fa;
            }
            
            /* Firefox scrollbar */
            * {
              scrollbar-width: thin;
              scrollbar-color: #3b82f6 #1e293b;
            }
          `;
          document.head.appendChild(overrideStyle);
        }
      });
    }
  }, []);

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
    // Scroll to top when date changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  }, [selectedDate]);

  // Add hover handlers for game cards
  const handleGameHover = (isHovered: boolean) => {
    if (Platform.OS === 'web') {
      setIsHovering(isHovered);
    }
  };

  // New handlers for date button hover
  const handleDateHover = (date: string, isHovered: boolean) => {
    if (Platform.OS === 'web') {
      setHoveredDate(isHovered ? date : null);
    }
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
              onHoverIn={() => handleDateHover(date, true)}
              onHoverOut={() => handleDateHover(date, false)}
            >
              <Text 
                style={[
                  styles.dateText,
                  date === selectedDate && styles.selectedDateText
                ]}
              >
                {formatDate(date)}
              </Text>
              
              {/* Show game count only when hovering */}
              {gamesByDate[date]?.length > 0 && date === hoveredDate && (
                <View style={[
                  styles.countBadge,
                  Platform.OS === 'web' && {
                    animation: 'fadeIn 0.2s ease-in-out',
                  }
                ]}>
                  <Text style={styles.countText}>{gamesByDate[date].length}</Text>
                </View>
              )}
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
        Platform.OS === 'web' ? (
          <div className="scrollable-container" style={{ 
            height: 'calc(100vh - 180px)', 
            overflow: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#3b82f6 #1e293b',
            paddingBottom: '60px' /* Space for tab bar */
          }}>
            <div style={{ paddingBottom: 120 }}>
              {currentGames.map((game) => (
                <div 
                  key={game.id} 
                  style={{ margin: '8px 20px' }}
                  onMouseEnter={() => handleGameHover(true)}
                  onMouseLeave={() => handleGameHover(false)}
                >
                  {renderGameCard({
                    item: game,
                    onSelect: onGameSelect,
                    selected: selectedGame?.id === game.id,
                    hasPrediction: predictions.some((pred) => pred.gameId === game.id),
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.gamesList}
            contentContainerStyle={styles.gamesListContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#60a5fa']}
                tintColor="#60a5fa"
                progressBackgroundColor="#1e293b"
              />
            }
          >
            {currentGames.map((game) => (
              <View 
                key={game.id}
                style={styles.gameCardWrapper}
                onTouchStart={() => handleGameHover(true)}
                onTouchEnd={() => handleGameHover(false)}
              >
                {renderGameCard({
                  item: game,
                  onSelect: onGameSelect,
                  selected: selectedGame?.id === game.id,
                  hasPrediction: predictions.some((pred) => pred.gameId === game.id),
                })}
              </View>
            ))}
            {/* Extra padding at bottom to account for tab bar and ensure last card is fully visible */}
            <View style={{ height: 120 }} />
          </ScrollView>
        )
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
    backgroundColor: '#0f172a',
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
    zIndex: 10,
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
    position: 'relative',
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
  countBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#60a5fa',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease-in-out',
      // Add simple fade-in animation for web
      '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'scale(0.8)' },
        to: { opacity: 1, transform: 'scale(1)' }
      }
    })
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
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
  gamesList: {
    flex: 1,
  },
  gamesListContent: {
    paddingTop: 8,
  },
  gameCardWrapper: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  noGamesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noGamesText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default GamesByDay;