import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats() {
    const [userCount, vehicleCount, tripCount, chargeCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vehicle.count(),
      this.prisma.driveSession.count(),
      this.prisma.chargeSession.count(),
    ]);

    return {
      users: userCount,
      vehicles: vehicleCount,
      trips: tripCount,
      charges: chargeCount,
    };
  }

  async getAllUsers(options?: { limit?: number; offset?: number }) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: { vehicles: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      this.prisma.user.count(),
    ]);

    return { users, total };
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async getSystemSettings() {
    let settings = await this.prisma.systemSettings.findUnique({
      where: { id: 'system' },
    });

    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: { id: 'system' },
      });
    }

    // Mask the client secret for security
    return {
      ...settings,
      teslaClientSecret: settings.teslaClientSecret ? '••••••••' : null,
    };
  }

  async updateSystemSettings(data: {
    teslaClientId?: string;
    teslaClientSecret?: string;
    teslaRedirectUri?: string;
    teslaAudience?: string;
    appName?: string;
    maintenanceMode?: boolean;
  }, updatedBy: string) {
    // Don't update secret if it's the masked value
    if (data.teslaClientSecret === '••••••••') {
      delete data.teslaClientSecret;
    }

    return this.prisma.systemSettings.upsert({
      where: { id: 'system' },
      update: { ...data, updatedBy },
      create: { id: 'system', ...data, updatedBy },
    });
  }
}
