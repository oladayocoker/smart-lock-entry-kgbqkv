
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useDevice } from '../../src/contexts/DeviceContext';
import { LockApi } from '../../src/api/lockApi';
import { ActivityLog } from '../../src/types';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

export default function ActivityScreen() {
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const { settings, isConfigured } = useDevice();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const api = settings.piBaseUrl ? new LockApi(settings.piBaseUrl) : null;

  useEffect(() => {
    if (api && isConfigured && user) {
      fetchActivities();
    }
  }, [api, isConfigured, user]);

  const fetchActivities = async () => {
    if (!api) return;
    
    setIsLoading(true);
    try {
      const fetchedActivities = await api.getActivityLogs();
      setActivities(fetchedActivities);
    } catch (error) {
      console.log('Error fetching activities:', error);
      Alert.alert('Error', 'Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActivities();
    setIsRefreshing(false);
  };

  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes('lock')) {
      return { ios: 'lock.fill', android: 'lock' };
    } else if (action.toLowerCase().includes('unlock')) {
      return { ios: 'lock.open.fill', android: 'lock_open' };
    } else if (action.toLowerCase().includes('motion')) {
      return { ios: 'video.fill', android: 'videocam' };
    }
    return { ios: 'info.circle.fill', android: 'info' };
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
          Activity logs are only available for logged-in users
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
      <Text style={commonStyles.title}>Activity Feed</Text>
      <Text style={commonStyles.textSecondary}>Recent lock and system events</Text>

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

      {isLoading && activities.length === 0 ? (
        <View style={[commonStyles.card, commonStyles.center]}>
          <Text style={commonStyles.textSecondary}>Loading activities...</Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={[commonStyles.card, commonStyles.center]}>
          <IconSymbol
            ios_icon_name="list.bullet"
            android_material_icon_name="list"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[commonStyles.textSecondary, { marginTop: 16 }]}>No activity logs available</Text>
        </View>
      ) : (
        <View style={styles.activityList}>
          {activities.map((activity, index) => {
            const icon = getActivityIcon(activity.action);
            return (
              <View key={index} style={commonStyles.card}>
                <View style={styles.activityHeader}>
                  <IconSymbol
                    ios_icon_name={icon.ios}
                    android_material_icon_name={icon.android}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.activityContent}>
                    <Text style={commonStyles.text}>{activity.action}</Text>
                    {activity.user && (
                      <Text style={commonStyles.textSecondary}>by {activity.user}</Text>
                    )}
                  </View>
                </View>
                <Text style={[commonStyles.textSecondary, styles.timestamp]}>
                  {new Date(activity.timestamp).toLocaleString()}
                </Text>
                {activity.details && (
                  <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
                    {activity.details}
                  </Text>
                )}
              </View>
            );
          })}
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
  activityList: {
    marginTop: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  activityContent: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
});
