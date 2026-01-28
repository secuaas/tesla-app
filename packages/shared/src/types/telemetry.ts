export interface TelemetrySnapshot {
  id: string;
  vehicleId: string;
  timestamp: Date;
  batteryLevel: number | null;
  energyRemaining: number | null;
  estRange: number | null;
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  speed: number | null;
  odometer: number | null;
  gear: string | null;
  insideTemp: number | null;
  outsideTemp: number | null;
  hvacPower: boolean | null;
  locked: boolean | null;
  sentryMode: boolean | null;
  chargeState: string | null;
  chargePower: number | null;
  chargeAmps: number | null;
  chargerVoltage: number | null;
}

export interface TelemetryEvent {
  vehicleId: string;
  vin: string;
  timestamp: Date;
  data: Partial<TelemetryData>;
}

export interface TelemetryData {
  // Battery
  batteryLevel: number;
  energyRemaining: number;
  estRange: number;
  idealRange: number;
  ratedRange: number;
  chargeLimitSoc: number;

  // Charge
  chargeState: string;
  chargeAmps: number;
  chargerVoltage: number;
  chargePowerAC: number;
  chargePowerDC: number;
  chargeEnergyAdded: number;
  timeToFullCharge: number;
  chargePortOpen: boolean;
  chargePortLatch: string;

  // Location
  latitude: number;
  longitude: number;
  heading: number;
  gpsState: boolean;

  // Driving
  speed: number;
  odometer: number;
  gear: string;
  pedalPosition: number;
  brakePedal: boolean;

  // Climate
  insideTemp: number;
  outsideTemp: number;
  hvacPower: boolean;
  hvacFanSpeed: number;
  hvacLeftTemp: number;
  hvacRightTemp: number;
  climateKeeperMode: string;

  // State
  locked: boolean;
  sentryMode: boolean;
  doorState: string;
  windowState: string;

  // Tires
  tirePressureFl: number;
  tirePressureFr: number;
  tirePressureRl: number;
  tirePressureRr: number;
}

export interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
}

export type TelemetryUpdateMessage = WebSocketMessage<TelemetryEvent>;
