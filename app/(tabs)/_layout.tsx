import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';

// Define the allowed color scheme types based on your Colors object
type ColorSchemeType = keyof typeof Colors;

export default function TabLayout() {
  const colorScheme = useColorScheme() as ColorSchemeType;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Predictions',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="hockey-puck" size={28} style={{ marginBottom: -3 }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="chart-line" size={28} style={{ marginBottom: -3 }} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}