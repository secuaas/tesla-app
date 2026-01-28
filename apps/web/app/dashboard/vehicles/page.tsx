'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Car,
  Battery,
  Lock,
  Unlock,
  Thermometer,
  Zap,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { formatDistance, formatRelativeTime, cn } from '@/lib/utils';

export default function VehiclesPage() {
  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load vehicles</h2>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  const vehicleList = vehicles as any[] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage and monitor your Tesla vehicles
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {vehicleList.length === 0 ? (
        <Card className="p-12 text-center">
          <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No vehicles connected</h2>
          <p className="text-muted-foreground mb-6">
            Connect your Tesla account to start monitoring your vehicles
          </p>
          <Button>Connect Tesla Account</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {vehicleList.map((vehicle: any) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: any }) {
  const batteryLevel = 75;
  const isLocked = true;
  const isCharging = false;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {vehicle.displayName || 'My Tesla'}
            </CardTitle>
            <CardDescription>
              {vehicle.carType} {vehicle.trim} • {vehicle.vin}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Lock className="h-5 w-5 text-green-500" />
            ) : (
              <Unlock className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Battery */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Battery className="h-4 w-4" />
              Battery
            </span>
            <span className="font-medium">{batteryLevel}%</span>
          </div>
          <Progress
            value={batteryLevel}
            className={cn(
              "h-3",
              batteryLevel <= 20 && "bg-red-200 [&>div]:bg-red-500",
              batteryLevel > 20 && batteryLevel <= 50 && "bg-yellow-200 [&>div]:bg-yellow-500",
              batteryLevel > 50 && "bg-green-200 [&>div]:bg-green-500"
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>~{formatDistance(batteryLevel * 4)} range</span>
            {isCharging && (
              <span className="text-green-500 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Charging at 11 kW
              </span>
            )}
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-3 gap-4 py-2 border-y">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Odometer</p>
            <p className="font-medium">45,234 km</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Inside</p>
            <p className="font-medium flex items-center justify-center gap-1">
              <Thermometer className="h-3 w-3" />
              21°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Outside</p>
            <p className="font-medium">-5°C</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/dashboard/vehicles/${vehicle.id}`} className="flex-1">
            <Button variant="default" className="w-full">
              View Details
            </Button>
          </Link>
          <Button variant="outline" size="icon">
            <Lock className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Thermometer className="h-4 w-4" />
          </Button>
        </div>

        {/* Last seen */}
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {formatRelativeTime(new Date())}
        </p>
      </CardContent>
    </Card>
  );
}
