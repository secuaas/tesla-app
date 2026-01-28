export interface DriveSession {
  id: string;
  vehicleId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  startLatitude: number;
  startLongitude: number;
  startLocationName: string | null;
  endLatitude: number | null;
  endLongitude: number | null;
  endLocationName: string | null;
  routePolyline: string | null;
  startOdometer: number;
  endOdometer: number | null;
  distance: number | null;
  startBattery: number;
  endBattery: number | null;
  startEnergy: number | null;
  endEnergy: number | null;
  energyUsed: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  avgConsumption: number | null;
  avgOutsideTemp: number | null;
  hvacUsed: boolean;
  elevationGain: number | null;
  elevationLoss: number | null;
  speedProfile: SpeedDataPoint[] | null;
  consumptionProfile: ConsumptionDataPoint[] | null;
  elevationProfile: ElevationDataPoint[] | null;
}

export interface SpeedDataPoint {
  timestamp: Date;
  speed: number;
}

export interface ConsumptionDataPoint {
  timestamp: Date;
  consumption: number;
}

export interface ElevationDataPoint {
  distance: number;
  elevation: number;
}

export interface TripFilter {
  vehicleId?: string;
  startDate?: Date;
  endDate?: Date;
  minDistance?: number;
  maxDistance?: number;
  minConsumption?: number;
  maxConsumption?: number;
}

export interface TripSummary {
  totalTrips: number;
  totalDistance: number;
  totalDuration: number;
  totalEnergyUsed: number;
  avgConsumption: number;
  avgSpeed: number;
}
