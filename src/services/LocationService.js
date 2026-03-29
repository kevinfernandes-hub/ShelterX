import * as Location from 'expo-location';
import { LOCATION_CONFIG } from '../config';

class LocationService {
  constructor() {
    this.subscription = null;
    this.currentLocation = null;
    this.listeners = [];
  }

  /**
   * Start tracking user location
   * @param {Function} onLocationChange - Callback when location changes
   * @returns {Function} Unsubscribe function
   */
  startTracking = async (onLocationChange) => {
    try {
      // Check permissions first
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return () => {};
      }

      // Subscribe to location updates
      this.subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: LOCATION_CONFIG.updateInterval,
          distanceInterval: LOCATION_CONFIG.minDistance,
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };

          // Notify all listeners
          this.notifyListeners(this.currentLocation);

          // Call the provided callback
          if (onLocationChange) {
            onLocationChange(this.currentLocation);
          }
        }
      );

      console.log('Location tracking started');
      return this.stopTracking;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return () => {};
    }
  };

  /**
   * Get current location once
   */
  getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  /**
   * Stop tracking location
   */
  stopTracking = () => {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
      console.log('Location tracking stopped');
    }
  };

  /**
   * Add a listener for location changes
   * @param {Function} listener - Callback function
   */
  addListener = (listener) => {
    this.listeners.push(listener);
  };

  /**
   * Remove a listener
   * @param {Function} listener - Callback function to remove
   */
  removeListener = (listener) => {
    this.listeners = this.listeners.filter((l) => l !== listener);
  };

  /**
   * Notify all listeners of location change
   */
  notifyListeners = (location) => {
    this.listeners.forEach((listener) => {
      try {
        listener(location);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  };

  /**
   * Get cached current location
   */
  getCachedLocation = () => {
    return this.currentLocation;
  };

  /**
   * Calculate distance between two coordinates (in meters)
   */
  calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  /**
   * Check if location is within a safe zone
   */
  isInSafeZone = (location, safeZones = []) => {
    if (!location || safeZones.length === 0) return false;

    return safeZones.some((zone) => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude
      );
      return distance <= zone.radius;
    });
  };
}

export default new LocationService();
