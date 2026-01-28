const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${this.baseUrl}/api${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ accessToken: string; user: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.accessToken);
    return result;
  }

  async register(email: string, password: string, name?: string) {
    const result = await this.request<{ accessToken: string; user: unknown }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(result.accessToken);
    return result;
  }

  async logout() {
    this.setToken(null);
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Users
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: { name?: string }) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getPreferences() {
    return this.request('/users/preferences');
  }

  async updatePreferences(data: Record<string, unknown>) {
    return this.request('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Vehicles
  async getVehicles() {
    return this.request('/vehicles');
  }

  async getVehicle(id: string) {
    return this.request(`/vehicles/${id}`);
  }

  async updateVehicle(id: string, data: Record<string, unknown>) {
    return this.request(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Commands
  async sendCommand(vehicleId: string, command: string, params?: Record<string, unknown>) {
    return this.request(`/vehicles/${vehicleId}/commands`, {
      method: 'POST',
      body: JSON.stringify({ command, params }),
    });
  }

  async lockVehicle(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}/commands/lock`, { method: 'POST' });
  }

  async unlockVehicle(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}/commands/unlock`, { method: 'POST' });
  }

  async startClimate(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}/commands/climate/start`, { method: 'POST' });
  }

  async stopClimate(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}/commands/climate/stop`, { method: 'POST' });
  }

  async startCharge(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}/commands/charge/start`, { method: 'POST' });
  }

  async stopCharge(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}/commands/charge/stop`, { method: 'POST' });
  }

  // Trips
  async getTrips(vehicleId: string, params?: { startDate?: string; endDate?: string; limit?: number }): Promise<{ trips: unknown[]; total: number }> {
    return this.request(`/vehicles/${vehicleId}/trips`, { params });
  }

  async getTripsSummary(vehicleId: string, params?: { startDate?: string; endDate?: string }): Promise<Record<string, unknown>> {
    return this.request(`/vehicles/${vehicleId}/trips/summary`, { params });
  }

  async getTrip(vehicleId: string, tripId: string) {
    return this.request(`/vehicles/${vehicleId}/trips/${tripId}`);
  }

  // Charges
  async getCharges(vehicleId: string, params?: { startDate?: string; endDate?: string; chargerType?: string }): Promise<{ charges: unknown[]; total: number }> {
    return this.request(`/vehicles/${vehicleId}/charges`, { params });
  }

  async getChargesSummary(vehicleId: string, params?: { startDate?: string; endDate?: string }): Promise<Record<string, unknown>> {
    return this.request(`/vehicles/${vehicleId}/charges/summary`, { params });
  }

  async getCharge(vehicleId: string, chargeId: string) {
    return this.request(`/vehicles/${vehicleId}/charges/${chargeId}`);
  }

  // Stats
  async getDailyStats(vehicleId: string, startDate: string, endDate: string): Promise<unknown[]> {
    return this.request(`/vehicles/${vehicleId}/stats/daily`, {
      params: { startDate, endDate },
    });
  }

  async getMonthlyStats(vehicleId: string, year: number, month?: number): Promise<unknown[]> {
    return this.request(`/vehicles/${vehicleId}/stats/monthly`, {
      params: { year, month },
    });
  }

  async getEfficiencyStats(vehicleId: string): Promise<Record<string, unknown>> {
    return this.request(`/vehicles/${vehicleId}/stats/efficiency`);
  }

  async getEnvironmentalStats(vehicleId: string): Promise<Record<string, unknown>> {
    return this.request(`/vehicles/${vehicleId}/stats/environmental`);
  }

  async getStatsOverview(vehicleId: string): Promise<Record<string, unknown>> {
    return this.request(`/vehicles/${vehicleId}/stats/overview`);
  }

  // Billing
  async getApiUsage(vehicleId: string, year: number, month: number) {
    return this.request(`/billing/usage/vehicle/${vehicleId}/monthly`, {
      params: { year, month },
    });
  }

  // Admin
  async getAdminSettings(): Promise<Record<string, unknown>> {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_URL);
