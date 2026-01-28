import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommandsService, TeslaCommand } from './commands.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('commands')
@Controller('vehicles/:vehicleId/commands')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post()
  @ApiOperation({ summary: 'Execute a vehicle command' })
  async executeCommand(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { command: TeslaCommand; params?: Record<string, unknown> },
  ) {
    return this.commandsService.executeCommand(
      vehicleId,
      user.sub,
      body.command,
      body.params,
    );
  }

  @Post('lock')
  @ApiOperation({ summary: 'Lock the vehicle' })
  async lock(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.lock(vehicleId, user.sub);
  }

  @Post('unlock')
  @ApiOperation({ summary: 'Unlock the vehicle' })
  async unlock(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.unlock(vehicleId, user.sub);
  }

  @Post('climate/start')
  @ApiOperation({ summary: 'Start climate control' })
  async startClimate(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.startClimate(vehicleId, user.sub);
  }

  @Post('climate/stop')
  @ApiOperation({ summary: 'Stop climate control' })
  async stopClimate(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.stopClimate(vehicleId, user.sub);
  }

  @Post('charge/start')
  @ApiOperation({ summary: 'Start charging' })
  async startCharge(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.startCharge(vehicleId, user.sub);
  }

  @Post('charge/stop')
  @ApiOperation({ summary: 'Stop charging' })
  async stopCharge(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.stopCharge(vehicleId, user.sub);
  }

  @Post('charge/limit')
  @ApiOperation({ summary: 'Set charge limit' })
  async setChargeLimit(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { percent: number },
  ) {
    return this.commandsService.setChargeLimit(
      vehicleId,
      user.sub,
      body.percent,
    );
  }

  @Post('flash')
  @ApiOperation({ summary: 'Flash lights' })
  async flashLights(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.flashLights(vehicleId, user.sub);
  }

  @Post('honk')
  @ApiOperation({ summary: 'Honk horn' })
  async honkHorn(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.honkHorn(vehicleId, user.sub);
  }

  @Post('wake')
  @ApiOperation({ summary: 'Wake up the vehicle' })
  async wakeUp(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandsService.wakeUp(vehicleId, user.sub);
  }
}
