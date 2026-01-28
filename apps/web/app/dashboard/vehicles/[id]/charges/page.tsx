'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  ArrowLeft,
  Calendar,
  DollarSign,
  Battery,
  Home,
  Building,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { formatEnergy, formatCurrency, formatDuration, formatDate, formatDateTime, cn } from '@/lib/utils';

export default function ChargesPage() {
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

  const { data: chargesData, isLoading } = useQuery({
    queryKey: ['charges', vehicleId, dateRange],
    queryFn: () => api.getCharges(vehicleId, { startDate, endDate }),
  });

  const { data: summary } = useQuery({
    queryKey: ['charges-summary', vehicleId, dateRange],
    queryFn: () => api.getChargesSummary(vehicleId, { startDate, endDate }),
  });

  const charges = chargesData?.charges || [];
  const total = chargesData?.total || 0;

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
          <h1 className="text-3xl font-bold">Charge History</h1>
          <p className="text-muted-foreground">
            View and analyze your charging sessions
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
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(summary as any).totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Added</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatEnergy((summary as any).totalEnergyAdded || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency((summary as any).totalCost || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost/kWh</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency((summary as any).avgCostPerKwh || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charging Distribution */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Charging Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </span>
                  <span>{Math.round((summary as any).homeChargingPercent || 0)}%</span>
                </div>
                <Progress value={(summary as any).homeChargingPercent || 0} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Supercharger
                  </span>
                  <span>{Math.round((summary as any).superchargerPercent || 0)}%</span>
                </div>
                <Progress value={(summary as any).superchargerPercent || 0} className="h-2 [&>div]:bg-red-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Public
                  </span>
                  <span>{Math.round((summary as any).publicPercent || 0)}%</span>
                </div>
                <Progress value={(summary as any).publicPercent || 0} className="h-2 [&>div]:bg-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charges List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : charges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No charging sessions in this period
            </div>
          ) : (
            <div className="space-y-4">
              {charges.map((charge: any) => (
                <ChargeCard key={charge.id} charge={charge} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChargeCard({ charge }: { charge: any }) {
  const getChargerIcon = () => {
    switch (charge.chargerType) {
      case 'home':
        return Home;
      case 'supercharger':
        return Zap;
      default:
        return Building;
    }
  };

  const ChargerIcon = getChargerIcon();

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          charge.chargerType === 'home' && "bg-green-500/10",
          charge.chargerType === 'supercharger' && "bg-red-500/10",
          !['home', 'supercharger'].includes(charge.chargerType) && "bg-blue-500/10"
        )}>
          <ChargerIcon className={cn(
            "h-6 w-6",
            charge.chargerType === 'home' && "text-green-500",
            charge.chargerType === 'supercharger' && "text-red-500",
            !['home', 'supercharger'].includes(charge.chargerType) && "text-blue-500"
          )} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">
            {charge.locationName || charge.chargerType || 'Unknown Location'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-secondary">
            {charge.chargerType}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(charge.startTime)}
          </span>
          <span>
            {charge.startBattery}% → {charge.endBattery || '?'}%
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{formatEnergy(charge.energyAdded || 0)}</div>
        <div className="text-sm text-muted-foreground">
          {charge.totalCost ? formatCurrency(charge.totalCost) : '--'}
        </div>
      </div>
    </div>
  );
}
