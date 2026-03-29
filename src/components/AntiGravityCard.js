import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { COLORS } from '../config';
import RouteMapViewer from './RouteMapViewer';

const AntiGravityCard = ({
  analysis,
  visible,
  onClose,
  onSelectRoute,
  userLocation,
  userInput = '',
}) => {
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [showMapViewer, setShowMapViewer] = useState(false);

  if (!analysis) return null;

  const { destination, routes, selectedRoute, summary, places } = analysis;

  const getRiskUI = (score) => {
    if (score >= 80) return { icon: '🟢', color: COLORS.success, text: 'Very Safe' };
    if (score >= 65) return { icon: '🟢', color: COLORS.success, text: 'Safe' };
    if (score >= 50) return { icon: '🟡', color: COLORS.warning, text: 'Moderate' };
    if (score >= 35) return { icon: '🔴', color: COLORS.danger, text: 'Risky' };
    return { icon: '🔴', color: '#DC2626', text: 'Very Risky' };
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧲 Anti-Gravity Route</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => setShowMapViewer(true)}
            >
              <Text style={styles.mapButtonText}>🗺️ Map</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} scrollEventThrottle={16}>
          {/* Destination Card */}
          <View style={styles.destinationCard}>
            <View style={styles.destinationHeader}>
              <Text style={styles.destinationIcon}>{destination.icon}</Text>
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>{destination.name}</Text>
                <Text style={styles.destinationType}>{destination.type}</Text>
              </View>
            </View>
            <View style={styles.destinationStats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Safety</Text>
                <Text style={styles.statValue}>{destination.safetyScore}%</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Places</Text>
                <Text style={styles.statValue}>{places.total}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Safe</Text>
                <Text style={[styles.statValue, { color: COLORS.success }]}>{places.safe}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Unsafe</Text>
                <Text style={[styles.statValue, { color: COLORS.danger }]}>{places.unsafe}</Text>
              </View>
            </View>
            <Text style={styles.destinationMsg}>{summary.message}</Text>
          </View>

          {/* Routes List */}
          <Text style={styles.sectionTitle}>📍 Route Options</Text>
          {routes.map((route, idx) => {
            const riskUI = getRiskUI(route.safetyScore);
            const isSelected = selectedRoute && selectedRoute.id === route.id;
            const isExpanded = expandedRoute === route.id;

            return (
              <TouchableOpacity
                key={route.id || idx}
                style={[styles.routeCard, isSelected && styles.routeCardSelected]}
                onPress={() => {
                  if (isExpanded) {
                    setExpandedRoute(null);
                  } else {
                    setExpandedRoute(route.id);
                    onSelectRoute(route);
                  }
                }}
              >
                {/* Route Header */}
                <View style={styles.routeHeader}>
                  <View style={styles.routeTitle}>
                    <Text style={styles.routeName}>{route.name || `Route ${idx + 1}`}</Text>
                    <Text style={[styles.riskBadge, { color: riskUI.color }]}>
                      {riskUI.icon} {route.safetyScore}%
                    </Text>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </View>

                {/* Route Summary */}
                <View style={styles.routeSummary}>
                  <Text style={styles.routeDetail}>📏 {(route.distance / 1000).toFixed(1)} km</Text>
                  <Text style={styles.routeDetail}>⏱️ {Math.round(route.duration / 60)} min</Text>
                  <Text style={styles.routeDetail}>{riskUI.icon} {riskUI.text}</Text>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.routeDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Unsafe Location Impact:</Text>
                      <Text style={[styles.detailValue, { color: COLORS.danger }]}>
                        {route.riskFactors.unsafeLocations}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Safe Location Bonus:</Text>
                      <Text style={[styles.detailValue, { color: COLORS.success }]}>
                        +{route.riskFactors.safeLocations}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Route Length:</Text>
                      <Text style={styles.detailValue}>{route.riskFactors.routeLength} km</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Sampled Points:</Text>
                      <Text style={styles.detailValue}>{route.sampledPointsCount}</Text>
                    </View>

                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓ SELECTED</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Route Map Viewer */}
        <RouteMapViewer
          visible={showMapViewer}
          onClose={() => setShowMapViewer(false)}
          userLocation={userLocation}
          destination={destination}
          selectedRoute={selectedRoute}
          allRoutes={routes}
          userInput={userInput}
        />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapButton: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  mapButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
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
  content: {
    flex: 1,
    padding: 16,
  },
  destinationCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  destinationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  destinationType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  destinationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkCard,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  destinationMsg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.darkCard,
  },
  routeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.dark,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTitle: {
    flex: 1,
  },
  routeName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  riskBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  routeDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  routeDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkCard,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  selectedIndicator: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeButtonBottom: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AntiGravityCard;
