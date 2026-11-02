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
        games: ['dice', 'mines'],
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

  socket.on('disconnect', () => {
    activeMinesGames.delete(socket.id);
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
