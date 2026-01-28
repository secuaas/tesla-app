import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: ['km', 'miles'] })
  @IsString()
  @IsIn(['km', 'miles'])
  @IsOptional()
  distanceUnit?: string;

  @ApiPropertyOptional({ enum: ['celsius', 'fahrenheit'] })
  @IsString()
  @IsIn(['celsius', 'fahrenheit'])
  @IsOptional()
  temperatureUnit?: string;

  @ApiPropertyOptional({ example: 'CAD' })
  @IsString()
  @IsOptional()
  currencyCode?: string;

  @ApiPropertyOptional({ example: 0.1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  homeElectricityRate?: number;

  @ApiPropertyOptional({ example: 0.15 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  homePeakRate?: number;

  @ApiPropertyOptional({ example: 0.08 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  homeOffPeakRate?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsNumber()
  @Min(0)
  @Max(23)
  @IsOptional()
  peakHoursStart?: number;

  @ApiPropertyOptional({ example: 23 })
  @IsNumber()
  @Min(0)
  @Max(23)
  @IsOptional()
  peakHoursEnd?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  gasPrice?: number;

  @ApiPropertyOptional({ example: 8.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  equivalentCarMpg?: number;

  @ApiPropertyOptional({ example: 2.31 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  co2FactorGasoline?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  co2FactorElectricity?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyChargeComplete?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyLowBattery?: boolean;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(5)
  @Max(50)
  @IsOptional()
  lowBatteryThreshold?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyTirePressure?: boolean;
}
