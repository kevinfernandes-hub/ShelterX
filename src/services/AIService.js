import { COLORS } from '../config';

class AIService {
  constructor() {
    this.lastPrediction = null;
    this.lastPredictionTime = 0;
    this.predictionCooldown = 3000; // Don't update prediction too frequently
  }

  /**
   * Generate AI prediction based on real-time data
   * @param {object} data - { riskScore, routes, time, location, movement }
   * @returns {object} - { message, severity, icon, shouldShow }
   */
  getPrediction = (data = {}) => {
    const { riskScore = 20, routes = [], time = new Date(), location = null, movement = 0 } = data;

    // Check cooldown
    if (Date.now() - this.lastPredictionTime < this.predictionCooldown) {
      return this.lastPrediction || this.defaultPrediction();
    }

    let prediction = null;

    // ===== PRIORITY 1: CRITICAL SAFETY ALERTS =====
    if (riskScore > 70) {
      prediction = this.getHighRiskAlert(riskScore, location);
    }
    // ===== PRIORITY 2: MEDIUM WARNINGS =====
    else if (riskScore > 50) {
      prediction = this.getMediumRiskAlert(riskScore, time, movement);
    }
    // ===== PRIORITY 3: ROUTE SUGGESTIONS =====
    else if (routes && routes.length > 1) {
      prediction = this.getRouteSuggestion(routes);
    }
    // ===== PRIORITY 4: CONTEXTUAL AWARENESS =====
    else {
      prediction = this.getContextualMessage(time, movement, riskScore);
    }

    // Cache prediction
    this.lastPrediction = prediction;
    this.lastPredictionTime = Date.now();

    return prediction;
  };

  /**
   * Generate high-risk alert (riskScore > 70)
   */
  getHighRiskAlert = (riskScore, location) => {
    if (riskScore > 85) {
      return {
        message: '🚨 High risk zone ahead - stay alert',
        severity: 'critical',
        icon: '🚨',
        shouldShow: true,
        color: COLORS.danger,
      };
    }

    // Check if in sparse location
    if (location?.accuracy > 100) {
      return {
        message: '⚠️ Isolated area detected - stay aware',
        severity: 'high',
        icon: '⚠️',
        shouldShow: true,
        color: COLORS.danger,
      };
    }

    return {
      message: '⚠️ Risk increasing - consider changing route',
      severity: 'high',
      icon: '⚠️',
      shouldShow: true,
      color: COLORS.danger,
    };
  };

  /**
   * Generate medium-risk alert (riskScore 50-70)
   */
  getMediumRiskAlert = (riskScore, time, movement) => {
    const hour = time.getHours();
    const isNight = hour >= 21 || hour < 6;

    // Night time specific
    if (isNight) {
      if (movement < 5) {
        return {
          message: '🌙 Late night, low activity nearby',
          severity: 'medium',
          icon: '🌙',
          shouldShow: true,
          color: COLORS.warning,
        };
      }

      return {
        message: '🌙 Late night - stay alert',
        severity: 'medium',
        icon: '🌙',
        shouldShow: true,
        color: COLORS.warning,
      };
    }

    // Daytime caution
    if (movement < 10) {
      return {
        message: '📍 Quiet area nearby',
        severity: 'medium',
        icon: '📍',
        shouldShow: true,
        color: COLORS.warning,
      };
    }

    return {
      message: '⚡ Risk level moderate',
      severity: 'medium',
      icon: '⚡',
      shouldShow: false,
      color: COLORS.warning,
    };
  };

  /**
   * Suggest safer route if available
   */
  getRouteSuggestion = (routes) => {
    if (!routes || routes.length < 2) {
      return this.defaultPrediction();
    }

    // Find fastest route (first one is typically fastest)
    const fastestRoute = routes[0];
    const distance = fastestRoute.distance / 1000; // Convert to km

    if (distance < 3) {
      return {
        message: '🛣️ Faster route available',
        severity: 'info',
        icon: '🛣️',
        shouldShow: true,
        color: COLORS.primary,
      };
    }

    return {
      message: '🧭 Alternative routes found',
      severity: 'info',
      icon: '🧭',
      shouldShow: false,
      color: COLORS.primary,
    };
  };

  /**
   * Contextual awareness messages (low risk)
   */
  getContextualMessage = (time, movement, riskScore) => {
    const hour = time.getHours();

    // Early morning
    if (hour >= 5 && hour < 8) {
      return {
        message: '☀️ Good morning - stay safe',
        severity: 'info',
        icon: '☀️',
        shouldShow: false,
        color: COLORS.success,
      };
    }

    // Evening
    if (hour >= 18 && hour < 21) {
      return {
        message: '🌅 Evening time - stay aware',
        severity: 'low',
        icon: '🌅',
        shouldShow: false,
        color: COLORS.primary,
      };
    }

    // Safe hours
    if (riskScore < 25) {
      return {
        message: '✓ All clear - safe zone',
        severity: 'safe',
        icon: '✓',
        shouldShow: false,
        color: COLORS.success,
      };
    }

    return this.defaultPrediction();
  };

  /**
   * Default safe prediction
   */
  defaultPrediction = () => {
    return {
      message: '✓ Safe - no alerts',
      severity: 'safe',
      icon: '✓',
      shouldShow: false,
      color: COLORS.success,
    };
  };

  /**
   * Get emoji and color based on risk level
   */
  getVisualsForRisk = (riskScore) => {
    if (riskScore >= 70) {
      return { emoji: '🔴', color: COLORS.danger, opacity: 1 };
    }
    if (riskScore >= 50) {
      return { emoji: '🟡', color: COLORS.warning, opacity: 0.9 };
    }
    return { emoji: '🟢', color: COLORS.success, opacity: 0.7 };
  };

  /**
   * Check if message should trigger notification sound
   */
  shouldPlayAlert = (severity) => {
    return severity === 'critical' || severity === 'high';
  };
}

export default new AIService();
