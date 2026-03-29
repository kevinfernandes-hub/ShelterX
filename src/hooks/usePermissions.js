import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    location: false,
    microphone: false,
    motion: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    requestAllPermissions();
  }, []);

  const requestAllPermissions = async () => {
    try {
      setPermissions((prev) => ({ ...prev, loading: true, error: null }));

      // Request location permission
      const locationResult = await Location.requestForegroundPermissionsAsync();
      const locationGranted = locationResult.status === 'granted';

      // Request audio/microphone permission (using expo-av)
      // Note: Microphone permissions are handled by the audio service
      const microphoneGranted = true;

      // Motion/accelerometer (no specific permission required on iOS/Android)
      const motionGranted = true;

      setPermissions({
        location: locationGranted,
        microphone: microphoneGranted,
        motion: motionGranted,
        loading: false,
        error: locationGranted ? null : 'Location permission denied',
      });

      return locationGranted && microphoneGranted && motionGranted;
    } catch (error) {
      console.error('Permission request error:', error);
      setPermissions((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      return false;
    }
  };

  const requestBackground = async () => {
    try {
      const result = await Location.requestBackgroundPermissionsAsync();
      return result.status === 'granted';
    } catch (error) {
      console.error('Background permission error:', error);
      return false;
    }
  };

  return {
    ...permissions,
    requestAllPermissions,
    requestBackground,
  };
};
