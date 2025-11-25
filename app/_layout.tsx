
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { DeviceProvider } from '../src/contexts/DeviceContext';
import { DebugPanel } from '../src/components/DebugPanel';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
        </Stack>
        <DebugPanel />
      </DeviceProvider>
    </AuthProvider>
  );
}
