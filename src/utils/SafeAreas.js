/**
 * Predefined safe areas and landmarks across India
 * Format: { name, area, city, lat, lng, safetyScore, description }
 */

export const SAFE_AREAS = [
  // Nagpur
  {
    id: 'civil_lines_nagpur',
    name: 'Civil Lines',
    area: 'Civil Lines',
    city: 'Nagpur',
    lat: 21.1634,
    lng: 79.0842,
    safetyScore: 85,
    description: 'Upscale residential area with good infrastructure',
    icon: '🏛️',
  },
  {
    id: 'sitabardi_nagpur',
    name: 'Sitabardi',
    area: 'Sitabardi',
    city: 'Nagpur',
    lat: 21.1563,
    lng: 79.1076,
    safetyScore: 80,
    description: 'Central area with fort and markets',
    icon: '🏰',
  },
  {
    id: 'dhantoli_nagpur',
    name: 'Dhantoli',
    area: 'Dhantoli',
    city: 'Nagpur',
    lat: 21.1515,
    lng: 79.0751,
    safetyScore: 82,
    description: 'Commercial area near Nagpur',
    icon: '🏬',
  },
  {
    id: 'wardha_road_nagpur',
    name: 'Wardha Road',
    area: 'Wardha Road',
    city: 'Nagpur',
    lat: 21.1401,
    lng: 79.0533,
    safetyScore: 75,
    description: 'Busy commercial corridor',
    icon: '🛣️',
  },
  {
    id: 'ramdaspeth_nagpur',
    name: 'Ramdaspeth',
    area: 'Ramdaspeth',
    city: 'Nagpur',
    lat: 21.1542,
    lng: 79.0919,
    safetyScore: 78,
    description: 'Market area in central Nagpur',
    icon: '🛍️',
  },

  // Pune
  {
    id: 'pimpri_pune',
    name: 'Pimpri',
    area: 'Pimpri',
    city: 'Pune',
    lat: 18.6393,
    lng: 73.8084,
    safetyScore: 82,
    description: 'Industrial area with good connectivity',
    icon: '🏭',
  },
  {
    id: 'chinchwad_pune',
    name: 'Chinchwad',
    area: 'Chinchwad',
    city: 'Pune',
    lat: 18.6349,
    lng: 73.8013,
    safetyScore: 80,
    description: 'Residential and industrial zone',
    icon: '🏘️',
  },
  {
    id: 'hinjewadi_pune',
    name: 'Hinjewadi',
    area: 'Hinjewadi',
    city: 'Pune',
    lat: 18.5912,
    lng: 73.7499,
    safetyScore: 88,
    description: 'IT hub with modern infrastructure',
    icon: '💻',
  },
  {
    id: 'koregaon_park_pune',
    name: 'Koregaon Park',
    area: 'Koregaon Park',
    city: 'Pune',
    lat: 18.5435,
    lng: 73.8732,
    safetyScore: 85,
    description: 'Upscale residential and leisure zone',
    icon: '🌳',
  },
  {
    id: 'viman_nagar_pune',
    name: 'Viman Nagar',
    area: 'Viman Nagar',
    city: 'Pune',
    lat: 18.5681,
    lng: 73.9134,
    safetyScore: 84,
    description: 'Airport area with residential development',
    icon: '✈️',
  },

  // Mumbai
  {
    id: 'bandra_mumbai',
    name: 'Bandra',
    area: 'Bandra',
    city: 'Mumbai',
    lat: 19.0596,
    lng: 72.8295,
    safetyScore: 80,
    description: 'Upscale western Mumbai neighborhood',
    icon: '🌊',
  },
  {
    id: 'powai_mumbai',
    name: 'Powai',
    area: 'Powai',
    city: 'Mumbai',
    lat: 19.0756,
    lng: 72.9051,
    safetyScore: 83,
    description: 'IT hub in eastern Mumbai',
    icon: '💼',
  },
  {
    id: 'dadar_mumbai',
    name: 'Dadar',
    area: 'Dadar',
    city: 'Mumbai',
    lat: 19.0166,
    lng: 72.8479,
    safetyScore: 78,
    description: 'Central residential area',
    icon: '🏙️',
  },

  // Bangalore
  {
    id: 'whitefield_bangalore',
    name: 'Whitefield',
    area: 'Whitefield',
    city: 'Bangalore',
    lat: 12.9698,
    lng: 77.7499,
    safetyScore: 85,
    description: 'IT hub with expat community',
    icon: '🖥️',
  },
  {
    id: 'indiranagar_bangalore',
    name: 'Indiranagar',
    area: 'Indiranagar',
    city: 'Bangalore',
    lat: 12.9716,
    lng: 77.6412,
    safetyScore: 82,
    description: 'Residential hub with cafes and restaurants',
    icon: '☕',
  },

  // Delhi
  {
    id: 'cp_delhi',
    name: 'Connaught Place',
    area: 'Connaught Place',
    city: 'Delhi',
    lat: 28.6328,
    lng: 77.1892,
    safetyScore: 80,
    description: 'Central business district',
    icon: '🏛️',
  },
  {
    id: 'gurgaon_delhi',
    name: 'Gurgaon',
    area: 'Gurgaon',
    city: 'Delhi NCR',
    lat: 28.4595,
    lng: 77.0266,
    safetyScore: 82,
    description: 'Modern corporate hub',
    icon: '🌆',
  },
];

/**
 * Search areas by name (supports partial match and fuzzy search)
 * @param {string} query - Search query
 * @returns {Array} Matching areas
 */
export const searchAreas = (query) => {
  if (!query || query.trim().length === 0) return [];

  const lowerQuery = query.toLowerCase();
  
  return SAFE_AREAS.filter((area) => {
    const nameMatch = area.name.toLowerCase().includes(lowerQuery);
    const areaMatch = area.area.toLowerCase().includes(lowerQuery);
    const cityMatch = area.city.toLowerCase().includes(lowerQuery);
    const descMatch = area.description.toLowerCase().includes(lowerQuery);

    return nameMatch || areaMatch || cityMatch || descMatch;
  });
};

/**
 * Get areas by city
 * @param {string} city - City name
 * @returns {Array} Areas in that city
 */
export const getAreasByCity = (city) => {
  return SAFE_AREAS.filter((area) => 
    area.city.toLowerCase() === city.toLowerCase()
  );
};

/**
 * Get all unique cities
 * @returns {Array} List of cities
 */
export const getCities = () => {
  const cities = new Set(SAFE_AREAS.map((area) => area.city));
  return Array.from(cities).sort();
};

/**
 * Get area by ID
 * @param {string} areaId
 * @returns {Object|null} Area object or null
 */
export const getAreaById = (areaId) => {
  return SAFE_AREAS.find((area) => area.id === areaId) || null;
};

export default {
  SAFE_AREAS,
  searchAreas,
  getAreasByCity,
  getCities,
  getAreaById,
};
