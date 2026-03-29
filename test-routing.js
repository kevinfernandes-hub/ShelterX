// Test script to verify routing system
// Run this in your React Native environment to test

import RoutingService from './src/services/RoutingService';

/**
 * Test the routing system with a sample location
 * Run this to verify:
 * - Routes are REAL API data
 * - Each route has UNIQUE distance & duration
 * - Fallback works if API fails
 */
export const testRoutingSystem = async () => {
  console.log('🧪 ROUTING SYSTEM TEST');
  console.log('=====================\n');

  // Sample coordinates (San Francisco area)
  const startLat = 37.7749;
  const startLon = -122.4194;
  const endLat = 37.7694;
  const endLon = -122.4862;

  console.log('📍 Start Location: 37.7749, -122.4194');
  console.log('📍 End Location: 37.7694, -122.4862\n');

  try {
    console.log('⏳ Fetching routes from Open Route Service API...\n');
    
    const routes = await RoutingService.getAlternativeRoutes(
      startLat,
      startLon,
      endLat,
      endLon,
      3
    );

    console.log('✅ Routes received!\n');
    console.log('IMPORTANT - Verify each route has DIFFERENT values:\n');

    // Check if all routes are unique (the main bug we fixed)
    const distances = routes.map((r) => r.distance);
    const durations = routes.map((r) => r.duration);
    const uniqueDistances = new Set(distances).size;
    const uniqueDurations = new Set(durations).size;

    routes.forEach((route, index) => {
      const km = (route.distance / 1000).toFixed(1);
      const mins = Math.ceil(route.duration / 60);
      console.log(`Route ${index + 1}: ${km}km | ${mins}min`);
      console.log(`  └─ Distance: ${route.distance}m, Duration: ${route.duration}s`);
      console.log(`  └─ Name: ${route.name}`);
      console.log(`  └─ Mock: ${route.isMock ? 'Yes' : 'No (Real API)'}\n`);
    });

    console.log('📊 VERIFICATION:\n');
    console.log(`Total routes: ${routes.length}`);
    console.log(`Unique distance values: ${uniqueDistances}/${routes.length}`);
    console.log(`Unique duration values: ${uniqueDurations}/${routes.length}`);

    // Check if bug is fixed
    if (uniqueDistances === routes.length && uniqueDurations === routes.length) {
      console.log('\n✅ ✅ ✅ BUG FIXED! Each route has UNIQUE values!\n');
    } else {
      console.log('\n❌ WARNING: Routes have duplicate values (bug might still exist)\n');
    }

    // Verify realistic values
    console.log('📏 DISTANCE CHECK:');
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const kmDistance = avgDistance / 1000;
    console.log(`  Average: ${kmDistance.toFixed(1)}km`);
    if (kmDistance >= 1 && kmDistance <= 50) {
      console.log('  ✅ Realistic (1-50 km range)\n');
    } else {
      console.log('  ❌ Unrealistic value\n');
    }

    console.log('⏱️ TIME CHECK:');
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minsDuration = avgDuration / 60;
    console.log(`  Average: ${minsDuration.toFixed(0)}min`);
    if (minsDuration >= 1 && minsDuration <= 60) {
      console.log('  ✅ Realistic (1-60 min range)\n');
    } else {
      console.log('  ❌ Unrealistic value\n');
    }

    // Test formatting functions
    console.log('📝 FORMAT FUNCTION TEST:\n');
    routes.forEach((route, index) => {
      const formatted = `${RoutingService.getDistanceKm(route.distance)}km, ${RoutingService.getTimeMinutes(route.duration)}min`;
      console.log(`Route ${index + 1}: ${formatted}`);
    });

    return {
      success: true,
      routes,
      uniqueDistances,
      uniqueDurations,
    };
  } catch (error) {
    console.error('❌ Error testing routing system:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Usage in your component:
/*
import { testRoutingSystem } from './test-routing';

// In useEffect or button press handler
useEffect(() => {
  testRoutingSystem();
}, []);

// Or in a button
<TouchableOpacity onPress={() => testRoutingSystem()}>
  <Text>Run Routing Test</Text>
</TouchableOpacity>
*/

export default testRoutingSystem;
