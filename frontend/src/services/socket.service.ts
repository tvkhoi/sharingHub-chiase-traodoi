import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://sharinghub-chiase-traodoi.onrender.com/api/v1';
const SOCKET_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(`${SOCKET_BASE}/negotiation`, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to Socket.io Realtime Negotiation Gateway:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('⚡ Disconnected from Socket.io Realtime Negotiation Gateway');
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  joinRoom(proposalId: string) {
    const socket = this.connect();
    socket.emit('join_room', { proposalId });
  }

  onNewMessage(callback: (message: any) => void) {
    const socket = this.connect();
    socket.off('new_message');
    socket.on('new_message', callback);
  }

  leaveRoom() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
