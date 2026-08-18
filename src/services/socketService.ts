import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../utils/authCookie';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket | null {
    const token = getAuthToken() || localStorage.getItem('accessToken');
    if (!token) return null;

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      this.socket = io(WS_URL, {
        auth: { token },
        query: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Socket.IO connected:', this.socket?.id);
      });

      this.socket.on('connect_error', (err) => {
        console.error('⚠️ Socket connection error:', err.message);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });
    } else {
      this.socket.connect();
    }

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public on<T = any>(event: string, callback: (data: T) => void): void {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  public off<T = any>(event: string, callback?: (data: T) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  public emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
