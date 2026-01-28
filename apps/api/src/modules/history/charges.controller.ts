import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChargesService } from './charges.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { VehiclesService } from '../vehicles/vehicles.service';

@ApiTags('charges')
@Controller('vehicles/:vehicleId/charges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChargesController {
  constructor(
    private readonly chargesService: ChargesService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all charge sessions for a vehicle' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'chargerType', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('chargerType') chargerType?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Verify ownership
    await this.vehiclesService.findById(vehicleId, user.sub);

    return this.chargesService.findAllByVehicle(vehicleId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      chargerType,
      limit,
      offset,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get charge sessions summary for a vehicle' })
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

    return this.chargesService.getSummary(
      vehicleId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':chargeId')
  @ApiOperation({ summary: 'Get a specific charge session' })
  async findOne(
    @Param('vehicleId') vehicleId: string,
    @Param('chargeId') chargeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Verify ownership
    await this.vehiclesService.findById(vehicleId, user.sub);

    return this.chargesService.findById(chargeId);
  }
}
