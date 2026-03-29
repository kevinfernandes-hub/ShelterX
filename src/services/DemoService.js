import RiskService from './RiskService';
import EmergencyService from './EmergencyService';
import LocationService from './LocationService';

/**
 * DemoService
 * Orchestrates a controlled demo sequence showing ANTIGRAVITY's capabilities
 * 
 * Demo Flow (60 seconds):
 * 1. Risk increases gradually
 * 2. Noise spikes detected
 * 3. Movement stops (user freezes)
 * 4. Dangerous zone appears
 * 5. AI warning triggered
 * 6. Safer route suggested
 * 7. SOS auto-triggers
 */
class DemoService {
  constructor() {
    this.isRunning = false;
    this.isEnabled = false;
    this.listeners = [];
    this.demoStartTime = null;
    this.demoTimeoutIds = [];
    this.demoPhase = 0; // Track which phase we're in
  }

  /**
   * Enable/disable demo mode
   */
  setDemoMode = (enabled) => {
    this.isEnabled = enabled;
    if (!enabled && this.isRunning) {
      this.stopDemo();
    }
    this.notifyListeners({
      type: 'demo_mode_changed',
      enabled: this.isEnabled,
    });
  };

  /**
   * Check if demo mode is enabled
   */
  isDemoMode = () => {
    return this.isEnabled;
  };

  /**
   * Start the controlled demo sequence (60 seconds total)
   */
  startDemo = async () => {
    if (this.isRunning) {
      console.log('Demo already running');
      return;
    }

    this.isRunning = true;
    this.demoStartTime = Date.now();
    this.demoPhase = 0;

    console.log('🎬 DEMO MODE STARTED - 60 second sequence');

    this.notifyListeners({
      type: 'demo_started',
      phase: 0,
    });

    // Phase 1: Safe state (0s - 3s)
    // Show baseline: risk = 20%, safe, AI normal
    this.schedulePhase(0, () => {
      this.demoPhase = 1;
      console.log('📍 Phase 1: Safe Baseline (Risk 20%)');
      RiskService.setRiskScore(20);
      this.updateDemoFactors({
        noiseSpikes: 0,
        noMovement: 0,
      });
      this.notifyListeners({ type: 'demo_phase', phase: 1, message: 'Safe baseline established' });
    });

    // Phase 2: Slight risk increase (5s - 8s)
    // Risk reaches 35%, noise detected
    this.schedulePhase(5000, () => {
      this.demoPhase = 2;
      console.log('📢 Phase 2: Noise Spikes Detected (Risk 35%)');
      RiskService.setRiskScore(35);
      this.updateDemoFactors({
        noiseSpikes: 15,
      });
      this.notifyListeners({ type: 'demo_phase', phase: 2, message: 'Sounds suspicious nearby' });
    });

    // Phase 3: User freezes (10s - 15s)
    // Risk climbs to 55%, no movement detected
    this.schedulePhase(10000, () => {
      this.demoPhase = 3;
      console.log('🚶 Phase 3: No Movement Detected (Risk 55%)');
      RiskService.setRiskScore(55);
      this.updateDemoFactors({
        noMovement: 20,
      });
      this.notifyListeners({ type: 'demo_phase', phase: 3, message: 'You\'ve stopped moving - potential threat' });
    });

    // Phase 4: Dangerous zone + time factor (15s - 20s)
    // Risk jumps to 70%, late night + sparse area
    this.schedulePhase(15000, () => {
      this.demoPhase = 4;
      console.log('🌙 Phase 4: Dangerous Zone Detected (Risk 70%)');
      RiskService.setRiskScore(70);
      this.updateDemoFactors({
        nightTime: 25,
        sparseArea: 15,
      });
      this.notifyListeners({ type: 'demo_phase', phase: 4, message: 'Late night in sparse area - HIGH RISK' });
    });

    // Phase 5: AI triggers warning (20s - 25s)
    // AI warning banner appears with recommendation
    this.schedulePhase(20000, () => {
      this.demoPhase = 5;
      console.log('🤖 Phase 5: AI Warning Triggered');
      this.notifyListeners({
        type: 'demo_phase',
        phase: 5,
        message: 'AI analyzes situation - suggests immediate action',
        aiWarning: true,
      });
    });

    // Phase 6: Route changes (25s - 30s)
    // Primary route updates to safer alternative
    this.schedulePhase(25000, () => {
      this.demoPhase = 6;
      console.log('📍 Phase 6: Safer Route Suggested');
      this.notifyListeners({
        type: 'demo_phase',
        phase: 6,
        message: 'Route updated to safer path - take Main St instead',
        routeChange: true,
      });
    });

    // Phase 7: Critical risk (30s - 35s)
    // Risk reaches critical level (85%)
    this.schedulePhase(30000, () => {
      this.demoPhase = 7;
      console.log('🚨 Phase 7: CRITICAL RISK LEVEL (Risk 85%)');
      RiskService.setRiskScore(85);
      this.updateDemoFactors({
        noMovement: 30,
      });
      this.notifyListeners({
        type: 'demo_phase',
        phase: 7,
        message: 'CRITICAL: User still frozen + high environmental risk',
      });
    });

    // Phase 8: Demo auto-triggers SOS (35s)
    // SOS automatically triggers (to show SOS system works)
    this.schedulePhase(35000, async () => {
      this.demoPhase = 8;
      console.log('🆘 Phase 8: SOS TRIGGERED');
      
      const userLocation = LocationService.getCachedLocation?.() || {
        latitude: 40.7128,
        longitude: -74.0060,
      };

      await EmergencyService.triggerSOS(
        userLocation,
        RiskService.getRiskScore(),
        'demo-auto-trigger'
      );

      this.notifyListeners({
        type: 'demo_phase',
        phase: 8,
        message: 'Emergency services notified - demo complete!',
        sosTriggered: true,
      });
    });

    // Phase 9: Reset (50s)
    // After 50 seconds, prepare to end demo
    this.schedulePhase(50000, () => {
      this.demoPhase = 9;
      console.log('✅ Phase 9: Demo Summary');
      this.notifyListeners({
        type: 'demo_phase',
        phase: 9,
        message: 'Demo showcases full ANTIGRAVITY safety flow',
      });
    });

    // Phase 10: Auto-stop (60s)
    this.schedulePhase(60000, () => {
      console.log('⏹️ Demo sequence complete');
      this.stopDemo();
      this.notifyListeners({
        type: 'demo_complete',
      });
    });
  };

  /**
   * Schedule a phase callback at specific time offset
   */
  schedulePhase = (delayMs, callback) => {
    const timeoutId = setTimeout(callback, delayMs);
    this.demoTimeoutIds.push(timeoutId);
  };

  /**
   * Update demo risk factors
   */
  updateDemoFactors = (factors) => {
    RiskService.riskFactors = {
      ...RiskService.riskFactors,
      ...factors,
    };
  };

  /**
   * Stop the demo sequence and reset
   */
  stopDemo = async () => {
    console.log('⏹️ Stopping demo mode');

    // Clear all pending timeouts
    this.demoTimeoutIds.forEach((id) => clearTimeout(id));
    this.demoTimeoutIds = [];

    this.isRunning = false;
    this.demoPhase = 0;
    this.demoStartTime = null;

    // Reset risk to baseline
    RiskService.setRiskScore(20);
    RiskService.riskFactors = {
      nightTime: 0,
      noiseSpikes: 0,
      noMovement: 0,
      sparseArea: 0,
      isolated: 0,
    };

    // Cancel any active SOS from demo
    if (EmergencyService.sosActive) {
      await EmergencyService.cancelSOS();
    }

    this.notifyListeners({
      type: 'demo_stopped',
    });
  };

  /**
   * Get current demo phase
   */
  getDemoPhase = () => {
    return this.demoPhase;
  };

  /**
   * Get elapsed time in demo
   */
  getDemoElapsedTime = () => {
    if (!this.isRunning || !this.demoStartTime) {
      return 0;
    }
    return Date.now() - this.demoStartTime;
  };

  /**
   * Add listener for demo events
   */
  addListener = (listener) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  };

  /**
   * Notify all listeners of demo events
   */
  notifyListeners = (event) => {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in demo listener:', error);
      }
    });
  };
}

export default new DemoService();
