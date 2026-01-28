import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { CommandsModule } from './modules/commands/commands.module';
import { HistoryModule } from './modules/history/history.module';
import { StatsModule } from './modules/stats/stats.module';
import { BillingModule } from './modules/billing/billing.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    TelemetryModule,
    CommandsModule,
    HistoryModule,
    StatsModule,
    BillingModule,
    AdminModule,
  ],
})
export class AppModule {}
