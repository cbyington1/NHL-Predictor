// react-native.d.ts
declare module 'react-native' {
  export const Modal: any;
  export const View: any;
  export const Text: any;
  export const Pressable: any;
  export const StyleSheet: any;
  export const Image: any;
  export const FlatList: any;
  export const ScrollView: any;
  export const ActivityIndicator: any;
  export const Platform: any;
  export const Dimensions: any;
  export const RefreshControl: any; 
  export const LayoutChangeEvent: any; 


  // Add these new type definitions
  export interface NativeSyntheticEvent<T> {
    nativeEvent: T;
  }

  export interface ImageErrorEventData {
    error: string;
  }
}