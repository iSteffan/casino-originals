'use client';

import { cn } from '#ui/lib/cn';
import type { SocketConnectionStatus } from './game-socket';

export function SocketStatusBadge({
  status,
  className,
}: {
  status: SocketConnectionStatus;
  className?: string;
}) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-ds-full text-xs font-semibold tracking-wide border transition-all',
        isConnected
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : isConnecting
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
            : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60',
        className,
      )}
      title={
        isConnected
          ? 'Connected to WebSocket Server (RNG on server)'
          : isConnecting
            ? 'Connecting to WebSocket Server...'
            : 'Offline / Local RNG fallback'
      }
    >
      <span
        className={cn(
          'size-2 rounded-full',
          isConnected
            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
            : isConnecting
              ? 'bg-amber-400'
              : 'bg-zinc-500',
        )}
      />
      <span>
        {isConnected ? 'WS Live' : isConnecting ? 'Connecting...' : 'Offline RNG'}
      </span>
    </div>
  );
}
