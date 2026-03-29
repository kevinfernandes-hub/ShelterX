import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { COLORS } from '../config';
import { GOOGLE_MAPS_API_KEY } from '../config';
import RoutingService from '../services/RoutingService';
import SafeRouteScorer from '../utils/SafeRouteScorer';

/**
 * Destination Search Modal
 * Allows users to enter a destination and view safe routes
 */
const DestinationSearch = ({ visible, onClose, onRouteSelected, currentLocation }) => {
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [riskFactors, setRiskFactors] = useState({});

  /**
   * Search for routes to destination
   * Uses Google Maps Geocoding + Open Route Service + Safety Scoring
   */
  const searchRoutes = async () => {
    if (!destination.trim() || !currentLocation) {
      alert('Please enter a destination');
      return;
    }

    setLoading(true);
    try {
      // Parse destination using Google Maps Geocoding API
      const destCoords = await parseDestinationInput(destination);

      if (!destCoords) {
        alert('Could not find destination. Please try another search.');
        setLoading(false);
        return;
      }

      // Get alternative routes from Open Route Service
      const alternativeRoutes = await RoutingService.getAlternativeRoutes(
        currentLocation.latitude,
        currentLocation.longitude,
        destCoords.latitude,
        destCoords.longitude,
        5 // Get up to 5 alternatives
      );

      // Score each route by safety
      const riskData = {
        noiseLevel: 45, // Would come from SensorService in production
        environmentalRisk: 10,
      };

      const rankedRoutes = SafeRouteScorer.rankRoutesBySafety(
        alternativeRoutes,
        riskData
      );

      setRoutes(rankedRoutes);
      setRiskFactors(riskData);
    } catch (error) {
      console.error('Error searching routes:', error);
      alert('Error searching routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Parse user input for destination using Google Maps Geocoding API
   * Supports: "latitude,longitude" or place names
   */
  const parseDestinationInput = async (input) => {
    // Try parsing as coordinates first
    const coords = input.split(',').map(v => parseFloat(v.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return { latitude: coords[0], longitude: coords[1] };
    }

    // Use Google Maps Geocoding API for place names
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          name: data.results[0].formatted_address,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding destination:', error);
      return null;
    }
  };

  /**
   * Render individual route with safety score
   */
  const renderRoute = ({ item, index }) => {
    const isSelected = selectedRoute?.id === item.id;
    const safeColor =
      item.safetyScore >= 85
        ? COLORS.success
        : item.safetyScore >= 70
        ? COLORS.warning
        : COLORS.danger;

    return (
      <TouchableOpacity
        style={[
          styles.routeCard,
          isSelected && styles.routeCardSelected,
          { borderLeftColor: safeColor, borderLeftWidth: 4 },
        ]}
        onPress={() => setSelectedRoute(item)}
      >
        <View style={styles.routeHeader}>
          <Text style={styles.routeTitle}>
            Route {index + 1}: {item.name}
          </Text>
          <View style={[styles.safetyBadge, { backgroundColor: safeColor }]}>
            <Text style={styles.safetyScore}>{item.safetyScore}%</Text>
          </View>
        </View>

        <Text style={styles.routeInfo}>
          📍 {(item.distance / 1000).toFixed(1)}km • ⏱️ {Math.ceil(item.duration / 60)}min
        </Text>

        <Text style={styles.recommendation}>{item.recommendation}</Text>

        {item.riskHotspots.length > 0 && (
          <View style={styles.hotspotsContainer}>
            <Text style={styles.hotspotsTitle}>⚠️ Caution Areas ({item.riskHotspots.length})</Text>
            {item.riskHotspots.slice(0, 2).map((hotspot, idx) => (
              <Text key={idx} style={styles.hotspotText}>
                • {hotspot.reason} (Risk: {hotspot.risk}%)
              </Text>
            ))}
          </View>
        )}

        {isSelected && (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              onRouteSelected(item);
              onClose();
            }}
          >
            <Text style={styles.selectButtonText}>✓ Use This Route</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safe Route Finder</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="E.g. Civil Lines, Sitaburdi, Pimpri, Hinjewadi..."
            placeholderTextColor={COLORS.darkCard}
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={searchRoutes}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchRoutes}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.dark} size="small" />
            ) : (
              <Text style={styles.searchButtonText}>🔍 Find Safe Routes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Routes List */}
        {routes.length > 0 ? (
          <FlatList
            data={routes}
            renderItem={renderRoute}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Analyzing routes for safety...</Text>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>📍</Text>
            <Text style={styles.emptyTitle}>Enter a destination</Text>
            <Text style={styles.emptySubtitle}>
              Search for any place: hospitals, airports, metro stations, landmarks, etc.
            </Text>
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try searching:</Text>
              <Text style={styles.suggestionItem}>🏥 Hospital</Text>
              <Text style={styles.suggestionItem}>✈️ Airport</Text>
              <Text style={styles.suggestionItem}>🚆 Railway Station</Text>
              <Text style={styles.suggestionItem}>🛍️ Shopping Mall</Text>
              <Text style={styles.suggestionItem}>🎓 School or College</Text>
              <Text style={styles.suggestionItem}>🏦 Bank</Text>
            </View>
          </View>
        )}

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Safety Score based on: time, location, traffic patterns
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
    paddingTop: 50,
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
  closeButton: {
    fontSize: 28,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  placeholder: {
    width: 28,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkCard,
  },
  searchInput: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    marginBottom: 12,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: COLORS.dark,
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    color: COLORS.primary,
    marginTop: 16,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.darkCard,
    fontSize: 14,
    textAlign: 'center',
  },
  routeCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  routeCardSelected: {
    backgroundColor: COLORS.darkCard,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeTitle: {
    color: 'white',
    fontWeight: '600',
    flex: 1,
  },
  safetyBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  safetyScore: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  routeInfo: {
    color: COLORS.darkCard,
    fontSize: 13,
    marginBottom: 8,
  },
  recommendation: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  hotspotsContainer: {
    backgroundColor: COLORS.dark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  hotspotsTitle: {
    color: COLORS.warning,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 6,
  },
  hotspotText: {
    color: COLORS.darkCard,
    fontSize: 11,
  },
  selectButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  suggestionsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    maxHeight: 200,
  },
  suggestionsTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  suggestionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.darkCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark,
  },
  footerText: {
    color: COLORS.darkCard,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default DestinationSearch;
