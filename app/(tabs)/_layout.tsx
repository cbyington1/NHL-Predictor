import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { View, StyleSheet, Platform } from 'react-native';

// Define the allowed color scheme types based on your Colors object
type ColorSchemeType = keyof typeof Colors;

export default function TabLayout() {
  const colorScheme = useColorScheme() as ColorSchemeType;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#60a5fa', // bright blue that matches theme
          tabBarInactiveTintColor: '#64748b', // slate-500 for more subtle inactive
          tabBarStyle: {
            backgroundColor: '#0f172a', // slate-900 to match cards
            borderTopWidth: 1,
            borderTopColor: '#1e293b', // slate-800
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            elevation: 0,
            shadowOpacity: 0,
            ...Platform.select({
              ios: {
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
              },
            }),
          },
          headerStyle: {
            backgroundColor: '#0f172a', // slate-900
            borderBottomWidth: 1,
            borderBottomColor: '#1e293b', // slate-800
            elevation: 0,
            shadowOpacity: 0,
            height: 45, // Significantly reduced from 70
            minHeight: 45, // Ensure it doesn't expand
          },
          headerTitleStyle: {
            color: '#f8fafc', // slate-50
            fontSize: 15,
            fontWeight: '500',
            marginTop: -5, // Pull the title up slightly
          },
          headerTintColor: '#f8fafc',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Predictions',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <FontAwesome5 
                  name="hockey-puck" 
                  size={22} 
                  color={color}
                  style={styles.icon}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <FontAwesome5 
                  name="chart-line" 
                  size={22} 
                  color={color}
                  style={styles.icon}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  iconContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -8,
  },
  icon: {
    marginBottom: -3,
  },
});