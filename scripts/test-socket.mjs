import http from 'node:http';
import { io } from 'socket.io-client';

async function testHealth() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/health', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log('✅ Health check HTTP response:', data);
        resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

async function testDiceBet() {
  return new Promise((resolve, reject) => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected to test server! Socket ID:', socket.id);

      const payload = {
        target: 50.25,
        direction: 'UNDER',
        amount: '10',
        currencyId: 'USDT',
        clientSeed: 'test-seed-123',
      };

      console.log('📤 Sending dice:bet event with payload:', payload);
      socket.emit('dice:bet', payload, { requestId: 'test_req_1' });
    });

    socket.on('dice:result', (result, meta) => {
      console.log('📥 Received dice:result from server:');
      console.log('   Result:', result);
      console.log('   Meta:', meta);

      if (
        result &&
        typeof result.rollResult === 'number' &&
        typeof result.isWinner === 'boolean' &&
        meta?.requestId === 'test_req_1'
      ) {
        console.log('🎉 Dice test passed with flying colors!');
        socket.disconnect();
        resolve(result);
      } else {
        socket.disconnect();
        reject(new Error('Unexpected result shape'));
      }
    });

    socket.on('exception', (err) => {
      console.error('❌ Received exception:', err);
      socket.disconnect();
      reject(err);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message);
      socket.disconnect();
      reject(err);
    });
  });
}

async function run() {
  console.log('Testing Health Check...');
  await testHealth();

  console.log('\nTesting Dice Bet Event...');
  await testDiceBet();

  console.log('\nAll tests completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
