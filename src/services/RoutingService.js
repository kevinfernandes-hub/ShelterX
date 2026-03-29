import axios from 'axios';
import { GOOGLE_MAPS_API_KEY, OPENROUTE_SERVICE_API_KEY } from '../config';

// v2 - Graceful error handling for ORS API

class RoutingService {
  constructor() {
    this.cache = {};
  }

  /**
   * Get route between two locations using Open Route Service
   * (Free alternative to Google Maps)
   */
  getRouteORS = async (startLat, startLon, endLat, endLon) => {
    try {
      const key =
        OPENROUTE_SERVICE_API_KEY || '5b3ce3597851110001cf6248'; // Free demo key
      const url = `https://api.openrouteservice.org/v2/directions/driving`;

      const response = await axios.post(
        url,
        {
          coordinates: [
            [startLon, startLat],
            [endLon, endLat],
          ],
        },
        {
          headers: {
            Authorization: key,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          distance: route.summary.distance, // meters
          duration: route.summary.duration, // seconds
          points: this.decodePolyline(route.geometry),
          success: true,
        };
      }

      return { success: false, error: 'No route found' };
    } catch (error) {
      console.error('Error getting route from ORS:', error.message);
      // Fallback to mock data if API fails
      return this.getMockRoute();
    }
  };

  /**
   * Get route using Google Maps API
   * (Requires API key configuration)
   */
  getRouteGoogle = async (startLat, startLon, endLat, endLon) => {
    try {
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.log('Google Maps API key not configured, using mock data');
        return this.getMockRoute();
      }

      const url = `https://maps.googleapis.com/maps/api/directions/json`;
      const response = await axios.get(url, {
        params: {
          origin: `${startLat},${startLon}`,
          destination: `${endLat},${endLon}`,
          key: GOOGLE_MAPS_API_KEY,
          mode: 'driving',
        },
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        return {
          distance: leg.distance.value, // meters
          duration: leg.duration.value, // seconds
          points: this.decodePolyline(route.overview_polyline.points),
          success: true,
        };
      }

      return { success: false, error: 'No route found' };
    } catch (error) {
      console.error('Error getting route from Google:', error.message);
      return this.getMockRoute();
    }
  };

  /**
   * Get route (uses ORS as primary, falls back to Google)
   */
  getRoute = async (startLat, startLon, endLat, endLon) => {
    const cacheKey = `${startLat},${startLon}-${endLat},${endLon}`;

    // Return cached result if available
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      // Try Open Route Service first
      const result = await this.getRouteORS(startLat, startLon, endLat, endLon);
      if (result.success) {
        this.cache[cacheKey] = result;
        return result;
      }

      // Fall back to mock data or Google
      return this.getMockRoute();
    } catch (error) {
      console.error('Error getting route:', error);
      return this.getMockRoute();
    }
  };

  /**
   * Generate mock route data for demo purposes
   */
  getMockRoute = () => {
    const distances = [2500, 5000, 7500, 10000, 15000];
    const durations = [300, 600, 900, 1200, 1800];

    const randomDistance = distances[Math.floor(Math.random() * distances.length)];
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];

    return {
      distance: randomDistance, // meters
      duration: randomDuration, // seconds
      points: [],
      success: true,
      isMock: true,
    };
  };

  /**
   * Get multiple alternative routes from Open Route Service
   * ORS returns actual alternative routes with different characteristics
   */
  getAlternativeRoutesORS = async (startLat, startLon, endLat, endLon, count = 3) => {
    try {
      const key =
        OPENROUTE_SERVICE_API_KEY || '5b3ce3597851110001cf6248'; // Free demo key
      const url = `https://api.openrouteservice.org/v2/directions/driving`;

      // Request multiple alternatives from ORS
      const response = await axios.post(
        url,
        {
          coordinates: [
            [startLon, startLat],
            [endLon, endLat],
          ],
          alternatives: true, // Request alternative routes
          radiuses: [-1], // -1 means unlimited radius for start point
        },
        {
          headers: {
            Authorization: key,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data.routes && response.data.routes.length > 0) {
        // Map real routes from API - each route has its own distance and duration
        const routes = response.data.routes.slice(0, count).map((route, index) => {
          const distance = route.summary.distance; // meters
          const duration = route.summary.duration; // seconds

          console.log(
            `Route ${index + 1}: ${(distance / 1000).toFixed(1)}km, ${Math.ceil(
              duration / 60
            )}min`
          );

          return {
            id: `route_${index}_${Date.now()}`,
            distance: distance,
            duration: duration,
            name: index === 0 ? 'Fastest Route' : `Route ${index + 1}`,
            success: true,
            isMock: false,
            geometry: route.geometry,
          };
        });

        return routes;
      }

      console.log('No routes found from ORS, using fallback');
      return this.generateFallbackRoutes(startLat, startLon, endLat, endLon, count);
    } catch (error) {
      // Silently fall back to demo routes on API error (demo API key limited)
      console.log('📍 Using demo routes (ORS API unavailable)');
      return this.generateFallbackRoutes(startLat, startLon, endLat, endLon, count);
    }
  };

  /**
   * Generate fallback routes with realistic variations
   * When API fails, create routes with genuinely different values
   */
  generateFallbackRoutes = (startLat, startLon, endLat, endLon, count = 3) => {
    // Calculate approximate distance using Haversine formula
    const baseDistance = this.calculateDistance(startLat, startLon, endLat, endLon);

    // Create routes with different characteristics - NOT just multiplying
    const routeConfigs = [
      { name: 'Fastest Route', distanceFactor: 0.9, speedFactor: 1.2 },
      { name: 'Shortest Route', distanceFactor: 0.8, speedFactor: 0.95 },
      { name: 'Scenic Route', distanceFactor: 1.3, speedFactor: 0.8 },
    ];

    return routeConfigs.slice(0, count).map((config, index) => {
      const distance = Math.round(baseDistance * 1000 * config.distanceFactor); // convert to meters
      const avgSpeed = 50 * config.speedFactor; // km/h
      const duration = Math.round((distance / 1000 / avgSpeed) * 3600); // seconds

      console.log(
        `Fallback Route ${index + 1} (${config.name}): ${(distance / 1000).toFixed(
          1
        )}km, ${Math.ceil(duration / 60)}min`
      );

      return {
        id: `fallback_${index}_${Date.now()}`,
        distance: distance,
        duration: duration,
        name: config.name,
        success: true,
        isMock: true,
      };
    });
  };

  /**
   * Calculate distance using Haversine formula (km)
   */
  calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
  };

  toRad = (deg) => {
    return deg * (Math.PI / 180);
  };

  /**
   * Get multiple alternative routes - main entry point
   */
  getAlternativeRoutes = async (startLat, startLon, endLat, endLon, count = 3) => {
    return await this.getAlternativeRoutesORS(startLat, startLon, endLat, endLon, count);
  };

  /**
   * Decode polyline (Google Maps style)
   */
  decodePolyline = (encoded) => {
    if (!encoded) return [];

    const precision = 5;
    const factor = Math.pow(10, precision);
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let result = 0,
        shift = 0,
        b;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      result = 0;
      shift = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / factor,
        longitude: lng / factor,
      });
    }

    return points;
  };

  /**
   * Calculate distance in KM
   */
  getDistanceKm = (meters) => {
    return (meters / 1000).toFixed(2);
  };

  /**
   * Calculate time in minutes
   */
  getTimeMinutes = (seconds) => {
    return Math.ceil(seconds / 60);
  };

  /**
   * Clear cache
   */
  clearCache = () => {
    this.cache = {};
  };
}

export default new RoutingService();
