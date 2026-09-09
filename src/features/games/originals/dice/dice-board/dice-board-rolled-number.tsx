'use client';

import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';

import { getDiceBoardRolledNumberFlowStyles } from './dice-board.utils';

import type { DiceCubeMarkerState } from '#ui/features/games/originals/dice/dice-cube/dice-cube.types';
import { cn } from '#ui/lib/cn';
import { NumberFlow } from '#ui/primitives/data-display/number-flow/number-flow';

const rolledNumberHostClassName = cn(
  'absolute left-1/2 top-[-10px] -translate-x-1/2 sm:top-[-14px]',
);

const DICE_ROLLED_NUMBER_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

const DICE_ROLLED_NUMBER_SHADOW_STYLE_ID = 'dice-board-rolled-number-styles';

const DICE_ROLLED_NUMBER_SHADOW_STYLE = `
  .digit__num,
  .symbol__value {
    background: var(--dice-board-number-gradient);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke-width: 0.5px;
    -webkit-text-stroke-color: var(--dice-board-number-stroke);
  }
`;

interface DiceBoardRolledNumberProps {
  value: number;
  markerState: DiceCubeMarkerState;
  locale?: string;
  reducedMotion?: boolean;
}

export function DiceBoardRolledNumber({
  value,
  markerState,
  locale = 'en-US',
  reducedMotion = false,
}: DiceBoardRolledNumberProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [useFlow, setUseFlow] = useState(false);
  const { backgroundGradient, strokeColor } =
    getDiceBoardRolledNumberFlowStyles(markerState);
  const style = {
    '--dice-board-number-gradient': backgroundGradient,
    '--dice-board-number-stroke': strokeColor,
  } as CSSProperties;

  useLayoutEffect(() => {
    setUseFlow(true);
  }, []);

  useLayoutEffect(() => {
    if (!useFlow) return undefined;

    const shadowRoot = hostRef.current?.querySelector('number-flow-react')?.shadowRoot;
    if (!shadowRoot) return undefined;

    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-injected-id', DICE_ROLLED_NUMBER_SHADOW_STYLE_ID);
    styleElement.textContent = DICE_ROLLED_NUMBER_SHADOW_STYLE;
    shadowRoot.appendChild(styleElement);

    return () => {
      styleElement.remove();
    };
  }, [useFlow]);

  return (
    <div ref={hostRef} className={rolledNumberHostClassName} style={style}>
      {useFlow ? (
        <NumberFlow
          value={value}
          format={DICE_ROLLED_NUMBER_FORMAT}
          locales={locale}
          animated={!reducedMotion}
          className="dice-board-rolled-number dice-board-value-size"
        />
      ) : (
        <p className="dice-board-value-size dice-board-rolled-number-text tabular-nums">
          {value.toFixed(2)}
        </p>
      )}
    </div>
  );
}
