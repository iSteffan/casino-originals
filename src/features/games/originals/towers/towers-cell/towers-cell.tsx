'use client';

import { type CSSProperties, type ReactNode, useRef } from 'react';

import type { TowersCellProps, TowersCellState } from './towers-cell.types';
import {
  getTowersCellFaceSrc,
  TOWERS_DESKTOP_ART_MEDIA_QUERY,
} from './towers-cell.utils';
import { useTowersCellFlip } from './use-towers-cell-flip';

import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function isTowersCellSelectable(state: TowersCellState): boolean {
  // `idle` is included so Auto path-edit siblings in a filled row stay clickable
  // without the auto-selectable pulse mark (controller sets disabled=false there).
  return (
    state === 'active' ||
    state === 'auto-selected' ||
    state === 'auto-selectable' ||
    state === 'idle'
  );
}

function TowersCellShell({
  canPress,
  onClick,
  ariaLabel,
  ariaPressed,
  className,
  children,
}: {
  canPress: boolean;
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
        aria-disabled={!canPress || undefined}
        tabIndex={canPress ? undefined : -1}
        onClick={canPress ? onClick : undefined}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        className={cn(
          'focus-visible:ds-focus-ring block size-full border-0 bg-transparent p-0 font-[inherit] outline-none',
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

function TowersCellAutoMark({
  state,
  reducedMotion,
}: {
  state: TowersCellState;
  reducedMotion: boolean;
}) {
  if (state === 'auto-selected') {
    return <div className="ds-towers-cell-auto-mark" />;
  }

  if (state === 'auto-selectable') {
    return (
      <div
        className={cn(
          'ds-towers-cell-auto-mark',
          !reducedMotion && 'ds-towers-cell-auto-selectable',
        )}
      />
    );
  }

  if (state === 'auto-planned') {
    return <div className="ds-towers-cell-auto-mark-planned" />;
  }

  if (state === 'auto-planned-active') {
    return <div className="ds-towers-cell-auto-mark-active" />;
  }

  return null;
}

function TowersCellArt({
  src,
  compactSrc,
  className,
}: {
  src: string;
  compactSrc?: string;
  className?: string;
}) {
  if (!compactSrc || compactSrc === src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <picture className="absolute inset-0 block size-full">
      <source media={TOWERS_DESKTOP_ART_MEDIA_QUERY} srcSet={src} />
      <img
        src={compactSrc}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className={className}
      />
    </picture>
  );
}

function TowersCellFace({
  displayState,
  assets,
  mobileAssets,
  amountLabel,
  potentialWin,
  reducedMotion,
}: {
  displayState: TowersCellState;
  assets: TowersCellProps['assets'];
  mobileAssets?: TowersCellProps['mobileAssets'];
  amountLabel?: string;
  potentialWin?: TowersCellProps['potentialWin'];
  reducedMotion: boolean;
}) {
  const faceSrc = getTowersCellFaceSrc(assets, displayState);
  const compactFaceSrc = mobileAssets
    ? getTowersCellFaceSrc(mobileAssets, displayState)
    : undefined;
  const showPotentialWin =
    (displayState === 'active' || displayState === 'auto-planned-active') &&
    Boolean(potentialWin);
  const showAmount = displayState === 'safe' && Boolean(amountLabel);

  return (
    <div className="relative size-full overflow-hidden">
      <TowersCellArt
        src={faceSrc}
        compactSrc={compactFaceSrc}
        className={cn(
          'ds-towers-cell-face-art',
          (displayState === 'active' || displayState === 'auto-planned-active') &&
            'ds-towers-cell-shadow',
        )}
      />

      {displayState === 'trap' ? (
        <TowersCellArt
          src={assets.bomb}
          compactSrc={mobileAssets?.bomb}
          className="pointer-events-none absolute inset-0 size-full object-contain"
        />
      ) : null}

      <TowersCellAutoMark state={displayState} reducedMotion={reducedMotion} />

      {showAmount ? (
        <div className="ds-towers-cell-label">
          <Typography
            as="p"
            kind="brand-primary-12-700"
            smSize={16}
            className="ds-towers-cell-label-copy m-0"
          >
            {amountLabel}
          </Typography>
        </div>
      ) : null}

      {showPotentialWin && potentialWin ? (
        <div className="ds-towers-cell-label">
          <Typography
            as="p"
            kind="white-12-700"
            smSize={16}
            className="ds-towers-cell-label-copy pb-ds-1-5 m-0"
          >
            <span>{potentialWin.whole}</span>
            <span className="text-ds-gray-500">.{potentialWin.fraction}</span>
          </Typography>
        </div>
      ) : null}
    </div>
  );
}

export function TowersCell({
  state = 'idle',
  assets,
  mobileAssets,
  amountLabel,
  potentialWin,
  disabled = false,
  reducedMotion = false,
  onClick,
  className,
  'aria-label': ariaLabel,
}: TowersCellProps) {
  const flipperRef = useRef<HTMLDivElement>(null);
  const {
    displayState,
    flipping,
    flipPhase,
    flipKey,
    onFlipPhaseEnd,
    targetState,
    flipDurationMs,
  } = useTowersCellFlip({
    state,
    reducedMotion,
    flipperRef,
  });
  const preloadFaceSrc =
    flipping && displayState !== targetState
      ? getTowersCellFaceSrc(assets, targetState)
      : null;
  const preloadCompactSrc =
    flipping && displayState !== targetState && mobileAssets
      ? getTowersCellFaceSrc(mobileAssets, targetState)
      : undefined;
  const canPress =
    typeof onClick === 'function' && !disabled && isTowersCellSelectable(state);

  return (
    <div className={cn('ds-towers-cell-perspective', className)}>
      <TowersCellShell
        canPress={canPress}
        onClick={onClick}
        ariaLabel={ariaLabel}
        ariaPressed={
          state === 'auto-selected'
            ? true
            : state === 'auto-selectable'
              ? false
              : undefined
        }
        className={cn(
          'ds-towers-cell-shell relative',
          canPress &&
            !reducedMotion &&
            displayState === 'auto-selectable' &&
            'ds-towers-cell-selectable-hover',
          flipping && 'ds-towers-cell-shell-flipping',
          canPress && 'cursor-pointer',
          !canPress && 'cursor-default',
        )}
      >
        <div
          key={flipKey}
          ref={flipperRef}
          className={cn(
            'ds-towers-cell-flipper',
            flipPhase === 'out' && 'ds-towers-cell-flip-out',
            flipPhase === 'in' && 'ds-towers-cell-flip-in',
          )}
          style={
            flipping
              ? ({
                  '--ds-towers-cell-half-flip-duration': `${flipDurationMs / 2}ms`,
                } as CSSProperties)
              : undefined
          }
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            onFlipPhaseEnd(flipKey);
          }}
        >
          <TowersCellFace
            displayState={displayState}
            assets={assets}
            mobileAssets={mobileAssets}
            amountLabel={amountLabel}
            potentialWin={potentialWin}
            reducedMotion={reducedMotion}
          />
          {preloadFaceSrc ? (
            <TowersCellArt
              src={preloadFaceSrc}
              compactSrc={preloadCompactSrc}
              className="pointer-events-none absolute size-0 opacity-0"
            />
          ) : null}
        </div>
      </TowersCellShell>
    </div>
  );
}

export type { TowersCellProps } from './towers-cell.types';
