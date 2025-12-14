// src/utils/stepStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const STEP_KEY = "@verification_step";

export const saveStep = async (step: string) => {
  await AsyncStorage.setItem(STEP_KEY, String(step));
};

export const loadStep = async (): Promise<string> => {
  const step = await AsyncStorage.getItem(STEP_KEY);
  return step ?? " OnboardingHubScreen";
};

export const resetStep = async () => {
  await AsyncStorage.removeItem(STEP_KEY);
};
