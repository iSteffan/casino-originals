import { z } from 'zod';
import type { Socket } from 'socket.io-client';

export interface MinesStartPayload {
  amount: string;
  currencyId: string;
  numberOfMines: number;
  gridSize?: number;
  clientSeed?: string;
}

export interface MinesStartResult {
  status: 'in_progress';
  betAmount: string;
  numberOfMines: number;
  gridSize: number;
  nextMultiplier: number;
}

export interface MinesRevealPayload {
  index: number;
}

export interface MinesStepResult {
  status: 'in_progress';
  isMine: false;
  revealedIndex: number;
  payoutMultiplier: number;
  currentPayout: string;
  nextMultiplier: number;
  isCompleted: false;
}

export interface MinesEndResult {
  status: 'lost' | 'won' | 'cashed_out';
  isMine: boolean;
  hitIndex?: number;
  revealedIndex?: number;
  mineIndexes: number[];
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
  isCompleted: true;
}

export interface MinesAutobetPayload {
  amount: string;
  currencyId: string;
  numberOfMines: number;
  gridSize: number;
  selectedIndexes: number[];
  clientSeed?: string;
}

export interface MinesAutobetResult {
  win: boolean;
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
  hitIndex?: number;
  mineIndexes: number[];
  selectedIndexes: number[];
}

export const minesStartResultSchema = z.object({
  status: z.literal('in_progress'),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  numberOfMines: z.number(),
  gridSize: z.number(),
  nextMultiplier: z.number(),
});

export const minesStepResultSchema = z.object({
  status: z.literal('in_progress'),
  isMine: z.literal(false),
  revealedIndex: z.number(),
  payoutMultiplier: z.number(),
  currentPayout: z.union([z.string(), z.number()]).transform(String),
  nextMultiplier: z.number(),
  isCompleted: z.literal(false),
});

export const minesEndResultSchema = z.object({
  status: z.enum(['lost', 'won', 'cashed_out']),
  isMine: z.boolean(),
  hitIndex: z.number().optional(),
  revealedIndex: z.number().optional(),
  mineIndexes: z.array(z.number()),
  payoutMultiplier: z.number(),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  isCompleted: z.literal(true),
});

export const minesAutobetResultSchema = z.object({
  win: z.boolean(),
  payoutMultiplier: z.number(),
  betAmount: z.union([z.string(), z.number()]).transform(String),
  payoutAmount: z.union([z.string(), z.number()]).transform(String),
  hitIndex: z.number().optional(),
  mineIndexes: z.array(z.number()),
  selectedIndexes: z.array(z.number()),
});

export const minesExceptionSchema = z.union([
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
  const parsed = minesExceptionSchema.safeParse(data);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    if ('message' in parsed.data) return parsed.data.message;
    if ('error' in parsed.data) return parsed.data.error;
  }
  return 'Server error';
}

export function sendMinesStartCommand(
  socket: Socket,
  payload: MinesStartPayload,
  handlers: {
    onResult: (result: MinesStartResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('mines:start:result', handleResult);
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
    const parsed = minesStartResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid mines start schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('mines:start:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('mines:start', payload, { requestId });
  return cleanup;
}

export function sendMinesRevealCommand(
  socket: Socket,
  payload: MinesRevealPayload,
  handlers: {
    onStep: (result: MinesStepResult) => void;
    onEnd: (result: MinesEndResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('mines:step:result', handleStepResult);
    socket.off('mines:result', handleEndResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Reveal tile timed out.');
    }
  }, timeoutMs);

  const handleStepResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = minesStepResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onStep(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid mines step schema from server.');
    }
  };

  const handleEndResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = minesEndResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onEnd(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid mines end schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('mines:step:result', handleStepResult);
  socket.on('mines:result', handleEndResult);
  socket.on('exception', handleException);

  socket.emit('mines:reveal', payload, { requestId });
  return cleanup;
}

export function sendMinesCashoutCommand(
  socket: Socket,
  handlers: {
    onResult: (result: MinesEndResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 8000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('mines:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Cashout timed out.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = minesEndResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid mines cashout schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('mines:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('mines:cashout', {}, { requestId });
  return cleanup;
}

export function sendMinesAutobetCommand(
  socket: Socket,
  payload: MinesAutobetPayload,
  handlers: {
    onResult: (result: MinesAutobetResult) => void;
    onError: (errorMessage: string) => void;
  },
  timeoutMs = 10000,
): () => void {
  const requestId = createRequestId();
  let completed = false;

  const cleanup = () => {
    completed = true;
    clearTimeout(timer);
    socket.off('mines:autobet:result', handleResult);
    socket.off('exception', handleException);
  };

  const timer = setTimeout(() => {
    if (!completed) {
      cleanup();
      handlers.onError('Autobet timed out.');
    }
  }, timeoutMs);

  const handleResult = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    const parsed = minesAutobetResultSchema.safeParse(data);
    if (parsed.success) {
      cleanup();
      handlers.onResult(parsed.data);
    } else {
      cleanup();
      handlers.onError('Invalid mines autobet schema from server.');
    }
  };

  const handleException = (data: unknown, meta?: unknown) => {
    if (meta && typeof meta === 'object' && 'requestId' in meta) {
      if ((meta as { requestId?: string }).requestId !== requestId) return;
    }
    cleanup();
    handlers.onError(parseExceptionMessage(data));
  };

  socket.on('mines:autobet:result', handleResult);
  socket.on('exception', handleException);

  socket.emit('mines:autobet', payload, { requestId });
  return cleanup;
}
