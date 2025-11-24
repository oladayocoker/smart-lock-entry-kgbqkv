
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useDevice } from '../../src/contexts/DeviceContext';
import { LockApi } from '../../src/api/lockApi';
import { MotionClip } from '../../src/types';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

export default function ClipsScreen() {
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const { settings, isConfigured } = useDevice();
  const [clips, setClips] = useState<MotionClip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const api = settings.piBaseUrl ? new LockApi(settings.piBaseUrl) : null;

  useEffect(() => {
    if (api && isConfigured && user) {
      fetchClips();
    }
  }, [api, isConfigured, user]);

  const fetchClips = async () => {
    if (!api) return;
    
    setIsLoading(true);
    try {
      const fetchedClips = await api.getMotionClips();
      setClips(fetchedClips);
    } catch (error) {
      console.log('Error fetching clips:', error);
      Alert.alert('Error', 'Failed to load motion clips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClips();
    setIsRefreshing(false);
  };

  if (authLoading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  if (!user && !isGuest) {
    return <Redirect href="/auth/login" />;
  }

  if (isGuest) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <IconSymbol
          ios_icon_name="lock.fill"
          android_material_icon_name="lock"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={[commonStyles.title, { marginTop: 16 }]}>Login Required</Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
          Motion clips are only available for logged-in users
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={commonStyles.title}>Motion Clips</Text>
      <Text style={commonStyles.textSecondary}>Recorded motion detection events</Text>

      {!isConfigured && (
        <View style={[commonStyles.card, styles.warningCard]}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={32}
            color={colors.warning}
          />
          <Text style={[commonStyles.text, { marginTop: 8 }]}>
            Configure your Raspberry Pi URL in Settings
          </Text>
        </View>
      )}

      {isLoading && clips.length === 0 ? (
        <View style={[commonStyles.card, commonStyles.center]}>
          <Text style={commonStyles.textSecondary}>Loading clips...</Text>
        </View>
      ) : clips.length === 0 ? (
        <View style={[commonStyles.card, commonStyles.center]}>
          <IconSymbol
            ios_icon_name="video.slash"
            android_material_icon_name="videocam_off"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[commonStyles.textSecondary, { marginTop: 16 }]}>No motion clips available</Text>
        </View>
      ) : (
        <View style={styles.clipsList}>
          {clips.map((clip, index) => (
            <TouchableOpacity key={index} style={commonStyles.card}>
              <View style={styles.clipHeader}>
                <IconSymbol
                  ios_icon_name="video.fill"
                  android_material_icon_name="videocam"
                  size={24}
                  color={colors.primary}
                />
                <Text style={commonStyles.text}>{clip.filename}</Text>
              </View>
              <View style={styles.clipDetails}>
                <Text style={commonStyles.textSecondary}>
                  {new Date(clip.timestamp).toLocaleString()}
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Duration: {clip.duration}s
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
  warningCard: {
    alignItems: 'center',
    marginTop: 24,
  },
  clipsList: {
    marginTop: 24,
  },
  clipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  clipDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
