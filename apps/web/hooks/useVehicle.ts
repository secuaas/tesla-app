'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { socket } from '@/lib/socket';
import { WS_EVENTS } from '@teslavault/shared';

interface VehicleState {
  batteryLevel: number | null;
  estRange: number | null;
  locked: boolean | null;
  chargeState: string | null;
  chargePower: number | null;
  insideTemp: number | null;
  outsideTemp: number | null;
  hvacPower: boolean | null;
  sentryMode: boolean | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  gear: string | null;
  odometer: number | null;
  lastSeen: Date | null;
}

export function useVehicle(vehicleId: string) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<VehicleState>({
    batteryLevel: null,
    estRange: null,
    locked: null,
    chargeState: null,
    chargePower: null,
    insideTemp: null,
    outsideTemp: null,
    hvacPower: null,
    sentryMode: null,
    latitude: null,
    longitude: null,
    speed: null,
    gear: null,
    odometer: null,
    lastSeen: null,
  });

  // Fetch vehicle data
  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => api.getVehicle(vehicleId),
    enabled: !!vehicleId,
  });

  // Fetch stats overview for current state
  const { data: overview } = useQuery({
    queryKey: ['vehicle-overview', vehicleId],
    queryFn: () => api.getStatsOverview(vehicleId),
    enabled: !!vehicleId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!vehicleId) return;

    socket.connect();
    socket.subscribeToVehicle(vehicleId);

    const unsubscribeTelemetry = socket.on(WS_EVENTS.TELEMETRY_UPDATE, (data: any) => {
      if (data.vehicleId === vehicleId) {
        setState((prev) => ({
          ...prev,
          ...data.data,
          lastSeen: new Date(),
        }));
      }
    });

    const unsubscribeState = socket.on(WS_EVENTS.VEHICLE_STATE, (data: any) => {
      if (data.vehicleId === vehicleId) {
        setState((prev) => ({
          ...prev,
          ...data.state,
          lastSeen: new Date(),
        }));
      }
    });

    const unsubscribeCharge = socket.on(WS_EVENTS.CHARGE_COMPLETED, (data: any) => {
      if (data.vehicleId === vehicleId) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['vehicle-overview', vehicleId] });
      }
    });

    return () => {
      socket.unsubscribeFromVehicle(vehicleId);
      unsubscribeTelemetry();
      unsubscribeState();
      unsubscribeCharge();
    };
  }, [vehicleId, queryClient]);

  // Update state from overview if available
  useEffect(() => {
    if (overview?.current) {
      setState((prev) => ({
        ...prev,
        ...overview.current,
      }));
    }
  }, [overview]);

  return {
    vehicle,
    state,
    overview,
    isLoading,
    error,
    isOnline: state.lastSeen
      ? Date.now() - new Date(state.lastSeen).getTime() < 5 * 60 * 1000
      : false,
  };
}

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
  });
}
