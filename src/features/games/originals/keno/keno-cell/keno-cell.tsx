'use client';

import { type ReactNode, useRef } from 'react';

import type { KenoCellProps, KenoCellState } from './keno-cell.types';
import {
  getKenoCellFaceSrc,
  isKenoCellPicked,
  isKenoCellSelectable,
} from './keno-cell.utils';
import { useKenoCellFlip } from './use-keno-cell-flip';

import { cn } from '#ui/lib/cn';

function getKenoCellNumberColorClass(state: KenoCellState): string {
  switch (state) {
    case 'win':
      return 'text-ds-white';
    case 'missed':
      return 'text-ds-text-error';
    default:
      return 'text-ds-gray-300';
  }
}

function KenoCellShell({
  canPress,
  disabled,
  onClick,
  ariaLabel,
  ariaPressed,
  className,
  children,
}: {
  canPress: boolean;
  disabled: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        disabled={disabled || !canPress}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        className={cn(
          'block size-full border-0 bg-transparent p-0 font-[inherit]',
          className,
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={cn('block size-full', className)}
    >
      {children}
    </div>
  );
}

function KenoCellFace({
  displayState,
  number,
  assets,
  canPress,
}: {
  displayState: KenoCellState;
  number: number;
  assets: KenoCellProps['assets'];
  canPress: boolean;
}) {
  const faceSrc = getKenoCellFaceSrc(assets, displayState);
  const isCenteredNumber = displayState === 'win' || displayState === 'missed';

  return (
    <div
      className={cn(
        'relative flex size-full items-center justify-center',
        displayState === 'idle' && canPress && 'ds-keno-cell-hover',
        (displayState === 'selected' || displayState === 'lose') && 'ds-keno-cell-shadow',
        canPress && 'cursor-pointer',
        !canPress && 'cursor-default',
      )}
    >
      <img
        src={faceSrc}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 size-full object-contain"
      />

      <span
        aria-hidden
        className={cn(
          'ds-keno-cell-number',
          getKenoCellNumberColorClass(displayState),
          isCenteredNumber
            ? 'absolute inset-0 flex items-center justify-center'
            : 'ds-keno-cell-number-raised absolute inset-x-0',
        )}
      >
        {number}
      </span>
    </div>
  );
}

export function KenoCell({
  number,
  state = 'idle',
  assets,
  disabled = false,
  reducedMotion = false,
  onClick,
  className,
  'aria-label': ariaLabel,
}: KenoCellProps) {
  const flipperRef = useRef<HTMLDivElement>(null);
  const { displayState, incomingState, flipping, flipKey, onFlipEnd } = useKenoCellFlip({
    state,
    reducedMotion,
    flipperRef,
  });
  const canPress =
    typeof onClick === 'function' && !disabled && isKenoCellSelectable(state);

  return (
    <div className={cn('ds-keno-cell-perspective aspect-square w-full', className)}>
      <KenoCellShell
        canPress={canPress}
        disabled={disabled}
        onClick={
          typeof onClick === 'function'
            ? () => {
                if (disabled || !isKenoCellSelectable(state)) return;
                onClick();
              }
            : undefined
        }
        ariaLabel={ariaLabel}
        ariaPressed={isKenoCellPicked(state)}
        className="size-full"
      >
        <div
          key={flipKey}
          ref={flipperRef}
          className={cn(
            'ds-keno-cell-flipper size-full',
            flipping && 'ds-keno-cell-flip-animating',
          )}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            onFlipEnd();
          }}
        >
          {flipping && incomingState ? (
            <>
              <div className="ds-keno-cell-face-layer ds-keno-cell-face-outgoing">
                <KenoCellFace
                  displayState={displayState}
                  number={number}
                  assets={assets}
                  canPress={canPress}
                />
              </div>
              <div className="ds-keno-cell-face-layer ds-keno-cell-face-incoming">
                <KenoCellFace
                  displayState={incomingState}
                  number={number}
                  assets={assets}
                  canPress={canPress}
                />
              </div>
            </>
          ) : (
            <KenoCellFace
              displayState={displayState}
              number={number}
              assets={assets}
              canPress={canPress}
            />
          )}
        </div>
      </KenoCellShell>
    </div>
  );
}

export type { KenoCellProps } from './keno-cell.types';
