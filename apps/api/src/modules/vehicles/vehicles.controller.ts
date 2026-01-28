import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vehicles for current user' })
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.vehiclesService.findAllByUser(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vehicle' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vehiclesService.findById(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle settings' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    data: {
      displayName?: string;
      originalRange?: number;
      batteryCapacity?: number;
    },
  ) {
    return this.vehiclesService.update(id, user.sub, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a vehicle' })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.vehiclesService.delete(id, user.sub);
    return { message: 'Vehicle removed successfully' };
  }
}
