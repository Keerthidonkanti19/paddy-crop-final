import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { LanguageProvider } from "../context/LanguageContext";

const TOKEN_KEY = "khet_saathi_access_token";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        if (token) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth");
        }
      } catch (error) {
        console.log(
          "Authentication check failed:",
          error
        );

        router.replace("/auth");
      }
    };

    checkAuthentication();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider
        value={
          colorScheme === "dark"
            ? DarkTheme
            : DefaultTheme
        }
      >
        <Stack>
          <Stack.Screen
            name="auth"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="predict"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="result"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="assistant"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
            }}
          />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
  );
}