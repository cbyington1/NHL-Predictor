import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Platform } from 'react-native';
import type { Game, Team } from '../types/index';

interface GameCardProps {
  game: Game;
  onSelect: (gameId: number) => void;
  selected?: boolean;
  hasPrediction?: boolean;
}

// NHL team colors mapping
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

const getTeamColor = (teamName: string) => {
  const team = Object.keys(teamColors).find(key => teamName.includes(key));
  return team ? teamColors[team] : '#64748b';
};

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

export default function GameCard({ game, onSelect, selected, hasPrediction }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const gameDate = new Date(game.startTime);
  const displayDate = new Date(gameDate.getTime() + (Math.abs(new Date().getTimezoneOffset()) * 60000));
  const gameTime = displayDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const homeTeamColor = getTeamColor(game.homeTeam.name);
  const awayTeamColor = getTeamColor(game.awayTeam.name);

  const renderRecord = (record: Team['record']) => {
    return (
      <Text style={styles.record}>
        {record.wins}-{record.losses}-{record.otl}
      </Text>
    );
  };

  const renderTeamInfo = (team: Team, isHome: boolean) => {
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
          {hasPrediction && (
            <View style={[
              styles.predictionIndicator,
              { 
                backgroundColor: isHovered ? teamColor : '#22c55e',
                transform: [{ scale: isHovered ? 1.1 : 1 }],
                ...(Platform.OS === 'web' && {
                  transition: 'all 0.5s ease-in-out'
                })
              }
            ]} />
          )}
        </View>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.cityName}>{team.city}</Text>
        {renderRecord(team.record)}
      </View>
    );
  };

  return (
    <Pressable 
      style={[
        styles.card,
        selected && styles.selectedCard,
        Platform.OS === 'web' && {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        isHovered && Platform.OS === 'web' && styles.cardHovered
      ]}
      onPress={() => onSelect(game.id)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <View style={[
        styles.dateHeader,
        Platform.OS === 'web' && {
          background: createGradient('#f1f5f9', '#f1f5f9', 1.2),
          ...(isHovered || selected) && {
            background: createGradient(homeTeamColor, awayTeamColor, 0.6),
          },
          transition: 'background 0.3s ease-in-out'
        },
        Platform.OS !== 'web' && {
          backgroundColor: '#f1f5f9'
        }
      ]}>
        <Text style={[
          styles.time,
          (isHovered || selected) && { color: '#ffffff' }
        ]}>{gameTime}</Text>
        {game.odds && (
          <Text style={[
            styles.odds,
            (isHovered || selected) && { color: '#f1f5f9' }
          ]}>
            {game.odds.homeOdds > game.odds.awayOdds ? '+' : ''}{game.odds.homeOdds} / {game.odds.awayOdds > game.odds.homeOdds ? '+' : ''}{game.odds.awayOdds}
          </Text>
        )}
      </View>

      <View style={styles.teamsContainer}>
        {renderTeamInfo(game.homeTeam, true)}

        <View style={styles.centerInfo}>
          <View style={styles.vsContainer}>
            <Text style={[
              styles.vsText,
              Platform.OS === 'web' && {
                color: '#64748b',
                ...(isHovered || selected) && {
                  background: createGradient(homeTeamColor, awayTeamColor, 1),
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  opacity: 1
                },
                transition: 'all 0.5s ease-in-out'
              }
            ]}>VS</Text>
          </View>
          {game.status === 'live' && game.score && (
            <Text style={[
              styles.score,
              { color: homeTeamColor }
            ]}>
              {game.score.home} - {game.score.away}
            </Text>
          )}
        </View>

        {renderTeamInfo(game.awayTeam, false)}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    userSelect: 'none',
    ...(Platform.OS === 'web' 
      ? {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 2,
        }
    ),
  },
  cardHovered: {
    transform: [{translateY: -4}, {scale: 1.005}],
    borderColor: '#cbd5e1',
    ...(Platform.OS === 'web' 
      ? {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }
      : {
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        }
    ),
  },
  selectedCard: {
    borderWidth: 2,
    backgroundColor: '#f1f5f9',
  },
  dateHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
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
  predictionIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f8fafc',
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
  vsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  score: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
});