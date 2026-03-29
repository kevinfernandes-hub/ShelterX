/**
 * AntiGravityService - Implements complete anti-gravity routing logic
 * 
 * Flow:
 * 1. Get user source location
 * 2. Get nearby places (candidates)
 * 3. Classify into safe (attractors) vs unsafe (repellers)
 * 4. Choose best destination
 * 5. Get routes to destination
 * 6. Apply anti-gravity scoring (avoid unsafe, prefer safe)
 * 7. Select and return best route
 */

import RoutingService from './RoutingService';
import { calculateDistance, sampleRoutePoints, calculateDistanceKm } from '../utils/DistanceUtils';
import { classifyPlaces, chooseBestDestination, getMockNearbyPlaces } from '../utils/PlaceClassifier';

class AntiGravityService {
  constructor() {
    this.listeners = [];
    this.lastAnalysis = null;
  }

  /**
   * Complete anti-gravity routing analysis
   * @param {Object} userLocation - { latitude, longitude }
   * @param {Array} nearbyPlaces - Array of places (or null to use mock)
   * @param {Object} options - { radiusKm, strategy, weights }
   * @returns {Promise<Object>} Complete routing analysis
   */
  analyzeAntiGravityRoute = async (userLocation, nearbyPlaces = null, options = {}) => {
    const {
      radiusKm = 5,
      strategy = 'nearest',
      weights = {},
    } = options;

    const defaultWeights = {
      unsafeRepulsion: 3,
      safeAttraction: 2,
      distanceFalloff: 2,
      epsilon: 100, // Avoid division by zero
    };

    const finalWeights = { ...defaultWeights, ...weights };

    try {
      // Step 1: Get source
      const source = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };

      // Step 2: Discover nearby places
      const places = nearbyPlaces || getMockNearbyPlaces(source.lat, source.lng, radiusKm);

      // Step 3: Classify places
      const { safePlaces, unsafePlaces } = classifyPlaces(places);

      // Step 4: Choose destination
      const destination = chooseBestDestination(safePlaces, source.lat, source.lng, strategy);

      if (!destination) {
        return {
          success: false,
          error: 'No safe destination found',
          analysis: null,
        };
      }

      // Step 5: Get routes to destination
      const routes = await RoutingService.getAlternativeRoutes(
        source.lat,
        source.lng,
        destination.lat,
        destination.lng,
        3
      );

      if (!routes || routes.length === 0) {
        return {
          success: false,
          error: 'No routes found to destination',
          analysis: null,
        };
      }

      // Step 6: Apply anti-gravity scoring to each route
      const scoredRoutes = routes.map((route) =>
        this.scoreRouteWithAntiGravity(route, source, unsafePlaces, safePlaces, finalWeights)
      );

      // Sort by safety score descending
      scoredRoutes.sort((a, b) => b.safetyScore - a.safetyScore);

      // Step 7: Select best route
      const selectedRoute = scoredRoutes[0];

      // Build analysis result
      const analysis = {
        source,
        destination: {
          name: destination.name,
          type: destination.type,
          lat: destination.lat,
          lng: destination.lng,
          safetyScore: destination.safetyScore,
          icon: destination.icon,
        },
        places: {
          total: places.length,
          safe: safePlaces.length,
          unsafe: unsafePlaces.length,
        },
        routes: scoredRoutes,
        selectedRoute,
        summary: {
          message: `Routing from your location to ${destination.name} while avoiding ${unsafePlaces.length} high-risk areas.`,
          safetyLevel: this.getRiskLevel(selectedRoute.safetyScore),
          recommendedRoute: selectedRoute.name,
        },
      };

      this.lastAnalysis = analysis;
      this.notifyListeners(analysis);

      return {
        success: true,
        analysis,
      };
    } catch (error) {
      console.error('Error in anti-gravity routing:', error);
      return {
        success: false,
        error: error.message,
        analysis: null,
      };
    }
  };

  /**
   * Score a single route with anti-gravity algorithm
   * @param {Object} route - Route with coordinates
   * @param {Object} source - Source location
   * @param {Array} unsafePlaces - Places to avoid
   * @param {Array} safePlaces - Safe landmarks
   * @param {Object} weights - Scoring weights
   * @returns {Object} Route with populated safetyScore
   */
  scoreRouteWithAntiGravity = (route, source, unsafePlaces, safePlaces, weights) => {
    if (!route.geometry || !route.geometry.coordinates) {
      return { ...route, safetyScore: 50, riskFactors: {} };
    }

    // Sample points along the route
    const sampledPoints = sampleRoutePoints(route.geometry.coordinates, 100);

    let totalPenalty = 0;
    let totalReward = 0;
    const riskFactors = {};

    // Apply unsafe place repulsion
    unsafePlaces.forEach((unsafePlace) => {
      let maxPenalty = 0;

      sampledPoints.forEach((point) => {
        const distance = calculateDistance(point.lat, point.lng, unsafePlace.lat, unsafePlace.lng);
        const unsafeRisk = 100 - (unsafePlace.safetyScore || 50);

        // Penalty formula: risk / (distance^2 + epsilon)
        const penalty = (unsafeRisk * weights.unsafeRepulsion) / (Math.pow(distance / 1000, 2) + weights.epsilon);

        maxPenalty = Math.max(maxPenalty, penalty);
      });

      totalPenalty += maxPenalty;
    });

    // Apply safe place attraction
    safePlaces.slice(0, 5).forEach((safePlace) => {
      let maxReward = 0;

      sampledPoints.forEach((point) => {
        const distance = calculateDistance(point.lat, point.lng, safePlace.lat, safePlace.lng);
        const safeScore = safePlace.safetyScore || 75;

        // Reward formula: safety / (distance^2 + epsilon)
        const reward = (safeScore * weights.safeAttraction) / (Math.pow(distance / 1000, 2) + weights.epsilon);

        maxReward = Math.max(maxReward, reward);
      });

      totalReward += maxReward;
    });

    // Base safety score (70 = baseline route safety)
    const baseSafety = 70;

    // Final safety score: base - penalties + rewards, normalized to 0-100
    const rawScore = baseSafety - totalPenalty + totalReward;
    const safetyScore = Math.max(0, Math.min(100, rawScore));

    riskFactors.unsafeLocations = Math.round(totalPenalty);
    riskFactors.safeLocations = Math.round(totalReward);
    riskFactors.routeLength = Math.round((route.distance || 0) / 1000); // km
    riskFactors.routeDuration = Math.round((route.duration || 0) / 60); // minutes

    return {
      ...route,
      safetyScore: Math.round(safetyScore),
      riskLevel: this.getRiskLevel(safetyScore),
      riskFactors,
      sampledPointsCount: sampledPoints.length,
    };
  };

  /**
   * Get risk level text based on safety score
   * @param {number} score - Safety score 0-100
   * @returns {string} Risk level
   */
  getRiskLevel = (score) => {
    if (score >= 80) return 'very_safe';
    if (score >= 65) return 'safe';
    if (score >= 50) return 'moderate';
    if (score >= 35) return 'risky';
    return 'very_risky';
  };

  /**
   * Get risk level icon and color
   * @param {number} score - Safety score 0-100
   * @returns {Object} { icon, color, text }
   */
  getRiskLevelUI = (score) => {
    const level = this.getRiskLevel(score);
    const levels = {
      very_safe: { icon: '🟢', color: '#10B981', text: 'Very Safe' },
      safe: { icon: '🟢', color: '#10B981', text: 'Safe' },
      moderate: { icon: '🟡', color: '#F59E0B', text: 'Moderate' },
      risky: { icon: '🔴', color: '#EF4444', text: 'Risky' },
      very_risky: { icon: '🔴', color: '#DC2626', text: 'Very Risky' },
    };
    return levels[level];
  };

  /**
   * Add event listener
   * @param {Function} listener
   */
  addListener = (listener) => {
    this.listeners.push(listener);
  };

  /**
   * Remove event listener
   * @param {Function} listener
   */
  removeListener = (listener) => {
    this.listeners = this.listeners.filter((l) => l !== listener);
  };

  /**
   * Notify all listeners
   * @param {Object} data
   */
  notifyListeners = (data) => {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in anti-gravity listener:', error);
      }
    });
  };

  /**
   * Get last analysis
   * @returns {Object|null}
   */
  getLastAnalysis = () => {
    return this.lastAnalysis;
  };
}

export default new AntiGravityService();
