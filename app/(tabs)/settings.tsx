
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useDevice } from '../../src/contexts/DeviceContext';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

export default function SettingsScreen() {
  const { user, isGuest, logout } = useAuth();
  const { settings, updateSettings } = useDevice();
  const [piBaseUrl, setPiBaseUrl] = useState(settings.piBaseUrl);
  const [cameraEnabled, setCameraEnabled] = useState(settings.cameraEnabled);
  const [motionDetectionEnabled, setMotionDetectionEnabled] = useState(settings.motionDetectionEnabled);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (!piBaseUrl) {
      Alert.alert('Error', 'Please enter a Raspberry Pi URL');
      return;
    }

    // Validate URL format
    if (!piBaseUrl.startsWith('http://') && !piBaseUrl.startsWith('https://')) {
      Alert.alert('Error', 'URL must start with http:// or https://');
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings({
        piBaseUrl,
        cameraEnabled,
        motionDetectionEnabled,
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <Text style={commonStyles.title}>Settings</Text>

      {user && (
        <View style={[commonStyles.card, styles.userCard]}>
          <IconSymbol
            ios_icon_name="person.circle.fill"
            android_material_icon_name="account_circle"
            size={48}
            color={colors.primary}
          />
          <View style={styles.userInfo}>
            <Text style={commonStyles.text}>{user.username}</Text>
            <Text style={commonStyles.textSecondary}>{user.email}</Text>
          </View>
        </View>
      )}

      {isGuest && (
        <View style={[commonStyles.card, styles.guestCard]}>
          <IconSymbol
            ios_icon_name="person.fill.questionmark"
            android_material_icon_name="person"
            size={32}
            color={colors.textSecondary}
          />
          <Text style={[commonStyles.text, { marginTop: 8 }]}>Guest Mode</Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 4, textAlign: 'center' }]}>
            Login to access all features
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={commonStyles.subtitle}>Device Configuration</Text>
        
        <Text style={[commonStyles.text, styles.label]}>Raspberry Pi URL</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="http://192.168.1.100:8000"
          placeholderTextColor={colors.textSecondary}
          value={piBaseUrl}
          onChangeText={setPiBaseUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={commonStyles.text}>Camera Enabled</Text>
            <Text style={commonStyles.textSecondary}>Enable live camera streaming</Text>
          </View>
          <Switch
            value={cameraEnabled}
            onValueChange={setCameraEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={commonStyles.text}>Motion Detection</Text>
            <Text style={commonStyles.textSecondary}>Record motion events</Text>
          </View>
          <Switch
            value={motionDetectionEnabled}
            onValueChange={setMotionDetectionEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        <TouchableOpacity
          style={[commonStyles.button, isSaving && styles.buttonDisabled]}
          onPress={handleSaveSettings}
          disabled={isSaving}
        >
          <Text style={commonStyles.buttonText}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={commonStyles.subtitle}>About</Text>
        <View style={commonStyles.card}>
          <Text style={commonStyles.text}>Smart Lock Entry System</Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>Version 1.0.0</Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
            A complete smart lock solution with real-time monitoring, motion detection, and remote control.
          </Text>
        </View>
      </View>

      {(user || isGuest) && (
        <TouchableOpacity
          style={[commonStyles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <IconSymbol
            ios_icon_name="arrow.right.square.fill"
            android_material_icon_name="logout"
            size={20}
            color={colors.text}
          />
          <Text style={commonStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  userInfo: {
    flex: 1,
  },
  guestCard: {
    alignItems: 'center',
    marginTop: 16,
  },
  section: {
    marginTop: 32,
  },
  label: {
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  logoutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
});
