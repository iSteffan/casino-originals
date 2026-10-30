import { z } from 'zod';
import type { Socket } from 'socket.io-client';
import type { DiceControlsDirection } from '#ui/features/games/originals/dice/dice-controls/dice-controls.types';

export interface DiceBetPayload {
  target: number;
  direction: DiceControlsDirection;
  amount: string;
  currencyId: string;
  clientSeed?: string;
}

export interface DiceResult {
  target: number;
  direction: DiceControlsDirection;
  rollResult: number;
  isWinner: boolean;
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
}

export const diceResultSchema = z.object({
  target: z.number().finite().min(3).max(97),
  direction: z.enum(['UNDER', 'OVER']),
  rollResult: z.number().finite().min(0).max(100),
  isWinner: z.boolean(),
  payoutMultiplier: z.number().finite().nonnegative(),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
});

export const diceExceptionSchema = z.union([
  z.string(),
  z.object({ message: z.string() }),
  z.object({ error: z.string() }),
]);

export function sendDiceBetCommand(
  socket: Socket,
  payload: DiceBetPayload,
  handlers: {
    onResult: (result: DiceResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 10000,
): () => void {
  const requestId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('dice:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Server response timed out. Reverting to local roll.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) {
        return;
      }
    }

    const parsed = diceResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data as DiceResult);
    } else {
      cleanup();
      handlers.onError('Received invalid dice result schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) {
        return;
      }
    }

    const parsed = diceExceptionSchema.safeParse(data);
    const message = parsed.success
      ? typeof parsed.data === 'string'
        ? parsed.data
        : 'message' in parsed.data
          ? parsed.data.message
          : parsed.data.error
      : 'Server error';

    cleanup();
    handlers.onError(message);
  };

  socket.on('dice:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('dice:bet', payload, { requestId });

  return cleanup;
}
