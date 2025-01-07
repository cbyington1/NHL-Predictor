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

    const renderProbabilityBar = (probability: number) => (
        <View style={styles.probabilityBarContainer}>
            <View 
                style={[
                    styles.probabilityFill, 
                    { width: `${probability}%` },
                    probability > 60 ? styles.highProbability : 
                    probability > 40 ? styles.mediumProbability : 
                    styles.lowProbability
                ]} 
            />
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
        >
            <Pressable style={styles.overlay} onPress={onClose}>
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
                            <Text style={styles.title}>Win Probability</Text>
                            
                            <View style={styles.teamsContainer}>
                                <View style={styles.teamColumn}>
                                    <Text style={styles.teamName}>{game.homeTeam.name}</Text>
                                    <Text style={[
                                        styles.probability,
                                        prediction.homeTeamWinProbability > 60 ? styles.highProbabilityText :
                                        prediction.homeTeamWinProbability > 40 ? styles.mediumProbabilityText :
                                        styles.lowProbabilityText
                                    ]}>
                                        {prediction.homeTeamWinProbability.toFixed(1)}%
                                    </Text>
                                    {renderProbabilityBar(prediction.homeTeamWinProbability)}
                                </View>
                                
                                <View style={styles.vsContainer}>
                                    <Text style={styles.vsText}>VS</Text>
                                </View>
                                
                                <View style={styles.teamColumn}>
                                    <Text style={styles.teamName}>{game.awayTeam.name}</Text>
                                    <Text style={[
                                        styles.probability,
                                        prediction.awayTeamWinProbability > 60 ? styles.highProbabilityText :
                                        prediction.awayTeamWinProbability > 40 ? styles.mediumProbabilityText :
                                        styles.lowProbabilityText
                                    ]}>
                                        {prediction.awayTeamWinProbability.toFixed(1)}%
                                    </Text>
                                    {renderProbabilityBar(prediction.awayTeamWinProbability)}
                                </View>
                            </View>

                            <View style={styles.factorsContainer}>
                                <Text style={styles.factorsTitle}>Contributing Factors</Text>
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Offensive Rating:</Text>
                                    <Text style={styles.factorValue}>
                                        {prediction.factors.homeAdvantage.offense.toFixed(2)} vs {prediction.factors.awayAdvantage.offense.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Defensive Rating:</Text>
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
        marginBottom: 8,
    },
    probabilityBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    probabilityFill: {
        height: '100%',
        borderRadius: 4,
    },
    highProbability: {
        backgroundColor: '#22c55e',
    },
    mediumProbability: {
        backgroundColor: '#eab308',
    },
    lowProbability: {
        backgroundColor: '#ef4444',
    },
    highProbabilityText: {
        color: '#22c55e',
    },
    mediumProbabilityText: {
        color: '#eab308',
    },
    lowProbabilityText: {
        color: '#ef4444',
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