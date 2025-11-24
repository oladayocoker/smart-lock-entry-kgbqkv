
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, continueAsGuest } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      router.replace('/(tabs)/(home)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    await continueAsGuest();
    router.replace('/(tabs)/(home)');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="lock.shield.fill"
          android_material_icon_name="security"
          size={80}
          color={colors.primary}
        />
        <Text style={styles.title}>Smart Lock Entry</Text>
        <Text style={commonStyles.textSecondary}>Secure your home with ease</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={commonStyles.input}
          placeholder="Username"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={commonStyles.input}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[commonStyles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={commonStyles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.button, styles.secondaryButton]}
          onPress={handleRegister}
        >
          <Text style={commonStyles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={[commonStyles.textSecondary, styles.dividerText]}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[commonStyles.button, styles.guestButton]}
          onPress={handleGuestMode}
        >
          <Text style={commonStyles.buttonText}>Continue as Guest</Text>
        </TouchableOpacity>

        <Text style={[commonStyles.textSecondary, styles.guestNote]}>
          Guest mode provides access to basic lock controls and live camera only
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    marginTop: 12,
  },
  guestButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  guestNote: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
  },
});
