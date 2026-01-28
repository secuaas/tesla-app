import { io, Socket } from 'socket.io-client';
import { WS_EVENTS } from '@teslavault/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Set up event forwarding
    Object.values(WS_EVENTS).forEach((event) => {
      this.socket?.on(event, (data) => {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
          eventListeners.forEach((listener) => listener(data));
        }
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  subscribeToVehicle(vehicleId: string) {
    this.socket?.emit(WS_EVENTS.SUBSCRIBE_VEHICLE, { vehicleId });
  }

  unsubscribeFromVehicle(vehicleId: string) {
    this.socket?.emit(WS_EVENTS.UNSUBSCRIBE_VEHICLE, { vehicleId });
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: (data: unknown) => void) {
    this.listeners.get(event)?.delete(callback);
  }
}

export const socket = new SocketClient();
