/// <reference types="nativewind/types" />
import { ViewProps, TextProps, TouchableOpacityProps } from 'react-native';
import { SafeAreaViewProps } from 'react-native-safe-area-context';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

declare module 'react-native-safe-area-context' {
  interface SafeAreaViewProps {
    className?: string;
  }
}