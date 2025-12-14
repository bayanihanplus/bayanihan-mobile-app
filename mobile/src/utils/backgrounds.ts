import { ImageSourcePropType } from "react-native";

export const backgrounds: ImageSourcePropType[] = [
  require("../../assets/homescreen.jpg"),
  require("../../assets/homescreen1.jpg"),
  require("../../assets/homescreen3.jpg"),
];

// Utility to pick a random background
export const getRandomBackground = (): ImageSourcePropType => {
  const index = Math.floor(Math.random() * backgrounds.length);
  return backgrounds[index];
};