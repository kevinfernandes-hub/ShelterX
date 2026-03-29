import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { COLORS } from '../config';

/**
 * MapComponent - Native version (iOS/Android)
 * Full interactive map with location markers and risk zones
 */
const MapComponent = ({
  userLocation,
  routeMarkers = [],
  riskLevel = 'safe',
  onMapReady = () => {},
  autoCenter = true,
}) => {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(null);

  // Auto-center map when user location updates
  useEffect(() => {
    if (autoCenter && userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  }, [userLocation, autoCenter]);

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

  // Determine region for initial map load
  const getInitialRegion = () => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // Default to San Francisco if no location available
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        onMapReady={onMapReady}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Your Location"
              description={`Risk: ${riskLevel}`}
              pinColor={getRiskColor()}
            />
            {/* Risk Zone Circle */}
            <Circle
              center={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              radius={500} // 500 meters
              fillColor={`${getRiskColor()}20`}
              strokeColor={getRiskColor()}
              strokeWidth={2}
            />
          </>
        )}

        {/* Route Markers */}
        {routeMarkers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            pinColor={COLORS.primary}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    flex: 1,
  },
});

export default MapComponent;
