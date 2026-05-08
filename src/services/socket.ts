import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Adjust as needed for production

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('Socket.IO Connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO Disconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
