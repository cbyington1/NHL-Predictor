// components/OffSeasonMessage.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Calendar, RefreshCw } from 'lucide-react-native';

interface OffSeasonMessageProps {
  message: string;
  nextSeasonInfo?: string;
  onRefresh: () => void;
}

const OffSeasonMessage: React.FC<OffSeasonMessageProps> = ({ 
  message, 
  nextSeasonInfo, 
  onRefresh 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Calendar size={64} color="#60a5fa" />
      </View>
      
      <Text style={styles.title}>NHL Off-Season</Text>
      <Text style={styles.message}>{message}</Text>
      
      {nextSeasonInfo && (
        <Text style={styles.nextSeasonInfo}>{nextSeasonInfo}</Text>
      )}
      
      <Pressable 
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <View style={styles.refreshIcon}>
          <RefreshCw size={16} color="#ffffff" />
        </View>
        <Text style={styles.refreshText}>Check Again</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f172a'
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 12,
    textAlign: 'center'
  },
  nextSeasonInfo: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 24,
    textAlign: 'center'
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    })
  },
  refreshIcon: {
    marginRight: 8
  },
  refreshText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default OffSeasonMessage;