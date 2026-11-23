import { z } from 'zod';
import type { Socket } from 'socket.io-client';

export interface RouletteSocketBetItem {
  cellId: string;
  amount: string;
}

export interface RouletteSpinPayload {
  bets: RouletteSocketBetItem[];
  currencyId?: string;
  clientSeed?: string;
}

export const rouletteBetItemSchema = z.object({
  cellId: z.string(),
  amount: z.union([z.string(), z.number()]).transform(String),
});

export const rouletteSpinResultSchema = z.object({
  roundId: z.number(),
  winningNumber: z.number(),
  color: z.enum(['red', 'black', 'green']),
  totalStake: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  profit: z.union([z.string(), z.number()]).transform(String),
  winningStake: z.union([z.string(), z.number()]).transform(String),
  payoutMultiplier: z.number(),
  isWin: z.boolean(),
  currencyId: z.string(),
  bets: z.array(rouletteBetItemSchema).optional(),
});

export const rouletteExceptionSchema = z.union([
  z.string(),
  z.object({ message: z.string() }),
  z.object({ error: z.string() }),
]);

export type RouletteSpinResult = z.infer<typeof rouletteSpinResultSchema>;

function createRequestId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function parseExceptionMessage(data: unknown): string {
  const parsed = rouletteExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

export function sendRouletteSpinCommand(
  socket: Socket,
  payload: RouletteSpinPayload,
  handlers: {
    onResult: (result: RouletteSpinResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('roulette:spin:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Roulette spin timed out. Falling back to local RNG.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = rouletteSpinResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid roulette result schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('roulette:spin:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('roulette:spin', payload, { requestId });
  return cleanup;
}
