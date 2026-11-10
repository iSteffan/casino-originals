import { z } from 'zod';
import type { Socket } from 'socket.io-client';

export interface PlinkoBetPayload {
  amount: string;
  currencyId: string;
  risk: 'low' | 'medium' | 'high';
  rows: number;
  clientSeed?: string;
}

export interface PlinkoBetResult {
  bucketIndex: number;
  multiplier: number;
  payoutAmount: string;
  betAmount: string;
  isWin: boolean;
  risk: 'low' | 'medium' | 'high';
  rows: number;
}

export const plinkoBetResultSchema = z.object({
  bucketIndex: z.number(),
  multiplier: z.number(),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  isWin: z.boolean(),
  risk: z.enum(['low', 'medium', 'high']),
  rows: z.number(),
});

export const plinkoExceptionSchema = z.union([
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
  const parsed = plinkoExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

export function sendPlinkoBetCommand(
  socket: Socket,
  payload: PlinkoBetPayload,
  handlers: {
    onResult: (result: PlinkoBetResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('plinko:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Plinko bet timed out. Falling back to local RNG.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = plinkoBetResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid plinko result schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('plinko:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('plinko:bet', payload, { requestId });

  return cleanup;
}
