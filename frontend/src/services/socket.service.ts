import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://sharinghub-chiase-traodoi.onrender.com/api/v1';
const SOCKET_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

class SocketService {
  private socket: Socket | null = null;

  /** Khởi tạo hoặc kết nối lại Socket.io client */
  connect(): Socket {
    if (!this.socket) {
      this.socket = io(`${SOCKET_BASE}/negotiation`, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Đã kết nối đến Gateway thương lượng thời gian thực:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('⚡ Ngắt kết nối khỏi Gateway thương lượng thời gian thực');
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  /** Tham gia phòng chat thương lượng theo ID đề xuất */
  joinRoom(proposalId: string) {
    const socket = this.connect();
    socket.emit('join_room', { proposalId });
  }

  /** Đăng ký lắng nghe sự kiện khi có tin nhắn thương lượng mới */
  onNewMessage(callback: (message: any) => void) {
    const socket = this.connect();
    socket.off('new_message');
    socket.on('new_message', callback);
  }

  /** Tham gia kênh nhận thông báo cá nhân theo ID người dùng */
  joinUserRoom(userId: string) {
    const socket = this.connect();
    socket.emit('join_user', { userId });
  }

  /** Đăng ký lắng nghe sự kiện nhận thông báo đẩy (Push Notification) */
  onPushNotification(callback: (notification: any) => void) {
    const socket = this.connect();
    socket.off('push_notification');
    socket.on('push_notification', callback);
  }

  /** Đăng ký lắng nghe cập nhật số lượng người dùng đang truy cập trực tuyến */
  onOnlineCountUpdate(callback: (data: { count: number }) => void) {
    const socket = this.connect();
    socket.off('online_count_update');
    socket.on('online_count_update', callback);
  }

  /** Rời khỏi phòng chat thương lượng */
  leaveRoom() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  /** Ngắt kết nối socket hoàn toàn */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
