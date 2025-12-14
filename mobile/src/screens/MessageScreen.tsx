import React from "react";
import { View, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";


type Props = Partial<NativeStackScreenProps<RootStackParamList, "MessageScreen">>;

export default function MessageScreen({ route }: Props) {
  const { userId, userName } = route?.params || {};

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Chat with {userName}</Text>
      <Text>User ID: {userId}</Text>
      {/* Render your chat messages here */}
    </View>
  );
}
