import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { StatsService } from './stats.service';

@Injectable()
export class DailyStatsJob {
  private readonly logger = new Logger(DailyStatsJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  // Run every day at 1 AM
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async calculateYesterdayStats() {
    this.logger.log('Starting daily stats calculation...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    try {
      // Get all vehicles
      const vehicles = await this.prisma.vehicle.findMany({
        select: { id: true },
      });

      for (const vehicle of vehicles) {
        try {
          await this.statsService.calculateDailyStats(vehicle.id, yesterday);
          this.logger.log(`Calculated daily stats for vehicle ${vehicle.id}`);
        } catch (error) {
          this.logger.error(
            `Failed to calculate stats for vehicle ${vehicle.id}:`,
            error,
          );
        }
      }

      this.logger.log('Daily stats calculation completed');
    } catch (error) {
      this.logger.error('Daily stats calculation failed:', error);
    }
  }

  // Run on the 1st of every month at 2 AM
  @Cron('0 2 1 * *')
  async calculateLastMonthStats() {
    this.logger.log('Starting monthly stats calculation...');

    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    try {
      const vehicles = await this.prisma.vehicle.findMany({
        select: { id: true },
      });

      for (const vehicle of vehicles) {
        try {
          await this.calculateMonthlyStats(vehicle.id, year, lastMonth);
          this.logger.log(
            `Calculated monthly stats for vehicle ${vehicle.id} (${year}-${lastMonth})`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to calculate monthly stats for vehicle ${vehicle.id}:`,
            error,
          );
        }
      }

      this.logger.log('Monthly stats calculation completed');
    } catch (error) {
      this.logger.error('Monthly stats calculation failed:', error);
    }
  }

  private async calculateMonthlyStats(
    vehicleId: string,
    year: number,
    month: number,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Aggregate daily stats for the month
    const dailyStats = await this.prisma.dailyStats.findMany({
      where: {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const distanceKm = dailyStats.reduce((sum, d) => sum + d.distanceKm, 0);
    const tripCount = dailyStats.reduce((sum, d) => sum + d.tripCount, 0);
    const drivingHours =
      dailyStats.reduce((sum, d) => sum + d.drivingMinutes, 0) / 60;
    const energyUsedKwh = dailyStats.reduce((sum, d) => sum + d.energyUsedKwh, 0);
    const avgConsumption =
      distanceKm > 0 ? (energyUsedKwh * 1000) / distanceKm : null;

    const chargeCount = dailyStats.reduce((sum, d) => sum + d.chargeCount, 0);
    const energyAddedKwh = dailyStats.reduce(
      (sum, d) => sum + d.energyAddedKwh,
      0,
    );
    const chargingHours =
      dailyStats.reduce((sum, d) => sum + d.chargingMinutes, 0) / 60;
    const chargingCost = dailyStats.reduce((sum, d) => sum + d.chargingCost, 0);

    // Get charge sessions for home/public breakdown
    const charges = await this.prisma.chargeSession.findMany({
      where: {
        vehicleId,
        startTime: { gte: startDate, lte: endDate },
      },
      select: {
        chargerType: true,
        energyAdded: true,
      },
    });

    const homeChargeKwh = charges
      .filter((c) => c.chargerType === 'home')
      .reduce((sum, c) => sum + (c.energyAdded || 0), 0);
    const publicChargeKwh = charges
      .filter((c) => c.chargerType === 'public' || c.chargerType === 'destination')
      .reduce((sum, c) => sum + (c.energyAdded || 0), 0);
    const superchargeKwh = charges
      .filter((c) => c.chargerType === 'supercharger')
      .reduce((sum, c) => sum + (c.energyAdded || 0), 0);

    // Get previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthStats = await this.prisma.monthlyStats.findUnique({
      where: {
        vehicleId_year_month: { vehicleId, year: prevYear, month: prevMonth },
      },
    });

    // Get same month last year for comparison
    const lastYearStats = await this.prisma.monthlyStats.findUnique({
      where: {
        vehicleId_year_month: { vehicleId, year: year - 1, month },
      },
    });

    const vsLastMonth = prevMonthStats?.distanceKm
      ? ((distanceKm - prevMonthStats.distanceKm) / prevMonthStats.distanceKm) *
        100
      : null;
    const vsLastYear = lastYearStats?.distanceKm
      ? ((distanceKm - lastYearStats.distanceKm) / lastYearStats.distanceKm) *
        100
      : null;

    return this.prisma.monthlyStats.upsert({
      where: {
        vehicleId_year_month: { vehicleId, year, month },
      },
      update: {
        distanceKm,
        tripCount,
        drivingHours,
        energyUsedKwh,
        avgConsumption,
        chargeCount,
        energyAddedKwh,
        chargingHours,
        chargingCost,
        homeChargeKwh,
        publicChargeKwh,
        superchargeKwh,
        efficiency: avgConsumption,
        vsLastMonth,
        vsLastYear,
      },
      create: {
        vehicleId,
        year,
        month,
        distanceKm,
        tripCount,
        drivingHours,
        energyUsedKwh,
        avgConsumption,
        chargeCount,
        energyAddedKwh,
        chargingHours,
        chargingCost,
        homeChargeKwh,
        publicChargeKwh,
        superchargeKwh,
        efficiency: avgConsumption,
        vsLastMonth,
        vsLastYear,
      },
    });
  }
}
