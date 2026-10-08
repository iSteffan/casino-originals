import {
  getPlinkoDropStartY,
  getPlinkoMultiplierRects,
  getPlinkoPins,
  PLINKO_LAYOUT,
  PLINKO_WORLD,
  type PlinkoPinLayout,
} from './plinko-board.layout';

export const PLINKO_BALL_RADIUS = PLINKO_LAYOUT.ballRadius;
export const PLINKO_HOP_HEIGHT = -10;
export const PLINKO_PIN_CONTACT_OFFSET = PLINKO_LAYOUT.pinSize + PLINKO_BALL_RADIUS;

export interface PlinkoPathPoint {
  x: number;
  y: number;
  kind: 'start' | 'pin' | 'land';
  pinId?: string;
}

function chooseRight(moveRight: number, moveLeft: number): boolean {
  if (moveRight <= 0) return false;
  if (moveLeft <= 0) return true;
  return Math.random() * (moveRight + moveLeft) < moveRight;
}

function getPinAt(
  pins: readonly PlinkoPinLayout[],
  row: number,
  index: number,
): PlinkoPinLayout | undefined {
  return pins.find((pin) => pin.id === `pin-${row}-${index}`);
}

function toPinContact(pin: PlinkoPinLayout): PlinkoPathPoint {
  return {
    x: pin.x,
    y: pin.y - PLINKO_PIN_CONTACT_OFFSET,
    kind: 'pin',
    pinId: pin.id,
  };
}

export function getPlinkoDropPath(
  rowCount: number,
  bucketIndex: number,
  multipliers: readonly number[],
): PlinkoPathPoint[] {
  const rows = Math.max(0, rowCount);
  const rects = getPlinkoMultiplierRects(multipliers);
  const bucket = Math.max(0, Math.min(bucketIndex, Math.max(rects.length - 1, 0)));
  const pins = getPlinkoPins(rows);

  let moveRight = bucket;
  let moveLeft = Math.max(rows - bucket, 0);
  let pinIndex = Math.floor((PLINKO_LAYOUT.startPins - 1) / 2);

  const points: PlinkoPathPoint[] = [
    {
      x: PLINKO_WORLD.width / 2,
      y: getPlinkoDropStartY(rows),
      kind: 'start',
    },
  ];

  for (let row = 0; row < rows; row += 1) {
    const pin = getPinAt(pins, row, pinIndex);
    if (pin) points.push(toPinContact(pin));

    if (row === rows - 1) break;

    if (chooseRight(moveRight, moveLeft)) {
      pinIndex += 1;
      moveRight -= 1;
    } else {
      moveLeft -= 1;
    }
  }

  const land = rects[bucket];
  if (land) {
    points.push({ x: land.x, y: land.y, kind: 'land' });
  }

  return points;
}
