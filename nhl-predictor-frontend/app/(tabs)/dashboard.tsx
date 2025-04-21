// Clean, spacious Dashboard.tsx with ice texture
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import GamesByDay from '../../components/GamesByDay';
import GameCard from '../../components/GameCard';
import PredictionModal from '../../components/PredictionModal';
import OffSeasonMessage from '../../components/OffSeasonMessage';
import DarkThemeLayout from '@/components/DarkThemeLayout';
import NHLApiService from '../../services/nhlApi';
import type { Game, UserPrediction } from '@/types/index';
import type { RootState } from '@/store';

interface RenderGameCardProps {
  item: Game;
  onSelect: (gameId: number) => void;
  selected: boolean;
  hasPrediction: boolean;
}

interface SeasonStatus {
  isOffSeason: boolean;
  message: string;
  nextSeasonInfo?: string;
}

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

export default function Dashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatus | null>(null);

  const predictions = useSelector((state: RootState) => 
    state.predictions?.predictions ?? []
  ) as UserPrediction[];

  useEffect(() => {
    checkSeasonStatus();
  }, []);

  const checkSeasonStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if it's off-season
      const status = await NHLApiService.getSeasonStatus();
      setSeasonStatus(status);
      
      // If not off-season, proceed to fetch games
      if (!status.isOffSeason) {
        await fetchGames();
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to check NHL season status. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const upcomingGames = await NHLApiService.getUpcomingGames();
      setGames(upcomingGames);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch games. Please try again later.';
      setError(errorMessage);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await checkSeasonStatus();
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
    <View style={styles.gameCardWrapper}>
      <GameCard
        game={item}
        onSelect={onSelect}
        selected={selected}
        hasPrediction={hasPrediction}
      />
    </View>
  );

  // Content to render inside DarkThemeLayout
  const content = (
    <>
      {/* Simple, clean header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>NHL Predictions</Text>
        
        {/* Simple stats row */}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            {games.length} Upcoming Games This Week
          </Text>
        </View>
      </View>
      
      {/* Subtle accent line */}
      <View style={styles.accentLine} />
      
      {/* Game list with more breathing room */}
      <View style={styles.gamesContainer}>
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
      </View>

      {selectedGame && (
        <PredictionModal
          visible={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          game={selectedGame}
        />
      )}
    </>
  );

  if (error) {
    return (
      <DarkThemeLayout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text 
            style={styles.tryAgainButton}
            onPress={checkSeasonStatus}
          >
            Try Again
          </Text>
        </View>
      </DarkThemeLayout>
    );
  }

  // Show off-season message when it's off-season
  if (seasonStatus?.isOffSeason) {
    return (
      <DarkThemeLayout>
        <OffSeasonMessage 
          message={seasonStatus.message}
          nextSeasonInfo={seasonStatus.nextSeasonInfo}
          onRefresh={handleRefresh}
        />
      </DarkThemeLayout>
    );
  }

  return (
    <DarkThemeLayout>
      {Platform.OS === 'web' ? (
        <IceTextureBackground>{content}</IceTextureBackground>
      ) : (
        content
      )}
    </DarkThemeLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
    zIndex: 1, // Ensure header is above ice texture
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  statsRow: {
    marginTop: 4,
    zIndex: 1,
  },
  statText: {
    fontSize: 15,
    color: '#94a3b8',
  },
  accentLine: {
    height: 1,
    backgroundColor: '#3b82f6',
    marginHorizontal: 20,
    opacity: 0.5,
    zIndex: 1,
  },
  gamesContainer: {
    flex: 1,
    paddingTop: 12,
    zIndex: 1,
  },
  gameCardWrapper: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  tryAgainButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});