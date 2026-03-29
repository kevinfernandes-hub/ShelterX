import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import MapComponent from '../components/MapComponent';
import RouteCard from '../components/RouteCard';
import AIPredictionBanner from '../components/AIPredictionBanner';
import SOSButton from '../components/SOSButton';
import EmergencyAlertModal from '../components/EmergencyAlertModal';
import { COLORS } from '../config';
import RiskService from '../services/RiskService';
import SensorService from '../services/SensorService';
import RoutingService from '../services/RoutingService';
import AIService from '../services/AIService';
import EmergencyService from '../services/EmergencyService';
import DemoService from '../services/DemoService';
import { usePermissions } from '../hooks/usePermissions';
import { useLocation } from '../hooks/useLocation';

const MonitorScreen = ({ onSOS = () => {} }) => {
  const { location: locationGranted } = usePermissions();
  const { location: userLocation } = useLocation();
  const [riskData, setRiskData] = useState({ score: 20, level: 'safe', factors: {} });
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoPhase, setDemoPhase] = useState(0);
  const [demoMessage, setDemoMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize services
  // Initialize services
  const initializeServices = useCallback(async () => {
    try {
      // Initialize sensors
      await SensorService.initialize();
      await SensorService.startAccelerometerTracking();
      await SensorService.startGyroscopeTracking();
      await SensorService.startSoundMonitoring();

      // useLocation hook handles location tracking automatically

      // Start risk monitoring and generate AI predictions
      RiskService.addListener((riskData) => {
        setIsAnalyzing(true);
        setRiskData(riskData);

        // Generate AI prediction based on current data
        const prediction = AIService.getPrediction({
          riskScore: riskData.score,
          routes: routes,
          time: new Date(),
          location: userLocation,
          movement: SensorService.getMovementIntensity?.() || 0,
        });

        setAiPrediction(prediction);
        
        // Brief analyzing state
        setTimeout(() => setIsAnalyzing(false), 500);
      });
      RiskService.startMonitoring();

      // Listen for emergency events
      EmergencyService.addListener((event) => {
        if (event.type === 'sos_triggered') {
          setEmergencyAlert(event.data);
          setShowEmergencyAlert(true);
        } else if (event.type === 'sos_cancelled') {
          setShowEmergencyAlert(false);
        }
      });

      // Initialize emergency service
      await EmergencyService.initialize();
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }, [routes, userLocation]);

  useEffect(() => {
    if (locationGranted) {
      initializeServices();
    }

    return () => {
      RiskService.stopMonitoring();
      SensorService.stopAllTracking();
    };
  }, [locationGranted, initializeServices]);

  // Listen to demo mode events
  useEffect(() => {
    const unsubscribe = DemoService.addListener((event) => {
      if (event.type === 'demo_phase') {
        setDemoPhase(event.phase);
        setDemoMessage(event.message || '');
      } else if (event.type === 'demo_complete') {
        setDemoMode(false);
        setDemoPhase(0);
        setDemoMessage('');
      } else if (event.type === 'demo_stopped') {
        setDemoMode(false);
        setDemoPhase(0);
        setDemoMessage('');
      }
    });
    return unsubscribe;
  }, []);

  // Generate routes when user location updates
  useEffect(() => {
    if (userLocation) {
      const destination = {
        latitude: userLocation.latitude + 0.05,
        longitude: userLocation.longitude + 0.05,
      };

      RoutingService.getAlternativeRoutes(
        userLocation.latitude,
        userLocation.longitude,
        destination.latitude,
        destination.longitude,
        3
      ).then((alternativeRoutes) => {
        setRoutes(alternativeRoutes);
      }).catch((error) => {
        console.error('Error fetching routes:', error);
      });
    }
  }, [userLocation]);

  // Handle SOS button press
  const handleSOS = async () => {
    try {
      await EmergencyService.triggerSOS(
        userLocation,
        riskData,
        'manual'
      );
      onSOS && onSOS(userLocation, riskData);
    } catch (error) {
      console.error('Error triggering SOS:', error);
    }
  };

  // Handle demo mode toggle
  const handleDemoToggle = async () => {
    if (demoMode) {
      // Stop demo
      setDemoMode(false);
      await DemoService.stopDemo();
    } else {
      // Start demo
      setDemoMode(true);
      DemoService.setDemoMode(true);
      await DemoService.startDemo();
    }
  };

  // Get risk gauge color
  const getRiskColor = () => {
    switch (riskData.level) {
      case 'safe':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'high':
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  // Get risk text
  const getRiskText = () => {
    switch (riskData.level) {
      case 'safe':
        return 'Safe Zone';
      case 'medium':
        return 'Caution';
      case 'high':
        return 'High Risk';
      default:
        return 'Safe';
    }
  };

  return (
    <View style={styles.container}>
      {/* Demo Mode Toggle */}
      <View style={styles.demoHeader}>
        <TouchableOpacity
          style={[styles.demoToggle, demoMode && styles.demoToggleActive]}
          onPress={handleDemoToggle}
        >
          <Text style={styles.demoToggleText}>
            {demoMode ? '🎬 DEMO ON' : '🎬 DEMO OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Demo Phase Feedback */}
      {demoMode && demoMessage && (
        <View style={styles.demoPhaseBanner}>
          <Text style={styles.demoPhaseText}>{demoMessage}</Text>
          <Text style={styles.demoPhaseCounter}>
            Phase {demoPhase}/9
          </Text>
        </View>
      )}

      {/* Processing Feedback */}
      {isAnalyzing && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackDot}>●</Text>
          <Text style={styles.feedbackText}>
            Analyzing surroundings…
          </Text>
        </View>
      )}

      {/* AI Companion Banner */}
      <AIPredictionBanner
        prediction={aiPrediction}
        riskScore={riskData.score}
        onDismiss={() => {
          // Optional: handle banner dismissal
        }}
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapComponent
          userLocation={userLocation}
          riskLevel={riskData.level}
          autoCenter={true}
        />
      </View>

      {/* Risk Gauge */}
      <View style={[styles.riskGauge, { backgroundColor: getRiskColor() + '30' }]}>
        <View style={styles.riskInner}>
          <Text style={styles.riskLabel}>RISK LEVEL</Text>
          <Text style={[styles.riskScore, { color: getRiskColor() }]}>
            {riskData.score}%
          </Text>
          <Text style={styles.riskText}>{getRiskText()}</Text>

          {/* Factors */}
          <View style={styles.factorsContainer}>
            <Text style={styles.factorText}>
              🌙 Night: {riskData.factors.nightTime || 0}
            </Text>
            <Text style={styles.factorText}>
              📢 Noise: {riskData.factors.noiseSpikes || 0}
            </Text>
            <Text style={styles.factorText}>
              🚶 Movement: {riskData.factors.noMovement || 0}
            </Text>
            <Text style={styles.factorText}>
              🗺️ Area: {riskData.factors.sparseArea || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Routes & SOS */}
      <ScrollView style={styles.bottomPanel} scrollEventThrottle={16}>
        {/* Route Cards */}
        <View style={styles.routesContainer}>
          <Text style={styles.sectionTitle}>📍 Route Options</Text>
          {routes && routes.length > 0 ? (
            routes.map((route, index) => (
              <RouteCard
                key={route.id || index}
                route={route}
                isSelected={selectedRoute === index}
                onPress={() => {
                  setSelectedRoute(index);
                  console.log(`Selected route: ${route.name} - ${route.distance}m, ${route.duration}s`);
                }}
              />
            ))
          ) : (
            <Text style={styles.noRoutesText}>Loading routes...</Text>
          )}
        </View>

        {/* SOS Button */}
        <SOSButton
          onPress={handleSOS}
          disabled={EmergencyService.sosActive}
        />

        {/* Demo Controls */}
        <View style={styles.demoControls}>
          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: COLORS.danger }]}
            onPress={() => RiskService.simulateRiskIncrease()}
          >
            <Text style={styles.demoButtonText}>⬆️ Risk+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: COLORS.success }]}
            onPress={() => RiskService.simulateRiskDecrease()}
          >
            <Text style={styles.demoButtonText}>⬇️ Risk-</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        visible={showEmergencyAlert}
        alert={emergencyAlert}
        onCancel={() => EmergencyService.cancelSOS()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  mapContainer: {
    flex: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkCard,
  },
  riskGauge: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.darkCard,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  riskInner: {
    alignItems: 'center',
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  riskScore: {
    fontSize: 56,
    fontWeight: '800',
    marginVertical: 12,
    letterSpacing: -1,
  },
  riskText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  factorsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkCard,
  },
  factorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginVertical: 4,
    width: '48%',
    textAlign: 'center',
  },
  bottomPanel: {
    flex: 0.5,
    backgroundColor: COLORS.dark,
    paddingHorizontal: 12,
  },
  routesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  noRoutesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  routeCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  routeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.darkCard + '99',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  routeDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  mockBadge: {
    fontSize: 10,
    color: COLORS.warning,
    marginTop: 8,
    fontStyle: 'italic',
  },
  sosContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  sosSubtext: {
    fontSize: 11,
    color: 'white',
    marginTop: 4,
    fontWeight: '500',
  },
  sosHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  demoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  demoButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  demoButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  demoHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  demoToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignSelf: 'flex-start',
  },
  demoToggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  demoToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  demoPhaseBanner: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  demoPhaseText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  demoPhaseCounter: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  feedbackBanner: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.darkCard,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackDot: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 8,
    animation: 'pulse 1.5s infinite',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    fontStyle: 'italic',
  },
});

export default MonitorScreen;
