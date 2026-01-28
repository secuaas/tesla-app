'use client';

import { cn } from '@/lib/utils';
import { Battery, BatteryCharging, BatteryLow, BatteryWarning } from 'lucide-react';

interface BatteryGaugeProps {
  level: number;
  isCharging?: boolean;
  range?: number;
  rangeUnit?: 'km' | 'miles';
  className?: string;
}

export function BatteryGauge({
  level,
  isCharging = false,
  range,
  rangeUnit = 'km',
  className,
}: BatteryGaugeProps) {
  const getBatteryIcon = () => {
    if (isCharging) return BatteryCharging;
    if (level <= 10) return BatteryWarning;
    if (level <= 20) return BatteryLow;
    return Battery;
  };

  const BatteryIcon = getBatteryIcon();

  const getColor = () => {
    if (level <= 10) return 'text-red-500';
    if (level <= 20) return 'text-orange-500';
    if (level <= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getGradient = () => {
    if (level <= 10) return 'from-red-500 to-red-600';
    if (level <= 20) return 'from-orange-500 to-orange-600';
    if (level <= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main battery display */}
      <div className="flex items-center gap-4">
        <BatteryIcon className={cn('h-12 w-12', getColor(), isCharging && 'animate-pulse')} />
        <div className="flex-1">
          <div className="text-4xl font-bold">{level}%</div>
          {range !== undefined && (
            <div className="text-sm text-muted-foreground">
              ~{range} {rangeUnit} range
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 bg-gradient-to-r rounded-full transition-all duration-500',
            getGradient()
          )}
          style={{ width: `${level}%` }}
        />
        {isCharging && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>

      {/* Charge status */}
      {isCharging && (
        <div className="flex items-center gap-2 text-sm text-green-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Charging
        </div>
      )}
    </div>
  );
}
