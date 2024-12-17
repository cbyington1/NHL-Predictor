import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import type { Game } from '@/types/index';

interface PredictionModalProps {
  visible: boolean;
  onClose: () => void;
  game: Game;
}

export default function PredictionModal({ visible, onClose, game }: PredictionModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
    >
      <Pressable 
        style={styles.overlay} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.constructionIcon}>🏗️</Text>
          </View>
          
          <Text style={styles.title}>Coming Soon!</Text>
          
          <Text style={styles.description}>
            We're building an advanced prediction system for {game.homeTeam.name} vs {game.awayTeam.name}.
          </Text>
          
          <Text style={styles.subDescription}>
            Soon you'll be able to see:
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• AI-powered game predictions</Text>
            <Text style={styles.featureItem}>• Team performance analytics</Text>
            <Text style={styles.featureItem}>• Historical matchup data</Text>
          </View>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  constructionIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  subDescription: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 12,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 8,
    paddingLeft: 8,
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});