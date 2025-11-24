
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceSettings } from '../types';

interface DeviceContextType {
  settings: DeviceSettings;
  updateSettings: (settings: Partial<DeviceSettings>) => Promise<void>;
  isConfigured: boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const DEFAULT_SETTINGS: DeviceSettings = {
  piBaseUrl: '',
  cameraEnabled: true,
  motionDetectionEnabled: true,
};

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<DeviceSettings>(DEFAULT_SETTINGS);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('deviceSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        setIsConfigured(!!parsed.piBaseUrl);
      }
    } catch (error) {
      console.log('Error loading device settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<DeviceSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      setIsConfigured(!!updated.piBaseUrl);
      await AsyncStorage.setItem('deviceSettings', JSON.stringify(updated));
    } catch (error) {
      console.log('Error updating device settings:', error);
      throw error;
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        settings,
        updateSettings,
        isConfigured,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
