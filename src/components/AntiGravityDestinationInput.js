import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../config';
import { GOOGLE_MAPS_API_KEY } from '../config';

const AntiGravityDestinationInput = ({
  visible,
  onClose,
  onDestinationSelected,
  currentLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  /**
   * Search destinations using Google Places API with real-time results
   */
  const searchDestinations = useCallback(async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Build session token for Places API (for cost optimization)
      const sessionToken = `session_${Date.now()}`;

      // Use Google Places Autocomplete API with location bias (50km radius)
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}&location=${currentLocation?.latitude},${currentLocation?.longitude}&radius=50000`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions && Array.isArray(data.predictions)) {
        // Get details for each prediction
        const enrichedResults = await Promise.all(
          data.predictions.slice(0, 10).map(async (prediction) => {
            try {
              // Get place details including lat/lng
              const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry,formatted_address,name,types,photos&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}`;

              const detailResponse = await fetch(detailUrl);
              const detailData = await detailResponse.json();

              const result = detailData.result || {};
              const location = result.geometry?.location || {};

              // Determine icon based on place type
              let icon = '📍';
              const types = result.types || [];
              if (types.includes('hospital') || types.includes('health')) icon = '🏥';
              else if (types.includes('airport')) icon = '✈️';
              else if (types.includes('train_station') || types.includes('transit_station')) icon = '🚆';
              else if (types.includes('restaurant') || types.includes('cafe')) icon = '🍽️';
              else if (types.includes('shopping_mall')) icon = '🛍️';
              else if (types.includes('police')) icon = '👮';
              else if (types.includes('fire_station')) icon = '🚒';
              else if (types.includes('bank')) icon = '🏦';
              else if (types.includes('school') || types.includes('university')) icon = '🎓';
              else if (types.includes('park')) icon = '🌳';

              return {
                id: prediction.place_id,
                name: prediction.main_text,
                area: prediction.secondary_text || prediction.main_text,
                city: prediction.secondary_text?.split(',')[0] || 'Unknown',
                lat: location.lat || 0,
                lng: location.lng || 0,
                description: prediction.description,
                address: result.formatted_address || prediction.description,
                icon: icon,
                safetyScore: 70, // Default safety - will be calculated during routing
                types: types,
              };
            } catch (err) {
              console.error('Error fetching place details:', err);
              return null;
            }
          })
        );

        // Filter out null results
        const validResults = enrichedResults.filter((r) => r !== null);
        setSearchResults(validResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching destinations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Render search result item with distance
  const renderSearchResult = ({ item, index }) => {
    // Calculate distance from current location
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const distance = calculateDistance(
      currentLocation?.latitude || 0,
      currentLocation?.longitude || 0,
      item.lat,
      item.lng
    );

    return (
      <TouchableOpacity
        style={[styles.resultItem, index % 2 === 0 && styles.resultItemAlt]}
        onPress={() => {
          onDestinationSelected({
            destination: item,
            userInput: searchQuery,
          });
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <View style={styles.resultContent}>
          <Text style={styles.resultIcon}>{item.icon}</Text>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultAddress} numberOfLines={1}>
              {item.address}
            </Text>
            <Text style={styles.resultDistance}>
              📍 {distance.toFixed(1)} km away
            </Text>
          </View>
        </View>
        <View style={styles.resultMeta}>
          <Text style={styles.resultKm}>{distance.toFixed(1)}</Text>
          <Text style={styles.resultKmLabel}>km</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Handle search input with debounce
  const handleSearchInput = (text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Show loading state immediately if input is 2+ characters
    if (text.trim().length >= 2) {
      setIsSearching(true);

      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        searchDestinations(text);
      }, 500); // Debounce delay: 500ms

      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗺️ Search Destination</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search any destination, area, landmark..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchInput}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator color={COLORS.primary} size="small" />}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} scrollEventThrottle={16}>
          {searchQuery.trim().length >= 2 ? (
            <View>
              <Text style={styles.sectionTitle}>
                {isSearching ? 'Searching...' : `Results (${searchResults.length})`}
              </Text>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.primary} size="large" />
                  <Text style={styles.loadingText}>Searching locations...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsIcon}>🌍</Text>
                  <Text style={styles.noResults}>No destinations found</Text>
                  <Text style={styles.noResultsHint}>Try searching with a different name or location</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>📍</Text>
              <Text style={styles.emptyStateTitle}>Search for a Destination</Text>
              <Text style={styles.emptyStateHint}>Type at least 2 characters to search for destinations, areas, landmarks, or addresses</Text>
              
              <View style={styles.examplesContainer}>
                <Text style={styles.exampleTitle}>Try searching for:</Text>
                <Text style={styles.exampleItem}>• Civil Lines, Nagpur</Text>
                <Text style={styles.exampleItem}>• Airport, Mumbai</Text>
                <Text style={styles.exampleItem}>• Hospital near me</Text>
                <Text style={styles.exampleItem}>• Railway Station</Text>
              </View>
            </View>
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    color: COLORS.text,
    fontSize: 14,
  },
  clearButton: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  resultItemAlt: {
    backgroundColor: COLORS.dark,
    borderColor: COLORS.primary + '10',
  },
  resultContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  resultAddress: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  resultDistance: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  resultMeta: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 6,
  },
  resultKm: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resultKmLabel: {
    fontSize: 9,
    color: COLORS.primary,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noResults: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  noResultsHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  examplesContainer: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    width: '100%',
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  exampleItem: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 6,
  },
});

export default AntiGravityDestinationInput;
