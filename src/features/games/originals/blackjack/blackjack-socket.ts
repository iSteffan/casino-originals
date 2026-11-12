import { z } from 'zod';
import type { Socket } from 'socket.io-client';

export const blackjackSuitSchema = z.enum([
  'Hearts',
  'Diamonds',
  'Clubs',
  'Spades',
]);

export const blackjackRankSchema = z.enum([
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Jack',
  'Queen',
  'King',
  'Ace',
]);

export const blackjackHandResultSchema = z.enum([
  'pending',
  'stand',
  'busted',
  'win',
  'lose',
  'push',
  'blackjack',
]);

export const blackjackCardSchema = z.object({
  suit: blackjackSuitSchema,
  rank: blackjackRankSchema,
});

export const blackjackSettlementSchema = z.object({
  totalStake: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  profit: z.union([z.string(), z.number()]).transform(String),
  handsWinAmount: z.union([z.string(), z.number()]).transform(String),
  isPlayerWin: z.boolean(),
});

export const blackjackStartResultSchema = z.object({
  roundId: z.number(),
  status: z.enum(['insurance', 'playing', 'finished']),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  currencyId: z.string(),
  playerHands: z.array(z.array(blackjackCardSchema)),
  dealerUpCard: blackjackCardSchema,
  dealerHand: z.array(blackjackCardSchema).optional(),
  canSplit: z.boolean(),
  insuranceOffered: z.boolean(),
  handResults: z.array(blackjackHandResultSchema).optional(),
  isWin: z.boolean().optional(),
  isLose: z.boolean().optional(),
  isPush: z.boolean().optional(),
  settlement: blackjackSettlementSchema.optional(),
});

export const blackjackInsuranceResultSchema = z.object({
  roundId: z.number(),
  status: z.enum(['playing', 'finished']),
  insuranceTaken: z.boolean(),
  insuranceResult: z.enum(['win', 'lose']).optional(),
  canSplit: z.boolean(),
  dealerHand: z.array(blackjackCardSchema).optional(),
  handResults: z.array(blackjackHandResultSchema).optional(),
  isWin: z.boolean().optional(),
  isLose: z.boolean().optional(),
  isPush: z.boolean().optional(),
  settlement: blackjackSettlementSchema.optional(),
});

export const blackjackActionResultSchema = z.object({
  roundId: z.number(),
  action: z.enum(['hit', 'stand', 'double', 'split']),
  status: z.enum(['playing', 'finished']),
  handIndex: z.number(),
  card: blackjackCardSchema.optional(),
  splitDrawnCards: z.tuple([blackjackCardSchema, blackjackCardSchema]).optional(),
  playerHands: z.array(z.array(blackjackCardSchema)),
  activeHandIndex: z.number(),
  isSplitDone: z.boolean(),
  canSplit: z.boolean(),
  isDoubled: z.boolean().optional(),
  dealerHand: z.array(blackjackCardSchema).optional(),
  handResults: z.array(blackjackHandResultSchema),
  isWin: z.boolean().optional(),
  isLose: z.boolean().optional(),
  isPush: z.boolean().optional(),
  settlement: blackjackSettlementSchema.optional(),
});

export const blackjackExceptionSchema = z.union([
  z.string(),
  z.object({ message: z.string() }),
  z.object({ error: z.string() }),
]);

export type BlackjackSocketCard = z.infer<typeof blackjackCardSchema>;
export type BlackjackSocketHandResult = z.infer<typeof blackjackHandResultSchema>;
export type BlackjackSocketSettlement = z.infer<typeof blackjackSettlementSchema>;
export type BlackjackStartResult = z.infer<typeof blackjackStartResultSchema>;
export type BlackjackInsuranceResult = z.infer<typeof blackjackInsuranceResultSchema>;
export type BlackjackActionResult = z.infer<typeof blackjackActionResultSchema>;

export interface BlackjackStartPayload {
  amount: string;
  currencyId: string;
  clientSeed?: string;
}

export interface BlackjackInsurancePayload {
  accepted: boolean;
}

export type BlackjackActionCommand = 'hit' | 'stand' | 'double' | 'split';

function createRequestId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function parseExceptionMessage(data: unknown): string {
  const parsed = blackjackExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

function sendBlackjackCommand<T>(
  socket: Socket,
  emitEvent: string,
  resultEvent: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  payload: unknown,
  handlers: {
    onResult: (result: T) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off(resultEvent, handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError(`Command ${emitEvent} timed out.`);
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = schema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError(`Invalid ${resultEvent} schema from server.`);
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on(resultEvent, handleResult);
  socket.on('exception', handleException);

  socket.emit(emitEvent, payload, { requestId });
  return cleanup;
}

export function sendBlackjackStartCommand(
  socket: Socket,
  payload: BlackjackStartPayload,
  handlers: {
    onResult: (result: BlackjackStartResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  return sendBlackjackCommand(
    socket,
    'blackjack:start',
    'blackjack:start:result',
    blackjackStartResultSchema,
    payload,
    handlers,
    timeoutMs,
  );
}

export function sendBlackjackInsuranceCommand(
  socket: Socket,
  payload: BlackjackInsurancePayload,
  handlers: {
    onResult: (result: BlackjackInsuranceResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  return sendBlackjackCommand(
    socket,
    'blackjack:insurance',
    'blackjack:insurance:result',
    blackjackInsuranceResultSchema,
    payload,
    handlers,
    timeoutMs,
  );
}

export function sendBlackjackActionCommand(
  socket: Socket,
  action: BlackjackActionCommand,
  handlers: {
    onResult: (result: BlackjackActionResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  return sendBlackjackCommand(
    socket,
    `blackjack:${action}`,
    'blackjack:action:result',
    blackjackActionResultSchema,
    {},
    handlers,
    timeoutMs,
  );
}
