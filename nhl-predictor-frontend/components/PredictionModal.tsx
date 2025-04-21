// PredictionModal.tsx with CSS animations
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import type { Game } from '@/types/index';
import { usePrediction } from '../hooks/usePrediction';

interface PredictionModalProps {
    visible: boolean;
    onClose: () => void;
    game: Game;
}

export default function PredictionModal({ visible, onClose, game }: PredictionModalProps) {
    const { prediction, loading, error } = usePrediction(game);
    const [animateIn, setAnimateIn] = useState(false);
    const [showFactors, setShowFactors] = useState(false);
    const [homeBarWidth, setHomeBarWidth] = useState(0);
    const [awayBarWidth, setAwayBarWidth] = useState(0);
    
    // Trigger animations when prediction is loaded and modal is visible
    useEffect(() => {
        if (prediction && visible) {
            // Reset animation states
            setAnimateIn(false);
            setShowFactors(false);
            setHomeBarWidth(0);
            setAwayBarWidth(0);
            
            // Trigger animations in sequence
            setTimeout(() => setAnimateIn(true), 10);
            
            // Animate probability bars after a slight delay
            setTimeout(() => {
                setHomeBarWidth(prediction.homeTeamWinProbability);
                setAwayBarWidth(prediction.awayTeamWinProbability);
            }, 300);
            
            // Fade in factors after bars animate
            setTimeout(() => {
                setShowFactors(true);
            }, 700);
        }
    }, [prediction, visible]);

    const renderProbabilityBar = (probability: number, width: number) => (
        <View style={styles.probabilityBarContainer}>
            <View 
                style={[
                    styles.probabilityFill, 
                    { width: `${width}%`, transition: 'width 0.8s ease-out' },
                    probability > 60 ? styles.highProbability : 
                    probability > 40 ? styles.mediumProbability : 
                    styles.lowProbability
                ]} 
            />
        </View>
    );

    // Function to get advantage description
    const getAdvantageDescription = (homeValue: number, awayValue: number) => {
        // Normalize the values
        const normalizedHome = Math.min(homeValue, 15);
        const normalizedAway = Math.min(awayValue, 15);
        
        // Calculate percent difference
        const minValue = Math.max(Math.min(normalizedHome, normalizedAway), 0.1);
        const maxValue = Math.max(normalizedHome, normalizedAway);
        const percentDiff = ((maxValue - minValue) / minValue) * 100;
        
        // Determine which team has the advantage
        const homeAdvantage = normalizedHome > normalizedAway;
        const teamWithAdvantage = homeAdvantage ? game.homeTeam.name : game.awayTeam.name;
        
        // Convert to descriptive text
        if (percentDiff < 10) {
            return "Evenly matched";
        } else if (percentDiff < 25) {
            return `Slight advantage to ${teamWithAdvantage}`;
        } else if (percentDiff < 50) {
            return `Advantage to ${teamWithAdvantage}`;
        } else if (percentDiff < 100) {
            return `Strong advantage to ${teamWithAdvantage}`;
        } else {
            return `Dominant advantage to ${teamWithAdvantage}`;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                {/* Initial loading indicator that shows immediately on background blur */}
                {!animateIn && (
                    <View style={styles.initialLoadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                )}
                <View 
                    style={[
                        styles.modalContent,
                        {
                            opacity: animateIn ? 1 : 0,
                            transform: [{ scale: animateIn ? 1 : 0.9 }],
                            ...(Platform.OS === 'web' && {
                                transition: 'opacity 0.3s ease, transform 0.3s ease',
                            })
                        }
                    ]}
                >
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
                                    {renderProbabilityBar(prediction.homeTeamWinProbability, homeBarWidth)}
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
                                        prediction.awayTeamWinProbability > 40 ? styles.mediumProbabilityText :
                                        styles.lowProbabilityText
                                    ]}>
                                        {prediction.awayTeamWinProbability.toFixed(1)}%
                                    </Text>
                                    {renderProbabilityBar(prediction.awayTeamWinProbability, awayBarWidth)}
                                </View>
                            </View>

                            <View 
                                style={[
                                    styles.factorsContainer,
                                    { 
                                        opacity: showFactors ? 1 : 0,
                                        transform: [{ translateY: showFactors ? 0 : 20 }],
                                        ...(Platform.OS === 'web' && {
                                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                                        })
                                    }
                                ]}
                            >
                                <Text style={styles.factorsTitle}>Team Advantages</Text>
                                
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Offense:</Text>
                                    <Text style={styles.factorValue}>
                                        {getAdvantageDescription(
                                            prediction.factors.homeAdvantage.offense,
                                            prediction.factors.awayAdvantage.offense
                                        )}
                                    </Text>
                                </View>
                                
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Defense:</Text>
                                    <Text style={styles.factorValue}>
                                        {getAdvantageDescription(
                                            prediction.factors.homeAdvantage.defense,
                                            prediction.factors.awayAdvantage.defense
                                        )}
                                    </Text>
                                </View>
                                
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Special Teams:</Text>
                                    <Text style={styles.factorValue}>
                                        {getAdvantageDescription(
                                            prediction.factors.homeAdvantage.special,
                                            prediction.factors.awayAdvantage.special
                                        )}
                                    </Text>
                                </View>
                                
                                <View style={styles.factorRow}>
                                    <Text style={styles.factorLabel}>Home Ice:</Text>
                                    <Text style={styles.factorValue}>Advantage to {game.homeTeam.name}</Text>
                                </View>
                            </View>

                            <Pressable 
                                style={[
                                    styles.closeButton,
                                    {
                                        opacity: showFactors ? 1 : 0.5,
                                        transform: [{ translateY: showFactors ? 0 : 10 }],
                                        ...(Platform.OS === 'web' && {
                                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                                            transitionDelay: '100ms'
                                        })
                                    }
                                ]} 
                                onPress={onClose}
                            >
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
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
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
    initialLoadingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});