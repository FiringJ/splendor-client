import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  isInitialized: boolean;
  error: string | null;

  // 初始化socket连接
  initSocket: () => Socket;

  // 设置连接状态
  setConnected: (connected: boolean) => void;

  // 设置错误信息
  setError: (error: string | null) => void;

  // 清理socket连接（如果需要）
  cleanup: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  isInitialized: false,
  error: null,

  initSocket: () => {
    // 如果已经初始化，直接返回现有socket
    const { socket, isInitialized } = get();
    if (socket && isInitialized) {
      return socket;
    }

    const newSocket = io(
      process.env.NODE_ENV === 'production' 
        ? 'https://www.splendor.uno' // 使用域名，不需要指定端口
        : 'http://localhost:3001',
      {
        transports: ['websocket', 'polling'], // 添加 polling 作为备选
        secure: true, // 启用 SSL
        rejectUnauthorized: false // 允许自签名证书
      }
    );

    // 设置基本事件监听
    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
      set({ isConnected: true, error: null });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ isConnected: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      set({ error: '连接服务器失败，请检查网络连接', isConnected: false });
    });

    // 更新store
    set({ socket: newSocket, isInitialized: true });

    return newSocket;
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setError: (error) => set({ error }),

  cleanup: () => {
    const { socket } = get();
    if (socket) {
      // 只移除事件监听器，不断开连接
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      console.log('Socket event listeners removed');
    }
  }
}));