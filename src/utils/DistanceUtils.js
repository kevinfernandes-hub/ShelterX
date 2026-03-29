/**
 * Distance and location utilities for anti-gravity routing
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

/**
 * Calculate distance in kilometers
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  return calculateDistance(lat1, lng1, lat2, lng2) / 1000;
};

/**
 * Sample points along a route at regular intervals
 * @param {Array} coordinates - Array of [lng, lat] pairs from GeoJSON
 * @param {number} intervalMeters - Sampling interval in meters
 * @returns {Array} Sampled points as {lat, lng, distanceFromStart}
 */
export const sampleRoutePoints = (coordinates, intervalMeters = 100) => {
  if (!coordinates || coordinates.length < 2) return [];

  const sampledPoints = [];
  let totalDistance = 0;
  let sampledDistance = 0;

  // Sample first point
  sampledPoints.push({
    lat: coordinates[0][1],
    lng: coordinates[0][0],
    distanceFromStart: 0,
  });

  // Iterate through coordinates
  for (let i = 1; i < coordinates.length; i++) {
    const [lng1, lat1] = coordinates[i - 1];
    const [lng2, lat2] = coordinates[i];

    const segmentDistance = calculateDistance(lat1, lng1, lat2, lng2);
    totalDistance += segmentDistance;

    // Sample points along this segment if distance exceeds interval
    while (sampledDistance + intervalMeters < totalDistance) {
      sampledDistance += intervalMeters;

      // Linear interpolation along segment
      const ratio = (sampledDistance - (totalDistance - segmentDistance)) / segmentDistance;
      const interpLat = lat1 + ratio * (lat2 - lat1);
      const interpLng = lng1 + ratio * (lng2 - lng1);

      sampledPoints.push({
        lat: interpLat,
        lng: interpLng,
        distanceFromStart: sampledDistance,
      });
    }
  }

  // Sample last point
  const lastPoint = coordinates[coordinates.length - 1];
  sampledPoints.push({
    lat: lastPoint[1],
    lng: lastPoint[0],
    distanceFromStart: totalDistance,
  });

  return sampledPoints;
};

/**
 * Calculate bearing between two points
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Bearing in degrees (0-360)
 */
export const calculateBearing = (lat1, lng1, lat2, lng2) => {
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

/**
 * Check if point is within radius
 * @param {number} centerLat
 * @param {number} centerLng
 * @param {number} pointLat
 * @param {number} pointLng
 * @param {number} radiusMeters
 * @returns {boolean}
 */
export const isWithinRadius = (centerLat, centerLng, pointLat, pointLng, radiusMeters) => {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusMeters;
};

export default {
  calculateDistance,
  calculateDistanceKm,
  sampleRoutePoints,
  calculateBearing,
  isWithinRadius,
};
