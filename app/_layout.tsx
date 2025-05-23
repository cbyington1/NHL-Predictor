import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from '@/store';
import { useColorScheme } from '@/components/useColorScheme';
import { Platform } from 'react-native';

// Initialize QueryClient
const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Add global scrollbar styling for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Create global scrollbar styles that will apply to all pages
      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        /* Global scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
          opacity: 0.5;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #60a5fa;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #1e293b;
        }
        
        /* Ensure scrollable containers maintain these styles */
        .scrollable-container {
          height: calc(100vh - 180px);
          overflow: auto !important;
          position: relative !important;
          display: block !important;
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #1e293b;
          padding-bottom: 60px;
        }
      `;
      document.head.appendChild(styleEl);

      // Cleanup on component unmount
      return () => {
        document.head.removeChild(styleEl);
      };
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}