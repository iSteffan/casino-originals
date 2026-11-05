import { z } from 'zod';
import type { Socket } from 'socket.io-client';

export interface TowersStartPayload {
  amount: string;
  currencyId: string;
  difficulty: number;
  clientSeed?: string;
}

export interface TowersStartResult {
  status: 'in_progress';
  betAmount: string;
  difficulty: number;
  rows: number;
  cols: number;
  trapsPerRow: number;
  nextMultiplier: number;
}

export interface TowersRevealPayload {
  rowIndex: number;
  columnIndex: number;
}

export interface TowersStepResult {
  status: 'in_progress';
  isTrap: false;
  rowIndex: number;
  columnIndex: number;
  rowTrapColumns: number[];
  payoutMultiplier: number;
  currentPayout: string;
  nextMultiplier?: number;
  isCompleted: false;
}

export interface TowersEndResult {
  status: 'lost' | 'won' | 'cashed_out';
  isTrap: boolean;
  hitRow?: number;
  hitColumn?: number;
  revealedRow?: number;
  revealedColumn?: number;
  trapColumns: number[][];
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
  isCompleted: true;
}

export interface TowersAutobetPayload {
  amount: string;
  currencyId: string;
  difficulty: number;
  selection: number[];
  clientSeed?: string;
}

export interface TowersAutobetResult {
  win: boolean;
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
  hitRow?: number;
  hitColumn?: number;
  trapColumns: number[][];
  selection: number[];
}

export const towersStartResultSchema = z.object({
  status: z.literal('in_progress'),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  difficulty: z.number(),
  rows: z.number(),
  cols: z.number(),
  trapsPerRow: z.number(),
  nextMultiplier: z.number(),
});

export const towersStepResultSchema = z.object({
  status: z.literal('in_progress'),
  isTrap: z.literal(false),
  rowIndex: z.number(),
  columnIndex: z.number(),
  rowTrapColumns: z.array(z.number()),
  payoutMultiplier: z.number(),
  currentPayout: z.union([z.string(), z.number()]).transform(String),
  nextMultiplier: z.number().optional(),
  isCompleted: z.literal(false),
});

export const towersEndResultSchema = z.object({
  status: z.enum(['lost', 'won', 'cashed_out']),
  isTrap: z.boolean(),
  hitRow: z.number().optional(),
  hitColumn: z.number().optional(),
  revealedRow: z.number().optional(),
  revealedColumn: z.number().optional(),
  trapColumns: z.array(z.array(z.number())),
  payoutMultiplier: z.number(),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  isCompleted: z.literal(true),
});

export const towersAutobetResultSchema = z.object({
  win: z.boolean(),
  payoutMultiplier: z.number(),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  hitRow: z.number().optional(),
  hitColumn: z.number().optional(),
  trapColumns: z.array(z.array(z.number())),
  selection: z.array(z.number()),
});

export const towersExceptionSchema = z.union([
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
  const parsed = towersExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

export function sendTowersStartCommand(
  socket: Socket,
  payload: TowersStartPayload,
  handlers: {
    onResult: (result: TowersStartResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('towers:start:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Start game timed out. Falling back to local RNG.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = towersStartResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid towers start schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('towers:start:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('towers:start', payload, { requestId });
  return cleanup;
}

export function sendTowersRevealCommand(
  socket: Socket,
  payload: TowersRevealPayload,
  handlers: {
    onStep: (result: TowersStepResult) => void;
    onEnd: (result: TowersEndResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('towers:step:result', handleStepResult);
    socket.off('towers:result', handleEndResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Reveal step timed out. Falling back to local RNG.');
    }
  }, timeoutMs);

  const handleStepResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = towersStepResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onStep(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid towers step schema from server.');
    }
  };

  const handleEndResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = towersEndResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onEnd(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid towers end schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('towers:step:result', handleStepResult);
  socket.on('towers:result', handleEndResult);
  socket.on('exception', handleException);

  socket.emit('towers:reveal', payload, { requestId });
  return cleanup;
}

export function sendTowersCashoutCommand(
  socket: Socket,
  handlers: {
    onResult: (result: TowersEndResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('towers:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Cashout timed out. Falling back to local calculation.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = towersEndResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid towers cashout schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('towers:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('towers:cashout', {}, { requestId });
  return cleanup;
}

export function sendTowersAutobetCommand(
  socket: Socket,
  payload: TowersAutobetPayload,
  handlers: {
    onResult: (result: TowersAutobetResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 12000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('towers:autobet:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Autobet timed out. Falling back to local RNG.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = towersAutobetResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid towers autobet schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('towers:autobet:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('towers:autobet', payload, { requestId });
  return cleanup;
}
