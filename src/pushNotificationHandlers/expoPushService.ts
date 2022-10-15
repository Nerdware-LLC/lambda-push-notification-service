import { Expo } from "expo-server-sdk";

export const expoPushService = new Expo({
  accessToken: process.env.EXPO_PUSH_ACCESS_TOKEN
});
