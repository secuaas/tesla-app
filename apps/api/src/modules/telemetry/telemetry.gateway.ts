import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WS_EVENTS } from '@teslavault/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class TelemetryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('TelemetryGateway');
  private vehicleSubscriptions = new Map<string, Set<string>>(); // vehicleId -> Set<socketId>

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove client from all vehicle subscriptions
    for (const [vehicleId, subscribers] of this.vehicleSubscriptions) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.vehicleSubscriptions.delete(vehicleId);
      }
    }
  }

  @SubscribeMessage(WS_EVENTS.SUBSCRIBE_VEHICLE)
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vehicleId: string },
  ) {
    const { vehicleId } = data;
    this.logger.log(`Client ${client.id} subscribing to vehicle ${vehicleId}`);

    if (!this.vehicleSubscriptions.has(vehicleId)) {
      this.vehicleSubscriptions.set(vehicleId, new Set());
    }
    this.vehicleSubscriptions.get(vehicleId)!.add(client.id);

    client.join(`vehicle:${vehicleId}`);

    return { success: true, vehicleId };
  }

  @SubscribeMessage(WS_EVENTS.UNSUBSCRIBE_VEHICLE)
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vehicleId: string },
  ) {
    const { vehicleId } = data;
    this.logger.log(
      `Client ${client.id} unsubscribing from vehicle ${vehicleId}`,
    );

    const subscribers = this.vehicleSubscriptions.get(vehicleId);
    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.vehicleSubscriptions.delete(vehicleId);
      }
    }

    client.leave(`vehicle:${vehicleId}`);

    return { success: true, vehicleId };
  }

  // Called by the telemetry service when new data arrives
  broadcastTelemetryUpdate(vehicleId: string, data: unknown) {
    this.server.to(`vehicle:${vehicleId}`).emit(WS_EVENTS.TELEMETRY_UPDATE, {
      vehicleId,
      data,
      timestamp: new Date(),
    });
  }

  // Called when vehicle state changes
  broadcastVehicleState(vehicleId: string, state: unknown) {
    this.server.to(`vehicle:${vehicleId}`).emit(WS_EVENTS.VEHICLE_STATE, {
      vehicleId,
      state,
      timestamp: new Date(),
    });
  }

  // Called when a charge session starts
  broadcastChargeStarted(vehicleId: string, sessionId: string) {
    this.server.to(`vehicle:${vehicleId}`).emit(WS_EVENTS.CHARGE_STARTED, {
      vehicleId,
      sessionId,
      timestamp: new Date(),
    });
  }

  // Called when a charge session completes
  broadcastChargeCompleted(vehicleId: string, sessionId: string) {
    this.server.to(`vehicle:${vehicleId}`).emit(WS_EVENTS.CHARGE_COMPLETED, {
      vehicleId,
      sessionId,
      timestamp: new Date(),
    });
  }

  // Called when a drive session starts
  broadcastDriveStarted(vehicleId: string, sessionId: string) {
    this.server.to(`vehicle:${vehicleId}`).emit(WS_EVENTS.DRIVE_STARTED, {
      vehicleId,
      sessionId,
      timestamp: new Date(),
    });
  }

  // Called when a drive session completes
  broadcastDriveCompleted(vehicleId: string, sessionId: string) {
    this.server.to(`vehicle:${vehicleId}`).emit(WS_EVENTS.DRIVE_COMPLETED, {
      vehicleId,
      sessionId,
      timestamp: new Date(),
    });
  }
}
