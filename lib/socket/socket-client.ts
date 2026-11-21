import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';

let socket: Socket | null = null;

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
}

export function getSocket(): Socket {
  if (!socket) {
    const url = getSocketUrl();
    const token = useAuthStore.getState().accessToken;

    socket = io(url, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
    });

    // Listen to token updates
    useAuthStore.subscribe((state) => {
      if (socket && state.accessToken) {
        socket.auth = { token: state.accessToken };
      }
    });
  }

  return socket;
}

export function connectSocket(token?: string | null): Socket {
  const s = getSocket();
  const currentToken = token ?? useAuthStore.getState().accessToken;

  if (currentToken) {
    s.auth = { token: currentToken };
  }

  if (!s.connected) {
    s.connect();
  }

  return s;
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
