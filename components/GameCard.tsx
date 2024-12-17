import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Platform } from 'react-native';
import type { Game } from '../types/index';

interface GameCardProps {
  game: Game;
  onSelect: (gameId: number) => void;
  selected?: boolean;
  hasPrediction?: boolean;
}

export default function GameCard({ game, onSelect, selected }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const gameDate = new Date(game.startTime);
  const formattedTime = gameDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const renderRecord = (record: { wins: number; losses: number; otl: number }) => {
    return (
      <Text style={styles.record}>
        {record.wins}-{record.losses}-{record.otl}
      </Text>
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
        isHovered && Platform.OS === 'web' && {
          transform: [{translateY: -8}, {scale: 1.02}],
          backgroundColor: '#f8fafc',
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          zIndex: 1,
        }
      ]}
      onPress={() => onSelect(game.id)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <View style={styles.dateHeader}>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.teamSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: game.homeTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.teamName}>{game.homeTeam.name}</Text>
          {renderRecord(game.homeTeam.record)}
        </View>

        <View style={styles.centerInfo}>
          <Text style={styles.vsText}>VS</Text>
          {game.status === 'live' && game.score && (
            <Text style={styles.score}>
              {game.score.home} - {game.score.away}
            </Text>
          )}
        </View>

        <View style={styles.teamSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: game.awayTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.teamName}>{game.awayTeam.name}</Text>
          {renderRecord(game.awayTeam.record)}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    ...(Platform.OS === 'web' 
      ? {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }
    ),
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  dateHeader: {
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    color: '#64748b',
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
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#f8fafc',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 35,
    height: 35,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  score: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
});