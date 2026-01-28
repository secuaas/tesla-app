import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { VehiclesService } from '../vehicles/vehicles.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('stats')
@Controller('vehicles/:vehicleId/stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly vehiclesService: VehiclesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily stats for a date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getDailyStats(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    await this.vehiclesService.findById(vehicleId, user.sub);

    return this.statsService.getDailyStatsRange(
      vehicleId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly stats' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: false })
  async getMonthlyStats(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    await this.vehiclesService.findById(vehicleId, user.sub);

    if (month) {
      return this.statsService.getMonthlyStats(vehicleId, year, month);
    }

    // Return all months for the year
    return this.statsService.getMonthlyStatsRange(vehicleId, year, 1, 12);
  }

  @Get('efficiency')
  @ApiOperation({ summary: 'Get efficiency statistics' })
  async getEfficiencyStats(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.vehiclesService.findById(vehicleId, user.sub);

    return this.statsService.getEfficiencyStats(vehicleId);
  }

  @Get('environmental')
  @ApiOperation({ summary: 'Get environmental impact statistics' })
  async getEnvironmentalStats(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.vehiclesService.findById(vehicleId, user.sub);

    // Get user preferences for calculations
    const preferences = await this.prisma.userPreferences.findUnique({
      where: { userId: user.sub },
    });

    return this.statsService.getEnvironmentalStats(vehicleId, {
      gasPrice: preferences?.gasPrice || 1.5,
      equivalentCarMpg: preferences?.equivalentCarMpg || 8.0,
      co2FactorGasoline: preferences?.co2FactorGasoline || 2.31,
      co2FactorElectricity: preferences?.co2FactorElectricity || 0.5,
    });
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get overall vehicle statistics overview' })
  async getOverview(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const vehicle = await this.vehiclesService.findById(vehicleId, user.sub);

    // Get latest telemetry
    const latestSnapshot = await this.prisma.telemetrySnapshot.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStats = await this.statsService.getDailyStats(vehicleId, today);

    // Get this month's stats
    const thisMonth = await this.statsService.getMonthlyStats(
      vehicleId,
      today.getFullYear(),
      today.getMonth() + 1,
    );

    // Get total distance from odometer
    const totalDistance = latestSnapshot?.odometer || 0;

    return {
      vehicle: {
        id: vehicle.id,
        displayName: vehicle.displayName,
        carType: vehicle.carType,
        vin: vehicle.vin,
      },
      current: latestSnapshot
        ? {
            batteryLevel: latestSnapshot.batteryLevel,
            estRange: latestSnapshot.estRange,
            odometer: latestSnapshot.odometer,
            locked: latestSnapshot.locked,
            chargeState: latestSnapshot.chargeState,
            lastSeen: latestSnapshot.timestamp,
          }
        : null,
      today: todayStats,
      thisMonth,
      lifetime: {
        totalDistance,
        totalTrips: await this.prisma.driveSession.count({ where: { vehicleId } }),
        totalCharges: await this.prisma.chargeSession.count({ where: { vehicleId } }),
      },
    };
  }
}
