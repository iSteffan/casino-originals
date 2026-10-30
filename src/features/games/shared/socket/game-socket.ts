'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

export type SocketConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function getGameSocket(): Socket | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!socketInstance) {
    socketInstance = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
      timeout: 10000,
    });
  }
  return socketInstance;
}

export function useGameSocket(): {
  socket: Socket | null;
  status: SocketConnectionStatus;
  connected: boolean;
  serverUrl: string;
} {
  const [socket, setSocket] = useState<Socket | null>(() => getGameSocket());
  const [status, setStatus] = useState<SocketConnectionStatus>(() =>
    socket?.connected ? 'connected' : 'connecting',
  );

  useEffect(() => {
    const s = getGameSocket();
    if (!s) return;
    setSocket(s);

    const handleConnect = () => {
      console.log(`[GameSocket] Connected to ${SOCKET_SERVER_URL} (ID: ${s.id})`);
      setStatus('connected');
    };

    const handleDisconnect = (reason: string) => {
      console.log(`[GameSocket] Disconnected:`, reason);
      setStatus('disconnected');
    };

    const handleConnectError = (err: Error) => {
      console.warn(`[GameSocket] Connect error:`, err.message);
      setStatus('disconnected');
    };

    const handleReconnectAttempt = (attempt: number) => {
      console.log(`[GameSocket] Reconnecting (attempt ${attempt})...`);
      setStatus('connecting');
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('connect_error', handleConnectError);
    s.io.on('reconnect_attempt', handleReconnectAttempt);
    s.io.on('reconnect', handleConnect);

    if (s.connected) {
      setStatus('connected');
    } else {
      s.connect();
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('connect_error', handleConnectError);
      s.io.off('reconnect_attempt', handleReconnectAttempt);
      s.io.off('reconnect', handleConnect);
    };
  }, []);

  return {
    socket,
    status,
    connected: status === 'connected' && socket?.connected === true,
    serverUrl: SOCKET_SERVER_URL,
  };
}
