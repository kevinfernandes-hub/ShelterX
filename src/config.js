// Firebase Configuration
export const firebaseConfig = {
  apiKey: 'AIzaSyAzU2QwqjADNgwykEeAECXyJHYrLWTBoCw',
  authDomain: 'shelter-18445.firebaseapp.com',
  projectId: 'shelter-18445',
  storageBucket: 'shelter-18445.firebasestorage.app',
  messagingSenderId: '389931881735',
  appId: '1:389931881735:web:8c001d90615c8a8c67e1a2',
  databaseURL: 'https://shelter-18445-default-rtdb.firebaseio.com',
  measurementId: 'G-YDYVZBJ3KN',
};

// API Keys
// Note: Using mock keys for demo mode
// Replace with your actual API keys for production
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDemoMapsKey_Replace_With_Real_Key';
export const OPENROUTE_SERVICE_API_KEY = 'ORS_DemoKey_Replace_With_Real_Key';

// Risk Thresholds
export const RISK_CONFIG = {
  nightTime: { hour: 21, riskIncrease: 20 }, // 9 PM risk increase
  morningTime: { hour: 6, riskRecovery: 10 }, // 6 AM risk recovery
  noMovementThreshold: 30, // seconds without movement
  noiseSpikeThreshold: 70, // dB
  sparseAreaThreshold: 5000, // meters - area considered sparse
};

// Location Update Intervals
export const LOCATION_CONFIG = {
  updateInterval: 5000, // 5 seconds
  minDistance: 10, // meters
  accuracy: 6, // Best accuracy
};

// Sensor Config
export const SENSOR_CONFIG = {
  accelerometerUpdateInterval: 500, // 0.5 seconds
  soundMeterInterval: 1000, // 1 second
};

// UI Colors
export const COLORS = {
  dark: '#0A0E27',
  darkCard: '#1A1F3A',
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  safe: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  text: '#F3F4F6',
  textSecondary: '#D1D5DB',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Fonts
export const FONTS = {
  regular: 'System',
  semiBold: 'System',
  bold: 'System',
};

// Emergency Contacts (Example)
export const EMERGENCY_CONTACTS = [
  { name: 'Police', number: '911' },
  { name: 'Emergency', number: '911' },
];
