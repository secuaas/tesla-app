'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Leaf,
  DollarSign,
  Battery,
  Zap,
  Car,
  Gauge,
  TreePine,
  Droplets,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { formatDistance, formatEnergy, formatCurrency, formatConsumption } from '@/lib/utils';

export default function StatsPage() {
  const params = useParams();
  const vehicleId = params.id as string;

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['stats-overview', vehicleId],
    queryFn: () => api.getStatsOverview(vehicleId),
  });

  const { data: efficiency, isLoading: efficiencyLoading } = useQuery({
    queryKey: ['stats-efficiency', vehicleId],
    queryFn: () => api.getEfficiencyStats(vehicleId),
  });

  const { data: environmental, isLoading: envLoading } = useQuery({
    queryKey: ['stats-environmental', vehicleId],
    queryFn: () => api.getEnvironmentalStats(vehicleId),
  });

  const isLoading = overviewLoading || efficiencyLoading || envLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = overview as any;
  const effStats = efficiency as any;
  const envStats = environmental as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/vehicles/${vehicleId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights
          </p>
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistance(stats?.lifetime?.totalDistance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime odometer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.lifetime?.totalTrips || 0}
            </div>
            <p className="text-xs text-muted-foreground">Recorded trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.lifetime?.totalCharges || 0}
            </div>
            <p className="text-xs text-muted-foreground">Charging sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatConsumption(effStats?.lifetimeEfficiency || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime average</p>
          </CardContent>
        </Card>
      </div>

      {/* This Month */}
      {stats?.thisMonth && (
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Summary of the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-2xl font-bold">
                  {formatDistance(stats.thisMonth.distanceKm || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Energy Used</p>
                <p className="text-2xl font-bold">
                  {formatEnergy(stats.thisMonth.energyUsedKwh || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Charging Cost</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.thisMonth.chargingCost || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environmental Impact */}
      {envStats && (
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              Environmental Impact
            </CardTitle>
            <CardDescription>Your contribution to a cleaner planet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <TreePine className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(envStats.co2Avoided || 0)}
                </p>
                <p className="text-sm text-muted-foreground">kg CO2 avoided</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <TreePine className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(envStats.treesEquivalent || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Trees equivalent</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(envStats.fuelNotUsed || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Liters fuel saved</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-background/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Money Saved vs Gasoline
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(envStats.moneySavedVsGas || 0)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Compared to an equivalent gasoline vehicle
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Efficiency by Temperature */}
      {effStats?.efficiencyByTemp && effStats.efficiencyByTemp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Efficiency by Temperature</CardTitle>
            <CardDescription>How temperature affects your consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {effStats.efficiencyByTemp.map((range: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{range.rangeStart}°C to {range.rangeEnd}°C</span>
                    <span className="font-medium">
                      {formatConsumption(range.avgEfficiency)} ({range.sampleCount} trips)
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (range.avgEfficiency / 200) * 100)}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best/Worst Trips */}
      {(effStats?.bestTrip || effStats?.worstTrip) && (
        <div className="grid gap-4 md:grid-cols-2">
          {effStats.bestTrip && (
            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-500">Best Efficiency Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span>{formatDistance(effStats.bestTrip.distance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consumption</span>
                    <span className="font-bold text-green-500">
                      {formatConsumption(effStats.bestTrip.consumption)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {effStats.worstTrip && (
            <Card className="border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-500">Highest Consumption Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span>{formatDistance(effStats.worstTrip.distance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consumption</span>
                    <span className="font-bold text-red-500">
                      {formatConsumption(effStats.worstTrip.consumption)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
