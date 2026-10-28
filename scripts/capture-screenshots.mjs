import { spawn, execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 3456;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(code) {
    const res = await this.send('Runtime.evaluate', {
      expression: code,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log(`Starting Next.js server on port ${PORT}...`);
  const nextProcess = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], {
    stdio: 'ignore',
    shell: true,
  });

  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1440,900',
    `--user-data-dir=${path.join(process.env.TEMP || 'C:\\Temp', 'chrome-cdp-screenshots')}`,
    'about:blank'
  ]);

  const cleanup = () => {
    try { execFileSync('taskkill', ['/pid', String(nextProcess.pid), '/T', '/F']); } catch {}
    try { execFileSync('taskkill', ['/pid', String(chromeProcess.pid), '/T', '/F']); } catch {}
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  try {
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`${BASE_URL}/games/mines`);
        if (res.ok) break;
      } catch {}
      await new Promise(r => setTimeout(r, 500));
    }
    console.log('Next.js server ready.');

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page');

    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    const helpers = `
      function setBetInput(val) {
        const inputs = Array.from(document.querySelectorAll('input'));
        const betInput = inputs.find(i => i.placeholder === '0.00' || (i.closest && i.closest('.ds-originals-field'))) || inputs[1];
        if (!betInput) return false;
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(betInput, String(val));
        betInput.dispatchEvent(new Event('input', { bubbles: true }));
        betInput.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    `;

    // 1. BLACKJACK (Split Hand)
    console.log('Capturing Blackjack (Split)...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/blackjack` });
    await new Promise(r => setTimeout(r, 2000));
    await client.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const splitScenario = btns.find(b => b.textContent && b.textContent.includes('Split pair'));
        if (splitScenario) splitScenario.click();
      })()
    `);
    await client.eval(`
      new Promise((resolve) => {
        const start = Date.now();
        const interval = setInterval(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const splitBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Split');
          if (splitBtn && !splitBtn.disabled) {
            clearInterval(interval);
            splitBtn.click();
            resolve(true);
          } else if (Date.now() - start > 12000) {
            clearInterval(interval);
            resolve(false);
          }
        }, 300);
      })
    `);
    await new Promise(r => setTimeout(r, 3500));
    await client.captureScreenshot(path.join(OUT_DIR, 'blackjack.png'));
    console.log('Saved blackjack.png');

    // 2. MINES (Uncovered gems)
    console.log('Capturing Mines (Uncovered gems)...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/mines` });
    await new Promise(r => setTimeout(r, 2000));
    await client.eval(helpers);
    await client.eval(`
      (async () => {
        setBetInput(10);
        await new Promise(r => setTimeout(r, 400));

        for (let attempt = 0; attempt < 10; attempt++) {
          const btns = Array.from(document.querySelectorAll('button'));
          const placeBetBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Place Bet' && !b.disabled);
          if (placeBetBtn) {
            placeBetBtn.click();
            await new Promise(r => setTimeout(r, 600));
          }

          let mineIndexes = [];
          const anyCell = document.querySelector('[data-slot="mines-cell"]') || document.querySelector('[role="group"]');
          if (anyCell) {
            const fKey = Object.keys(anyCell).find(k => k.startsWith('__reactFiber$'));
            let f = anyCell[fKey];
            while (f) {
              let s = f.memoizedState;
              while (s) {
                if (s.memoizedState && Array.isArray(s.memoizedState.mineIndexes) && s.memoizedState.mineIndexes.length > 0) {
                  mineIndexes = s.memoizedState.mineIndexes;
                  break;
                }
                s = s.next;
              }
              if (mineIndexes.length > 0) break;
              f = f.return;
            }
          }

          const cellElements = Array.from(document.querySelectorAll('[data-slot="mines-cell"]'));
          let revealed = 0;

          if (mineIndexes.length > 0) {
            for (let idx = 0; idx < cellElements.length; idx++) {
              if (!mineIndexes.includes(idx)) {
                cellElements[idx].click();
                revealed++;
                await new Promise(r => setTimeout(r, 350));
                if (revealed >= 4) break;
              }
            }
            return;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await client.captureScreenshot(path.join(OUT_DIR, 'mines.png'));
    console.log('Saved mines.png');

    // 3. TOWERS (Climbed floors)
    console.log('Capturing Towers (Climbed floors)...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/towers` });
    await new Promise(r => setTimeout(r, 2000));
    await client.eval(helpers);
    await client.eval(`
      (async () => {
        setBetInput(10);
        await new Promise(r => setTimeout(r, 400));

        const diffBtns = Array.from(document.querySelectorAll('button'));
        const easyBtn = diffBtns.find(b => b.textContent && b.textContent.includes('Easy'));
        if (easyBtn) easyBtn.click();
        await new Promise(r => setTimeout(r, 300));

        for (let attempt = 0; attempt < 15; attempt++) {
          const btns = Array.from(document.querySelectorAll('button'));
          const placeBetBtn = btns.find(b => b.textContent && b.textContent.trim() === 'Place Bet' && !b.disabled);
          if (placeBetBtn) {
            placeBetBtn.click();
            await new Promise(r => setTimeout(r, 600));
          }

          let climbed = 0;
          for (let step = 0; step < 4; step++) {
            const randomBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Random');
            if (randomBtn && !randomBtn.disabled) {
              randomBtn.click();
              await new Promise(r => setTimeout(r, 600));
              const stillInRound = Array.from(document.querySelectorAll('button')).some(b => b.textContent && b.textContent.includes('Cashout'));
              if (stillInRound) {
                climbed++;
                if (climbed >= 3) break;
              } else {
                break;
              }
            } else {
              break;
            }
          }

          if (climbed >= 3) return;
          await new Promise(r => setTimeout(r, 1000));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 800));
    await client.captureScreenshot(path.join(OUT_DIR, 'towers.png'));
    console.log('Saved towers.png');

    // 4. KENO (Drawn & matched spots)
    console.log('Capturing Keno (Drawn spots)...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/keno` });
    await new Promise(r => setTimeout(r, 2000));
    await client.eval(helpers);
    await client.eval(`
      (async () => {
        setBetInput(10);
        await new Promise(r => setTimeout(r, 300));

        const autoPickBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Auto Pick'));
        if (autoPickBtn) autoPickBtn.click();
        await new Promise(r => setTimeout(r, 400));

        const placeBetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Place Bet');
        if (placeBetBtn) placeBetBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 2200));
    await client.captureScreenshot(path.join(OUT_DIR, 'keno.png'));
    console.log('Saved keno.png');

    // 5. ROULETTE (Chips & ball)
    console.log('Capturing Roulette (Chips & ball)...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/roulette` });
    await new Promise(r => setTimeout(r, 2000));
    await client.eval(`
      (async () => {
        const chipBtns = Array.from(document.querySelectorAll('button'));
        const chip10 = chipBtns.find(b => b.textContent && b.textContent.trim() === '10');
        if (chip10) chip10.click();
        await new Promise(r => setTimeout(r, 200));

        const redBtn = document.querySelector('button[aria-label="Red"]');
        const blackBtn = document.querySelector('button[aria-label="Black"]');
        const num7 = document.querySelector('button[aria-label="Number 7"]');
        const num17 = document.querySelector('button[aria-label="Number 17"]');
        const num23 = document.querySelector('button[aria-label="Number 23"]');
        const doz = document.querySelector('button[aria-label="1-12"]');
        const even = document.querySelector('button[aria-label="Even"]');

        if (redBtn) redBtn.click();
        await new Promise(r => setTimeout(r, 100));
        if (blackBtn) blackBtn.click();
        await new Promise(r => setTimeout(r, 100));
        if (num7) num7.click();
        await new Promise(r => setTimeout(r, 100));
        if (num17) num17.click();
        await new Promise(r => setTimeout(r, 100));
        if (num23) num23.click();
        await new Promise(r => setTimeout(r, 100));
        if (doz) doz.click();
        await new Promise(r => setTimeout(r, 100));
        if (even) even.click();
        await new Promise(r => setTimeout(r, 300));

        const spinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Spin');
        if (spinBtn) spinBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 3400));
    await client.eval(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) dialog.style.display = 'none';
        const overlay = document.querySelector('[data-state="open"]');
        if (overlay) overlay.style.display = 'none';
      })()
    `);
    await new Promise(r => setTimeout(r, 300));
    await client.captureScreenshot(path.join(OUT_DIR, 'roulette.png'));
    console.log('Saved roulette.png');

    // 6. PLINKO (Multiple balls)
    console.log('Capturing Plinko (Multiple balls in flight)...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/plinko` });
    await new Promise(r => setTimeout(r, 2000));
    await client.eval(helpers);
    await client.eval(`
      (async () => {
        setBetInput(10);
        await new Promise(r => setTimeout(r, 300));

        const rowBtns = Array.from(document.querySelectorAll('button'));
        const row16 = rowBtns.find(b => b.textContent && b.textContent.trim() === '16');
        if (row16) row16.click();
        await new Promise(r => setTimeout(r, 300));

        const dropBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Drop Ball'));
        if (dropBtn) {
          for (let i = 0; i < 8; i++) {
            dropBtn.click();
            await new Promise(r => setTimeout(r, 180));
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));
    await client.captureScreenshot(path.join(OUT_DIR, 'plinko.png'));
    console.log('Saved plinko.png');

    // 7. DICE
    console.log('Capturing Dice...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/dice` });
    await new Promise(r => setTimeout(r, 2000));
    await client.captureScreenshot(path.join(OUT_DIR, 'dice.png'));
    console.log('Saved dice.png');

    // 8. COIN FLIP
    console.log('Capturing Coin Flip...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/coinflip` });
    await new Promise(r => setTimeout(r, 2000));
    await client.captureScreenshot(path.join(OUT_DIR, 'coinflip.png'));
    console.log('Saved coinflip.png');

    // 9. DOUBLE
    console.log('Capturing Double...');
    await client.send('Page.navigate', { url: `${BASE_URL}/games/double` });
    await new Promise(r => setTimeout(r, 2000));
    await client.captureScreenshot(path.join(OUT_DIR, 'double.png'));
    console.log('Saved double.png');

    console.log('ALL 9 SCREENSHOTS CAPTURED SUCCESSFULLY!');
    client.close();
  } finally {
    cleanup();
  }
}

run().catch(console.error);
