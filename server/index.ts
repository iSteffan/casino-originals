import http from 'node:http';
import crypto from 'node:crypto';
import { Server, type Socket } from 'socket.io';
import BigNumber from 'bignumber.js';

const PORT = Number(process.env.PORT) || 3001;
const RTP = 98; // 98% Return To Player

export interface DiceBetPayload {
  target: number;
  direction: 'UNDER' | 'OVER';
  amount: string;
  currencyId?: string;
  clientSeed?: string;
}

export interface DiceResult {
  target: number;
  direction: 'UNDER' | 'OVER';
  rollResult: number;
  isWinner: boolean;
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
}

export interface RequestMeta {
  requestId?: string;
}

export interface MinesStartPayload {
  amount: string;
  currencyId?: string;
  numberOfMines: number;
  gridSize?: number;
  clientSeed?: string;
}

export interface MinesRevealPayload {
  index: number;
}

export interface MinesAutobetPayload {
  amount: string;
  currencyId?: string;
  numberOfMines: number;
  gridSize?: number;
  selectedIndexes: number[];
  clientSeed?: string;
}

interface ActiveMinesGame {
  betAmount: string;
  currencyId: string;
  gridSize: number;
  numberOfMines: number;
  mineIndexes: number[];
  revealedIndexes: number[];
  isCompleted: boolean;
}

const MINES_HOUSE_EDGE = 0.99;

function getMinesMultiplier(
  gridSize: number,
  numberOfMines: number,
  safeRevealedCount: number,
): number {
  const cellCount = gridSize * gridSize;
  const mines = Math.min(Math.max(numberOfMines, 1), cellCount - 1);
  const picks = Math.min(Math.max(safeRevealedCount, 0), cellCount - mines);

  let multiplier = 1;
  for (let pick = 0; pick < picks; pick += 1) {
    const remaining = cellCount - pick;
    const remainingSafe = remaining - mines;
    if (remainingSafe <= 0) break;
    multiplier *= remaining / remainingSafe;
  }

  return Number((multiplier * MINES_HOUSE_EDGE).toFixed(4));
}

function generateMineIndexes(
  gridSize: number,
  numberOfMines: number,
): number[] {
  const totalCells = gridSize * gridSize;
  const count = Math.min(Math.max(numberOfMines, 1), totalCells - 1);
  const indexes = Array.from({ length: totalCells }, (_, i) => i);
  for (let i = totalCells - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const temp = indexes[i]!;
    indexes[i] = indexes[j]!;
    indexes[j] = temp;
  }
  return indexes.slice(0, count).sort((a, b) => a - b);
}

const activeMinesGames = new Map<string, ActiveMinesGame>();

export interface TowersStartPayload {
  amount: string;
  currencyId?: string;
  difficulty?: number;
  clientSeed?: string;
}

export interface TowersRevealPayload {
  rowIndex: number;
  columnIndex: number;
}

export interface TowersAutobetPayload {
  amount: string;
  currencyId?: string;
  difficulty?: number;
  selection: number[];
  clientSeed?: string;
}

interface TowersGridConfig {
  rows: number;
  cols: number;
  trapsPerRow: number;
}

const TOWERS_CONFIGS: Record<number, TowersGridConfig> = {
  0: { rows: 10, cols: 3, trapsPerRow: 1 }, // Easy
  1: { rows: 10, cols: 2, trapsPerRow: 1 }, // Medium
  2: { rows: 10, cols: 3, trapsPerRow: 2 }, // Hard
};

function getTowersGridConfig(difficulty = 0): TowersGridConfig {
  return TOWERS_CONFIGS[difficulty] ?? TOWERS_CONFIGS[0]!;
}

function computeTowersMultiplier(cols: number, trapsPerRow: number, row: number): number {
  const mult = (cols / (cols - trapsPerRow)) ** (row + 1) * 0.98;
  return Number(mult.toFixed(4));
}

function generateTowersTrapColumns(config: TowersGridConfig): number[][] {
  return Array.from({ length: config.rows }, () => {
    const indexes = Array.from({ length: config.cols }, (_, i) => i);
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      const temp = indexes[i]!;
      indexes[i] = indexes[j]!;
      indexes[j] = temp;
    }
    return indexes.slice(0, config.trapsPerRow).sort((a, b) => a - b);
  });
}

interface ActiveTowersGame {
  betAmount: string;
  currencyId: string;
  difficulty: number;
  config: TowersGridConfig;
  trapColumns: number[][];
  revealedPicks: { rowIndex: number; columnIndex: number }[];
  isCompleted: boolean;
}

const activeTowersGames = new Map<string, ActiveTowersGame>();

export interface KenoBetPayload {
  amount: string;
  currencyId?: string;
  risk?: 'classic' | 'low' | 'medium' | 'high';
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

const KENO_PAYTABLES: Record<string, readonly (readonly number[])[]> = {
  classic: [
    [0, 3.92],
    [0, 1.8, 5],
    [0, 1, 3, 11],
    [0, 0.8, 1.7, 5.2, 25],
    [0, 0.2, 1.3, 4.2, 17, 50],
    [0, 0, 1, 3.6, 7.1, 17, 50],
    [0, 0, 0.47, 3, 4.3, 14, 35, 75],
    [0, 0, 0, 2.2, 4, 12, 24, 70, 100],
    [0, 0, 0, 1.5, 3, 8, 16, 50, 70, 100],
    [0, 0, 0, 1.4, 2.2, 4.4, 8, 20, 75, 100, 150],
  ],
  low: [
    [0.6, 2.1],
    [0, 1.9, 4.35],
    [0, 1, 1.45, 28],
    [0, 0, 2, 8.2, 100],
    [0, 0, 1.5, 4, 13.4, 310],
    [0, 0, 1, 2, 6.6, 105, 800],
    [0, 0, 1.1, 1.5, 3.6, 15, 240, 1000],
    [0, 0, 1.1, 1.5, 2, 5, 36, 150, 1000],
    [0, 0, 1.1, 1.3, 1.6, 2.4, 8, 60, 350, 1000],
    [0, 0, 1, 1.2, 1.3, 2, 5, 20, 100, 500, 1000],
  ],
  medium: [
    [0.3, 3],
    [0, 1.7, 5.7],
    [0, 0, 2.6, 51.5],
    [0, 0, 1.6, 10.1, 105],
    [0, 0, 1.3, 4, 15, 420],
    [0, 0, 0, 3, 9, 175, 770],
    [0, 0, 0, 2, 7, 28, 410, 1000],
    [0, 0, 0, 2, 4, 11, 56, 500, 1000],
    [0, 0, 0, 2, 2.4, 5, 15, 110, 600, 1000],
    [0, 0, 0, 1.5, 2.1, 4, 7.5, 27, 125, 600, 1000],
  ],
  high: [
    [0, 3.92],
    [0, 0.3, 15],
    [0, 0, 0.5, 75],
    [0, 0, 0, 7, 305],
    [0, 0, 0, 4.5, 45, 500],
    [0, 0, 0, 0, 11.5, 330, 1000],
    [0, 0, 0, 0, 7, 90, 370, 1000],
    [0, 0, 0, 0, 5, 20, 260, 650, 1000],
    [0, 0, 0, 0, 4, 11, 52, 520, 850, 1000],
    [0, 0, 0, 0, 3.5, 8, 13, 50, 500, 850, 1000],
  ],
};

function getKenoMultiplier(selectedCount: number, hits: number, risk = 'medium'): number {
  const safeRisk = ['classic', 'low', 'medium', 'high'].includes(risk) ? risk : 'medium';
  const paytable = KENO_PAYTABLES[safeRisk];
  const row = paytable?.[selectedCount - 1];
  return row?.[hits] ?? 0;
}

function drawKenoNumbers(drawCount = 10, totalCount = 40): number[] {
  const numbers = Array.from({ length: totalCount }, (_, i) => i + 1);
  for (let i = totalCount - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const temp = numbers[i]!;
    numbers[i] = numbers[j]!;
    numbers[j] = temp;
  }
  return numbers.slice(0, drawCount);
}

export interface CoinflipBetPayload {
  amount: string;
  currencyId?: string;
  side: 'HEADS' | 'TAILS';
  clientSeed?: string;
}

export interface CoinflipBetResult {
  side: 'HEADS' | 'TAILS';
  landedSide: 'HEADS' | 'TAILS';
  isWin: boolean;
  payoutMultiplier: number;
  betAmount: string;
  payoutAmount: string;
}

const COINFLIP_MULTIPLIER = 2;

// Create HTTP server for health checks (useful for Render/Koyeb keep-alive)
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'casino-originals-ws-server',
        games: ['dice', 'mines', 'towers', 'keno', 'coinflip'],
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

function calculateRoll(clientSeed?: string): number {
  if (clientSeed) {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const hash = crypto
      .createHmac('sha256', serverSeed)
      .update(`${clientSeed}:${Date.now()}`)
      .digest('hex');
    const intVal = parseInt(hash.substring(0, 8), 16);
    return Number(((intVal % 10001) / 100).toFixed(2));
  }
  // Standard cryptographically secure random between 0.00 and 100.00
  return Number((crypto.randomInt(0, 10001) / 100).toFixed(2));
}

io.on('connection', (socket: Socket) => {
  console.log(`[Socket.io] Player connected: ${socket.id}`);

  socket.on(
    'dice:bet',
    (payload: DiceBetPayload, meta?: RequestMeta) => {
      try {
        const { target, direction, amount, currencyId = 'USDT', clientSeed } = payload;

        // Validation
        if (typeof target !== 'number' || target < 3 || target > 97) {
          socket.emit(
            'exception',
            { message: 'Target must be a number between 3 and 97.' },
            meta,
          );
          return;
        }

        if (direction !== 'UNDER' && direction !== 'OVER') {
          socket.emit(
            'exception',
            { message: 'Direction must be UNDER or OVER.' },
            meta,
          );
          return;
        }

        const betBig = new BigNumber(amount);
        if (!betBig.isFinite() || betBig.lte(0)) {
          socket.emit(
            'exception',
            { message: 'Bet amount must be greater than zero.' },
            meta,
          );
          return;
        }

        // Calculate win probability and multiplier
        const winChance = direction === 'UNDER' ? target : 100 - target;
        const payoutMultiplier = Number((RTP / winChance).toFixed(4));

        // Generate roll outcome
        const rollResult = calculateRoll(clientSeed);

        // Win check
        const isWinner =
          direction === 'UNDER' ? rollResult < target : rollResult > target;

        const payoutAmount = isWinner
          ? betBig.times(payoutMultiplier).toFixed()
          : '0';

        const result: DiceResult = {
          target,
          direction,
          rollResult,
          isWinner,
          payoutMultiplier,
          betAmount: betBig.toFixed(),
          payoutAmount,
        };

        console.log(
          `[Dice] ${socket.id} bet ${amount} ${currencyId} on ${direction} ${target} -> Roll: ${rollResult} (${isWinner ? 'WIN' : 'LOSS'})`,
        );

        socket.emit('dice:result', result, meta);
      } catch (err: unknown) {
        console.error('[Dice] Error processing bet:', err);
        socket.emit(
          'exception',
          { message: err instanceof Error ? err.message : 'Internal error processing bet.' },
          meta,
        );
      }
    },
  );

  socket.on(
    'mines:start',
    (payload: MinesStartPayload, meta?: RequestMeta) => {
      try {
        const { amount, currencyId = 'USDT', numberOfMines, gridSize = 5 } = payload;
        const totalCells = gridSize * gridSize;

        if (typeof numberOfMines !== 'number' || numberOfMines < 1 || numberOfMines >= totalCells) {
          socket.emit(
            'exception',
            { message: `Mines count must be between 1 and ${totalCells - 1}.` },
            meta,
          );
          return;
        }

        const betBig = new BigNumber(amount);
        if (!betBig.isFinite() || betBig.lte(0)) {
          socket.emit(
            'exception',
            { message: 'Bet amount must be greater than zero.' },
            meta,
          );
          return;
        }

        const mineIndexes = generateMineIndexes(gridSize, numberOfMines);
        activeMinesGames.set(socket.id, {
          betAmount: betBig.toFixed(),
          currencyId,
          gridSize,
          numberOfMines,
          mineIndexes,
          revealedIndexes: [],
          isCompleted: false,
        });

        const nextMultiplier = getMinesMultiplier(gridSize, numberOfMines, 1);
        console.log(
          `[Mines] ${socket.id} started game: ${amount} ${currencyId}, ${numberOfMines} mines on ${gridSize}x${gridSize}`,
        );

        socket.emit(
          'mines:start:result',
          {
            status: 'in_progress',
            betAmount: betBig.toFixed(),
            numberOfMines,
            gridSize,
            nextMultiplier,
          },
          meta,
        );
      } catch (err: unknown) {
        console.error('[Mines] Error starting game:', err);
        socket.emit(
          'exception',
          { message: err instanceof Error ? err.message : 'Error starting Mines game.' },
          meta,
        );
      }
    },
  );

  socket.on(
    'mines:reveal',
    (payload: MinesRevealPayload, meta?: RequestMeta) => {
      try {
        const game = activeMinesGames.get(socket.id);
        if (!game || game.isCompleted) {
          socket.emit(
            'exception',
            { message: 'No active Mines game found.' },
            meta,
          );
          return;
        }

        const { index } = payload;
        const totalCells = game.gridSize * game.gridSize;

        if (typeof index !== 'number' || index < 0 || index >= totalCells) {
          socket.emit('exception', { message: 'Invalid tile index.' }, meta);
          return;
        }

        if (game.revealedIndexes.includes(index)) {
          socket.emit('exception', { message: 'Tile already revealed.' }, meta);
          return;
        }

        // Check if mine hit
        if (game.mineIndexes.includes(index)) {
          game.isCompleted = true;
          activeMinesGames.delete(socket.id);

          console.log(`[Mines] ${socket.id} hit mine at index ${index} -> BUST`);
          socket.emit(
            'mines:result',
            {
              status: 'lost',
              isMine: true,
              hitIndex: index,
              revealedIndex: index,
              mineIndexes: game.mineIndexes,
              payoutMultiplier: 0,
              betAmount: game.betAmount,
              payoutAmount: '0',
              isCompleted: true,
            },
            meta,
          );
          return;
        }

        // Safe tile revealed
        game.revealedIndexes.push(index);
        const safeCount = game.revealedIndexes.length;
        const multiplier = getMinesMultiplier(game.gridSize, game.numberOfMines, safeCount);
        const betBig = new BigNumber(game.betAmount);
        const currentPayout = betBig.times(multiplier).toFixed();
        const totalSafe = totalCells - game.numberOfMines;

        if (safeCount >= totalSafe) {
          // All safe tiles cleared!
          game.isCompleted = true;
          activeMinesGames.delete(socket.id);

          console.log(`[Mines] ${socket.id} cleared all safe tiles! Win: ${currentPayout}`);
          socket.emit(
            'mines:result',
            {
              status: 'won',
              isMine: false,
              revealedIndex: index,
              mineIndexes: game.mineIndexes,
              payoutMultiplier: multiplier,
              betAmount: game.betAmount,
              payoutAmount: currentPayout,
              isCompleted: true,
            },
            meta,
          );
          return;
        }

        const nextMultiplier = getMinesMultiplier(game.gridSize, game.numberOfMines, safeCount + 1);
        console.log(`[Mines] ${socket.id} revealed safe tile ${index} -> Multiplier: ${multiplier}x`);

        socket.emit(
          'mines:step:result',
          {
            status: 'in_progress',
            isMine: false,
            revealedIndex: index,
            payoutMultiplier: multiplier,
            currentPayout,
            nextMultiplier,
            isCompleted: false,
          },
          meta,
        );
      } catch (err: unknown) {
        console.error('[Mines] Error revealing tile:', err);
        socket.emit(
          'exception',
          { message: err instanceof Error ? err.message : 'Error revealing tile.' },
          meta,
        );
      }
    },
  );

  socket.on(
    'mines:cashout',
    (_payload: unknown, meta?: RequestMeta) => {
      try {
        const game = activeMinesGames.get(socket.id);
        if (!game || game.isCompleted) {
          socket.emit('exception', { message: 'No active Mines game to cash out.' }, meta);
          return;
        }

        if (game.revealedIndexes.length === 0) {
          socket.emit('exception', { message: 'Must reveal at least one tile to cash out.' }, meta);
          return;
        }

        const safeCount = game.revealedIndexes.length;
        const multiplier = getMinesMultiplier(game.gridSize, game.numberOfMines, safeCount);
        const betBig = new BigNumber(game.betAmount);
        const payoutAmount = betBig.times(multiplier).toFixed();

        game.isCompleted = true;
        activeMinesGames.delete(socket.id);

        console.log(`[Mines] ${socket.id} cashed out -> Multiplier: ${multiplier}x, Payout: ${payoutAmount}`);
        socket.emit(
          'mines:result',
          {
            status: 'cashed_out',
            isMine: false,
            mineIndexes: game.mineIndexes,
            payoutMultiplier: multiplier,
            betAmount: game.betAmount,
            payoutAmount,
            isCompleted: true,
          },
          meta,
        );
      } catch (err: unknown) {
        console.error('[Mines] Error cashing out:', err);
        socket.emit(
          'exception',
          { message: err instanceof Error ? err.message : 'Error cashing out.' },
          meta,
        );
      }
    },
  );

  socket.on(
    'mines:autobet',
    (payload: MinesAutobetPayload, meta?: RequestMeta) => {
      try {
        const { amount, currencyId = 'USDT', numberOfMines, gridSize = 5, selectedIndexes } = payload;
        const totalCells = gridSize * gridSize;

        if (!Array.isArray(selectedIndexes) || selectedIndexes.length === 0) {
          socket.emit('exception', { message: 'Must select at least one tile for autobet.' }, meta);
          return;
        }

        if (typeof numberOfMines !== 'number' || numberOfMines < 1 || numberOfMines >= totalCells) {
          socket.emit('exception', { message: `Mines count must be between 1 and ${totalCells - 1}.` }, meta);
          return;
        }

        const betBig = new BigNumber(amount);
        if (!betBig.isFinite() || betBig.lte(0)) {
          socket.emit('exception', { message: 'Bet amount must be greater than zero.' }, meta);
          return;
        }

        const mineIndexes = generateMineIndexes(gridSize, numberOfMines);
        const mineSet = new Set(mineIndexes);
        const hitIndex = selectedIndexes.find((idx) => mineSet.has(idx));

        if (hitIndex !== undefined) {
          console.log(
            `[Mines:Autobet] ${socket.id} hit mine at ${hitIndex} -> LOSS (${amount} ${currencyId})`,
          );
          socket.emit(
            'mines:autobet:result',
            {
              win: false,
              payoutMultiplier: 0,
              betAmount: betBig.toFixed(),
              payoutAmount: '0',
              hitIndex,
              mineIndexes,
              selectedIndexes,
            },
            meta,
          );
          return;
        }

        const multiplier = getMinesMultiplier(gridSize, numberOfMines, selectedIndexes.length);
        const payoutAmount = betBig.times(multiplier).toFixed();

        console.log(
          `[Mines:Autobet] ${socket.id} won ${selectedIndexes.length} tiles -> Multiplier: ${multiplier}x, Payout: ${payoutAmount} ${currencyId}`,
        );

        socket.emit(
          'mines:autobet:result',
          {
            win: true,
            payoutMultiplier: multiplier,
            betAmount: betBig.toFixed(),
            payoutAmount,
            mineIndexes,
            selectedIndexes,
          },
          meta,
        );
      } catch (err: unknown) {
        console.error('[Mines:Autobet] Error processing autobet:', err);
        socket.emit(
          'exception',
          { message: err instanceof Error ? err.message : 'Error processing Mines autobet.' },
          meta,
        );
      }
    },
  );

  socket.on(
    'towers:start',
    (payload: TowersStartPayload, meta?: RequestMeta) => {
      try {
        const { amount, currencyId = 'btc', difficulty = 0 } = payload ?? {};
        const betBig = new BigNumber(amount);
        if (!betBig.isFinite() || betBig.lte(0)) {
          socket.emit(
            'exception',
            { message: 'Bet amount must be greater than zero.' },
            meta,
          );
          return;
        }

        const safeDifficulty = [0, 1, 2].includes(difficulty) ? difficulty : 0;
        const config = getTowersGridConfig(safeDifficulty);
        const trapColumns = generateTowersTrapColumns(config);

        activeTowersGames.set(socket.id, {
          betAmount: betBig.toFixed(),
          currencyId,
          difficulty: safeDifficulty,
          config,
          trapColumns,
          revealedPicks: [],
          isCompleted: false,
        });

        const nextMultiplier = computeTowersMultiplier(
          config.cols,
          config.trapsPerRow,
          0,
        );

        console.log(
          `[Towers:Start] ${socket.id} started game -> Diff: ${safeDifficulty}, Amount: ${betBig.toFixed()} ${currencyId}`,
        );

        socket.emit(
          'towers:start:result',
          {
            status: 'in_progress',
            betAmount: betBig.toFixed(),
            difficulty: safeDifficulty,
            rows: config.rows,
            cols: config.cols,
            trapsPerRow: config.trapsPerRow,
            nextMultiplier,
          },
          meta,
        );
      } catch (err: unknown) {
        console.error('[Towers:Start] Error:', err);
        socket.emit(
          'exception',
          {
            message:
              err instanceof Error ? err.message : 'Error starting Towers.',
          },
          meta,
        );
      }
    },
  );

  socket.on(
    'towers:reveal',
    (payload: TowersRevealPayload, meta?: RequestMeta) => {
      try {
        const game = activeTowersGames.get(socket.id);
        if (!game || game.isCompleted) {
          socket.emit(
            'exception',
            { message: 'No active Towers game. Start a new round.' },
            meta,
          );
          return;
        }

        const { rowIndex, columnIndex } = payload ?? {};
        if (typeof rowIndex !== 'number' || typeof columnIndex !== 'number') {
          socket.emit(
            'exception',
            { message: 'Row and column indexes are required.' },
            meta,
          );
          return;
        }

        const expectedRow = game.revealedPicks.length;
        if (rowIndex !== expectedRow) {
          socket.emit(
            'exception',
            {
              message: `Expected pick for row ${expectedRow + 1}, got row ${rowIndex + 1}.`,
            },
            meta,
          );
          return;
        }

        if (columnIndex < 0 || columnIndex >= game.config.cols) {
          socket.emit(
            'exception',
            {
              message: `Column index out of bounds (0-${game.config.cols - 1}).`,
            },
            meta,
          );
          return;
        }

        const rowTraps = game.trapColumns[rowIndex] ?? [];
        const isTrap = rowTraps.includes(columnIndex);

        if (isTrap) {
          game.isCompleted = true;
          activeTowersGames.delete(socket.id);
          console.log(
            `[Towers:Reveal] ${socket.id} hit trap at row ${rowIndex + 1}, col ${columnIndex + 1} -> LOSS`,
          );

          socket.emit(
            'towers:result',
            {
              status: 'lost',
              isTrap: true,
              hitRow: rowIndex,
              hitColumn: columnIndex,
              trapColumns: game.trapColumns,
              payoutMultiplier: 0,
              betAmount: game.betAmount,
              payoutAmount: '0',
              isCompleted: true,
            },
            meta,
          );
          return;
        }

        game.revealedPicks.push({ rowIndex, columnIndex });
        const multiplier = computeTowersMultiplier(
          game.config.cols,
          game.config.trapsPerRow,
          rowIndex,
        );
        const reachedTop = rowIndex + 1 >= game.config.rows;

        if (reachedTop) {
          game.isCompleted = true;
          activeTowersGames.delete(socket.id);
          const payoutAmount = new BigNumber(game.betAmount)
            .times(multiplier)
            .toFixed();
          console.log(
            `[Towers:Reveal] ${socket.id} reached top at row ${rowIndex + 1} -> WON (${payoutAmount} ${game.currencyId})`,
          );

          socket.emit(
            'towers:result',
            {
              status: 'won',
              isTrap: false,
              revealedRow: rowIndex,
              revealedColumn: columnIndex,
              trapColumns: game.trapColumns,
              payoutMultiplier: multiplier,
              betAmount: game.betAmount,
              payoutAmount,
              isCompleted: true,
            },
            meta,
          );
          return;
        }

        const currentPayout = new BigNumber(game.betAmount)
          .times(multiplier)
          .toFixed();
        const nextMultiplier = computeTowersMultiplier(
          game.config.cols,
          game.config.trapsPerRow,
          rowIndex + 1,
        );

        socket.emit(
          'towers:step:result',
          {
            status: 'in_progress',
            isTrap: false,
            rowIndex,
            columnIndex,
            rowTrapColumns: rowTraps,
            payoutMultiplier: multiplier,
            currentPayout,
            nextMultiplier,
            isCompleted: false,
          },
          meta,
        );
      } catch (err: unknown) {
        console.error('[Towers:Reveal] Error:', err);
        socket.emit(
          'exception',
          {
            message:
              err instanceof Error ? err.message : 'Error in Towers reveal.',
          },
          meta,
        );
      }
    },
  );

  socket.on('towers:cashout', (_data: unknown, meta?: RequestMeta) => {
    try {
      const game = activeTowersGames.get(socket.id);
      if (!game || game.isCompleted) {
        socket.emit(
          'exception',
          { message: 'No active Towers game to cash out.' },
          meta,
        );
        return;
      }

      if (game.revealedPicks.length === 0) {
        socket.emit(
          'exception',
          {
            message:
              'Cannot cash out before completing at least one safe row.',
          },
          meta,
        );
        return;
      }

      const lastRow = game.revealedPicks.length - 1;
      const multiplier = computeTowersMultiplier(
        game.config.cols,
        game.config.trapsPerRow,
        lastRow,
      );
      const payoutAmount = new BigNumber(game.betAmount)
        .times(multiplier)
        .toFixed();

      game.isCompleted = true;
      activeTowersGames.delete(socket.id);
      console.log(
        `[Towers:Cashout] ${socket.id} cashed out at row ${lastRow + 1} -> Multiplier: ${multiplier}x, Payout: ${payoutAmount} ${game.currencyId}`,
      );

      socket.emit(
        'towers:result',
        {
          status: 'cashed_out',
          isTrap: false,
          trapColumns: game.trapColumns,
          payoutMultiplier: multiplier,
          betAmount: game.betAmount,
          payoutAmount,
          isCompleted: true,
        },
        meta,
      );
    } catch (err: unknown) {
      console.error('[Towers:Cashout] Error:', err);
      socket.emit(
        'exception',
        {
          message:
            err instanceof Error ? err.message : 'Error cashing out Towers.',
        },
        meta,
      );
    }
  });

  socket.on(
    'towers:autobet',
    (payload: TowersAutobetPayload, meta?: RequestMeta) => {
      try {
        const {
          amount,
          currencyId = 'btc',
          difficulty = 0,
          selection,
        } = payload ?? {};
        if (
          !Array.isArray(selection) ||
          selection.length === 0 ||
          selection.length > 10
        ) {
          socket.emit(
            'exception',
            { message: 'Selection must be an array of 1 to 10 row picks.' },
            meta,
          );
          return;
        }

        const betBig = new BigNumber(amount);
        if (!betBig.isFinite() || betBig.lte(0)) {
          socket.emit(
            'exception',
            { message: 'Bet amount must be greater than zero.' },
            meta,
          );
          return;
        }

        const safeDifficulty = [0, 1, 2].includes(difficulty) ? difficulty : 0;
        const config = getTowersGridConfig(safeDifficulty);

        for (let r = 0; r < selection.length; r++) {
          const col = selection[r];
          if (typeof col !== 'number' || col < 0 || col >= config.cols) {
            socket.emit(
              'exception',
              { message: `Invalid column pick ${col} at row ${r + 1}.` },
              meta,
            );
            return;
          }
        }

        const trapColumns = generateTowersTrapColumns(config);

        for (let r = 0; r < selection.length; r++) {
          const col = selection[r]!;
          if (trapColumns[r]!.includes(col)) {
            console.log(
              `[Towers:Autobet] ${socket.id} hit trap at row ${r + 1}, col ${col + 1} -> LOSS (${amount} ${currencyId})`,
            );
            socket.emit(
              'towers:autobet:result',
              {
                win: false,
                payoutMultiplier: 0,
                betAmount: betBig.toFixed(),
                payoutAmount: '0',
                hitRow: r,
                hitColumn: col,
                trapColumns,
                selection,
              },
              meta,
            );
            return;
          }
        }

        const lastRow = selection.length - 1;
        const multiplier = computeTowersMultiplier(
          config.cols,
          config.trapsPerRow,
          lastRow,
        );
        const payoutAmount = betBig.times(multiplier).toFixed();

        console.log(
          `[Towers:Autobet] ${socket.id} completed ${selection.length} rows -> Multiplier: ${multiplier}x, Payout: ${payoutAmount} ${currencyId}`,
        );

        socket.emit(
          'towers:autobet:result',
          {
            win: true,
            payoutMultiplier: multiplier,
            betAmount: betBig.toFixed(),
            payoutAmount,
            trapColumns,
            selection,
          },
          meta,
        );
      } catch (err: unknown) {
        console.error('[Towers:Autobet] Error processing autobet:', err);
        socket.emit(
          'exception',
          {
            message:
              err instanceof Error
                ? err.message
                : 'Error processing Towers autobet.',
          },
          meta,
        );
      }
    },
  );

  const handleKenoBet = (payload: KenoBetPayload, meta?: RequestMeta) => {
    try {
      const {
        amount,
        currencyId = 'btc',
        risk = 'medium',
        selectedNumbers,
      } = payload ?? {};

      if (
        !Array.isArray(selectedNumbers) ||
        selectedNumbers.length === 0 ||
        selectedNumbers.length > 10
      ) {
        socket.emit(
          'exception',
          { message: 'Must select between 1 and 10 numbers.' },
          meta,
        );
        return;
      }

      const betBig = new BigNumber(amount);
      if (!betBig.isFinite() || betBig.lte(0)) {
        socket.emit(
          'exception',
          { message: 'Bet amount must be greater than zero.' },
          meta,
        );
        return;
      }

      const validRisk = ['classic', 'low', 'medium', 'high'].includes(risk)
        ? risk
        : 'medium';

      const uniquePicks = Array.from(new Set(selectedNumbers));
      if (
        uniquePicks.length !== selectedNumbers.length ||
        uniquePicks.some((n) => typeof n !== 'number' || n < 1 || n > 40)
      ) {
        socket.emit(
          'exception',
          {
            message:
              'Selected numbers must be unique integers between 1 and 40.',
          },
          meta,
        );
        return;
      }

      const drawnNumbers = drawKenoNumbers(10, 40);
      const drawnSet = new Set(drawnNumbers);
      const hits = uniquePicks.filter((n) => drawnSet.has(n));
      const hitsCount = hits.length;
      const multiplier = getKenoMultiplier(
        uniquePicks.length,
        hitsCount,
        validRisk,
      );
      const payoutAmount = betBig.times(multiplier).toFixed();
      const isWin = multiplier > 0;

      console.log(
        `[Keno:Bet] ${socket.id} picked [${uniquePicks.join(',')}] (${validRisk}) -> ${hitsCount} hits, Mult: ${multiplier}x, Payout: ${payoutAmount} ${currencyId}`,
      );

      socket.emit(
        'keno:result',
        {
          selectedNumbers: uniquePicks,
          drawnNumbers,
          hits,
          hitsCount,
          risk: validRisk,
          payoutMultiplier: multiplier,
          betAmount: betBig.toFixed(),
          payoutAmount,
          isWin,
        },
        meta,
      );
    } catch (err: unknown) {
      console.error('[Keno:Bet] Error:', err);
      socket.emit(
        'exception',
        {
          message:
            err instanceof Error ? err.message : 'Error processing Keno bet.',
        },
        meta,
      );
    }
  };

  socket.on('keno:bet', handleKenoBet);
  socket.on('keno:play', handleKenoBet);

  const handleCoinflipBet = (
    payload: CoinflipBetPayload,
    meta?: RequestMeta,
  ) => {
    try {
      const { amount, currencyId = 'btc', side, clientSeed } = payload ?? {};
      const validSide = side?.toUpperCase?.() as 'HEADS' | 'TAILS';
      if (validSide !== 'HEADS' && validSide !== 'TAILS') {
        socket.emit(
          'exception',
          { message: "Side must be either 'HEADS' or 'TAILS'." },
          meta,
        );
        return;
      }

      const betBig = new BigNumber(amount);
      if (!betBig.isFinite() || betBig.lte(0)) {
        socket.emit(
          'exception',
          { message: 'Amount must be a positive number.' },
          meta,
        );
        return;
      }

      let landedSide: 'HEADS' | 'TAILS';
      if (clientSeed) {
        const serverSeed = crypto.randomBytes(32).toString('hex');
        const hash = crypto
          .createHmac('sha256', serverSeed)
          .update(`${clientSeed}:${Date.now()}:${socket.id}`)
          .digest('hex');
        const byte = parseInt(hash.substring(0, 2), 16);
        landedSide = byte % 2 === 0 ? 'HEADS' : 'TAILS';
      } else {
        landedSide = crypto.randomInt(0, 2) === 0 ? 'HEADS' : 'TAILS';
      }

      const isWin = landedSide === validSide;
      const payoutMultiplier = isWin ? COINFLIP_MULTIPLIER : 0;
      const payoutAmount = isWin ? betBig.times(COINFLIP_MULTIPLIER).toFixed() : '0';

      console.log(
        `[Coinflip:Bet] ${socket.id} picked ${validSide} -> Landed: ${landedSide} (${isWin ? 'WIN' : 'LOSE'}), Mult: ${payoutMultiplier}x, Payout: ${payoutAmount} ${currencyId}`,
      );

      socket.emit(
        'coinflip:result',
        {
          side: validSide,
          landedSide,
          isWin,
          payoutMultiplier,
          betAmount: betBig.toFixed(),
          payoutAmount,
        },
        meta,
      );
    } catch (err: unknown) {
      console.error('[Coinflip:Bet] Error:', err);
      socket.emit(
        'exception',
        {
          message:
            err instanceof Error ? err.message : 'Error processing Coinflip bet.',
        },
        meta,
      );
    }
  };

  socket.on('coinflip:bet', handleCoinflipBet);
  socket.on('coinflip:flip', handleCoinflipBet);
  socket.on('coinflip:play', handleCoinflipBet);

  socket.on('disconnect', () => {
    activeMinesGames.delete(socket.id);
    activeTowersGames.delete(socket.id);
    console.log(`[Socket.io] Player disconnected: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🎲 Casino Originals WebSocket Server is running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  console.log(`===============================================`);
});
