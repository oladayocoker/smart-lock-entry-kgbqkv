
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';

interface CameraStreamProps {
  streamUrl: string;
  enabled?: boolean;
}

export const CameraStream: React.FC<CameraStreamProps> = ({ streamUrl, enabled = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!enabled) {
    return (
      <View style={[styles.container, styles.disabledContainer]}>
        <Text style={commonStyles.textSecondary}>Camera disabled</Text>
      </View>
    );
  }

  if (!streamUrl) {
    return (
      <View style={[styles.container, styles.disabledContainer]}>
        <Text style={commonStyles.textSecondary}>No camera stream available</Text>
        <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
          Configure your Raspberry Pi URL in Settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
            Loading camera stream...
          </Text>
        </View>
      )}
      
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={commonStyles.textSecondary}>Failed to load camera stream</Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
            Check your Raspberry Pi connection
          </Text>
        </View>
      )}

      <Image
        source={{ uri: streamUrl }}
        style={styles.stream}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  disabledContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stream: {
    width: '100%',
    height: '100%',
  },
});
