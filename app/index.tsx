import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';

export default function Index() {
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [redirecting, setRedirecting] = useState(false);

  // For web, add debugging and force navigation
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Collect debug info
      const info = {
        pathname: window.location.pathname,
        href: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      
      setDebugInfo(JSON.stringify(info, null, 2));
      
      // Wait a moment to show debug info before redirecting
      setTimeout(() => {
        setRedirecting(true);
        try {
          // Try to navigate to dashboard
          window.location.replace('/(tabs)/dashboard');
        } catch (error) {
          // Handle the error with proper TypeScript typing
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setDebugInfo(prev => prev + '\n\nError redirecting: ' + errorMessage);
        }
      }, 5000); // Wait 5 seconds so we can see the debug info
    }
  }, []);

  // For web, show debug screen
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>NHL Predictor Debug</Text>
        <Text style={styles.info}>
          {redirecting ? 'Redirecting to dashboard...' : 'Collecting debug info...'}
        </Text>
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
        <Text style={styles.footer}>
          This screen will redirect to the dashboard in 5 seconds.
        </Text>
      </View>
    );
  }

  // For native platforms, use normal redirect
  return <Redirect href="/(tabs)/dashboard" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#60a5fa',
    marginBottom: 20,
  },
  debugBox: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    marginBottom: 20,
  },
  debugText: {
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  footer: {
    fontSize: 14,
    color: '#94a3b8',
  },
});