import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('usage/total')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get total API usage across all vehicles (admin only)' })
  async getTotalUsage() {
    return this.billingService.getTotalUsage();
  }

  @Get('usage/vehicle/:vehicleId/daily')
  @ApiOperation({ summary: 'Get daily API usage for a vehicle' })
  @ApiQuery({ name: 'date', required: false })
  async getDailyUsage(
    @Param('vehicleId') vehicleId: string,
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return this.billingService.getDailyUsage(vehicleId, targetDate);
  }

  @Get('usage/vehicle/:vehicleId/monthly')
  @ApiOperation({ summary: 'Get monthly API usage for a vehicle' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  async getMonthlyUsage(
    @Param('vehicleId') vehicleId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.billingService.getMonthlyUsage(vehicleId, year, month);
  }

  @Get('usage/vehicle/:vehicleId/breakdown')
  @ApiOperation({ summary: 'Get cost breakdown for a vehicle' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getCostBreakdown(
    @Param('vehicleId') vehicleId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.billingService.getCostBreakdown(
      vehicleId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
