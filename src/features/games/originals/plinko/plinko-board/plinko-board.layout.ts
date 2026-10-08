export const PLINKO_WORLD = {
  width: 808,
  height: 700,
} as const;

export const PLINKO_LAYOUT = {
  columnSpacing: 39,
  rowSpacing: 33,
  startPins: 3,
  maxRows: 16,
  firstRowBaseY: 60,
  multiplierYOffset: 110,
  pinPadding: 25,
  multiplierBottomPadding: 35,
  pinSize: 5,
  pinGap: 40,
  multiplierSize: 40,
  ballRadius: 8,
  dropStartRowSpacing: 27,
  dropStartBaseY: 30,
} as const;

export const PLINKO_WORLD_FIT_MARGIN = 16;
export const PLINKO_DEFAULT_FIT_SCALE = 0.48;

export interface PlinkoPinLayout {
  id: string;
  x: number;
  y: number;
}

export interface PlinkoMultiplierLayout {
  index: number;
  value: number;
  x: number;
  y: number;
}

export interface PlinkoContentBounds {
  contentWidth: number;
  contentHeight: number;
  centerX: number;
  centerY: number;
}

export function getPlinkoDropStartY(rowCount: number): number {
  const { maxRows, dropStartRowSpacing, dropStartBaseY } = PLINKO_LAYOUT;
  return (maxRows - Math.max(0, rowCount)) * dropStartRowSpacing + dropStartBaseY;
}

export function getPlinkoContentBounds(rowCount: number): PlinkoContentBounds {
  const {
    columnSpacing,
    rowSpacing,
    startPins,
    maxRows,
    firstRowBaseY,
    multiplierYOffset,
    pinPadding,
    multiplierBottomPadding,
    ballRadius,
  } = PLINKO_LAYOUT;

  const rows = Math.max(0, rowCount);
  const firstY = (maxRows - rows) * rowSpacing + firstRowBaseY;
  const widestPinCount = startPins + Math.max(rows, 1) - 1;
  const contentWidth = widestPinCount * columnSpacing + pinPadding * 2;
  const topY = Math.max(
    0,
    Math.min(firstY - pinPadding, getPlinkoDropStartY(rows) - ballRadius),
  );
  const bottomY = PLINKO_WORLD.height - multiplierYOffset + multiplierBottomPadding;

  return {
    contentWidth: Math.max(contentWidth, 1),
    contentHeight: Math.max(bottomY - topY, 1),
    centerX: PLINKO_WORLD.width / 2,
    centerY: topY + Math.max(bottomY - topY, 1) / 2,
  };
}

export function getPlinkoPins(rowCount: number): PlinkoPinLayout[] {
  const { columnSpacing, rowSpacing, startPins, maxRows, firstRowBaseY } = PLINKO_LAYOUT;
  const rows = Math.max(0, rowCount);
  const pins: PlinkoPinLayout[] = [];
  const firstY = (maxRows - rows) * rowSpacing + firstRowBaseY;

  for (let row = 0; row < rows; row += 1) {
    const linePins = startPins + row;
    const lineWidth = linePins * columnSpacing;

    for (let index = 0; index < linePins; index += 1) {
      pins.push({
        id: `pin-${row}-${index}`,
        x:
          PLINKO_WORLD.width / 2 -
          lineWidth / 2 +
          index * columnSpacing +
          columnSpacing / 2,
        y: row === 0 ? firstY : row * rowSpacing + firstY,
      });
    }
  }

  return pins;
}

export function getPlinkoMultiplierRects(
  multipliers: readonly number[],
): PlinkoMultiplierLayout[] {
  const { pinGap, multiplierSize, multiplierYOffset } = PLINKO_LAYOUT;
  const y = PLINKO_WORLD.height - multiplierYOffset;
  let lastX = PLINKO_WORLD.width / 2 - (pinGap / 2) * (multipliers.length - 1) - pinGap;

  return multipliers.map((value, index) => {
    const x = lastX + multiplierSize;
    lastX = x;

    return { index, value, x, y };
  });
}
