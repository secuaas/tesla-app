'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Zap,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Gauge,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDistance, formatDuration, formatConsumption, formatDate, formatDateTime } from '@/lib/utils';

export default function TripsPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    switch (dateRange) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const { startDate, endDate } = getDateRange();

  const { data: tripsData, isLoading } = useQuery({
    queryKey: ['trips', vehicleId, dateRange],
    queryFn: () => api.getTrips(vehicleId, { startDate, endDate, limit: 50 }),
  });

  const { data: summary } = useQuery({
    queryKey: ['trips-summary', vehicleId, dateRange],
    queryFn: () => api.getTripsSummary(vehicleId, { startDate, endDate }),
  });

  const trips = (tripsData as any)?.trips || [];
  const total = (tripsData as any)?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/vehicles/${vehicleId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Trip History</h1>
          <p className="text-muted-foreground">
            View and analyze your driving history
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(summary as any).totalTrips}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDistance((summary as any).totalDistance)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summary as any).totalEnergyUsed?.toFixed(1)} kWh
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatConsumption((summary as any).avgConsumption || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trips List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trips recorded in this period
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip: any) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TripCard({ trip }: { trip: any }) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">
            {trip.startLocationName || 'Unknown'} → {trip.endLocationName || 'Unknown'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(trip.startTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(trip.duration || 0)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{formatDistance(trip.distance || 0)}</div>
        <div className="text-sm text-muted-foreground">
          {formatConsumption(trip.avgConsumption || 0)}
        </div>
      </div>
    </div>
  );
}
