/**
 * Place classification and destination selection for anti-gravity routing
 */

/**
 * Predefined place types and their safety scores
 */
const PLACE_SAFETY_PROFILES = {
  // Safe destinations (high safety scores)
  hospital: { category: 'safe', baseScore: 95, icon: '🏥' },
  'police-station': { category: 'safe', baseScore: 92, icon: '🚔' },
  fire_station: { category: 'safe', baseScore: 90, icon: '🚒' },
  school: { category: 'safe', baseScore: 85, icon: '🎓' },
  library: { category: 'safe', baseScore: 85, icon: '📚' },
  government_office: { category: 'safe', baseScore: 85, icon: '🏛️' },
  shopping_mall: { category: 'safe', baseScore: 80, icon: '🛍️' },
  supermarket: { category: 'safe', baseScore: 80, icon: '🏬' },
  restaurant: { category: 'safe', baseScore: 75, icon: '🍽️' },
  cafe: { category: 'safe', baseScore: 75, icon: '☕' },
  hotel: { category: 'safe', baseScore: 75, icon: '🏨' },
  metro_station: { category: 'safe', baseScore: 80, icon: '🚇' },
  bus_station: { category: 'safe', baseScore: 75, icon: '🚌' },
  park: { category: 'moderate', baseScore: 60, icon: '🌳' },
  
  // Unsafe/risky places (low safety scores)
  bar: { category: 'unsafe', baseScore: 40, icon: '🍺' },
  nightclub: { category: 'unsafe', baseScore: 35, icon: '🍷' },
  liquor_store: { category: 'unsafe', baseScore: 45, icon: '🥃' },
  casino: { category: 'unsafe', baseScore: 40, icon: '🎰' },
  adult_entertainment: { category: 'unsafe', baseScore: 25, icon: '⛔' },
  
  // Neutral/moderate
  parking: { category: 'moderate', baseScore: 65, icon: '🅿️' },
  atm: { category: 'moderate', baseScore: 65, icon: '🏧' },
  gym: { category: 'moderate', baseScore: 70, icon: '💪' },
  mosque: { category: 'safe', baseScore: 85, icon: '🕌' },
  temple: { category: 'safe', baseScore: 85, icon: '🛕' },
  church: { category: 'safe', baseScore: 85, icon: '⛪' },
};

/**
 * Get safety profile for a place type
 * @param {string} placeType
 * @returns {Object} Profile with category, baseScore, icon
 */
export const getPlaceSafetyProfile = (placeType) => {
  if (!placeType) return { category: 'moderate', baseScore: 50, icon: '📍' };
  
  const normalized = placeType.toLowerCase().replace(/\s+/g, '_');
  return PLACE_SAFETY_PROFILES[normalized] || { category: 'moderate', baseScore: 50, icon: '📍' };
};

/**
 * Classify places into safe (anchors) vs unsafe (repellers)
 * @param {Array} places - Array of place objects with lat, lng, type, name, safetyScore
 * @returns {Object} { safePlaces, unsafePlaces, moderatePlaces }
 */
export const classifyPlaces = (places) => {
  const safePlaces = [];
  const unsafePlaces = [];
  const moderatePlaces = [];

  places.forEach((place) => {
    const profile = getPlaceSafetyProfile(place.type);
    const safetyScore = place.safetyScore || profile.baseScore;

    const enrichedPlace = {
      ...place,
      safetyScore,
      category: profile.category,
      icon: profile.icon,
    };

    if (profile.category === 'safe' && safetyScore >= 75) {
      safePlaces.push(enrichedPlace);
    } else if (profile.category === 'unsafe' || safetyScore < 55) {
      unsafePlaces.push(enrichedPlace);
    } else {
      moderatePlaces.push(enrichedPlace);
    }
  });

  return { safePlaces, unsafePlaces, moderatePlaces };
};

/**
 * Score a destination based on safety and distance
 * @param {Object} place - Place object with lat, lng, safetyScore
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {number} distanceWeight - Weight for distance (default 2)
 * @returns {number} Destination score (higher is better)
 */
export const calculateDestinationScore = (
  place,
  userLat,
  userLng,
  distanceWeight = 2
) => {
  if (!place || !place.lat || !place.lng) return 0;

  // Import here to avoid circular dependency
  const { calculateDistanceKm } = require('./DistanceUtils');
  
  const distanceKm = calculateDistanceKm(userLat, userLng, place.lat, place.lng);
  const safetyComponent = place.safetyScore || 75;
  const distancePenalty = distanceWeight * (distanceKm || 0);

  return Math.max(0, safetyComponent - distancePenalty);
};

/**
 * Select the best destination from safe places
 * @param {Array} safePlaces - Array of safe place objects
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {string} strategy - 'nearest' (default) or 'safest'
 * @returns {Object|null} Best destination place or null
 */
export const chooseBestDestination = (safePlaces, userLat, userLng, strategy = 'nearest') => {
  if (!safePlaces || safePlaces.length === 0) return null;

  const { calculateDistanceKm } = require('./DistanceUtils');

  if (strategy === 'safest') {
    // Choose the safest place, with distance as secondary factor
    return safePlaces.reduce((best, current) => {
      const currentScore = calculateDestinationScore(current, userLat, userLng, 1);
      const bestScore = calculateDestinationScore(best, userLat, userLng, 1);
      return currentScore > bestScore ? current : best;
    });
  } else {
    // strategy === 'nearest' (default)
    return safePlaces.reduce((best, current) => {
      const currentDist = calculateDistanceKm(userLat, userLng, current.lat, current.lng);
      const bestDist = calculateDistanceKm(userLat, userLng, best.lat, best.lng);
      return currentDist < bestDist ? current : best;
    });
  }
};

/**
 * Mock nearby places generator (for testing)
 * In production, integrate with Places API
 * @param {number} centerLat
 * @param {number} centerLng
 * @param {number} radiusKm
 * @returns {Array} Mock places around the center
 */
export const getMockNearbyPlaces = (centerLat, centerLng, radiusKm = 5) => {
  const mockTypes = [
    'hospital', 'police-station', 'fire_station', 'shopping_mall',
    'supermarket', 'restaurant', 'bar', 'nightclub', 'park',
    'metro_station', 'bus_station', 'school', 'library'
  ];

  return mockTypes.map((type, idx) => {
    const angle = (idx / mockTypes.length) * Math.PI * 2;
    const distance = radiusKm * (0.3 + Math.random() * 0.7);
    
    const latOffset = (distance / 111) * Math.cos(angle);
    const lngOffset = (distance / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

    return {
      id: `mock_${type}_${idx}`,
      name: `${type.replace('_', ' ').toUpperCase()} #${idx + 1}`,
      type,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      safetyScore: 50 + Math.random() * 50,
      distance: distance * 1000,
    };
  });
};

export default {
  PLACE_SAFETY_PROFILES,
  getPlaceSafetyProfile,
  classifyPlaces,
  calculateDestinationScore,
  chooseBestDestination,
  getMockNearbyPlaces,
};
