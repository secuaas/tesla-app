export interface Vehicle {
  id: string;
  teslaId: string;
  vin: string;
  userId: string;
  displayName: string | null;
  carType: string | null;
  trim: string | null;
  exteriorColor: string | null;
  wheelType: string | null;
  year: number | null;
  virtualKeyPaired: boolean;
  commandProtocolReq: boolean;
  firmwareVersion: string | null;
  telemetryVersion: string | null;
  fleetStatusUpdatedAt: Date | null;
  originalRange: number | null;
  batteryCapacity: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleState {
  vehicleId: string;
  isOnline: boolean;
  lastSeen: Date | null;
  batteryLevel: number | null;
  energyRemaining: number | null;
  estRange: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  gear: string | null;
  locked: boolean | null;
  sentryMode: boolean | null;
  chargeState: ChargeState | null;
  chargePower: number | null;
  insideTemp: number | null;
  outsideTemp: number | null;
  hvacPower: boolean | null;
  odometer: number | null;
}

export type ChargeState =
  | 'Disconnected'
  | 'NoPower'
  | 'Starting'
  | 'Charging'
  | 'Complete'
  | 'Stopped';

export type Gear = 'P' | 'R' | 'N' | 'D' | null;

export interface VehicleWithState extends Vehicle {
  state: VehicleState;
}
