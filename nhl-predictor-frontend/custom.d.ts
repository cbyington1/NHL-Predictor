// custom.d.ts
declare module 'react-native' {
    import type { ComponentProps } from 'react';
    import type { Pressable as RNPressable } from 'react-native';
  
    export interface PressableProps extends ComponentProps<typeof RNPressable> {
      children: React.ReactNode;
    }
  }