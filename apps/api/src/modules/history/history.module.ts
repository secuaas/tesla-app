import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [VehiclesModule],
  controllers: [TripsController, ChargesController],
  providers: [TripsService, ChargesService],
  exports: [TripsService, ChargesService],
})
export class HistoryModule {}
