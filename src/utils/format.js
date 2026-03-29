/**
 * Format utilities for displaying distances, times, and other values
 */

/**
 * Convert meters to formatted kilometers string
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string (e.g., "2.5 km")
 */
export const formatDistance = (meters) => {
  if (!meters || meters < 0) return '0 km';
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
};

/**
 * Convert seconds to formatted time string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "12 min")
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0 min';
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 1) return '<1 min';
  return `${minutes} min`;
};

/**
 * Get risk level badge based on distance and time
 * @param {number} distance - Distance in meters
 * @param {number} duration - Duration in seconds
 * @returns {string} Risk level: 'safe', 'medium', 'high'
 */
export const getRiskLevelForRoute = (distance, duration) => {
  const distanceKm = distance / 1000;
  const minutesDuration = duration / 60;

  // Distance/time ratio indicator
  const ratio = distanceKm / (minutesDuration / 60);
  const avgSpeed = ratio;

  // Routes with very low or very high speeds are riskier
  if (avgSpeed < 20 || avgSpeed > 100) {
    return 'high';
  }

  if (distanceKm > 15 && minutesDuration > 30) {
    return 'medium';
  }

  return 'safe';
};

/**
 * Get badge text and color for route risk level
 * @param {string} level - Risk level: 'safe', 'medium', 'high'
 * @returns {object} Badge text and color
 */
export const getRiskBadge = (level) => {
  const badges = {
    safe: {
      text: '✓ Safe',
      emoji: '🟢',
      color: '#10B981',
    },
    medium: {
      text: '⚠ Medium',
      emoji: '🟡',
      color: '#F59E0B',
    },
    high: {
      text: '⚠ High',
      emoji: '🔴',
      color: '#EF4444',
    },
  };

  return badges[level] || badges.medium;
};

export default {
  formatDistance,
  formatTime,
  getRiskLevelForRoute,
  getRiskBadge,
};
