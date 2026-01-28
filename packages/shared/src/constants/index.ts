// Tesla API Costs (per operation)
export const TESLA_API_COSTS = {
  STREAMING_SIGNAL: 0.000007,
  COMMAND: 0.001,
  VEHICLE_DATA: 0.002,
  WAKE: 0.02,
  MONTHLY_DISCOUNT: 10,
} as const;

// Tesla API Rate Limits
export const TESLA_RATE_LIMITS = {
  REALTIME_DATA_PER_MIN: 60,
  WAKES_PER_MIN: 3,
  COMMANDS_PER_MIN: 30,
  TOKEN_REFRESH_PER_SEC: 20,
} as const;

// Conversion constants
export const CONVERSIONS = {
  MILES_TO_KM: 1.60934,
  KM_TO_MILES: 0.621371,
  GALLONS_TO_LITERS: 3.78541,
  LITERS_TO_GALLONS: 0.264172,
  KWH_PER_LITER_GAS: 9.7,
  CO2_PER_LITER_GAS: 2.31, // kg CO2
} as const;

// Default user preferences
export const DEFAULT_PREFERENCES = {
  DISTANCE_UNIT: 'km' as const,
  TEMPERATURE_UNIT: 'celsius' as const,
  CURRENCY_CODE: 'CAD',
  HOME_ELECTRICITY_RATE: 0.1,
  GAS_PRICE: 1.5,
  EQUIVALENT_CAR_MPG: 8.0,
  CO2_FACTOR_GASOLINE: 2.31,
  CO2_FACTOR_ELECTRICITY: 0.5,
  LOW_BATTERY_THRESHOLD: 20,
} as const;

// Session detection thresholds
export const SESSION_DETECTION = {
  DRIVE_END_PARK_DURATION_SECONDS: 120, // 2 minutes in Park to end drive
  MIN_TRIP_DISTANCE_KM: 0.1,
  MIN_CHARGE_ENERGY_KWH: 0.1,
} as const;

// WebSocket events
export const WS_EVENTS = {
  // Client -> Server
  SUBSCRIBE_VEHICLE: 'vehicle:subscribe',
  UNSUBSCRIBE_VEHICLE: 'vehicle:unsubscribe',

  // Server -> Client
  TELEMETRY_UPDATE: 'telemetry:update',
  VEHICLE_STATE: 'vehicle:state',
  VEHICLE_OFFLINE: 'vehicle:offline',
  VEHICLE_ONLINE: 'vehicle:online',
  CHARGE_STARTED: 'charge:started',
  CHARGE_COMPLETED: 'charge:completed',
  DRIVE_STARTED: 'drive:started',
  DRIVE_COMPLETED: 'drive:completed',
} as const;

// Tesla charge states
export const CHARGE_STATES = {
  DISCONNECTED: 'Disconnected',
  NO_POWER: 'NoPower',
  STARTING: 'Starting',
  CHARGING: 'Charging',
  COMPLETE: 'Complete',
  STOPPED: 'Stopped',
} as const;

// Tesla gear positions
export const GEAR_POSITIONS = {
  PARK: 'P',
  REVERSE: 'R',
  NEUTRAL: 'N',
  DRIVE: 'D',
} as const;

// Climate keeper modes
export const CLIMATE_MODES = {
  OFF: 'Off',
  KEEP: 'Keep',
  DOG: 'Dog',
  CAMP: 'Camp',
} as const;
