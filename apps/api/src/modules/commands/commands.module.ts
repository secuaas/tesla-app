import { Module } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { CommandsController } from './commands.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [VehiclesModule, BillingModule],
  controllers: [CommandsController],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}
