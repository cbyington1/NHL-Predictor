import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DarkThemeLayoutProps {
  children: React.ReactNode;
}

const DarkThemeLayout: React.FC<DarkThemeLayoutProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Tailwind slate-900
  },
});

export default DarkThemeLayout;