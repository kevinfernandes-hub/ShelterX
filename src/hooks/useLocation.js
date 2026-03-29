import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import LocationService from '../services/LocationService';

/**
 * Hook for subscribing to real-time location updates
 * @returns {Object} { location, loading, error, getCurrentLocation }
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const initializeLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Request permission first
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        // Get initial location
        const initialLocation = await LocationService.getCurrentLocation();
        if (initialLocation) {
          setLocation(initialLocation);
        }

        // Start tracking location updates
        unsubscribe = await LocationService.startTracking((updatedLocation) => {
          setLocation(updatedLocation);
        });

        setLoading(false);
      } catch (err) {
        console.error('useLocation error:', err);
        setError(err.message || 'Failed to get location');
        setLoading(false);
      }
    };

    initializeLocation();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      LocationService.stopTracking();
    };
  }, []);

  /**
   * Get current location on demand
   */
  const getCurrentLocation = async () => {
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        return currentLocation;
      }
      return location;
    } catch (err) {
      console.error('Error getting current location:', err);
      setError(err.message);
      return null;
    }
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
};

export default useLocation;
