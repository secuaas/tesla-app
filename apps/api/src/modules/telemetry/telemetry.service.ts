import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TelemetryService {
  constructor(private readonly prisma: PrismaService) {}

  async saveSnapshot(
    vehicleId: string,
    data: {
      timestamp: Date;
      batteryLevel?: number;
      energyRemaining?: number;
      estRange?: number;
      latitude?: number;
      longitude?: number;
      heading?: number;
      speed?: number;
      odometer?: number;
      gear?: string;
      insideTemp?: number;
      outsideTemp?: number;
      hvacPower?: boolean;
      locked?: boolean;
      sentryMode?: boolean;
      chargeState?: string;
      chargePower?: number;
      chargeAmps?: number;
      chargerVoltage?: number;
    },
  ) {
    return this.prisma.telemetrySnapshot.create({
      data: {
        vehicleId,
        ...data,
      },
    });
  }

  async getLatestSnapshot(vehicleId: string) {
    return this.prisma.telemetrySnapshot.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getSnapshots(
    vehicleId: string,
    startTime: Date,
    endTime: Date,
    limit = 1000,
  ) {
    return this.prisma.telemetrySnapshot.findMany({
      where: {
        vehicleId,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });
  }

  async cleanupOldSnapshots(vehicleId: string, olderThan: Date) {
    return this.prisma.telemetrySnapshot.deleteMany({
      where: {
        vehicleId,
        timestamp: {
          lt: olderThan,
        },
      },
    });
  }
}
