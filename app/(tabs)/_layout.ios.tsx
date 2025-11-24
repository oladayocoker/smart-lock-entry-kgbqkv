
import React from 'react';
import { Tabs } from 'expo-router/unstable-native-tabs';
import { colors } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol ios_icon_name="house.fill" android_material_icon_name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => (
            <IconSymbol ios_icon_name="video.fill" android_material_icon_name="videocam" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clips"
        options={{
          title: 'Clips',
          tabBarIcon: ({ color }) => (
            <IconSymbol ios_icon_name="film.fill" android_material_icon_name="video_library" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <IconSymbol ios_icon_name="list.bullet" android_material_icon_name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <IconSymbol ios_icon_name="gearshape.fill" android_material_icon_name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
