
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'camera',
      route: '/(tabs)/camera',
      icon: 'videocam',
      label: 'Camera',
    },
    {
      name: 'clips',
      route: '/(tabs)/clips',
      icon: 'video_library',
      label: 'Clips',
    },
    {
      name: 'activity',
      route: '/(tabs)/activity',
      icon: 'list',
      label: 'Activity',
    },
    {
      name: 'settings',
      route: '/(tabs)/settings',
      icon: 'settings',
      label: 'Settings',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="camera" name="camera" />
        <Stack.Screen key="clips" name="clips" />
        <Stack.Screen key="activity" name="activity" />
        <Stack.Screen key="settings" name="settings" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
