'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Car,
  Battery,
  MapPin,
  Lock,
  Unlock,
  Thermometer,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { formatDistance, formatRelativeTime, cn } from '@/lib/utils';

export default function DashboardPage() {
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Tesla vehicles
          </p>
        </div>
      </div>

      {vehicleList.length === 0 ? (
        <Card className="p-12 text-center">
          <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No vehicles found</h2>
          <p className="text-muted-foreground mb-6">
            Connect your Tesla account to start monitoring your vehicles
          </p>
          <Button>Connect Tesla Account</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {vehicleList.map((vehicle: any) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {vehicleList.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Distance Today
              </CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-- km</div>
              <p className="text-xs text-muted-foreground">
                Across all vehicles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Energy Used Today
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-- kWh</div>
              <p className="text-xs text-muted-foreground">
                Total consumption
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trips Today
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Completed trips
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Charging Cost
              </CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$--</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: any }) {
  // In a real app, we'd fetch the real-time state
  const batteryLevel = 75;
  const isLocked = true;
  const isCharging = false;

  return (
    <Link href={`/dashboard/vehicles/${vehicle.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {vehicle.displayName || 'My Tesla'}
              </CardTitle>
              <CardDescription>
                {vehicle.carType} {vehicle.trim}
              </CardDescription>
            </div>
            {isLocked ? (
              <Lock className="h-5 w-5 text-green-500" />
            ) : (
              <Unlock className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                "h-2",
                batteryLevel <= 20 && "bg-red-200 [&>div]:bg-red-500",
                batteryLevel > 20 && batteryLevel <= 50 && "bg-yellow-200 [&>div]:bg-yellow-500",
                batteryLevel > 50 && "bg-green-200 [&>div]:bg-green-500"
              )}
            />
            <p className="text-xs text-muted-foreground">
              ~{formatDistance(batteryLevel * 4)} range
            </p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {isCharging && (
              <span className="flex items-center gap-1 text-green-500">
                <Zap className="h-4 w-4" />
                Charging
              </span>
            )}
            <span className="flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              21°C
            </span>
          </div>

          {/* Last seen */}
          <p className="text-xs text-muted-foreground">
            Last updated: {formatRelativeTime(new Date())}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
