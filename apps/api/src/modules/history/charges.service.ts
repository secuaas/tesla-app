import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChargesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByVehicle(
    vehicleId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      chargerType?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { vehicleId };

    if (options?.startDate || options?.endDate) {
      where.startTime = {};
      if (options.startDate) where.startTime.gte = options.startDate;
      if (options.endDate) where.startTime.lte = options.endDate;
    }

    if (options?.chargerType) {
      where.chargerType = options.chargerType;
    }

    const [charges, total] = await Promise.all([
      this.prisma.chargeSession.findMany({
        where,
        orderBy: { startTime: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
        include: {
          location: true,
        },
      }),
      this.prisma.chargeSession.count({ where }),
    ]);

    return { charges, total };
  }

  async findById(id: string) {
    return this.prisma.chargeSession.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });
  }

  async getSummary(vehicleId: string, startDate?: Date, endDate?: Date) {
    const where: any = { vehicleId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const charges = await this.prisma.chargeSession.findMany({
      where,
      select: {
        energyAdded: true,
        totalCost: true,
        pricePerKwh: true,
        chargerType: true,
      },
    });

    const totalSessions = charges.length;
    const totalEnergyAdded = charges.reduce(
      (sum, c) => sum + (c.energyAdded || 0),
      0,
    );
    const totalCost = charges.reduce((sum, c) => sum + (c.totalCost || 0), 0);
    const avgCostPerKwh =
      totalEnergyAdded > 0 ? totalCost / totalEnergyAdded : 0;

    const homeCharges = charges.filter((c) => c.chargerType === 'home').length;
    const superchargerCharges = charges.filter(
      (c) => c.chargerType === 'supercharger',
    ).length;
    const publicCharges = charges.filter(
      (c) =>
        c.chargerType === 'public' || c.chargerType === 'destination',
    ).length;

    return {
      totalSessions,
      totalEnergyAdded,
      totalCost,
      avgCostPerKwh,
      homeChargingPercent:
        totalSessions > 0 ? (homeCharges / totalSessions) * 100 : 0,
      superchargerPercent:
        totalSessions > 0 ? (superchargerCharges / totalSessions) * 100 : 0,
      publicPercent:
        totalSessions > 0 ? (publicCharges / totalSessions) * 100 : 0,
    };
  }

  async createChargeSession(
    vehicleId: string,
    data: {
      startTime: Date;
      startBattery: number;
      latitude?: number;
      longitude?: number;
      locationName?: string;
      chargerType?: string;
      connectorType?: string;
      startEnergy?: number;
      outsideTemp?: number;
      batteryTempStart?: number;
    },
  ) {
    // Try to match a charging location
    let locationId: string | undefined;
    if (data.latitude && data.longitude) {
      const location = await this.findNearbyLocation(
        vehicleId,
        data.latitude,
        data.longitude,
      );
      if (location) {
        locationId = location.id;
        data.chargerType = data.chargerType || location.locationType;
      }
    }

    return this.prisma.chargeSession.create({
      data: {
        vehicleId,
        ...data,
        locationId,
      },
    });
  }

  async completeChargeSession(
    id: string,
    data: {
      endTime: Date;
      endBattery: number;
      endEnergy?: number;
      maxPower?: number;
      avgPower?: number;
      batteryTempEnd?: number;
      powerProfile?: unknown;
    },
  ) {
    const session = await this.prisma.chargeSession.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!session) return null;

    const duration = Math.round(
      (data.endTime.getTime() - session.startTime.getTime()) / 60000,
    );
    const energyAdded =
      session.startEnergy && data.endEnergy
        ? data.endEnergy - session.startEnergy
        : null;

    // Calculate cost based on location pricing
    let pricePerKwh = session.location?.pricePerKwh || null;
    if (session.location?.hasPeakPricing) {
      const hour = session.startTime.getHours();
      const isPeak =
        session.location.peakHoursStart &&
        session.location.peakHoursEnd &&
        hour >= session.location.peakHoursStart &&
        hour < session.location.peakHoursEnd;
      pricePerKwh = isPeak
        ? session.location.peakPrice
        : session.location.offPeakPrice;
    }

    const totalCost =
      energyAdded && pricePerKwh ? energyAdded * pricePerKwh : null;

    return this.prisma.chargeSession.update({
      where: { id },
      data: {
        ...data,
        duration,
        energyAdded,
        pricePerKwh,
        totalCost,
      },
    });
  }

  private async findNearbyLocation(
    vehicleId: string,
    latitude: number,
    longitude: number,
  ) {
    // Find charging locations within their radius
    const locations = await this.prisma.chargingLocation.findMany({
      where: { vehicleId },
    });

    for (const location of locations) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        location.latitude,
        location.longitude,
      );
      if (distance <= location.radius) {
        return location;
      }
    }

    return null;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
