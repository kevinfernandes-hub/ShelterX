import { RISK_CONFIG } from '../config';
import LocationService from './LocationService';
import SensorService from './SensorService';

class RiskService {
  constructor() {
    this.riskScore = 20; // Starting at 20 (baseline safe)
    this.previousRiskScore = 20; // For smoothing
    this.riskLevel = 'safe'; // safe, medium, high
    this.riskFactors = {
      nightTime: 0,
      noiseSpikes: 0,
      noMovement: 0,
      sparseArea: 0,
      isolated: 0,
    };
    this.previousLocation = null;
    this.lastMovementTime = Date.now();
    this.noMovementCounter = 0; // Track duration of no movement
    this.listeners = [];
    this.updateInterval = 3000; // Update every 3 seconds
    this.riskIntervalId = null;
    this.smoothingFactor = 0.7; // 70% previous, 30% new (smooth transitions)
  }

  /**
   * Start risk monitoring
   */
  startMonitoring = () => {
    try {
      // Clear any existing interval
      if (this.riskIntervalId) {
        clearInterval(this.riskIntervalId);
      }

      // Update risk score periodically
      this.riskIntervalId = setInterval(() => {
        this.updateRiskScore();
      }, this.updateInterval);

      console.log('Risk monitoring started');
    } catch (error) {
      console.error('Error starting risk monitoring:', error);
    }
  };

  /**
   * Stop risk monitoring
   */
  stopMonitoring = () => {
    if (this.riskIntervalId) {
      clearInterval(this.riskIntervalId);
      this.riskIntervalId = null;
      console.log('Risk monitoring stopped');
    }
  };

  /**
   * Update risk score based on all factors with smoothing
   * Uses: previousRisk * 0.7 + newRisk * 0.3
   */
  updateRiskScore = () => {
    let newScore = 0;

    // ===== STEP 1: TIME FACTOR (Night = +20) =====
    const nightFactor = this.calculateNightTimeFactor();
    this.riskFactors.nightTime = nightFactor;
    newScore += nightFactor;

    // ===== STEP 2: NOISE FACTOR (High noise = +15 max) =====
    const noiseFactor = this.calculateNoiseFactor();
    this.riskFactors.noiseSpikes = noiseFactor;
    newScore += noiseFactor;

    // ===== STEP 3: MOVEMENT FACTOR (No movement = +20, Fall = +30) =====
    const movementFactor = this.calculateMovementFactor();
    this.riskFactors.noMovement = movementFactor;
    newScore += movementFactor;

    // ===== STEP 4: LOCATION FACTOR (Sparse area = +15) =====
    const locationFactor = this.calculateLocationFactor();
    this.riskFactors.sparseArea = locationFactor;
    newScore += locationFactor;

    // ===== STEP 5: APPLY SMOOTHING =====
    // Avoid sudden jumps: newRisk = oldRisk * 0.7 + calculated * 0.3
    const smoothedScore =
      this.previousRiskScore * this.smoothingFactor +
      newScore * (1 - this.smoothingFactor);

    // ===== STEP 6: NORMALIZE TO 0-100 =====
    this.riskScore = Math.min(100, Math.max(0, Math.round(smoothedScore)));
    this.previousRiskScore = this.riskScore; // Store for next iteration

    // ===== STEP 7: DETERMINE RISK LEVEL =====
    if (this.riskScore < 35) {
      this.riskLevel = 'safe';
    } else if (this.riskScore < 65) {
      this.riskLevel = 'medium';
    } else {
      this.riskLevel = 'high';
    }

    // ===== STEP 8: NOTIFY LISTENERS =====
    this.notifyListeners({
      score: this.riskScore,
      level: this.riskLevel,
      factors: this.riskFactors,
    });
  };

  /**
   * Calculate night time risk factor (+20 for 8PM-5AM, 0 otherwise)
   */
  calculateNightTimeFactor = () => {
    const hour = new Date().getHours();
    const nightStart = RISK_CONFIG.nightTime.hour; // 21 (9 PM)
    const morningEnd = RISK_CONFIG.morningTime.hour; // 6 (6 AM)

    // Night increases risk by +20
    if (hour >= nightStart || hour < morningEnd) {
      return RISK_CONFIG.nightTime.riskIncrease; // 20
    }

    // Day time is safer
    return 0;
  };

  /**
   * Calculate noise spike risk factor (+15 max for high noise)
   */
  calculateNoiseFactor = () => {
    const currentSound = SensorService.soundLevel || 50;
    const threshold = RISK_CONFIG.noiseSpikeThreshold; // 70 dB

    if (currentSound > threshold) {
      // High noise detected
      // Map: 70dB -> 0 risk, 100dB -> 15 risk
      const excessNoise = currentSound - threshold; // 0-30
      return Math.min(15, (excessNoise / 30) * 15);
    }

    // Low noise = 0 risk
    return 0;
  };

  /**
   * Calculate movement factor (+20 no movement, +30 sudden fall)
   */
  calculateMovementFactor = () => {
    const movementIntensity = SensorService.getMovementIntensity() || 0;
    const threshold = 15; // Movement intensity threshold

    // ===== DETECT SUDDEN FALL =====
    if (SensorService.detectShake()) {
      // Sudden strong movement = potential fall = +30 risk
      return 30;
    }

    // ===== DETECT NO MOVEMENT =====
    if (movementIntensity < threshold) {
      this.noMovementCounter += 1; // Increment "still" counter
      const noMovementSeconds = this.noMovementCounter * (this.updateInterval / 1000);

      // After 30 seconds of no movement = +20 risk
      if (noMovementSeconds > RISK_CONFIG.noMovementThreshold) {
        return 20;
      }

      // Partial risk for some immobility
      return Math.min(20, (noMovementSeconds / RISK_CONFIG.noMovementThreshold) * 20);
    } else {
      // Movement detected = reset counter
      this.noMovementCounter = 0;
      return 0;
    }
  };

  /**
   * Calculate location factor (+15 for sparse/isolated areas)
   */
  calculateLocationFactor = () => {
    const currentLocation = LocationService.getCachedLocation?.();

    if (!currentLocation) {
      return 0; // No location data
    }

    // Poor GPS accuracy = likely sparse/rural area = +15 risk
    // Accuracy > 20 meters suggests less populated area
    if (currentLocation.accuracy > RISK_CONFIG.sparseAreaThreshold) {
      return 15;
    }

    return 0;
  };

  /**
   * Get current risk score
   */
  getRiskScore = () => {
    return {
      score: this.riskScore,
      level: this.riskLevel,
      factors: this.riskFactors,
    };
  };

  /**
   * Manual risk update for testing
   */
  setRiskScore = (score) => {
    const newScore = Math.min(100, Math.max(0, score));
    
    // Apply smoothing even for manual updates
    this.riskScore = this.previousRiskScore * this.smoothingFactor + newScore * (1 - this.smoothingFactor);
    this.previousRiskScore = this.riskScore;

    if (this.riskScore < 35) {
      this.riskLevel = 'safe';
    } else if (this.riskScore < 65) {
      this.riskLevel = 'medium';
    } else {
      this.riskLevel = 'high';
    }

    this.notifyListeners({
      score: this.riskScore,
      level: this.riskLevel,
      factors: this.riskFactors,
    });
  };

  /**
   * Simulate risk increase for demo
   */
  simulateRiskIncrease = () => {
    const newScore = Math.min(100, this.riskScore + 15);
    this.setRiskScore(newScore);
  };

  /**
   * Simulate risk decrease for demo
   */
  simulateRiskDecrease = () => {
    const newScore = Math.max(0, this.riskScore - 20);
    this.setRiskScore(newScore);
  };

  /**
   * Add listener for risk updates
   */
  addListener = (listener) => {
    this.listeners.push(listener);
  };

  /**
   * Remove listener
   */
  removeListener = (listener) => {
    this.listeners = this.listeners.filter((l) => l !== listener);
  };

  /**
   * Notify all listeners
   */
  notifyListeners = (riskData) => {
    this.listeners.forEach((listener) => {
      try {
        listener(riskData);
      } catch (error) {
        console.error('Error in risk listener:', error);
      }
    });
  };
}

export default new RiskService();
