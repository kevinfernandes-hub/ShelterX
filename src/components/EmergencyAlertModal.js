import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SPACING } from '../config';

/**
 * Emergency Alert Modal - Shows when SOS is triggered
 */
const EmergencyAlertModal = ({
  visible = false,
  alert = null,
  onCancel = () => {},
}) => {
  const [pulseAnim] = useState(new Animated.Value(0));

  // Pulse animation for alert
  useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [visible, pulseAnim]);

  if (!alert) return null;

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Alert card */}
        <Animated.View
          style={[
            styles.alertCard,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        >
          {/* Icon */}
          <Text style={styles.icon}>🚨</Text>

          {/* Title */}
          <Text style={styles.title}>EMERGENCY ALERT</Text>

          {/* Details */}
          <View style={styles.details}>
            {/* Risk level */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Risk Level:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color:
                      alert.riskScore > 70
                        ? COLORS.danger
                        : COLORS.warning,
                  },
                ]}
              >
                {alert.riskScore}% ({alert.riskLevel})
              </Text>
            </View>

            {/* Trigger reason */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Trigger:</Text>
              <Text style={styles.value}>
                {alert.reason === 'manual_sos'
                  ? 'Manual'
                  : alert.reason === 'shake_detected'
                  ? 'Shake'
                  : alert.reason === 'no_movement'
                  ? 'No Movement'
                  : alert.reason === 'fall_detected'
                  ? 'Fall'
                  : 'Unknown'}
              </Text>
            </View>

            {/* Location */}
            {alert.latitude && alert.longitude && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>
                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                </Text>
              </View>
            )}

            {/* Timestamp */}
            <View style={styles.detailRow}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            Emergency services have been notified with your location and status.
          </Text>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>✓ Cancel Alert</Text>
          </TouchableOpacity>

          {/* Warning */}
          <Text style={styles.warning}>
            You have 10 seconds to cancel this alert.
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  alertCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 18,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    borderWidth: 2,
    borderColor: COLORS.danger,
    alignItems: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  icon: {
    fontSize: 72,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.danger,
    marginBottom: SPACING.md,
    textAlign: 'center',
    letterSpacing: 2.5,
  },
  details: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  message: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 20,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    width: '100%',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  warning: {
    fontSize: 11,
    color: COLORS.warning,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

export default EmergencyAlertModal;
