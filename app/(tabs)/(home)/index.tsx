
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useDevice } from '../../../src/contexts/DeviceContext';
import { useWebSocket } from '../../../src/hooks/useWebSocket';
import { LockApi } from '../../../src/api/lockApi';
import { LockControl } from '../../../src/components/LockControl';
import { CameraStream } from '../../../src/components/CameraStream';
import { colors, commonStyles } from '../../../styles/commonStyles';
import { IconSymbol } from '../../../components/IconSymbol';

export default function HomeScreen() {
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const { settings, isConfigured } = useDevice();
  const [lockState, setLockState] = useState({ isLocked: true, timestamp: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [api, setApi] = useState<LockApi | null>(null);

  const { isConnected, lockState: wsLockState } = useWebSocket({
    url: settings.piBaseUrl,
    enabled: isConfigured,
    onLockStateChange: (state) => {
      console.log('Lock state changed via WebSocket:', state);
      setLockState(state);
    },
  });

  useEffect(() => {
    if (settings.piBaseUrl) {
      setApi(new LockApi(settings.piBaseUrl));
    }
  }, [settings.piBaseUrl]);

  useEffect(() => {
    if (wsLockState) {
      setLockState(wsLockState);
    }
  }, [wsLockState]);

  useEffect(() => {
    if (api && isConfigured) {
      fetchLockState();
    }
  }, [api, isConfigured]);

  const fetchLockState = async () => {
    if (!api) return;
    
    try {
      const state = await api.getLockState();
      setLockState(state);
    } catch (error) {
      console.log('Error fetching lock state:', error);
    }
  };

  const handleToggleLock = async (newState: boolean) => {
    if (!api) {
      Alert.alert('Error', 'Please configure your Raspberry Pi URL in Settings');
      return;
    }

    try {
      await api.setLockState(newState);
      setLockState({ isLocked: newState, timestamp: new Date().toISOString() });
    } catch (error) {
      Alert.alert('Error', 'Failed to change lock state');
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLockState();
    setIsRefreshing(false);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!user && !isGuest) {
    console.log('HomeScreen: User not authenticated, redirecting to login...');
    console.log('HomeScreen: user =', user, ', isGuest =', isGuest);
    return <Redirect href="/auth/login" />;
  }

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={commonStyles.title}>Smart Lock Entry</Text>
        {isGuest && (
          <View style={styles.guestBadge}>
            <Text style={styles.guestText}>Guest Mode</Text>
          </View>
        )}
        {user && (
          <Text style={commonStyles.textSecondary}>Welcome, {user.username}!</Text>
        )}
      </View>

      {!isConfigured && (
        <View style={[commonStyles.card, styles.warningCard]}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={32}
            color={colors.warning}
          />
          <Text style={[commonStyles.text, { marginTop: 8 }]}>
            Please configure your Raspberry Pi URL in Settings
          </Text>
        </View>
      )}

      <View style={styles.connectionStatus}>
        <View style={[styles.statusDot, isConnected ? styles.connectedDot : styles.disconnectedDot]} />
        <Text style={commonStyles.textSecondary}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      <LockControl
        isLocked={lockState.isLocked}
        onToggle={handleToggleLock}
        disabled={!isConfigured}
      />

      <View style={styles.cameraSection}>
        <Text style={commonStyles.subtitle}>Live Camera</Text>
        <CameraStream
          streamUrl={api?.getCameraStreamUrl() || ''}
          enabled={settings.cameraEnabled && isConfigured}
        />
      </View>

      {lockState.timestamp && (
        <Text style={[commonStyles.textSecondary, styles.timestamp]}>
          Last updated: {new Date(lockState.timestamp).toLocaleString()}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  guestBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  guestText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connectedDot: {
    backgroundColor: colors.success,
  },
  disconnectedDot: {
    backgroundColor: colors.error,
  },
  cameraSection: {
    marginTop: 32,
  },
  timestamp: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
  },
});
