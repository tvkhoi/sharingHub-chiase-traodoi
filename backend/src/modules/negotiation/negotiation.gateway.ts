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
  private activeSockets = new Set<string>();

  constructor(private negotiationService: NegotiationService) {}

  handleConnection(client: Socket) {
    this.activeSockets.add(client.id);
    this.logger.log(`Client connected to WSS negotiation: ${client.id}. Online sockets: ${this.activeSockets.size}`);
    this.broadcastOnlineCount();
  }

  handleDisconnect(client: Socket) {
    this.activeSockets.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}. Online sockets: ${this.activeSockets.size}`);
    this.broadcastOnlineCount();
  }

  public getOnlineUsersCount(): number {
    return this.activeSockets.size;
  }

  private broadcastOnlineCount() {
    if (this.server) {
      this.server.emit('online_count_update', { count: this.activeSockets.size });
    }
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

      // Send push notification to partner
      try {
        const proposal = await this.negotiationService.getProposalById(data.proposalId);
        if (proposal) {
          const isOwner = proposal.bai_dang?.chu_so_huu_id === data.userId;
          const targetUserId = isOwner ? proposal.nguoi_gui_id : proposal.bai_dang?.chu_so_huu_id;
          if (targetUserId) {
            const senderName = message.nguoi_gui?.ho_so?.ho_ten || 'Đối tác';
            this.sendNotificationToUser(targetUserId, {
              type: 'NEW_MESSAGE',
              title: 'Tin nhắn thương lượng mới 💬',
              message: `${senderName}: "${data.noiDung.length > 40 ? data.noiDung.substring(0, 40) + '...' : data.noiDung}"`,
              link: '/proposals',
              payload: { proposalId: data.proposalId },
            });
          }
        }
      } catch (err) {
        this.logger.error('Lỗi gửi push notification tin nhắn thương lượng:', err);
      }

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('join_user')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      const room = `user_${data.userId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined personal notification channel: ${room}`);
      return { status: 'joined', room };
    }
  }

  sendNotificationToUser(userId: string, notification: {
    type: 'NEW_PROPOSAL' | 'PROPOSAL_ACCEPTED' | 'PROPOSAL_REJECTED' | 'TRANSACTION_UPDATED' | 'ASSET_MODERATED' | 'NEW_REVIEW' | 'NEW_MESSAGE';
    title: string;
    message: string;
    link?: string;
    payload?: any;
  }) {
    const room = `user_${userId}`;
    const fullPayload = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notification,
    };
    this.logger.log(`Emitting push_notification to channel ${room}: ${notification.title}`);
    this.server.to(room).emit('push_notification', fullPayload);
  }
}
