import type { Socket } from 'socket.io-client';
import { z } from 'zod';

import type { DoubleBetType } from './double.types';

export const doubleColorSchema = z.enum(['RED', 'BLACK', 'GREEN']);
export const doubleBetTypeSchema = z.enum(['RED', 'BLACK', 'GREEN', 'JOKER']);
export const doublePhaseSchema = z.enum(['BETTING', 'LOCKED', 'RESOLVING', 'FINISHED']);

export const doubleOutcomeSchema = z.object({
  color: doubleColorSchema,
  hasJoker: z.boolean(),
});

export const doubleHistoryItemSchema = z.object({
  id: z.string(),
  color: doubleColorSchema,
  hasJoker: z.boolean(),
});

export const doubleStateSchema = z.object({
  roundId: z.number(),
  phase: doublePhaseSchema,
  durationMs: z.number(),
  remainingMs: z.number(),
  tileIndex: z.number(),
  history: z.array(doubleHistoryItemSchema).default([]),
});

export const doublePhaseEventSchema = z.object({
  roundId: z.number(),
  phase: doublePhaseSchema,
  durationMs: z.number(),
  remainingMs: z.number(),
  tileIndex: z.number(),
  outcome: doubleOutcomeSchema.optional(),
  historyItem: doubleHistoryItemSchema.optional(),
});

export const doubleBetAcceptedSchema = z.object({
  roundId: z.number(),
  totalStake: z.union([z.string(), z.number()]).transform(String),
  currencyId: z.string(),
});

export const doubleResultSchema = z.object({
  roundId: z.number(),
  tileIndex: z.number(),
  outcome: doubleOutcomeSchema,
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  winningTypes: z.array(doubleBetTypeSchema),
  isWin: z.boolean(),
  currencyId: z.string(),
});

export const doubleExceptionSchema = z.union([
  z.string(),
  z.object({ message: z.string() }),
  z.object({ error: z.string() }),
]);

export type DoubleStatePayload = z.infer<typeof doubleStateSchema>;
export type DoublePhasePayload = z.infer<typeof doublePhaseEventSchema>;
export type DoubleBetAcceptedPayload = z.infer<typeof doubleBetAcceptedSchema>;
export type DoubleResultPayload = z.infer<typeof doubleResultSchema>;

export interface DoubleBetPayload {
  amount: string;
  currencyId: string;
  types: DoubleBetType[];
  roundId?: number;
}

function createRequestId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function parseExceptionMessage(data: unknown): string {
  const parsed = doubleExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

export function sendDoubleBetCommand(
  socket: Socket,
  payload: DoubleBetPayload,
  handlers: {
    onAccepted: (accepted: DoubleBetAcceptedPayload) => void;
    onError: (errorMessage: string, meta: { isRejection: boolean }) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('double:bet-accepted', handleAccepted);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Double bet timed out. Falling back to local round.', {
        isRejection: false,
      });
    }
  }, timeoutMs);

  const handleAccepted = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = doubleBetAcceptedSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onAccepted(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid double bet acknowledgment from server.', {
        isRejection: false,
      });
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data), { isRejection: true });
  };

  socket.on('double:bet-accepted', handleAccepted);
  socket.on('exception', handleException);

  socket.emit('double:bet', payload, { requestId });

  return cleanup;
}
