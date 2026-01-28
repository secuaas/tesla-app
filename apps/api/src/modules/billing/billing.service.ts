import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TESLA_API_COSTS } from '@teslavault/shared';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackStreamingSignal(vehicleId: string, count = 1) {
    await this.updateUsage(vehicleId, { streamingSignals: count });
  }

  async trackCommand(vehicleId: string) {
    await this.updateUsage(vehicleId, { commands: 1 });
  }

  async trackVehicleDataCall(vehicleId: string) {
    await this.updateUsage(vehicleId, { vehicleDataCalls: 1 });
    this.logger.warn(
      `Vehicle data REST call made for ${vehicleId} - consider using Fleet Telemetry instead`,
    );
  }

  async trackWake(vehicleId: string) {
    await this.updateUsage(vehicleId, { wakes: 1 });
  }

  private async updateUsage(
    vehicleId: string,
    increments: {
      streamingSignals?: number;
      commands?: number;
      vehicleDataCalls?: number;
      wakes?: number;
    },
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate cost increment
    const costIncrement =
      (increments.streamingSignals || 0) * TESLA_API_COSTS.STREAMING_SIGNAL +
      (increments.commands || 0) * TESLA_API_COSTS.COMMAND +
      (increments.vehicleDataCalls || 0) * TESLA_API_COSTS.VEHICLE_DATA +
      (increments.wakes || 0) * TESLA_API_COSTS.WAKE;

    try {
      await this.prisma.apiUsage.upsert({
        where: {
          vehicleId_date: { vehicleId, date: today },
        },
        update: {
          streamingSignals: { increment: increments.streamingSignals || 0 },
          commands: { increment: increments.commands || 0 },
          vehicleDataCalls: { increment: increments.vehicleDataCalls || 0 },
          wakes: { increment: increments.wakes || 0 },
          estimatedCost: { increment: costIncrement },
        },
        create: {
          vehicleId,
          date: today,
          streamingSignals: increments.streamingSignals || 0,
          commands: increments.commands || 0,
          vehicleDataCalls: increments.vehicleDataCalls || 0,
          wakes: increments.wakes || 0,
          estimatedCost: new Decimal(costIncrement),
        },
      });
    } catch (error) {
      this.logger.error('Failed to track API usage:', error);
    }
  }

  async getDailyUsage(vehicleId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.apiUsage.findUnique({
      where: {
        vehicleId_date: { vehicleId, date: startOfDay },
      },
    });
  }

  async getMonthlyUsage(vehicleId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const usage = await this.prisma.apiUsage.findMany({
      where: {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totals = usage.reduce(
      (acc, u) => ({
        streamingSignals: acc.streamingSignals + u.streamingSignals,
        commands: acc.commands + u.commands,
        vehicleDataCalls: acc.vehicleDataCalls + u.vehicleDataCalls,
        wakes: acc.wakes + u.wakes,
        estimatedCost: acc.estimatedCost + Number(u.estimatedCost),
      }),
      {
        streamingSignals: 0,
        commands: 0,
        vehicleDataCalls: 0,
        wakes: 0,
        estimatedCost: 0,
      },
    );

    // Apply monthly discount
    const adjustedCost = Math.max(
      0,
      totals.estimatedCost - TESLA_API_COSTS.MONTHLY_DISCOUNT,
    );

    return {
      ...totals,
      rawCost: totals.estimatedCost,
      monthlyDiscount: TESLA_API_COSTS.MONTHLY_DISCOUNT,
      adjustedCost,
      dailyBreakdown: usage,
    };
  }

  async getTotalUsage() {
    const usage = await this.prisma.apiUsage.aggregate({
      _sum: {
        streamingSignals: true,
        commands: true,
        vehicleDataCalls: true,
        wakes: true,
        estimatedCost: true,
      },
    });

    return {
      streamingSignals: usage._sum.streamingSignals || 0,
      commands: usage._sum.commands || 0,
      vehicleDataCalls: usage._sum.vehicleDataCalls || 0,
      wakes: usage._sum.wakes || 0,
      totalCost: Number(usage._sum.estimatedCost) || 0,
    };
  }

  async getCostBreakdown(vehicleId: string, startDate: Date, endDate: Date) {
    const usage = await this.prisma.apiUsage.findMany({
      where: {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const breakdown = {
      streaming: 0,
      commands: 0,
      vehicleData: 0,
      wakes: 0,
    };

    for (const u of usage) {
      breakdown.streaming += u.streamingSignals * TESLA_API_COSTS.STREAMING_SIGNAL;
      breakdown.commands += u.commands * TESLA_API_COSTS.COMMAND;
      breakdown.vehicleData += u.vehicleDataCalls * TESLA_API_COSTS.VEHICLE_DATA;
      breakdown.wakes += u.wakes * TESLA_API_COSTS.WAKE;
    }

    const total =
      breakdown.streaming +
      breakdown.commands +
      breakdown.vehicleData +
      breakdown.wakes;

    return {
      breakdown,
      total,
      recommendations: this.generateRecommendations(breakdown),
    };
  }

  private generateRecommendations(breakdown: {
    streaming: number;
    commands: number;
    vehicleData: number;
    wakes: number;
  }): string[] {
    const recommendations: string[] = [];

    if (breakdown.vehicleData > 1) {
      recommendations.push(
        'Consider using Fleet Telemetry instead of vehicle_data REST calls to reduce costs by up to 97%',
      );
    }

    if (breakdown.wakes > 5) {
      recommendations.push(
        'High number of wake calls detected. Consider checking vehicle connectivity before sending commands.',
      );
    }

    if (breakdown.commands > 50) {
      recommendations.push(
        'High command usage. Consider batching commands where possible.',
      );
    }

    return recommendations;
  }
}
