'use client';

import { type ReactNode, useLayoutEffect, useState } from 'react';

import type {
  MinesCellContent,
  MinesCellProps,
  MinesCellRevealStyle,
} from './mines-cell.types';
import {
  getMinesCellLogoClassName,
  getMinesCellOuterRadiusClassName,
  getMinesCellRevealedFaceSrc,
} from './mines-cell.utils';
import { useMinesCellReveal } from './use-mines-cell-reveal';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function MinesCellShell({
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
        data-slot="mines-cell"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        // Preserve the clicked tile's focus while its result settles; the handler still
        // guards every non-actionable state, and future tab navigation skips the tile.
        aria-disabled={canPress ? undefined : true}
        tabIndex={canPress ? undefined : -1}
        className={cn('block border-0 p-0', formControlFocusRing, className)}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={cn('block', className)}
    >
      {children}
    </div>
  );
}

function MinesCellFaceImage({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      decoding="sync"
      className={cn(
        'pointer-events-none absolute inset-0 size-full max-w-none object-fill',
        className,
      )}
    />
  );
}

export function MinesCell({
  revealed,
  content = null,
  revealStyle = 'player',
  selected = false,
  selectionMode = false,
  cashoutLabel = null,
  gridSize = 5,
  assets,
  disabled = false,
  onClick,
  reducedMotion = false,
  className,
  'aria-label': ariaLabel,
}: MinesCellProps) {
  const { showFace, flipping, onFlipTransitionEnd } = useMinesCellReveal({
    revealed,
    reducedMotion,
  });

  const resolvedContent = content ?? 'safe';
  const nextCashoutLabel = cashoutLabel ?? null;
  // Keep the last revealed face on the back while parents clear content on `revealed: false`
  // (new round) — otherwise the reverse flip would flash player/gold on every tile.
  const [latchedFace, setLatchedFace] = useState<{
    content: MinesCellContent;
    revealStyle: MinesCellRevealStyle;
    cashoutLabel: string | null;
  }>({
    content: resolvedContent,
    revealStyle,
    cashoutLabel: nextCashoutLabel,
  });
  useLayoutEffect(() => {
    if (!revealed) return;

    setLatchedFace((current) => {
      if (
        current.content === resolvedContent &&
        current.revealStyle === revealStyle &&
        current.cashoutLabel === nextCashoutLabel
      ) {
        return current;
      }

      return {
        content: resolvedContent,
        revealStyle,
        cashoutLabel: nextCashoutLabel,
      };
    });
  }, [nextCashoutLabel, revealStyle, revealed, resolvedContent]);

  // Back face always shows the latched (or current) revealed art — both faces stay mounted
  // so rotateX(180) culls via backface-visibility at the true midpoint (no JS swap).
  const backContent = revealed ? resolvedContent : latchedFace.content;
  const backRevealStyle = revealed ? revealStyle : latchedFace.revealStyle;
  const backCashoutLabel = revealed ? nextCashoutLabel : latchedFace.cashoutLabel;
  const showSelection = selected && !showFace;
  const showPlayerIcon = backRevealStyle === 'player';
  const showCashout =
    showPlayerIcon &&
    backContent === 'safe' &&
    backCashoutLabel != null &&
    backCashoutLabel !== '';
  const canPress = typeof onClick === 'function' && !disabled && !revealed && !flipping;
  const revealedFaceSrc = getMinesCellRevealedFaceSrc({
    assets,
    content: backContent,
    revealStyle: backRevealStyle,
  });
  const playerIconSrc = backContent === 'mine' ? assets.mine : assets.gold;

  return (
    <div
      className={cn(
        'ds-mines-cell-perspective relative z-[3] aspect-square w-full bg-transparent p-px',
        getMinesCellOuterRadiusClassName(gridSize),
        canPress && 'ds-mines-cell-hover-ring',
        showSelection && 'z-20',
        className,
      )}
    >
      <MinesCellShell
        canPress={canPress}
        onClick={
          typeof onClick === 'function'
            ? () => {
                if (disabled || revealed || flipping) return;
                onClick();
              }
            : undefined
        }
        ariaLabel={ariaLabel}
        ariaPressed={selectionMode ? showSelection : undefined}
        className="size-full bg-transparent"
      >
        <div
          className={cn(
            'ds-mines-cell-flipper size-full',
            getMinesCellOuterRadiusClassName(gridSize),
            showFace && 'ds-mines-cell-flipper-revealed',
            flipping && 'ds-mines-cell-flipper-animating',
          )}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.propertyName !== 'transform') return;
            onFlipTransitionEnd();
          }}
        >
          <div
            className={cn(
              'ds-mines-cell-face z-[2]',
              'rounded-ds-2px lg:rounded-ds-3xs',
              canPress && 'group',
              canPress && 'ds-mines-cell-hover-shadow',
              canPress && 'cursor-pointer',
              !canPress && 'cursor-default',
            )}
          >
            <MinesCellFaceImage src={assets.tile} />

            {showSelection ? (
              <div
                aria-hidden
                className={cn(
                  'border-ds-purple-500 bg-ds-purple-300/20 absolute inset-0 border-2',
                  'rounded-ds-2px sm:rounded-ds-xxs',
                )}
              />
            ) : null}

            <div
              aria-hidden
              className={cn(
                'ds-mines-cell-logo-hint absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                getMinesCellLogoClassName(gridSize),
              )}
            >
              <div className="ds-mines-cell-logo-glow absolute left-1/2 top-1/2 z-[1] h-[40%] w-[55%] -translate-x-1/2 -translate-y-1/2" />
              <img
                src={assets.logo}
                alt=""
                width={33}
                height={16}
                className="relative z-[2] h-auto w-full"
              />
            </div>
          </div>

          <div className="ds-mines-cell-face ds-mines-cell-face-back rounded-ds-2px lg:rounded-ds-3xs z-[2]">
            <MinesCellFaceImage src={revealedFaceSrc} />

            {showPlayerIcon ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <img
                  src={playerIconSrc}
                  alt=""
                  width={90}
                  height={90}
                  draggable={false}
                  decoding="sync"
                  className="h-[95%] w-[95%] object-contain"
                />
              </div>
            ) : null}

            {showCashout ? (
              <div className="ds-mines-cell-cashout absolute bottom-[5px] left-1/2 max-w-full -translate-x-1/2">
                <Typography as="p" kind="white-12-700">
                  +{backCashoutLabel}
                </Typography>
              </div>
            ) : null}
          </div>
        </div>
      </MinesCellShell>
    </div>
  );
}

export type { MinesCellProps } from './mines-cell.types';
