import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { VehiclesService } from '../vehicles/vehicles.service';
import { BillingService } from '../billing/billing.service';

export type TeslaCommand =
  | 'door_lock'
  | 'door_unlock'
  | 'actuate_trunk'
  | 'window_control'
  | 'auto_conditioning_start'
  | 'auto_conditioning_stop'
  | 'set_temps'
  | 'remote_seat_heater_request'
  | 'charge_start'
  | 'charge_stop'
  | 'set_charge_limit'
  | 'set_charging_amps'
  | 'charge_port_door_open'
  | 'charge_port_door_close'
  | 'set_sentry_mode'
  | 'flash_lights'
  | 'honk_horn'
  | 'wake_up';

@Injectable()
export class CommandsService {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly billingService: BillingService,
  ) {}

  async executeCommand(
    vehicleId: string,
    userId: string,
    command: TeslaCommand,
    params?: Record<string, unknown>,
  ) {
    // Verify vehicle ownership
    const vehicle = await this.vehiclesService.findById(vehicleId, userId);

    // Check if virtual key is paired (required for commands)
    if (!vehicle.virtualKeyPaired) {
      throw new ForbiddenException(
        'Virtual key not paired. Please pair the key in your Tesla app first.',
      );
    }

    // Pre-command checks
    await this.preCommandChecks(vehicle, command, params);

    // Track API usage
    await this.billingService.trackCommand(vehicleId);

    // In a real implementation, this would call the Tesla HTTP Proxy
    // For now, we return a simulated response
    return {
      success: true,
      command,
      vehicleId,
      timestamp: new Date(),
      message: `Command ${command} sent successfully`,
    };
  }

  private async preCommandChecks(
    vehicle: { id: string; virtualKeyPaired: boolean },
    command: TeslaCommand,
    params?: Record<string, unknown>,
  ) {
    // Validate command parameters
    switch (command) {
      case 'set_charge_limit': {
        const percent = params?.percent as number | undefined;
        if (!percent || percent < 50 || percent > 100) {
          throw new BadRequestException(
            'Charge limit must be between 50 and 100',
          );
        }
        break;
      }

      case 'set_charging_amps': {
        const amps = params?.amps as number | undefined;
        if (!amps || amps < 5 || amps > 48) {
          throw new BadRequestException(
            'Charging amps must be between 5 and 48',
          );
        }
        break;
      }

      case 'set_temps': {
        const driverTemp = params?.driverTemp as number | undefined;
        if (driverTemp && (driverTemp < 15 || driverTemp > 28)) {
          throw new BadRequestException(
            'Temperature must be between 15 and 28°C',
          );
        }
        break;
      }

      case 'remote_seat_heater_request': {
        const level = params?.level as number | undefined;
        if (level !== undefined && (level < 0 || level > 3)) {
          throw new BadRequestException('Seat heater level must be between 0 and 3');
        }
        break;
      }

      case 'actuate_trunk':
        if (!params?.which || !['front', 'rear'].includes(params.which as string)) {
          throw new BadRequestException('Must specify trunk: front or rear');
        }
        break;

      case 'window_control':
        if (!params?.command || !['vent', 'close'].includes(params.command as string)) {
          throw new BadRequestException('Window command must be vent or close');
        }
        break;

      case 'set_sentry_mode':
        if (params?.on === undefined) {
          throw new BadRequestException('Must specify on: true or false');
        }
        break;
    }
  }

  // Convenience methods for common commands
  async lock(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'door_lock');
  }

  async unlock(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'door_unlock');
  }

  async startClimate(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'auto_conditioning_start');
  }

  async stopClimate(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'auto_conditioning_stop');
  }

  async startCharge(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'charge_start');
  }

  async stopCharge(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'charge_stop');
  }

  async setChargeLimit(vehicleId: string, userId: string, percent: number) {
    return this.executeCommand(vehicleId, userId, 'set_charge_limit', {
      percent,
    });
  }

  async flashLights(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'flash_lights');
  }

  async honkHorn(vehicleId: string, userId: string) {
    return this.executeCommand(vehicleId, userId, 'honk_horn');
  }

  async wakeUp(vehicleId: string, userId: string) {
    await this.billingService.trackWake(vehicleId);
    return this.executeCommand(vehicleId, userId, 'wake_up');
  }
}
