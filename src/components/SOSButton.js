import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SPACING } from '../config';

/**
 * SOS Button with hold-to-trigger functionality
 */
const SOSButton = ({
  onPress = () => {},
  disabled = false,
}) => {
  const [holding, setHolding] = useState(false);
  const holdProgress = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdTimeout = useRef(null);

  const HOLD_DURATION = 2500; // 2.5 seconds to trigger

  // Pulse animation (continuous, when not holding)
  useEffect(() => {
    if (!holding && !disabled) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished && !holding) {
            pulse();
          }
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [holding, disabled, pulseAnim]);

  const handlePressIn = () => {
    if (disabled) return;

    setHolding(true);

    // Animate progress ring
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    // Trigger after hold duration
    holdTimeout.current = setTimeout(() => {
      triggerSOS();
    }, HOLD_DURATION);
  };

  const handlePressOut = () => {
    setHolding(false);

    // Cancel hold
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
    }

    // Reset progress
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const triggerSOS = () => {
    setHolding(false);

    // Scale animation on trigger
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Call parent handler
    onPress();
  };

  const progressColor = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF0000', '#8B0000'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.button,
          {
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.innerButton, disabled && styles.disabled]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          disabled={disabled}
        >
          {/* Background progress ring */}
          {holding && (
            <View style={styles.progressRing}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>
          )}

          {/* Button content */}
          <View style={styles.content}>
            <Text style={styles.icon}>🆘</Text>
            <Text style={styles.text}>
              {holding ? 'HOLD...' : 'SOS'}
            </Text>

            {holding && (
              <Text style={styles.subtext}>
                {Math.ceil(HOLD_DURATION / 1000)} sec
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Instructions */}
      <Text style={styles.hint}>
        {holding ? 'Release to cancel' : 'Hold to trigger emergency'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  button: {
    position: 'relative',
  },
  innerButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0.2,
  },
  progressRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    width: 140 - 6,
    height: 140 - 6,
    borderRadius: 67,
    opacity: 0.2,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    fontSize: 48,
    marginBottom: 4,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default SOSButton;
