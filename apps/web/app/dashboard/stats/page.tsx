'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  BarChart3,
  Battery,
  Car,
  Fuel,
  Leaf,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface Vehicle {
  id: string;
  displayName: string;
  carType: string;
}

export default function StatsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVehicles()
      .then((data: any) => setVehicles(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground">
            Overview of your fleet performance
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No vehicles connected</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Connect your Tesla account to start tracking statistics.
              Go to Settings to link your Tesla account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          Overview of your fleet performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">Connected to TeslaVault</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Average Wh/km</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO2 Saved</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">kg this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Savings</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">$ this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Statistics</CardTitle>
          <CardDescription>
            Select a vehicle to view detailed statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <a
                key={vehicle.id}
                href={`/dashboard/vehicles/${vehicle.id}/stats`}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{vehicle.displayName || 'Tesla'}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.carType || 'Vehicle'}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistics Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Detailed statistics will be available once your vehicles start reporting telemetry data.
            This includes:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Daily and monthly driving statistics</li>
            <li>Energy consumption trends</li>
            <li>Charging history and costs</li>
            <li>Environmental impact (CO2 savings)</li>
            <li>Fuel cost comparisons</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
