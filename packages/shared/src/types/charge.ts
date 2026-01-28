export interface ChargeSession {
  id: string;
  vehicleId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  latitude: number | null;
  longitude: number | null;
  locationId: string | null;
  locationName: string | null;
  chargerType: ChargerType | null;
  connectorType: string | null;
  startBattery: number;
  endBattery: number | null;
  startEnergy: number | null;
  endEnergy: number | null;
  energyAdded: number | null;
  rangeAdded: number | null;
  maxPower: number | null;
  avgPower: number | null;
  pricePerKwh: number | null;
  totalCost: number | null;
  outsideTemp: number | null;
  batteryTempStart: number | null;
  batteryTempEnd: number | null;
  powerProfile: PowerDataPoint[] | null;
}

export type ChargerType = 'home' | 'supercharger' | 'destination' | 'public' | 'work';

export interface PowerDataPoint {
  timestamp: Date;
  power: number;
  batteryLevel: number;
}

export interface ChargingLocation {
  id: string;
  vehicleId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  locationType: ChargerType;
  pricePerKwh: number | null;
  hasPeakPricing: boolean;
  peakPrice: number | null;
  offPeakPrice: number | null;
  peakHoursStart: number | null;
  peakHoursEnd: number | null;
}

export interface ChargeFilter {
  vehicleId?: string;
  startDate?: Date;
  endDate?: Date;
  chargerType?: ChargerType;
  locationId?: string;
}

export interface ChargeSummary {
  totalSessions: number;
  totalEnergyAdded: number;
  totalCost: number;
  avgCostPerKwh: number;
  homeChargingPercent: number;
  superchargerPercent: number;
  publicPercent: number;
}
