import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { VehiclesService } from '../vehicles/vehicles.service';

@ApiTags('trips')
@Controller('vehicles/:vehicleId/trips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all trips for a vehicle' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Verify ownership
    await this.vehiclesService.findById(vehicleId, user.sub);

    return this.tripsService.findAllByVehicle(vehicleId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get trips summary for a vehicle' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSummary(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Verify ownership
    await this.vehiclesService.findById(vehicleId, user.sub);

    return this.tripsService.getSummary(
      vehicleId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':tripId')
  @ApiOperation({ summary: 'Get a specific trip' })
  async findOne(
    @Param('vehicleId') vehicleId: string,
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Verify ownership
    await this.vehiclesService.findById(vehicleId, user.sub);

    return this.tripsService.findById(tripId);
  }
}
