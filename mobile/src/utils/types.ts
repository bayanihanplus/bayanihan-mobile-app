// src/types.ts
export interface WSMessage {
  type: string;
  message?: string;
  from?: string;
  [key: string]: any;
}
declare module 'react-native-vector-icons/MaterialIcons';