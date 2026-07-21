import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NegotiationService } from './negotiation.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'negotiation',
})
export class NegotiationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NegotiationGateway.name);

  constructor(private negotiationService: NegotiationService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to WSS negotiation: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { proposalId: string },
  ) {
    client.join(data.proposalId);
    this.logger.log(`Client ${client.id} joined proposal room: ${data.proposalId}`);
    return { status: 'joined', room: data.proposalId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { proposalId: string; userId: string; noiDung: string },
  ) {
    try {
      const message = await this.negotiationService.createMessage(
        data.proposalId,
        data.userId,
        data.noiDung,
      );

      // Broadcast to room
      this.server.to(data.proposalId).emit('new_message', message);

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
