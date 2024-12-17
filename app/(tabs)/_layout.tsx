import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';

// Add this type definition
type ColorScheme = 'light' | 'dark';

export default function TabLayout() {
  // Cast the colorScheme to our defined type
  const colorScheme = useColorScheme() as ColorScheme;

  return (
    <Tabs
      screenOptions={{
        // Now TypeScript knows colorScheme is either 'light' or 'dark'
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Predictions',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="hockey-puck" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="chart-line" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={28} style={{ marginBottom: -3 }} {...props} />;
}