export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  distanceUnit: 'km' | 'miles';
  temperatureUnit: 'celsius' | 'fahrenheit';
  currencyCode: string;
  homeElectricityRate: number;
  homePeakRate: number | null;
  homeOffPeakRate: number | null;
  peakHoursStart: number | null;
  peakHoursEnd: number | null;
  gasPrice: number;
  equivalentCarMpg: number;
  co2FactorGasoline: number;
  co2FactorElectricity: number;
  notifyChargeComplete: boolean;
  notifyLowBattery: boolean;
  lowBatteryThreshold: number;
  notifyTirePressure: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
