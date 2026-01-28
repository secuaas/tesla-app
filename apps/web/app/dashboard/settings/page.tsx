'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import {
  Car,
  Key,
  Bell,
  DollarSign,
  Thermometer,
  Ruler,
  Save,
  ExternalLink,
} from 'lucide-react';

interface UserPreferences {
  distanceUnit: string;
  temperatureUnit: string;
  currencyCode: string;
  homeElectricityRate: number;
  gasPrice: number;
  notifyChargeComplete: boolean;
  notifyLowBattery: boolean;
  lowBatteryThreshold: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      api.getMe(),
      api.getPreferences().catch(() => null),
    ])
      .then(([userData, prefsData]: any) => {
        setUser(userData);
        setPreferences(prefsData || {
          distanceUnit: 'km',
          temperatureUnit: 'celsius',
          currencyCode: 'CAD',
          homeElectricityRate: 0.10,
          gasPrice: 1.50,
          notifyChargeComplete: true,
          notifyLowBattery: true,
          lowBatteryThreshold: 20,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      await api.updatePreferences(preferences as unknown as Record<string, unknown>);
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Tesla Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Tesla Account
          </CardTitle>
          <CardDescription>
            Connect your Tesla account to access your vehicles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Tesla Fleet API</p>
                <p className="text-sm text-muted-foreground">
                  Not connected
                </p>
              </div>
            </div>
            <Button disabled>
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Tesla
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Tesla API credentials need to be configured by the administrator.
            Once configured, you&apos;ll be able to connect your Tesla account here.
          </p>
        </CardContent>
      </Card>

      {/* Units & Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Units & Currency
          </CardTitle>
          <CardDescription>
            Choose your preferred measurement units
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="distanceUnit">Distance</Label>
              <select
                id="distanceUnit"
                className="w-full h-10 px-3 rounded-md border bg-background"
                value={preferences?.distanceUnit || 'km'}
                onChange={(e) => setPreferences(p => p ? {...p, distanceUnit: e.target.value} : p)}
              >
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles (mi)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatureUnit">Temperature</Label>
              <select
                id="temperatureUnit"
                className="w-full h-10 px-3 rounded-md border bg-background"
                value={preferences?.temperatureUnit || 'celsius'}
                onChange={(e) => setPreferences(p => p ? {...p, temperatureUnit: e.target.value} : p)}
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="w-full h-10 px-3 rounded-md border bg-background"
                value={preferences?.currencyCode || 'CAD'}
                onChange={(e) => setPreferences(p => p ? {...p, currencyCode: e.target.value} : p)}
              >
                <option value="CAD">CAD ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Energy Rates
          </CardTitle>
          <CardDescription>
            Set your electricity and fuel prices for cost calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="electricityRate">Electricity Rate ($/kWh)</Label>
              <Input
                id="electricityRate"
                type="number"
                step="0.01"
                value={preferences?.homeElectricityRate || 0.10}
                onChange={(e) => setPreferences(p => p ? {...p, homeElectricityRate: parseFloat(e.target.value)} : p)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gasPrice">Gas Price ($/L)</Label>
              <Input
                id="gasPrice"
                type="number"
                step="0.01"
                value={preferences?.gasPrice || 1.50}
                onChange={(e) => setPreferences(p => p ? {...p, gasPrice: parseFloat(e.target.value)} : p)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Charge Complete</Label>
              <p className="text-sm text-muted-foreground">
                Notify when charging is complete
              </p>
            </div>
            <Switch
              checked={preferences?.notifyChargeComplete ?? true}
              onCheckedChange={(checked) => setPreferences(p => p ? {...p, notifyChargeComplete: checked} : p)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Low Battery Warning</Label>
              <p className="text-sm text-muted-foreground">
                Notify when battery drops below threshold
              </p>
            </div>
            <Switch
              checked={preferences?.notifyLowBattery ?? true}
              onCheckedChange={(checked) => setPreferences(p => p ? {...p, notifyLowBattery: checked} : p)}
            />
          </div>

          {preferences?.notifyLowBattery && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="lowBatteryThreshold">Low Battery Threshold (%)</Label>
              <Input
                id="lowBatteryThreshold"
                type="number"
                min="5"
                max="50"
                value={preferences?.lowBatteryThreshold || 20}
                onChange={(e) => setPreferences(p => p ? {...p, lowBatteryThreshold: parseInt(e.target.value)} : p)}
                className="w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name || ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
