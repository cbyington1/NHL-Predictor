import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Stats() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-2xl font-bold text-blue-900 mb-4">
          NHL Stats
        </Text>
        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-lg font-semibold text-gray-800">
            Team Statistics
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}