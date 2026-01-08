import { Tabs } from "expo-router";
import { Heart, CheckSquare, Users, Wallet, UtensilsCrossed } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Acasă",
          tabBarIcon: ({ color }) => <Heart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Sarcini",
          tabBarIcon: ({ color }) => <CheckSquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="guests"
        options={{
          title: "Invitați",
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Buget",
          tabBarIcon: ({ color }) => <Wallet color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="event"
        options={{
          title: "Eveniment",
          tabBarIcon: ({ color }) => <UtensilsCrossed color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
