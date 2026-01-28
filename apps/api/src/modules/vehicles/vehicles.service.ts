import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async findByVin(vin: string) {
    return this.prisma.vehicle.findUnique({
      where: { vin },
    });
  }

  async create(
    userId: string,
    data: {
      teslaId: string;
      vin: string;
      displayName?: string;
      carType?: string;
      trim?: string;
      exteriorColor?: string;
      wheelType?: string;
      year?: number;
    },
  ) {
    return this.prisma.vehicle.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      displayName?: string;
      originalRange?: number;
      batteryCapacity?: number;
    },
  ) {
    const vehicle = await this.findById(id, userId);

    return this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data,
    });
  }

  async updateFleetStatus(
    id: string,
    data: {
      virtualKeyPaired?: boolean;
      commandProtocolReq?: boolean;
      firmwareVersion?: string;
      telemetryVersion?: string;
    },
  ) {
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        fleetStatusUpdatedAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    const vehicle = await this.findById(id, userId);

    return this.prisma.vehicle.delete({
      where: { id: vehicle.id },
    });
  }
}
