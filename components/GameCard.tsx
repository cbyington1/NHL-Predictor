import React from 'react';
import { View, Text, Pressable, Image, StyleSheet, Dimensions } from 'react-native';
import type { Game } from '../types/index';
import { formatDate } from '../utils/dateUtils';

interface GameCardProps {
  game: Game;
  onSelect: (gameId: number) => void;
  selected?: boolean;
  hasPrediction?: boolean;
}

export default function GameCard({ game, onSelect, selected }: GameCardProps) {
  // Format date and time separately for better display
  const gameDate = new Date(game.startTime);
  const formattedTime = gameDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Pressable 
      style={[
        styles.card,
        selected && styles.selectedCard
      ]}
      onPress={() => onSelect(game.id)}
    >
      {/* Date/Time Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>

      {/* Teams Container */}
      <View style={styles.teamsContainer}>
        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: game.homeTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.teamName}>{game.homeTeam.city}</Text>
          <Text style={styles.teamAbbrev}>{game.homeTeam.abbreviation}</Text>
          <Text style={styles.record}>
            {game.homeTeam.record.wins}-{game.homeTeam.record.losses}-{game.homeTeam.record.otl}
          </Text>
        </View>

        {/* Center Info */}
        <View style={styles.centerInfo}>
          <Text style={styles.vsText}>VS</Text>
          {game.status === 'live' && game.score && (
            <Text style={styles.score}>
              {game.score.home} - {game.score.away}
            </Text>
          )}
        </View>

        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: game.awayTeam.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.teamName}>{game.awayTeam.city}</Text>
          <Text style={styles.teamAbbrev}>{game.awayTeam.abbreviation}</Text>
          <Text style={styles.record}>
            {game.awayTeam.record.wins}-{game.awayTeam.record.losses}-{game.awayTeam.record.otl}
          </Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {game.status === 'pre' ? 'Upcoming' : game.status.toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
    width: 80,
    height: 80,
    backgroundColor: '#f8fafc',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 60,
    height: 60,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  teamAbbrev: {
    fontSize: 14,
    color: '#64748b',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statusBar: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
});