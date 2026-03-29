import { useState, useEffect } from 'react';
import RiskService from '../services/RiskService';

/**
 * Custom hook to manage real-time risk calculation
 * Combines location, sensor data, and time factors
 */
export const useRisk = () => {
  const [riskData, setRiskData] = useState({
    score: 20, // Start at baseline safe
    level: 'safe',
    factors: {
      nightTime: 0,
      noiseSpikes: 0,
      noMovement: 0,
      sparseArea: 0,
      isolated: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Start risk monitoring
      RiskService.startMonitoring();

      // Subscribe to risk updates
      const handleRiskUpdate = (updatedRiskData) => {
        setRiskData(updatedRiskData);
        setLoading(false);
      };

      RiskService.addListener(handleRiskUpdate);

      // Cleanup
      return () => {
        RiskService.removeListener(handleRiskUpdate);
        RiskService.stopMonitoring();
      };
    } catch (err) {
      console.error('Error in useRisk hook:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return {
    ...riskData,
    loading,
    error,
  };
};

export default useRisk;
