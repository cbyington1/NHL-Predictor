import { Redirect } from 'expo-router';

export default function Index() {
  // This will redirect to your dashboard tab
  return <Redirect href="/(tabs)/dashboard" />;
}