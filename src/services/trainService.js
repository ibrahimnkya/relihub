import { api, USE_MOCK } from './api'
import { TRAINS } from '../mock/trains.mock'

export const trainService = {
  getTrains: async () => {
    // Calculate fuelPct for each train
    const trains = TRAINS.map(t => ({
      ...t,
      fuelPct: Math.round((t.fuelLevel / t.fuelCapacity) * 100)
    }))
    return { data: trains }
  },
  
  getTrainById: async (id) => {
    const train = TRAINS.find(t => t.id === id)
    if (!train) return { data: null }
    return { data: { ...train, fuelPct: Math.round((train.fuelLevel / train.fuelCapacity) * 100) } }
  },

  launchAdvancedTracking: async (trainId) => {
    // Force mock for trains as requested
    console.log(`[MOCK] AkiliApp launch logged for train ${trainId}`)
    return { data: { status: 'success', sessionReference: 'mock-session-123' } }
  }
}
