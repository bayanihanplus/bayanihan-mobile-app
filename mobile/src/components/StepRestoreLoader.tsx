import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from "axios";
import { API_BASE_URL } from "../api/api";
import { jwtDecode } from "jwt-decode";
import { ActivityIndicator, View,StyleSheet } from "react-native";

type RootStackParamList = {

  OnboardingHub : undefined;
  IdentityVerification : undefined;
  Verification : undefined;
  Orientation : undefined;
  Application : undefined;
  FinalReview : undefined;
  ApplicationReviewPending : undefined;
  Approval : undefined;
  CoopPreDashboard : undefined;
  CoopDashboard : undefined;
  Social : undefined;
  
};

export default function StepRestoreLoader() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    const restoreStep = async () => {
      try {

        const token = await AsyncStorage.getItem("token");

          if(!token){
            console.log("No token found!");
            return;
          }
          const decoded: any = jwtDecode(token);
          const { data } = await axios.get(`${API_BASE_URL}/items/get-final-status/${decoded.id}`)
          
          if(data.progress === "AllStepsDone" && data.completed === true){
            console.log("User already completed → redirect to CoopPreDashboard");
            
              navigation.reset({
                index: 0,
                routes : [{
                  name : "CoopPreDashboard" as never,
                  params : { progressData: data } as never, 
                }],
              });
              return;  
          }

        const stepName = (await AsyncStorage.getItem("@verification_step")) || "OnboardingHub";
        console.log(`[STEP RESTORE] Restoring to Step ${stepName}`);

        // Reset the stack to the saved step
        navigation.reset({
          index: 0,
          routes: [{ name: stepName as never }],
        });

        // Show welcome back toast only if returning
        if (stepName !== "OnboardingHub") {
          Toast.show({
            type: "success",
            text1: "Welcome back! 👋",
            text2: `Resuming from ${stepName}`,
            position: "top",
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        console.warn("[STEP RESTORE] Failed:", error);
      }
    };

    restoreStep();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
