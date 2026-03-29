import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { sendEmergencyAlert, auth } from './firebase';
import SensorService from './SensorService';

// Emergency Service - All SOS and auto-trigger logic - v3

class EmergencyService {
  constructor() {
    this.sosActive = false;
    this.lastSOSTime = 0;
    this.sosDebounce = 5000; // 5 seconds between SOS triggers
    this.emergencySound = null;
    this.listeners = [];
    
    // Auto-trigger tracking
    this.noMovementCounter = 0;
    this.lastShakeTime = 0;
    this.lastFallTime = 0;
    this.shakeDebounce = 3000;
    this.fallDebounce = 5000;
    this.accelerometerHistory = [];
  }

  /**
   * Initialize Emergency Service
   */
  initialize = async () => {
    try {
      // Load SOS alert sound (if available)
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/sos-alert.mp3')
        );
        this.emergencySound = sound;
      } catch (soundError) {
        console.log('📴 SOS alert sound not available (will continue without sound):', soundError.message);
      }

      // Setup notifications (may not be available in Expo Go SDK 53+)
      try {
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      } catch (notifError) {
        console.log('📴 Notifications unavailable (Expo Go SDK 53+)');
      }

      // Subscribe to shake detection
      SensorService.addListener(this.handleSensorData);

      console.log('Emergency service initialized');
    } catch (error) {
      console.error('Error initializing emergency service:', error);
    }
  };

  /**
   * Trigger SOS manually
   */
  triggerSOS = async (location, riskData, trigger = 'manual') => {
    const now = Date.now();

    // Debounce multiple rapid SOS triggers
    if (now - this.lastSOSTime < this.sosDebounce) {
      console.log('⏱️ SOS debounced - too soon');
      return false;
    }

    this.lastSOSTime = now;
    this.sosActive = true;

    try {
      // Haptic feedback: urgent vibration pattern
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (_e) {
        console.log('Haptics unavailable');
      }

      const userId = auth.currentUser?.uid || 'anonymous';

      const emergencyData = {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        accuracy: location?.accuracy || 0,
        riskScore: riskData?.score || 0,
        riskLevel: riskData?.level || 'unknown',
        reason: trigger,
        soundLevel: SensorService.soundLevel || 0,
        movementIntensity: SensorService.getMovementIntensity?.() || 0,
        timestamp: new Date().toISOString(),
        userId,
      };

      // Send to Firebase
      await sendEmergencyAlert(userId, emergencyData);

      // Play sound
      await this.playEmergencySound();

      // Send notification
      await this.sendEmergencyNotification(emergencyData);

      // Notify listeners
      this.notifyListeners({
        type: 'sos_triggered',
        data: emergencyData,
      });

      console.log(`🚨 SOS triggered (${trigger}):`, emergencyData);

      // Keep SOS active for cancellation window
      setTimeout(() => {
        if (this.sosActive) {
          this.sosActive = false;
        }
      }, 10000); // 10 second window to cancel

      return true;
    } catch (error) {
      console.error('Error triggering SOS:', error);
      this.sosActive = false;
      return false;
    }
  };

  /**
   * Detect shake pattern (high acceleration spike)
   */
  detectShake = (accelerometerData = {}) => {
    const { magnitude = 0 } = accelerometerData;

    // Debounce shake detection
    if (Date.now() - this.lastShakeTime < this.shakeDebounce) {
      return false;
    }

    // Shake threshold: > 30 m/s² indicates sudden motion
    if (magnitude > 30) {
      this.lastShakeTime = Date.now();
      console.log('🤝 Shake detected:', magnitude);
      return true;
    }

    return false;
  };

  /**
   * Detect fall pattern: high spike + sudden stillness
   */
  detectFall = (accelerometerData = {}, movementIntensity = 0) => {
    if (Date.now() - this.lastFallTime < this.fallDebounce) {
      return false;
    }

    const { magnitude = 0 } = accelerometerData;
    const isHighSpike = magnitude > 30;
    const isStill = movementIntensity < 3;

    // Fall pattern: High acceleration followed by stillness
    if (isHighSpike && isStill) {
      this.lastFallTime = Date.now();
      console.log('📉 Fall detected - spike + stillness');
      return true;
    }

    return false;
  };

  /**
   * Track no-movement for auto-trigger
   */
  trackNoMovement = (movementIntensity = 0, riskScore = 0) => {
    const stillThreshold = 5;
    const noMovementTimeout = 30;
    const highRiskThreshold = 65;

    if (movementIntensity < stillThreshold) {
      this.noMovementCounter++;
    } else {
      this.noMovementCounter = 0;
    }

    // Auto-trigger conditions: still > 30sec AND high risk
    if (
      this.noMovementCounter >= noMovementTimeout &&
      riskScore > highRiskThreshold &&
      !this.sosActive
    ) {
      console.log('⏸️  Auto-trigger: No movement + high risk');
      return true;
    }

    return false;
  };

  /**
   * Reset no-movement counter (user is moving)
   */
  resetNoMovement = () => {
    this.noMovementCounter = 0;
  };

  /**
   * Handle sensor data for auto-triggers
   */
  handleSensorData = (sensorData) => {
    // Could auto-trigger SOS on various conditions
    // Currently disabled - users must manually trigger or wait for explicit auto-triggers
    if (sensorData.type === 'accelerometer') {
      // Shake detection is tracked but not auto-triggered
      // Fall detection is tracked but not auto-triggered
    }
  };

  /**
   * Cancel active SOS
   */
  cancelSOS = async () => {
    try {
      await this.stopEmergencySound();
      this.sosActive = false;

      // Haptic feedback: soft confirmation
      try {
        await Haptics.selectionAsync();
      } catch (_e) {
        console.log('Haptics unavailable');
      }

      this.notifyListeners({
        type: 'sos_cancelled',
      });

      console.log('✋ SOS cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling SOS:', error);
      return false;
    }
  };

  /**
   * Get SOS status
   */
  getStatus = () => {
    return {
      sosActive: this.sosActive,
      noMovementCounter: this.noMovementCounter,
      lastSOSTime: this.lastSOSTime,
    };
  };
  sendEmergencyNotification = async (emergencyData) => {
    try {
      // Notifications may not be available in Expo Go SDK 53+
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🆘 SOS ALERT SENT',
            body: `Location: ${emergencyData.latitude.toFixed(4)}, ${emergencyData.longitude.toFixed(4)}`,
            data: emergencyData,
            sound: true,
            priority: 'max',
          },
          trigger: null, // Send immediately
        });
      } catch (notifError) {
        console.log('📴 Notifications unavailable on this platform');
      }
    } catch (error) {
      console.error('Error in notification service:', error);
    }
  };

  /**
   * Play emergency alert sound
   */
  playEmergencySound = async () => {
    try {
      if (this.emergencySound) {
        await this.emergencySound.playAsync();
      }
    } catch (error) {
      console.error('Error playing emergency sound:', error);
    }
  };

  /**
   * Stop emergency alert sound
   */
  stopEmergencySound = async () => {
    try {
      if (this.emergencySound) {
        await this.emergencySound.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping emergency sound:', error);
    }
  };

  /**
   * Add listener for emergency events
   */
  addListener = (listener) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  };

  /**
   * Notify listeners
   */
  notifyListeners = (data) => {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in emergency listener:', error);
      }
    });
  };
}

export default new EmergencyService();
