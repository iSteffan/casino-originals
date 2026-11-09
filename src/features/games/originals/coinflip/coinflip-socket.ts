import { z } from 'zod';
import type { Socket } from 'socket.io-client';
import type { CoinflipSide } from './coinflip.types';

export interface CoinflipBetPayload {
  amount: string;
  currencyId: string;
  side: CoinflipSide;
  clientSeed?: string;
}

export interface CoinflipBetResult {
  side: CoinflipSide;
  landedSide: CoinflipSide;
  isWin: boolean;
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
}

export const coinflipBetResultSchema = z.object({
  side: z.enum(['HEADS', 'TAILS']),
  landedSide: z.enum(['HEADS', 'TAILS']),
  isWin: z.boolean(),
  payoutMultiplier: z.number(),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
});

export const coinflipExceptionSchema = z.union([
  z.string(),
  z.object({ message: z.string() }),
  z.object({ error: z.string() }),
]);

function createRequestId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function parseExceptionMessage(data: unknown): string {
  const parsed = coinflipExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

export function sendCoinflipBetCommand(
  socket: Socket,
  payload: CoinflipBetPayload,
  handlers: {
    onResult: (result: CoinflipBetResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('coinflip:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Coinflip bet timed out. Falling back to local RNG.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = coinflipBetResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid coinflip result schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('coinflip:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('coinflip:bet', payload, { requestId });

  return cleanup;
}
