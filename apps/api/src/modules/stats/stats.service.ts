import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CONVERSIONS } from '@teslavault/shared';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyStats(vehicleId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.dailyStats.findUnique({
      where: {
        vehicleId_date: {
          vehicleId,
          date: startOfDay,
        },
      },
    });
  }

  async getDailyStatsRange(vehicleId: string, startDate: Date, endDate: Date) {
    return this.prisma.dailyStats.findMany({
      where: {
        vehicleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getMonthlyStats(vehicleId: string, year: number, month: number) {
    return this.prisma.monthlyStats.findUnique({
      where: {
        vehicleId_year_month: {
          vehicleId,
          year,
          month,
        },
      },
    });
  }

  async getMonthlyStatsRange(vehicleId: string, startYear: number, startMonth: number, months: number) {
    const stats = [];
    let currentYear = startYear;
    let currentMonth = startMonth;

    for (let i = 0; i < months; i++) {
      const stat = await this.getMonthlyStats(vehicleId, currentYear, currentMonth);
      if (stat) stats.push(stat);

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return stats;
  }

  async getEnvironmentalStats(vehicleId: string, preferences: {
    gasPrice: number;
    equivalentCarMpg: number;
    co2FactorGasoline: number;
    co2FactorElectricity: number;
  }) {
    // Get all monthly stats for the vehicle
    const monthlyStats = await this.prisma.monthlyStats.findMany({
      where: { vehicleId },
    });

    const totalDistance = monthlyStats.reduce((sum, s) => sum + s.distanceKm, 0);
    const totalEnergy = monthlyStats.reduce((sum, s) => sum + s.energyUsedKwh, 0);

    // Calculate fuel equivalent
    const fuelNotUsed = (totalDistance / 100) * preferences.equivalentCarMpg;

    // Calculate CO2 avoided
    const co2FromGas = fuelNotUsed * preferences.co2FactorGasoline;
    const co2FromElectric = totalEnergy * preferences.co2FactorElectricity;
    const co2Avoided = co2FromGas - co2FromElectric;

    // Calculate money saved
    const gasCost = fuelNotUsed * preferences.gasPrice;
    const totalChargingCost = monthlyStats.reduce((sum, s) => sum + s.chargingCost, 0);
    const moneySaved = gasCost - totalChargingCost;

    // Trees equivalent (1 tree absorbs ~22kg CO2/year)
    const treesEquivalent = co2Avoided / 22;

    return {
      co2Avoided,
      treesEquivalent,
      fuelNotUsed,
      moneySavedVsGas: moneySaved,
      moneySavedVsDiesel: moneySaved * 0.85, // Diesel typically cheaper
      greenEnergyRatio: null, // Would need external data
    };
  }

  async getEfficiencyStats(vehicleId: string) {
    const trips = await this.prisma.driveSession.findMany({
      where: { vehicleId },
      select: {
        id: true,
        startTime: true,
        distance: true,
        energyUsed: true,
        avgConsumption: true,
        avgOutsideTemp: true,
        avgSpeed: true,
      },
    });

    if (trips.length === 0) {
      return null;
    }

    // Lifetime efficiency
    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalEnergy = trips.reduce((sum, t) => sum + (t.energyUsed || 0), 0);
    const lifetimeEfficiency = totalDistance > 0 ? (totalEnergy * 1000) / totalDistance : 0;

    // Best and worst trips
    const tripsWithConsumption = trips.filter(t => t.avgConsumption && t.distance && t.distance > 5);
    const sortedByEfficiency = [...tripsWithConsumption].sort(
      (a, b) => (a.avgConsumption || 0) - (b.avgConsumption || 0),
    );

    const bestTrip = sortedByEfficiency[0] || null;
    const worstTrip = sortedByEfficiency[sortedByEfficiency.length - 1] || null;

    // Efficiency by temperature ranges
    const tempRanges = [
      { rangeStart: -20, rangeEnd: 0 },
      { rangeStart: 0, rangeEnd: 10 },
      { rangeStart: 10, rangeEnd: 20 },
      { rangeStart: 20, rangeEnd: 30 },
      { rangeStart: 30, rangeEnd: 45 },
    ];

    const efficiencyByTemp = tempRanges.map(range => {
      const tripsInRange = trips.filter(
        t => t.avgOutsideTemp !== null &&
            t.avgOutsideTemp >= range.rangeStart &&
            t.avgOutsideTemp < range.rangeEnd &&
            t.avgConsumption,
      );
      const avgEfficiency = tripsInRange.length > 0
        ? tripsInRange.reduce((sum, t) => sum + (t.avgConsumption || 0), 0) / tripsInRange.length
        : 0;
      return { ...range, avgEfficiency, sampleCount: tripsInRange.length };
    });

    return {
      lifetimeEfficiency,
      efficiencyByTemp,
      efficiencyBySpeed: [], // TODO: implement
      efficiencyTrend: [], // TODO: implement
      bestTrip: bestTrip ? {
        tripId: bestTrip.id,
        date: bestTrip.startTime,
        distance: bestTrip.distance,
        consumption: bestTrip.avgConsumption,
      } : null,
      worstTrip: worstTrip ? {
        tripId: worstTrip.id,
        date: worstTrip.startTime,
        distance: worstTrip.distance,
        consumption: worstTrip.avgConsumption,
      } : null,
      winterAvg: null,
      summerAvg: null,
      highwayAvg: null,
      cityAvg: null,
    };
  }

  async calculateDailyStats(vehicleId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get trips for the day
    const trips = await this.prisma.driveSession.findMany({
      where: {
        vehicleId,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    // Get charges for the day
    const charges = await this.prisma.chargeSession.findMany({
      where: {
        vehicleId,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    const distanceKm = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const drivingMinutes = trips.reduce((sum, t) => sum + (t.duration || 0), 0);
    const energyUsedKwh = trips.reduce((sum, t) => sum + (t.energyUsed || 0), 0);
    const avgConsumption = distanceKm > 0 ? (energyUsedKwh * 1000) / distanceKm : null;
    const maxSpeed = Math.max(...trips.map(t => t.maxSpeed || 0), 0) || null;
    const avgSpeed = drivingMinutes > 0 ? (distanceKm / drivingMinutes) * 60 : null;

    const energyAddedKwh = charges.reduce((sum, c) => sum + (c.energyAdded || 0), 0);
    const chargingMinutes = charges.reduce((sum, c) => sum + (c.duration || 0), 0);
    const chargingCost = charges.reduce((sum, c) => sum + (c.totalCost || 0), 0);

    return this.prisma.dailyStats.upsert({
      where: {
        vehicleId_date: { vehicleId, date: startOfDay },
      },
      update: {
        distanceKm,
        tripCount: trips.length,
        drivingMinutes,
        energyUsedKwh,
        avgConsumption,
        avgSpeed,
        maxSpeed,
        chargeCount: charges.length,
        energyAddedKwh,
        chargingMinutes,
        chargingCost,
      },
      create: {
        vehicleId,
        date: startOfDay,
        distanceKm,
        tripCount: trips.length,
        drivingMinutes,
        energyUsedKwh,
        avgConsumption,
        avgSpeed,
        maxSpeed,
        chargeCount: charges.length,
        energyAddedKwh,
        chargingMinutes,
        chargingCost,
      },
    });
  }
}
