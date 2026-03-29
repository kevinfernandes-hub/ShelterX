import { firebaseConfig } from '../config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref, set, push, get, onValue } from 'firebase/database';

let app = null;
let auth = null;
let database = null;
let isFirebaseAvailable = false;

try {
  // Initialize Firebase with real credentials
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  isFirebaseAvailable = true;
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization failed (demo mode):', error.message);
  // Firebase not available - app will run in demo mode
  isFirebaseAvailable = false;
}

// Export Firebase services (may be null if not available)
export { auth, database };
export const getIsFirebaseAvailable = () => isFirebaseAvailable;

/**
 * Initialize Anonymous Auth
 */
export const initializeAuth = async () => {
  if (!isFirebaseAvailable || !auth) {
    console.log('📌 Firebase unavailable - demo mode auth');
    return { uid: 'demo-user-' + Date.now() };
  }
  
  try {
    const result = await signInAnonymously(auth);
    console.log('✅ Firebase Auth initialized:', result.user.uid);
    return result.user;
  } catch (error) {
    console.warn('⚠️ Auth initialization failed:', error.message);
    return { uid: 'demo-user-' + Date.now() };
  }
};

/**
 * Send location data to Firebase Realtime Database
 * @param {string} userId - User ID
 * @param {Object} locationData - { latitude, longitude, timestamp, riskScore, routeInfo }
 */
export const sendLocationData = async (userId, locationData) => {
  if (!isFirebaseAvailable || !database) {
    console.log('📌 Location data (demo):', locationData);
    return true;
  }
  
  try {
    const locationRef = ref(database, `users/${userId}/locations`);
    const newLocationRef = push(locationRef);
    await set(newLocationRef, {
      ...locationData,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn('📌 Error sending location data (demo mode):', error.message);
    return true;
  }
};

/**
 * Send emergency alert to Firebase
 * @param {string} userId - User ID
 * @param {Object} emergencyData - { latitude, longitude, riskScore, reason }
 */
export const sendEmergencyAlert = async (userId, emergencyData) => {
  if (!isFirebaseAvailable || !database) {
    console.log('🚨 EMERGENCY ALERT (demo):', emergencyData);
    return true;
  }
  
  try {
    const emergencyRef = ref(database, `users/${userId}/emergencies`);
    const newEmergencyRef = push(emergencyRef);
    await set(newEmergencyRef, {
      ...emergencyData,
      timestamp: new Date().toISOString(),
      status: 'active',
    });
    console.log('✅ Emergency alert sent:', emergencyData);
    return true;
  } catch (error) {
    console.warn('🚨 Error sending emergency alert (demo mode):', error.message);
    return true;
  }
};

/**
 * Send sensor data to Firebase (for analytics)
 * @param {string} userId - User ID
 * @param {Object} sensorData - { accelerometer, noise, movement }
 */
export const sendSensorData = async (userId, sensorData) => {
  if (!isFirebaseAvailable || !database) {
    console.log('📊 Sensor data (demo):', sensorData);
    return true;
  }
  
  try {
    const sensorRef = ref(database, `users/${userId}/sensors`);
    const newSensorRef = push(sensorRef);
    await set(newSensorRef, {
      ...sensorData,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn('📊 Error sending sensor data (demo mode):', error.message);
    return true;
  }
};

/**
 * Get user profile from Firebase
 * @param {string} userId - User ID
 */
export const getUserProfile = async (userId) => {
  if (!isFirebaseAvailable || !database) {
    console.log('📋 User profile (demo)');
    return { userId, name: 'Demo User', phone: '555-0123' };
  }
  
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    return snapshot.val() || null;
  } catch (error) {
    console.warn('📋 Error getting user profile (demo):', error.message);
    return { userId, name: 'Demo User', phone: '555-0123' };
  }
};

/**
 * Update user profile in Firebase
 * @param {string} userId - User ID
 * @param {Object} profileData - { name, phone, emergencyContacts, etc }
 */
export const updateUserProfile = async (userId, profileData) => {
  if (!isFirebaseAvailable || !database) {
    console.log('📋 Profile updated (demo):', profileData);
    return true;
  }
  
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    await set(userRef, profileData);
    return true;
  } catch (error) {
    console.warn('📋 Error updating profile (demo):', error.message);
    return true;
  }
};

/**
 * Subscribe to user's risk score in real-time
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function when data changes
 */
export const subscribeToRiskScore = (userId, callback) => {
  if (!isFirebaseAvailable || !database) {
    console.log('📊 Risk score subscription (demo)');
    // Simulate demo callback
    callback({ score: 0, level: 'safe' });
    return () => {};
  }
  
  try {
    const riskRef = ref(database, `users/${userId}/currentRisk`);
    const unsubscribe = onValue(riskRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || { score: 0, level: 'safe' });
    });
    return unsubscribe;
  } catch (error) {
    console.warn('📊 Error subscribing to risk score (demo):', error.message);
    return () => {};
  }
};

/**
 * Get recent locations from Firebase
 * @param {string} userId - User ID
 * @param {number} limit - Number of recent locations
 */
export const getRecentLocations = async (userId, limit = 10) => {
  try {
    const locationsRef = ref(database, `users/${userId}/locations`);
    const snapshot = await get(locationsRef);
    let locations = [];

    if (snapshot.exists()) {
      const data = snapshot.val();
      locations = Object.values(data).slice(-limit);
    }

    return locations;
  } catch (error) {
    console.error('Error getting recent locations:', error);
    return [];
  }
};

export default {
  auth,
  database,
  initializeAuth,
  sendLocationData,
  sendEmergencyAlert,
  sendSensorData,
  getUserProfile,
  updateUserProfile,
  subscribeToRiskScore,
  getRecentLocations,
};
