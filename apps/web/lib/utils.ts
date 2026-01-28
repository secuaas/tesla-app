import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number, unit: 'km' | 'miles' = 'km'): string {
  if (unit === 'miles') {
    return `${(km * 0.621371).toFixed(1)} mi`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatTemperature(
  celsius: number,
  unit: 'celsius' | 'fahrenheit' = 'celsius'
): string {
  if (unit === 'fahrenheit') {
    return `${Math.round(celsius * 1.8 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}

export function formatConsumption(whPerKm: number): string {
  return `${Math.round(whPerKm)} Wh/km`;
}

export function formatCurrency(amount: number, currency = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}
