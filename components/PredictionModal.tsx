// components/PredictionModal.tsx
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import type { Game } from '@/types/index';
import { usePrediction } from '../hooks/usePrediction';

interface PredictionModalProps {
    visible: boolean;
    onClose: () => void;
    game: Game;
}

export default function PredictionModal({ visible, onClose, game }: PredictionModalProps) {
    const { prediction, loading, error } = usePrediction(game);

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
                    {loading ? (
                        <ActivityIndicator size="large" color="#3b82f6" />
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <Pressable style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </Pressable>
                        </View>
                    ) : prediction ? (
                        <>
                            <Text style={styles.title}>Game Prediction</Text>
                            
                            <View style={styles.teamsContainer}>
                                <View style={styles.teamColumn}>
                                    <Text style={styles.teamName}>{game.homeTeam.name}</Text>
                                    <Text style={styles.probability}>
                                        {prediction.homeTeamWinProbability.toFixed(1)}%
                                    </Text>
                                    <Text style={styles.predictedScore}>
                                        Predicted: {prediction.predictedScore.home.toFixed(1)}
                                    </Text>
                                </View>
                                
                                <View style={styles.vsContainer}>
                                    <Text style={styles.vsText}>VS</Text>
                                </View>
                                
                                <View style={styles.teamColumn}>
                                    <Text style={styles.teamName}>{game.awayTeam.name}</Text>
                                    <Text style={styles.probability}>
                                        {prediction.awayTeamWinProbability.toFixed(1)}%
                                    </Text>
                                    <Text style={styles.predictedScore}>
                                        Predicted: {prediction.predictedScore.away.toFixed(1)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.factorsContainer}>
                                <Text style={styles.factorsTitle}>Key Factors</Text>
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Offense:</Text>
                                    <Text style={styles.factorValue}>
                                        {prediction.factors.homeAdvantage.offense.toFixed(2)} vs {prediction.factors.awayAdvantage.offense.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Defense:</Text>
                                    <Text style={styles.factorValue}>
                                        {prediction.factors.homeAdvantage.defense.toFixed(2)} vs {prediction.factors.awayAdvantage.defense.toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            <Pressable style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </Pressable>
                        </>
                    ) : null}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 24,
    },
    teamsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
    },
    teamColumn: {
        flex: 1,
        alignItems: 'center',
    },
    teamName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    probability: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginBottom: 8,
    },
    predictedScore: {
        fontSize: 16,
        color: '#64748b',
    },
    vsContainer: {
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    vsText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '600',
    },
    factorsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    factorsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    factorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    factorLabel: {
        fontSize: 16,
        color: '#64748b',
    },
    factorValue: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
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
    errorContainer: {
        alignItems: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
});