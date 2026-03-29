import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../config';

/**
 * AI Companion Banner - Shows contextual alerts and suggestions
 * Real-time predictions based on risk, routing, and context
 */
const AIPredictionBanner = ({
  prediction = null,
  riskScore = 0,
  onDismiss = () => {},
}) => {
  const [visible, setVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Determine if banner should show
  useEffect(() => {
    if (prediction?.shouldShow) {
      setVisible(true);
      slideIn();
    } else {
      // Auto-hide after delay if risk drops or no alert
      if (visible) {
        const timer = setTimeout(() => {
          slideOut();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [prediction?.shouldShow]);

  const slideIn = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const slideOut = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss();
    });
  };

  if (!visible || !prediction) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={slideOut}
          style={[styles.banner, { borderLeftColor: prediction.color }]}
        >
          {/* Glass effect background */}
          <View
            style={[
              styles.glassBackground,
              { backgroundColor: prediction.color + '15' },
            ]}
          />

          {/* Content */}
          <View style={styles.content}>
            {/* Icon and message */}
            <View style={styles.messageContainer}>
              <Text style={styles.icon}>{prediction.icon}</Text>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.message, { color: prediction.color }]}
                  numberOfLines={2}
                >
                  {prediction.message}
                </Text>
                <Text style={styles.subtext}>Tap to dismiss</Text>
              </View>
            </View>

            {/* Risk indicator dot */}
            <View style={styles.riskIndicator}>
              <View
                style={[
                  styles.riskDot,
                  {
                    backgroundColor: prediction.color,
                  },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  safeArea: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  banner: {
    overflow: 'hidden',
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2,
  },
  subtext: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  riskIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
  },
});

export default AIPredictionBanner;
