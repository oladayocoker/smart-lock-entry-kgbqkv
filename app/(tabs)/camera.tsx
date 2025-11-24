
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useDevice } from '../../src/contexts/DeviceContext';
import { LockApi } from '../../src/api/lockApi';
import { CameraStream } from '../../src/components/CameraStream';
import { colors, commonStyles } from '../../styles/commonStyles';

export default function CameraScreen() {
  const { user, isGuest, isLoading } = useAuth();
  const { settings, isConfigured } = useDevice();
  const api = settings.piBaseUrl ? new LockApi(settings.piBaseUrl) : null;

  if (isLoading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  if (!user && !isGuest) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <Text style={commonStyles.title}>Live Camera</Text>
      <Text style={commonStyles.textSecondary}>Real-time view from your Raspberry Pi</Text>

      <View style={styles.cameraContainer}>
        <CameraStream
          streamUrl={api?.getCameraStreamUrl() || ''}
          enabled={settings.cameraEnabled && isConfigured}
        />
      </View>

      {!isConfigured && (
        <View style={[commonStyles.card, styles.infoCard]}>
          <Text style={commonStyles.text}>
            Configure your Raspberry Pi URL in Settings to view the live camera stream
          </Text>
        </View>
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
  cameraContainer: {
    marginTop: 24,
  },
  infoCard: {
    marginTop: 24,
  },
});
