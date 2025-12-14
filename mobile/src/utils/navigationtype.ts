// navigation/types.ts
export type RootStackParamList = {
  Marketplace: undefined;
  ChatScreen: { sellerId: number; sellerName?: string };
  // other screens...
};