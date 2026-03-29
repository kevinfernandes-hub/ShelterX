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
} from 'react-native';
import { COLORS } from '../config';
import { SAFE_AREAS, searchAreas, getCities, getAreasByCity } from '../utils/SafeAreas';

const AntiGravityDestinationInput = ({
  visible,
  onClose,
  onDestinationSelected,
  currentLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCityList, setShowCityList] = useState(true);

  const cities = getCities();

  // Get search results
  const searchResults = searchQuery.trim().length > 0 ? searchAreas(searchQuery) : [];

  // Get areas for selected city
  const cityAreas = selectedCity ? getAreasByCity(selectedCity) : [];

  // Render area item
  const renderAreaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.areaItem}
      onPress={() => {
        onDestinationSelected(item);
        setSearchQuery('');
        setSelectedCity(null);
      }}
    >
      <View style={styles.areaItemContent}>
        <Text style={styles.areaIcon}>{item.icon}</Text>
        <View style={styles.areaInfo}>
          <Text style={styles.areaName}>{item.name}</Text>
          <Text style={styles.areaDetails}>
            {item.city} • Safety: {item.safetyScore}%
          </Text>
          <Text style={styles.areaDescription}>{item.description}</Text>
        </View>
      </View>
      <Text style={styles.selectArrow}>→</Text>
    </TouchableOpacity>
  );

  // Render city button
  const renderCityButton = ({ item }) => (
    <TouchableOpacity
      style={[styles.cityButton, selectedCity === item && styles.cityButtonActive]}
      onPress={() => {
        setSelectedCity(item);
        setShowCityList(false);
      }}
    >
      <Text
        style={[styles.cityButtonText, selectedCity === item && styles.cityButtonTextActive]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧲 Select Destination</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search areas, cities..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} scrollEventThrottle={16}>
          {/* Search Results */}
          {searchQuery.trim().length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>
                Search Results ({searchResults.length})
              </Text>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderAreaItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noResults}>No areas found. Try another search!</Text>
              )}
            </View>
          ) : (
            <View>
              {/* City Selection */}
              {showCityList ? (
                <View>
                  <Text style={styles.sectionTitle}>Select City</Text>
                  <FlatList
                    data={cities}
                    renderItem={renderCityButton}
                    keyExtractor={(item) => item}
                    scrollEnabled={false}
                    numColumns={2}
                    columnWrapperStyle={styles.cityGrid}
                  />
                </View>
              ) : (
                <View>
                  {/* Areas in Selected City */}
                  <View style={styles.selectedCityBar}>
                    <Text style={styles.selectedCityText}>{selectedCity}</Text>
                    <TouchableOpacity onPress={() => setShowCityList(true)}>
                      <Text style={styles.changeButton}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.sectionTitle}>
                    Areas in {selectedCity} ({cityAreas.length})
                  </Text>
                  <FlatList
                    data={cityAreas}
                    renderItem={renderAreaItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* Quick Access - Popular Areas */}
              {!selectedCity && !searchQuery && (
                <View style={styles.popularSection}>
                  <Text style={styles.sectionTitle}>Popular Areas</Text>
                  <FlatList
                    data={SAFE_AREAS.slice(0, 6)}
                    renderItem={renderAreaItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </View>
              )}
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
    borderColor: COLORS.darkCard,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  cityGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cityButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.darkCard,
    alignItems: 'center',
  },
  cityButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  cityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  cityButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.darkCard,
  },
  areaItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  areaDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  areaDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  selectArrow: {
    fontSize: 18,
    color: COLORS.primary,
    marginLeft: 8,
  },
  selectedCityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  selectedCityText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  changeButton: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  noResults: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
  popularSection: {
    marginBottom: 24,
  },
});

export default AntiGravityDestinationInput;
