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
        game: 'dice',
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

  socket.on('disconnect', () => {
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
