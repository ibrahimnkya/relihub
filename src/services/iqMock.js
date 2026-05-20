/**
 * RELI-IQ NEURAL MOCK ENGINE
 * Provides a high-fidelity local simulation of the AI pipeline 
 * when both primary and secondary APIs are unreachable.
 */

export const iqMock = {
  discovery: (query) => {
    const q = query?.toLowerCase() || '';
    return {
      data: {
        success: true,
        data_points: [
          { id: 'MOCK-1', type: 'TANK', context: 'Tank: North Terminal 01 (82% Fill)', importance: 0.9 },
          { id: 'MOCK-2', type: 'BRANCH', context: 'Node: Central Hub Operations', importance: 0.8 },
          { id: 'MOCK-3', type: 'ALERT', context: 'Alert: Consumption variance detected in Zone B', importance: 0.7 }
        ],
        discovery_token: 'MOCK-DISC-TOKEN'
      }
    };
  },

  extraction: (dataPoints) => {
    return {
      data: {
        success: true,
        context: (dataPoints || []).map(p => ({
          ...p,
          features: { variance: '0.12', frequency: 'STABLE', neural_weight: 0.95 }
        })),
        extraction_id: 'MOCK-EXT-ID'
      }
    };
  },

  answers: (query) => {
    const q = query?.toLowerCase() || '';
    let answer = "Neural Link is currently operating in offline fallback mode. Based on cached system snapshots, operational parameters are within nominal ranges. Node stability is at 98.4%.";
    
    if (q.includes('status') || q.includes('tank')) {
      answer = "Neural snapshot indicates all primary tanks are at optimal capacity. North Terminal 01 is reporting 82% fill with no pressure variance. System-wide stock is sufficient for the next 14 operational cycles.";
    } else if (q.includes('how long') || q.includes('refill') || q.includes('days')) {
      answer = "Predictive analysis suggests a 12.8-day runway at current consumption rates. No immediate refill protocols required.";
    }

    return {
      data: {
        success: true,
        reasoning_chain: [
          'Activating offline cognitive cache...',
          'Loading historical telemetry vectors...',
          'Synthesizing fallback inference...'
        ],
        answer,
        confidence: 0.85
      }
    };
  },

  agent: (action) => {
    return {
      data: {
        success: true,
        agent_report: `[MOCK MODE] Autonomous ${action} sequence simulated. Action logged to local cognitive registry.`
      }
    };
  }
};
