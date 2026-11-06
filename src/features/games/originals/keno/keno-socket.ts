import { z } from 'zod';
import type { Socket } from 'socket.io-client';

export interface KenoBetPayload {
  amount: string;
  currencyId: string;
  risk: string;
  selectedNumbers: number[];
  clientSeed?: string;
}

export interface KenoBetResult {
  selectedNumbers: number[];
  drawnNumbers: number[];
  hits: number[];
  hitsCount: number;
  risk: 'classic' | 'low' | 'medium' | 'high';
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
  isWin: boolean;
}

export const kenoBetResultSchema = z.object({
  selectedNumbers: z.array(z.number()),
  drawnNumbers: z.array(z.number()),
  hits: z.array(z.number()),
  hitsCount: z.number(),
  risk: z.enum(['classic', 'low', 'medium', 'high']),
  payoutMultiplier: z.number(),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  isWin: z.boolean(),
});

export const kenoExceptionSchema = z.union([
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
  const parsed = kenoExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

export function sendKenoBetCommand(
  socket: Socket,
  payload: KenoBetPayload,
  handlers: {
    onResult: (result: KenoBetResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('keno:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Keno bet timed out. Falling back to local RNG.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = kenoBetResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid keno result schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('keno:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('keno:bet', payload, { requestId });
  return cleanup;
}
