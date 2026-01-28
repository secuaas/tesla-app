import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByVehicle(
    vehicleId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { vehicleId };

    if (options?.startDate || options?.endDate) {
      where.startTime = {};
      if (options.startDate) {
        where.startTime.gte = options.startDate;
      }
      if (options.endDate) {
        where.startTime.lte = options.endDate;
      }
    }

    const [trips, total] = await Promise.all([
      this.prisma.driveSession.findMany({
        where,
        orderBy: { startTime: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      this.prisma.driveSession.count({ where }),
    ]);

    return { trips, total };
  }

  async findById(id: string) {
    return this.prisma.driveSession.findUnique({
      where: { id },
    });
  }

  async getSummary(vehicleId: string, startDate?: Date, endDate?: Date) {
    const where: any = { vehicleId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const trips = await this.prisma.driveSession.findMany({
      where,
      select: {
        distance: true,
        duration: true,
        energyUsed: true,
        avgSpeed: true,
      },
    });

    const totalTrips = trips.length;
    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalDuration = trips.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalEnergy = trips.reduce((sum, t) => sum + (t.energyUsed || 0), 0);
    const avgConsumption =
      totalDistance > 0 ? (totalEnergy * 1000) / totalDistance : 0;
    const avgSpeed =
      totalDuration > 0 ? (totalDistance / totalDuration) * 60 : 0;

    return {
      totalTrips,
      totalDistance,
      totalDuration,
      totalEnergyUsed: totalEnergy,
      avgConsumption,
      avgSpeed,
    };
  }

  async createDriveSession(
    vehicleId: string,
    data: {
      startTime: Date;
      startLatitude: number;
      startLongitude: number;
      startOdometer: number;
      startBattery: number;
      startLocationName?: string;
      startEnergy?: number;
    },
  ) {
    return this.prisma.driveSession.create({
      data: {
        vehicleId,
        ...data,
      },
    });
  }

  async completeDriveSession(
    id: string,
    data: {
      endTime: Date;
      endLatitude: number;
      endLongitude: number;
      endOdometer: number;
      endBattery: number;
      endLocationName?: string;
      endEnergy?: number;
      routePolyline?: string;
      avgOutsideTemp?: number;
      hvacUsed?: boolean;
      maxSpeed?: number;
    },
  ) {
    const session = await this.prisma.driveSession.findUnique({
      where: { id },
    });

    if (!session) return null;

    const duration = Math.round(
      (data.endTime.getTime() - session.startTime.getTime()) / 60000,
    );
    const distance = data.endOdometer - session.startOdometer;
    const energyUsed =
      session.startEnergy && data.endEnergy
        ? session.startEnergy - data.endEnergy
        : null;
    const avgConsumption =
      energyUsed && distance > 0 ? (energyUsed * 1000) / distance : null;
    const avgSpeed = duration > 0 ? (distance / duration) * 60 : null;

    return this.prisma.driveSession.update({
      where: { id },
      data: {
        ...data,
        duration,
        distance,
        energyUsed,
        avgConsumption,
        avgSpeed,
      },
    });
  }
}
