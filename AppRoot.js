import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import MonitorScreen from './src/screens/MonitorScreen';
import AIPredictionBanner from './src/components/AIPredictionBanner';
import { initializeAuth } from './src/services/firebase';
import EmergencyService from './src/services/EmergencyService';
import RiskService from './src/services/RiskService';
import { COLORS } from './src/config';

export default function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [riskData, setRiskData] = useState({ score: 20, level: 'safe', factors: {} });
  const [routeData, setRouteData] = useState({});

  useEffect(() => {
    // Initialize Firebase Auth
    initializeAuth()
      .then(() => {
        console.log('Firebase auth initialized');
        setAuthInitialized(true);

        // Initialize Emergency Service
        EmergencyService.initialize();

        // Subscribe to risk updates
        RiskService.addListener((riskUpdate) => {
          setRiskData(riskUpdate);
        });
      })
      .catch((error) => {
        console.error('Auth initialization error:', error);
        Alert.alert(
          'Initialization Error',
          'Could not initialize the app. Please restart.',
          [{ text: 'OK' }]
        );
      });

    // Cleanup
    return () => {
      RiskService.removeListener;
    };
  }, []);

  // Handle SOS button press
  const handleSOS = async (location, riskData) => {
    console.log('SOS triggered from app');
    await EmergencyService.triggerSOS(location, riskData);

    Alert.alert(
      '🆘 SOS ALERT SENT',
      `Location: ${location?.latitude.toFixed(4)}, ${location?.longitude.toFixed(4)}\n\nEmergency services and your contacts have been notified.`,
      [
        {
          text: 'Cancel',
          onPress: async () => {
            await EmergencyService.cancelSOS();
          },
        },
        {
          text: 'OK',
          isPreferred: true,
        },
      ]
    );
  };

  if (!authInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.dark} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing ANTIGRAVITY...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      {/* AI Prediction Banner */}
      <AIPredictionBanner riskData={riskData} routeData={routeData} />

      {/* Main Monitor Screen */}
      <MonitorScreen onSOS={handleSOS} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
});
