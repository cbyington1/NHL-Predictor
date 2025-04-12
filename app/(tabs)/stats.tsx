import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Image, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DarkThemeLayout from '@/components/DarkThemeLayout';

interface PredictionResult {
  id: number;
  gameId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeWinProbability: number;
  awayWinProbability: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
  wasCorrect: boolean;
  createdAt: string;
  gameStartTime: string;
  gameStatus: string;
}

interface PredictionAccuracy {
  totalGames: number;
  correctPredictions: number;
  accuracy: number;
}

// Complete NHL team colors mapping
const teamColors: { [key: string]: string } = {
  'Maple Leafs': '#00205B',
  'Canadiens': '#AF1E2D',
  'Bruins': '#FFB81C',
  'Rangers': '#0038A8',
  'Flyers': '#F74902',
  'Penguins': '#FCB514',
  'Capitals': '#041E42',
  'Lightning': '#00A3E0',
  'Panthers': '#C8102E',
  'Red Wings': '#CE1126',
  'Hurricanes': '#CC0000',
  'Blue Jackets': '#002654',
  'Islanders': '#00539B',
  'Devils': '#CE1126',
  'Sabres': '#003087',
  'Senators': '#C52032',
  'Blackhawks': '#CF0A2C',
  'Avalanche': '#6F263D',
  'Blues': '#002F87',
  'Stars': '#006847',
  'Wild': '#004F30',
  'Predators': '#FFB81C',
  'Jets': '#041E42',
  'Flames': '#D2001C',
  'Oilers': '#FF4C00',
  'Canucks': '#008852',
  'Sharks': '#006D75',
  'Ducks': '#F47A38',
  'Kings': '#111111',
  'Coyotes': '#8C2633',
  'Golden Knights': '#B4975A',
  'Kraken': '#001628'
};

// Get team color function
const getTeamColor = (teamName: string) => {
  if (!teamName) return '#64748b';
  const team = Object.keys(teamColors).find(key => teamName.includes(key));
  return team ? teamColors[team] : '#64748b';
};

// Create gradient function - same as GameCard
const createGradient = (color1: string, color2: string, opacity: number = 1) => {
  const toRGBA = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  return `linear-gradient(90deg, 
    ${toRGBA(color1, opacity)} 0%, 
    ${toRGBA(color1, opacity)} 45%, 
    ${toRGBA(color2, opacity)} 55%, 
    ${toRGBA(color2, opacity)} 100%
  )`;
};

// Ice texture component for web only
const IceTextureBackground = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // Ice texture style for web
  const iceTextureStyle = {
    position: 'relative',
    flex: 1,
  };

  useEffect(() => {
    // Create and append CSS for ice texture
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .ice-texture-bg {
        position: relative;
      }
      .ice-texture-bg::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        background: 
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 1px, transparent 1px) 0 0 / 24px 24px,
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px) 0 0 / 24px 24px,
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px) 0 0 / 24px 24px;
        opacity: 0.3;
        z-index: 0;
      }
      
      /* Custom scrollbar styles */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #1e293b;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #3b82f6;
        border-radius: 4px;
        opacity: 0.5;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #60a5fa;
      }
      
      * {
        scrollbar-width: thin;
        scrollbar-color: #3b82f6 #1e293b;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="ice-texture-bg" style={iceTextureStyle as any}>
      {children}
    </div>
  );
};

// Complete team mapping with all NHL teams
const teamIdToInfo: { [key: number]: { name: string; city: string; logo: string; record?: { wins: number; losses: number; otl: number } } } = {
  1: { name: 'Devils', city: 'New Jersey', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/nj.png', record: { wins: 0, losses: 0, otl: 0 } },
  2: { name: 'Islanders', city: 'New York', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/nyi.png', record: { wins: 0, losses: 0, otl: 0 } },
  3: { name: 'Rangers', city: 'New York', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/nyr.png', record: { wins: 0, losses: 0, otl: 0 } },
  4: { name: 'Flyers', city: 'Philadelphia', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/phi.png', record: { wins: 0, losses: 0, otl: 0 } },
  5: { name: 'Penguins', city: 'Pittsburgh', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/pit.png', record: { wins: 0, losses: 0, otl: 0 } },
  6: { name: 'Bruins', city: 'Boston', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/bos.png', record: { wins: 0, losses: 0, otl: 0 } },
  7: { name: 'Sabres', city: 'Buffalo', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/buf.png', record: { wins: 0, losses: 0, otl: 0 } },
  8: { name: 'Canadiens', city: 'Montreal', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/mtl.png', record: { wins: 0, losses: 0, otl: 0 } },
  9: { name: 'Senators', city: 'Ottawa', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/ott.png', record: { wins: 0, losses: 0, otl: 0 } },
  10: { name: 'Maple Leafs', city: 'Toronto', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/tor.png', record: { wins: 0, losses: 0, otl: 0 } },
  12: { name: 'Hurricanes', city: 'Carolina', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/car.png', record: { wins: 0, losses: 0, otl: 0 } },
  13: { name: 'Panthers', city: 'Florida', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/fla.png', record: { wins: 0, losses: 0, otl: 0 } },
  14: { name: 'Lightning', city: 'Tampa Bay', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/tb.png', record: { wins: 0, losses: 0, otl: 0 } },
  15: { name: 'Capitals', city: 'Washington', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/wsh.png', record: { wins: 0, losses: 0, otl: 0 } },
  16: { name: 'Blackhawks', city: 'Chicago', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/chi.png', record: { wins: 0, losses: 0, otl: 0 } },
  17: { name: 'Red Wings', city: 'Detroit', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/det.png', record: { wins: 0, losses: 0, otl: 0 } },
  18: { name: 'Predators', city: 'Nashville', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/nsh.png', record: { wins: 0, losses: 0, otl: 0 } },
  19: { name: 'Blues', city: 'St. Louis', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/stl.png', record: { wins: 0, losses: 0, otl: 0 } },
  20: { name: 'Flames', city: 'Calgary', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/cgy.png', record: { wins: 0, losses: 0, otl: 0 } },
  21: { name: 'Avalanche', city: 'Colorado', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/col.png', record: { wins: 0, losses: 0, otl: 0 } },
  22: { name: 'Oilers', city: 'Edmonton', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/edm.png', record: { wins: 0, losses: 0, otl: 0 } },
  23: { name: 'Canucks', city: 'Vancouver', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/van.png', record: { wins: 0, losses: 0, otl: 0 } },
  24: { name: 'Ducks', city: 'Anaheim', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/ana.png', record: { wins: 0, losses: 0, otl: 0 } },
  25: { name: 'Stars', city: 'Dallas', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/dal.png', record: { wins: 0, losses: 0, otl: 0 } },
  26: { name: 'Kings', city: 'Los Angeles', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/la.png', record: { wins: 0, losses: 0, otl: 0 } },
  28: { name: 'Sharks', city: 'San Jose', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/sj.png', record: { wins: 0, losses: 0, otl: 0 } },
  29: { name: 'Blue Jackets', city: 'Columbus', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/cbj.png', record: { wins: 0, losses: 0, otl: 0 } },
  30: { name: 'Wild', city: 'Minnesota', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/min.png', record: { wins: 0, losses: 0, otl: 0 } },
  52: { name: 'Jets', city: 'Winnipeg', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/wpg.png', record: { wins: 0, losses: 0, otl: 0 } },
  53: { name: 'Utah Hockey Club', city: 'Utah', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/ari.png', record: { wins: 0, losses: 0, otl: 0 } },
  54: { name: 'Golden Knights', city: 'Vegas', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/vgk.png', record: { wins: 0, losses: 0, otl: 0 } },
  55: { name: 'Kraken', city: 'Seattle', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/sea.png', record: { wins: 0, losses: 0, otl: 0 } },
};

// Default team fallback
const getTeamInfo = (teamId: number) => {
  return teamIdToInfo[teamId] || { 
    name: `Team ${teamId}`, 
    city: 'Unknown', 
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/default.png',
    record: { wins: 0, losses: 0, otl: 0 }
  };
};

export default function Stats() {
  const [completedPredictions, setCompletedPredictions] = useState<PredictionResult[]>([]);
  const [accuracy, setAccuracy] = useState<PredictionAccuracy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPredictionResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch completed predictions
        const completedResponse = await fetch('http://localhost:3000/api/predictions/completed');
        if (!completedResponse.ok) {
          throw new Error('Failed to fetch completed prediction results');
        }
        const completedData = await completedResponse.json();
        setCompletedPredictions(completedData);
        
        // Fetch accuracy statistics
        const accuracyResponse = await fetch('http://localhost:3000/api/predictions/accuracy');
        if (!accuracyResponse.ok) {
          throw new Error('Failed to fetch accuracy data');
        }
        const accuracyData = await accuracyResponse.json();
        setAccuracy(accuracyData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching prediction results:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPredictionResults();
  }, []);

  // Render prediction card
  const renderPredictionCard = (item: PredictionResult) => {
    const isHovered = hoveredCardId === item.id;
    
    const gameDate = new Date(item.gameStartTime); // This already converts to local time
    const displayDate = gameDate; // No additional adjustment needed
    
    // Format to include day, month, and year
    const formattedDate = displayDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const gameTime = displayDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Get team info
    const homeTeamInfo = getTeamInfo(item.homeTeamId);
    const awayTeamInfo = getTeamInfo(item.awayTeamId);
    
    // Get team colors
    const homeTeamColor = getTeamColor(homeTeamInfo.name);
    const awayTeamColor = getTeamColor(awayTeamInfo.name);
    
    // Determine winner
    const homeTeamWon = item.actualHomeScore > item.actualAwayScore;
    const winnerColor = homeTeamWon ? homeTeamColor : awayTeamColor;
    
    // Render team info - almost identical to GameCard.tsx (but removed record)
    const renderTeamInfo = (team: typeof homeTeamInfo, isHome: boolean) => {
      const teamColor = getTeamColor(team.name);
      return (
        <View style={styles.teamSection}>
          <View style={styles.logoWrapper}>
            <View style={[
              styles.logoContainer,
              isHovered && styles.logoContainerHovered,
              { borderColor: isHovered ? teamColor : '#e2e8f0' }
            ]}>
              <View style={[
                styles.teamColorOverlay,
                {
                  backgroundColor: teamColor,
                  opacity: isHovered ? 0.15 : 0
                }
              ]} />
              <Image 
                source={{ uri: team.logo }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.cityName}>{team.city}</Text>
          {/* Record display removed */}
        </View>
      );
    };
    
    return (
      <View 
        style={[
          styles.card,
          Platform.OS === 'web' && {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          },
          isHovered && Platform.OS === 'web' && styles.cardHovered
        ]}
        onMouseEnter={() => Platform.OS === 'web' && setHoveredCardId(item.id)}
        onMouseLeave={() => Platform.OS === 'web' && setHoveredCardId(null)}
      >
        {/* Header with date and outcome */}
        <View style={[
          styles.dateHeader,
          Platform.OS === 'web' && {
            background: createGradient('#f1f5f9', '#f1f5f9', 1.2), // Default light gray
            ...(isHovered) && {
              // Only show winner's color when hovered
              background: createGradient(winnerColor, winnerColor, 0.6)
            },
            transition: 'background 0.3s ease-in-out'
          },
          Platform.OS !== 'web' && {
            backgroundColor: '#f1f5f9' // Default light gray for mobile
          }
        ]}>
          <View>
            <Text style={[
              styles.time,
              isHovered && { color: '#ffffff' }
            ]}>{formattedDate}</Text>
            <Text style={[
              styles.gameTime,
              isHovered && { color: '#f1f5f9' }
            ]}>{gameTime}</Text>
          </View>
          <Text style={[
            styles.odds,
            isHovered && { color: '#f1f5f9' }
          ]}>
            {item.wasCorrect ? 'Correct ✓' : 'Incorrect ✗'}
          </Text>
        </View>

        {/* Teams container - just like GameCard */}
        <View style={styles.teamsContainer}>
          {renderTeamInfo(homeTeamInfo, true)}

          <View style={styles.centerInfo}>
            <View style={styles.predictedScores}>
              <Text style={styles.predictedLabel}>Win Probability</Text>
              <Text style={styles.predictedScore}>
                {item.homeWinProbability.toFixed(1)}% - {item.awayWinProbability.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.vsContainer}>
              <Text style={[
                styles.vsText,
                Platform.OS === 'web' && {
                  color: '#64748b',
                  ...(isHovered) && {
                    background: createGradient(homeTeamColor, awayTeamColor, 1),
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 1
                  },
                  transition: 'all 0.5s ease-in-out'
                }
              ]}>VS</Text>
            </View>
            
            <View style={styles.actualScores}>
            <Text style={styles.actualLabel}>Final Score</Text>
              <Text style={styles.finalScore}>
                {item.actualHomeScore} - {item.actualAwayScore}
              </Text>
            </View>
          </View>

          {renderTeamInfo(awayTeamInfo, false)}
        </View>
      </View>
    );
  };

  return (
    <DarkThemeLayout>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Prediction Results</Text>
          {/* Subtle accent line */}
          <View style={styles.accentLine} />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer}>
            {accuracy && (
              <View style={styles.accuracyCard}>
                <Text style={styles.accuracyTitle}>Prediction Accuracy</Text>
                <View style={styles.accuracyDetails}>
                  <View style={styles.accuracyItem}>
                    <Text style={styles.accuracyValue}>{accuracy.accuracy.toFixed(1)}%</Text>
                    <Text style={styles.accuracyLabel}>Accuracy</Text>
                  </View>
                  <View style={styles.accuracyItem}>
                    <Text style={styles.accuracyValue}>{accuracy.correctPredictions}</Text>
                    <Text style={styles.accuracyLabel}>Correct</Text>
                  </View>
                  <View style={styles.accuracyItem}>
                    <Text style={styles.accuracyValue}>{accuracy.totalGames}</Text>
                    <Text style={styles.accuracyLabel}>Total</Text>
                  </View>
                </View>
              </View>
            )}
            
            {completedPredictions.length > 0 ? (
              <View style={styles.predictionsContainer}>
                {completedPredictions.map(item => (
                  <View key={item.id} style={styles.predictionWrapper}>
                    {renderPredictionCard(item)}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No completed predictions available yet. Make some predictions and wait for the games to finish.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </DarkThemeLayout>
  );
}

// Styles are almost identical to GameCard.tsx but with added accent line
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  accentLine: {
    height: 1,
    backgroundColor: '#3b82f6',
    marginTop: 4,
    opacity: 0.5,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
  },
  accuracyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    zIndex: 1,
  },
  accuracyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 16,
  },
  accuracyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  accuracyItem: {
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  predictionsContainer: {
    paddingBottom: 80, // Space for tab bar
    zIndex: 1,
  },
  predictionWrapper: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  // Card styles - identical to GameCard but fixed for Web
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    cursor: 'default', // Changed to default from pointer
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    userSelect: 'none',
    ...(Platform.OS === 'web' 
      ? {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        }
      : {
          elevation: 2,
        }
    ),
  },
  cardHovered: {
    transform: [{translateY: -2}, {scale: 1.002}], // Reduced hover effect
    borderColor: '#cbd5e1',
    ...(Platform.OS === 'web' 
      ? {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Reduced shadow
        }
      : {
          elevation: 3,
        }
    ),
  },
  dateHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  gameTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  odds: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  teamsContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  logoContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#ffffff',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.5s ease-in-out',
    }),
  },
  logoContainerHovered: {
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' 
      ? {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }
      : {
          elevation: 4,
        }
    ),
  },
  teamColorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    ...(Platform.OS === 'web' && {
      transition: 'opacity 0.5s ease-in-out',
    }),
  },
  teamLogo: {
    width: 48,
    height: 48,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#0f172a',
  },
  cityName: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  record: {
    fontSize: 14,
    color: '#94a3b8',
  },
  centerInfo: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  predictedScores: {
    marginBottom: 8,
    alignItems: 'center',
  },
  predictedLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  predictedScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  vsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 8,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  actualScores: {
    marginTop: 8,
    alignItems: 'center',
  },
  actualLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  finalScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});