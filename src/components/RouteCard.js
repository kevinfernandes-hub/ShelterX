import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { formatDistance, formatTime, getRiskLevelForRoute, getRiskBadge } from '../utils/format';
import { COLORS } from '../config';

/**
 * RouteCard - Display a single route with distance, time, and risk level
 * Includes smooth scale and glow animations on selection
 */
const RouteCard = ({ route, isSelected, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isSelected) {
      // Select animation: scale up smoothly
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Glow pulse on selection
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Deselect animation: scale back to normal
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      glowAnim.setValue(0);
    }
  }, [isSelected, scaleAnim, glowAnim]);

  if (!route || !route.distance) {
    return null;
  }

  // Calculate risk level based on actual route data
  const riskLevel = getRiskLevelForRoute(route.distance, route.duration);
  const riskBadge = getRiskBadge(riskLevel);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primary + '00', COLORS.primary + '40'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          { borderLeftColor: riskBadge.color },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Glow background on selection */}
        {isSelected && (
          <Animated.View
            style={[
              styles.glowBg,
              {
                backgroundColor: glowColor,
              },
            ]}
          />
        )}
      {/* Header with route name and risk badge */}
      <View style={styles.header}>
        <Text style={styles.routeName}>{route.name || 'Route'}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: riskBadge.color + '20' },
          ]}
        >
          <Text style={[styles.badgeText, { color: riskBadge.color }]}>
            {riskBadge.emoji} {riskBadge.text}
          </Text>
        </View>
      </View>

      {/* Distance and time display */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📏</Text>
          <View>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{formatDistance(route.distance)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>⏱️</Text>
          <View>
            <Text style={styles.detailLabel}>ETA</Text>
            <Text style={styles.detailValue}>{formatTime(route.duration)}</Text>
          </View>
        </View>
      </View>

      {/* Selected indicator */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>✓ Selected</Text>
        </View>
      )}

      {/* Mock data indicator if applicable */}
      {route.isMock && (
        <Text style={styles.mockIndicator}>(Calculated Route)</Text>
      )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.darkCard,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.darkCard,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.darkCard,
    marginHorizontal: 12,
  },
  selectedIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '30',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  mockIndicator: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  glowBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    zIndex: -1,
  },
});

export default RouteCard;
