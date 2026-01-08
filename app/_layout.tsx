// template
import { WeddingProvider } from "@/context/WeddingContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <WeddingProvider>
      <Stack screenOptions={{ headerBackTitle: "Înapoi" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="statistics" options={{ headerShown: false }} />
        <Stack.Screen name="statistics-detail" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </WeddingProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
