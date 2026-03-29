import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../config';

/**
 * MapComponent - Web version
 * Simplified location display since maps aren't available on web
 */
const MapComponent = ({
  userLocation,
  routeMarkers = [],
  riskLevel = 'safe',
  onMapReady = () => {},
  autoCenter = true,
}) => {
  // Call onMapReady for consistency
  React.useEffect(() => {
    onMapReady();
  }, [onMapReady]);

  // Determine risk color
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'high':
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.webPlaceholder}>
        <Text style={styles.webPlaceholderText}>📍 Live Map</Text>
        <Text style={styles.webPlaceholderSubtext}>
          {userLocation
            ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
            : 'Waiting for location...'}
        </Text>
        {routeMarkers.length > 0 && (
          <Text style={styles.webPlaceholderSubtext}>
            {routeMarkers.length} route{routeMarkers.length !== 1 ? 's' : ''} available
          </Text>
        )}
        <View
          style={[
            styles.riskIndicator,
            { borderColor: getRiskColor() },
          ]}
        >
          <Text style={[styles.riskText, { color: getRiskColor() }]}>
            Risk: {riskLevel.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.webPlaceholderNote}>
          (Full maps available on iOS/Android)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    padding: 16,
  },
  webPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  webPlaceholderSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  riskIndicator: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  webPlaceholderNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default MapComponent;
