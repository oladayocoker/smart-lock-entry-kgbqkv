
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { IconSymbol } from '../../components/IconSymbol';

interface LockControlProps {
  isLocked: boolean;
  onToggle: (newState: boolean) => Promise<void>;
  disabled?: boolean;
}

export const LockControl: React.FC<LockControlProps> = ({ isLocked, onToggle, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggle(!isLocked);
    } catch (error) {
      console.log('Error toggling lock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusCard, isLocked ? styles.lockedCard : styles.unlockedCard]}>
        <IconSymbol
          ios_icon_name={isLocked ? 'lock.fill' : 'lock.open.fill'}
          android_material_icon_name={isLocked ? 'lock' : 'lock_open'}
          size={64}
          color={colors.text}
        />
        <Text style={styles.statusText}>
          {isLocked ? 'LOCKED' : 'UNLOCKED'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isLocked ? styles.unlockButton : styles.lockButton,
          (disabled || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleToggle}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <IconSymbol
              ios_icon_name={isLocked ? 'lock.open' : 'lock'}
              android_material_icon_name={isLocked ? 'lock_open' : 'lock'}
              size={24}
              color={colors.text}
            />
            <Text style={styles.buttonText}>
              {isLocked ? 'UNLOCK' : 'LOCK'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  statusCard: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
    elevation: 8,
  },
  lockedCard: {
    backgroundColor: colors.error,
  },
  unlockedCard: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  lockButton: {
    backgroundColor: colors.error,
  },
  unlockButton: {
    backgroundColor: colors.success,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
});
