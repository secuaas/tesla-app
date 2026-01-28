import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { DailyStatsJob } from './daily-stats.job';

@Module({
  imports: [VehiclesModule],
  controllers: [StatsController],
  providers: [StatsService, DailyStatsJob],
  exports: [StatsService],
})
export class StatsModule {}
