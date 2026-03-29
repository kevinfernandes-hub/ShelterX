import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { COLORS } from '../config';
import { calculateDistanceKm } from '../utils/DistanceUtils';

/**
 * RouteMapViewer - Display route on Google Maps with distance and safety info
 * Shows user location, destination, safest route, and detailed metrics
 */
const RouteMapViewer = ({
  visible,
  onClose,
  userLocation,
  destination,
  selectedRoute,
  allRoutes = [],
  userInput = '',
}) => {
  const [mapUrl, setMapUrl] = useState('');
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (userLocation && destination) {
      // Calculate distance
      const dist = calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        destination.lat,
        destination.lng
      );
      setDistance(dist);

      // Build Google Maps Embed URL
      const encodedDestination = `${destination.lat},${destination.lng}`;
      const encodedSource = `${userLocation.latitude},${userLocation.longitude}`;
      const apiKey = require('../config').GOOGLE_MAPS_API_KEY;

      // Create URL for embedded map showing route
      const url = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodedSource}&destination=${encodedDestination}&mode=driving`;
      setMapUrl(url);
    }
  }, [userLocation, destination]);

  if (!visible || !userLocation || !destination) return null;

  const route = selectedRoute || allRoutes[0];
  const safetyScore = route?.safetyScore || 75;
  const routeName = route?.name || 'Route 1';
  const routeDistance = (route?.distance || 0) / 1000; // Convert to km
  const routeDuration = Math.round((route?.duration || 0) / 60); // Convert to minutes

  // Get safety level UI
  const getSafetyUI = () => {
    if (safetyScore >= 80) return { icon: '🟢', text: 'Very Safe', color: COLORS.success };
    if (safetyScore >= 65) return { icon: '🟢', text: 'Safe', color: COLORS.success };
    if (safetyScore >= 50) return { icon: '🟡', text: 'Moderate', color: COLORS.warning };
    return { icon: '🔴', text: 'Risky', color: COLORS.danger };
  };

  const safetyUI = getSafetyUI();

  // Build Google Maps directions URL for opening in Google Maps app
  const openInMaps = () => {
    const encodedDest = encodeURIComponent(`${destination.lat},${destination.lng}`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`;
    Linking.openURL(mapsUrl).catch((err) => console.error('Error opening maps:', err));
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Preview</Text>
          <TouchableOpacity onPress={openInMaps}>
            <Text style={styles.mapsButton}>🗺️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} scrollEventThrottle={16}>
          {/* Map Embed Section */}
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapText}>Google Maps Route Viewer</Text>
              <Text style={styles.mapSubtext}>
                {destination.area}, {destination.city}
              </Text>
              <TouchableOpacity style={styles.openMapsButton} onPress={openInMaps}>
                <Text style={styles.openMapsButtonText}>Open in Google Maps →</Text>
              </TouchableOpacity>
              <Text style={styles.mapNote}>
                Tap button above or the 🗺️ icon to view interactive map
              </Text>
            </View>
          </View>

          {/* Destination Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.userInputLabel}>
              <Text style={styles.userInputText}>You searched for:</Text>
              <Text style={styles.userInputValue}>"{userInput}"</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.locationBadge}>
                <Text style={styles.locationBadgeIcon}>{destination.icon}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{destination.name}</Text>
                <Text style={styles.locationArea}>
                  {destination.area} • {destination.city}
                </Text>
                <Text style={styles.locationDesc}>{destination.description}</Text>
              </View>
            </View>
          </View>

          {/* Distance & Duration */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>📏 Distance</Text>
              <Text style={styles.metricValue}>{distance.toFixed(1)} km</Text>
              <Text style={styles.metricRoute}>Route: {routeDistance.toFixed(1)} km</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>⏱️ Duration</Text>
              <Text style={styles.metricValue}>{routeDuration} min</Text>
              <Text style={styles.metricRoute}>Est. time</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>🛡️ Safety</Text>
              <Text style={[styles.metricValue, { color: safetyUI.color }]}>
                {safetyScore}%
              </Text>
              <Text style={styles.metricRoute}>{safetyUI.text}</Text>
            </View>
          </View>

          {/* Route Details */}
          <View style={styles.routeDetailsCard}>
            <View style={styles.routeHeader}>
              <View>
                <Text style={styles.routeName}>{routeName}</Text>
                <Text style={styles.routeType}>
                  {safetyUI.icon} {safetyUI.text} Route
                </Text>
              </View>
              <View style={[styles.safetyBadge, { backgroundColor: safetyUI.color + '20' }]}>
                <Text style={[styles.safetyBadgeText, { color: safetyUI.color }]}>
                  {safetyScore}%
                </Text>
              </View>
            </View>

            <View style={styles.routeStats}>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>📍</Text>
                <View>
                  <Text style={styles.statLabel}>From</Text>
                  <Text style={styles.statValue}>
                    {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              <View style={styles.stat}>
                <Text style={styles.statIcon}>🎯</Text>
                <View>
                  <Text style={styles.statLabel}>To</Text>
                  <Text style={styles.statValue}>
                    {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                  </Text>
                </View>
              </View>

              {route?.riskFactors && (
                <>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>⚠️</Text>
                    <View>
                      <Text style={styles.statLabel}>Unsafe Areas Impact</Text>
                      <Text style={[styles.statValue, { color: COLORS.danger }]}>
                        -{route.riskFactors.unsafeLocations}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>✅</Text>
                    <View>
                      <Text style={styles.statLabel}>Safe Areas Bonus</Text>
                      <Text style={[styles.statValue, { color: COLORS.success }]}>
                        +{route.riskFactors.safeLocations}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Alternative Routes */}
          {allRoutes.length > 1 && (
            <View style={styles.alternativeRoutesCard}>
              <Text style={styles.sectionTitle}>Alternative Routes</Text>
              {allRoutes.map((r, idx) => {
                const rSafety = r.safetyScore || 65;
                const rDist = (r.distance || 0) / 1000;
                const rDur = Math.round((r.duration || 0) / 60);
                const rUI = rSafety >= 70 ? COLORS.success : rSafety >= 50 ? COLORS.warning : COLORS.danger;

                return (
                  <View key={r.id || idx} style={styles.altRouteItem}>
                    <View style={styles.altRouteInfo}>
                      <Text style={styles.altRouteName}>Route {idx + 1}</Text>
                      <Text style={styles.altRouteStats}>
                        {rDist.toFixed(1)} km • {rDur} min
                      </Text>
                    </View>
                    <View style={[styles.altRouteSafety, { backgroundColor: rUI + '20' }]}>
                      <Text style={[styles.altRouteSafetyText, { color: rUI }]}>
                        {rSafety}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={openInMaps}>
              <Text style={styles.primaryButtonText}>Navigate Now 🗺️</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkCard,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  mapsButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  mapContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.darkCard,
    height: 250,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    borderRadius: 12,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  mapSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  mapNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  openMapsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  openMapsButtonText: {
    color: COLORS.dark,
    fontWeight: '700',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  userInputLabel: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '40',
  },
  userInputText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userInputValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationBadgeIcon: {
    fontSize: 28,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationArea: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.darkCard,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkCard,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricRoute: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  routeDetailsCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkCard,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  routeType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  safetyBadge: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  safetyBadgeText: {
    fontWeight: '700',
    fontSize: 13,
  },
  routeStats: {
    gap: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 3,
  },
  alternativeRoutesCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  altRouteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.dark,
    borderRadius: 8,
    marginBottom: 8,
  },
  altRouteInfo: {
    flex: 1,
  },
  altRouteName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  altRouteStats: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  altRouteSafety: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  altRouteSafetyText: {
    fontWeight: '700',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.darkCard,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.dark,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default RouteMapViewer;
