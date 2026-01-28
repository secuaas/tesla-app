export interface DailyStats {
  id: string;
  vehicleId: string;
  date: Date;
  distanceKm: number;
  tripCount: number;
  drivingMinutes: number;
  energyUsedKwh: number;
  avgConsumption: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  chargeCount: number;
  energyAddedKwh: number;
  chargingMinutes: number;
  chargingCost: number;
  startBattery: number | null;
  endBattery: number | null;
  minBattery: number | null;
  maxBattery: number | null;
  avgOutsideTemp: number | null;
  hvacMinutes: number;
  startOdometer: number | null;
  endOdometer: number | null;
}

export interface MonthlyStats {
  id: string;
  vehicleId: string;
  year: number;
  month: number;
  distanceKm: number;
  tripCount: number;
  drivingHours: number;
  energyUsedKwh: number;
  avgConsumption: number | null;
  chargeCount: number;
  energyAddedKwh: number;
  chargingHours: number;
  chargingCost: number;
  homeChargeKwh: number;
  publicChargeKwh: number;
  superchargeKwh: number;
  efficiency: number | null;
  co2Avoided: number | null;
  fuelSaved: number | null;
  moneySaved: number | null;
  vsLastMonth: number | null;
  vsLastYear: number | null;
}

export interface EfficiencyStats {
  lifetimeEfficiency: number;
  efficiencyByTemp: EfficiencyByRange[];
  efficiencyBySpeed: EfficiencyByRange[];
  efficiencyTrend: TrendDataPoint[];
  bestTrip: TripEfficiency | null;
  worstTrip: TripEfficiency | null;
  winterAvg: number | null;
  summerAvg: number | null;
  highwayAvg: number | null;
  cityAvg: number | null;
}

export interface EfficiencyByRange {
  rangeStart: number;
  rangeEnd: number;
  avgEfficiency: number;
  sampleCount: number;
}

export interface TrendDataPoint {
  date: Date;
  value: number;
}

export interface TripEfficiency {
  tripId: string;
  date: Date;
  distance: number;
  consumption: number;
}

export interface EnvironmentalStats {
  co2Avoided: number;
  treesEquivalent: number;
  fuelNotUsed: number;
  moneySavedVsGas: number;
  moneySavedVsDiesel: number;
  greenEnergyRatio: number | null;
}

export interface UsageStats {
  totalOdometer: number;
  odometerByYear: Record<number, number>;
  avgDailyDistance: number;
  daysUsed: number;
  usageRate: number;
  longestTrip: TripStat | null;
  longestDayDistance: DayStat | null;
  sentryModeHours: number;
  climateHours: number;
  softwareUpdates: number;
}

export interface TripStat {
  tripId: string;
  date: Date;
  distance: number;
}

export interface DayStat {
  date: Date;
  distance: number;
}

export interface BatteryStats {
  degradationPercent: number;
  degradationTrend: TrendDataPoint[];
  avgDailyUsage: number;
  depthOfDischarge: number;
  chargingHabits: ChargingHabit[];
  timeSpentCharging: number;
  optimalRangeUsage: number;
  fullChargeCount: number;
  lowBatteryEvents: number;
}

export interface ChargingHabit {
  startSoc: number;
  endSoc: number;
  count: number;
}
