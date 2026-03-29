# ANTIGRAVITY Safety App

A comprehensive real-time safety monitoring and emergency response application built with React Native and Expo.

## Features

### 🎯 Core Functionality
- **Real-time Location Tracking** - GPS-based location monitoring with caching
- **Risk Assessment Engine** - Weighted sensor-based risk scoring algorithm  
- **AI Companion System** - Intelligent safety predictions and warnings
- **Emergency SOS System** - Manual trigger + auto-detection (shake, fall, no-movement)
- **Multiple Route Options** - Open Route Service integration with fallback routes
- **Ambient Monitoring** - Accelerometer, gyroscope, and sound level tracking

### 🎨 User Interface
- Premium dark theme with smooth animations
- Real-time risk indicator with color-coded warnings
- Interactive route selection with distance/ETA
- Emergency alert modal with 10-second cancellation window
- AI prediction banner with auto-dismiss
- Demo mode for testing complete safety scenarios

### 📱 Platform Support
- **iOS** - Full native support with platform-specific optimizations
- **Android** - Complete integration with all sensors
- **Web** - Responsive design with graceful fallbacks

## Project Structure

```
src/
├── services/           # Core business logic
│   ├── LocationService.js    # GPS tracking
│   ├── RiskService.js        # Risk calculation engine
│   ├── AIService.js          # Predictions & warnings
│   ├── EmergencyService.js   # SOS & auto-triggers
│   ├── RoutingService.js     # Navigation & routes
│   ├── SensorService.js      # Sensor monitoring
│   ├── DemoService.js        # Demo orchestration
│   └── firebase.js           # Firebase integration
├── hooks/              # React hooks
│   ├── useLocation.js
│   ├── useRisk.js
│   └── usePermissions.js
├── components/         # Reusable UI components
│   ├── SOSButton.js
│   ├── RouteCard.js
│   ├── AIPredictionBanner.js
│   ├── EmergencyAlertModal.js
│   └── MapComponent.js
├── screens/            # Main app screens
│   └── MonitorScreen.js
└── utils/              # Utilities
    ├── format.js
    └── AnimationUtils.js
```

## Getting Started

### Prerequisites
- Node.js & npm
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Open in:
# - Press 'w' for web browser
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app
```

## Configuration

### Firebase Setup
Update `src/config.js` with your Firebase credentials:

```javascript
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### API Keys
Configure in `src/config.js`:
- `GOOGLE_MAPS_API_KEY` - For Google Maps routing (optional)
- `OPENROUTE_SERVICE_API_KEY` - For Open Route Service directions

## Key Services

### Risk Engine
Monitors multiple factors:
- **Sensor Data**: Accelerometer magnitude, movement intensity
- **Environmental**: Sound levels, time of day, location type
- **User State**: No-movement duration, fall detection
- **Weighted Algorithm**: Combines factors with smoothing

### AI Companion
Provides intelligent warnings based on:
- Risk score escalation patterns
- Location safety assessment
- Time-based risk factors
- Personalized thresholds

### Emergency System
- **Manual SOS**: One-tap emergency alert
- **Shake Detection**: Triggers on sudden motion (>30 m/s²)
- **Fall Detection**: High acceleration + stillness combo
- **No-Movement**: Auto-trigger after 30s at high risk
- **5-Second Debounce**: Prevents rapid re-triggers

## Technologies

- **React Native** - Cross-platform mobile UI
- **Expo** - Development platform & SDK
- **Firebase** - Real-time database & auth
- **React Navigation** - App routing
- **Expo Sensors** - Accelerometer/Gyroscope
- **Expo Location** - GPS tracking
- **Axios** - API calls

## Testing

### Demo Mode
Click the 🎬 button to run a 60-second automated demo showing:
1. Location establishment
2. Risk escalation (20% → 85%)
3. AI companion warnings
4. Route fetching
5. Shake detection trigger
6. Auto SOS activation

### Manual Testing
1. **Manual SOS**: Long-press SOS button
2. **Cancel SOS**: Tap dismiss within 10 seconds
3. **Route Selection**: Tap a route to update navigation
4. **Risk Monitoring**: Watch real-time risk score changes

## Performance Optimizations

- ✅ Event debouncing (3-5 second windows)
- ✅ Location update batching (5-second intervals)
- ✅ Sensor polling optimization
- ✅ Smooth 60fps animations
- ✅ Graceful API fallbacks
- ✅ Memory-efficient listeners

## Firebase Integration

### Real-time Features
- Location sync to `users/{userId}/locations`
- Emergency alerts to `users/{userId}/emergencies`
- Risk scores to `users/{userId}/currentRisk`
- Sensor data to `users/{userId}/sensors`

### Authentication
- Anonymous auth for demo
- Replaceable with custom auth flow

## Production Checklist

- [ ] Update Firebase credentials
- [ ] Configure API keys (Google Maps, ORS)
- [ ] Set up push notifications
- [ ] Add custom SOS sound asset
- [ ] Configure emergency contacts
- [ ] Set up error reporting (Sentry, etc.)
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Privacy policy & terms

## Troubleshooting

### Sensors Not Working
- Ensure location permissions granted
- Check device supports accelerometer/gyroscope
- Restart Expo dev server with `r`

### Routes Not Fetching
- Verify API keys configured
- Check network connectivity
- Fallback demo routes will load automatically

### Firebase Errors
- Confirm database URL format
- Check Firebase project settings
- Verify authentication enabled

## License

MIT - See LICENSE file

## Support

For issues and questions:
- Check existing GitHub issues
- Review documentation in docs/
- Contact development team

## Authors

Built with ❤️ for safety

---

**Status**: Production Ready ✅
**Version**: 1.0.0
**Last Updated**: March 2026

- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
=======
# ShelterX
>>>>>>> 60836486457a9bb751d19f20da5fd86137c26b40
