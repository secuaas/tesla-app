'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  Car,
  Battery,
  Lock,
  Unlock,
  Thermometer,
  Zap,
  MapPin,
  Wind,
  Snowflake,
  Sun,
  AlertTriangle,
  ArrowLeft,
  Power,
  Volume2,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BatteryGauge } from '@/components/vehicle/BatteryGauge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => api.getVehicle(vehicleId),
  });

  // Command mutations
  const lockMutation = useMutation({
    mutationFn: () => api.lockVehicle(vehicleId),
    onSuccess: () => {
      toast({ title: 'Vehicle locked' });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to lock', description: error.message, variant: 'destructive' });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: () => api.unlockVehicle(vehicleId),
    onSuccess: () => {
      toast({ title: 'Vehicle unlocked' });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to unlock', description: error.message, variant: 'destructive' });
    },
  });

  const climateMutation = useMutation({
    mutationFn: (start: boolean) => start ? api.startClimate(vehicleId) : api.stopClimate(vehicleId),
    onSuccess: (_, start) => {
      toast({ title: start ? 'Climate started' : 'Climate stopped' });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Climate control failed', description: error.message, variant: 'destructive' });
    },
  });

  const chargeMutation = useMutation({
    mutationFn: (start: boolean) => start ? api.startCharge(vehicleId) : api.stopCharge(vehicleId),
    onSuccess: (_, start) => {
      toast({ title: start ? 'Charging started' : 'Charging stopped' });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Charge control failed', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vehicle not found</h2>
        <p className="text-muted-foreground mb-4">Could not load vehicle data</p>
        <Link href="/dashboard/vehicles">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Button>
        </Link>
      </div>
    );
  }

  const v = vehicle as any;
  const batteryLevel = 75;
  const isLocked = true;
  const isCharging = false;
  const climateOn = false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vehicles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Car className="h-8 w-8" />
            {v.displayName || 'My Tesla'}
          </h1>
          <p className="text-muted-foreground">
            {v.carType} {v.trim} • {v.vin}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Battery & Charge - spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              Battery & Charging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <BatteryGauge
              level={batteryLevel}
              isCharging={isCharging}
              range={batteryLevel * 4}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold">80%</p>
                <p className="text-xs text-muted-foreground">Charge Limit</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold">{isCharging ? '11 kW' : '--'}</p>
                <p className="text-xs text-muted-foreground">Charge Rate</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold">{isCharging ? '2h 15m' : '--'}</p>
                <p className="text-xs text-muted-foreground">Time to Full</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <p className="text-2xl font-bold">320 km</p>
                <p className="text-xs text-muted-foreground">Est. Range</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isCharging ? 'destructive' : 'default'}
                className="flex-1"
                onClick={() => chargeMutation.mutate(!isCharging)}
                disabled={chargeMutation.isPending}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isCharging ? 'Stop Charging' : 'Start Charging'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => isLocked ? unlockMutation.mutate() : lockMutation.mutate()}
              disabled={lockMutation.isPending || unlockMutation.isPending}
            >
              <span className="flex items-center gap-2">
                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                {isLocked ? 'Locked' : 'Unlocked'}
              </span>
              <span className={cn(
                'text-xs px-2 py-1 rounded',
                isLocked ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
              )}>
                {isLocked ? 'Secure' : 'Open'}
              </span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => climateMutation.mutate(!climateOn)}
              disabled={climateMutation.isPending}
            >
              <span className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Climate
              </span>
              <span className={cn(
                'text-xs px-2 py-1 rounded',
                climateOn ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'
              )}>
                {climateOn ? 'On' : 'Off'}
              </span>
            </Button>

            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Sentry Mode
              </span>
              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                Off
              </span>
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Volume2 className="h-4 w-4 mr-2" />
              Honk Horn
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Power className="h-4 w-4 mr-2" />
              Flash Lights
            </Button>
          </CardContent>
        </Card>

        {/* Climate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Climate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <Thermometer className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold">21°C</p>
                <p className="text-xs text-muted-foreground">Inside</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <Snowflake className="h-6 w-6 mx-auto mb-1 text-cyan-500" />
                <p className="text-2xl font-bold">-5°C</p>
                <p className="text-xs text-muted-foreground">Outside</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Target Temperature</span>
                <span className="font-medium">21°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="28"
                defaultValue="21"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-secondary/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Map loading...</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Last location: Home
            </p>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">VIN</span>
              <span className="font-mono text-sm">{v.vin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span>{v.carType || 'Model 3'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trim</span>
              <span>{v.trim || 'Long Range'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Year</span>
              <span>{v.year || '2024'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Odometer</span>
              <span>45,234 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Firmware</span>
              <span>{v.firmwareVersion || '2024.8.5'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={`/dashboard/vehicles/${vehicleId}/trips`}>
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Trip History</p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/dashboard/vehicles/${vehicleId}/charges`}>
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Charge History</p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/dashboard/vehicles/${vehicleId}/stats`}>
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Battery className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Statistics</p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/dashboard/vehicles/${vehicleId}/settings`}>
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Car className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Settings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
