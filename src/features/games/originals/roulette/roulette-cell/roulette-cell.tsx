'use client';

import { AnimatePresence, motion } from 'framer-motion';

import type { RouletteCellProps } from './roulette-cell.types';
import { getRouletteCellTileAssets } from './roulette-cell.utils';

import { cn } from '#ui/lib/cn';

export function RouletteCell({
  label,
  color,
  size = 'sm',
  assets,
  highlighted = false,
  winning = false,
  disabled = false,
  rotateLabel = false,
  chips = [],
  onClick,
  onHoverChange,
  className,
  'aria-label': ariaLabel,
}: RouletteCellProps) {
  const tile = getRouletteCellTileAssets(assets, color, size);
  const canPress = typeof onClick === 'function' && !disabled;
  const visibleChips = chips.slice(-5);
  const topChip = visibleChips[visibleChips.length - 1];
  const amountLabel = topChip?.amountLabel;

  const content = (
    <>
      <img
        src={tile.mobile}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 size-full object-contain md:hidden"
      />
      <img
        src={tile.desktop}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 hidden size-full object-contain md:block"
      />
      <p
        className={cn(
          'font-ds-medium relative z-[1] select-none text-[12px] leading-[1.33] text-ds-white md:text-[16px] md:leading-[1.25] md:tracking-[-0.32px]',
          rotateLabel && 'rotate-90 whitespace-nowrap',
        )}
      >
        {label}
      </p>
      <AnimatePresence>
        {visibleChips.map((chip, index) => (
          <motion.div
            key={chip.id}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 z-10 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 md:h-[50px] md:w-[50px]"
            style={{
              top: index === 0 ? '50%' : `calc(50% - ${index * 4}px)`,
            }}
          >
            <img
              src={chip.src}
              alt=""
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full object-contain"
            />
            {amountLabel && index === visibleChips.length - 1 ? (
              <p className="ds-roulette-cell-chip-label font-ds-regular pointer-events-none absolute inset-0 flex items-center justify-center text-[7px] text-ds-white md:text-[12px]">
                {amountLabel}
              </p>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );

  const sharedClassName = cn(
    'relative flex w-full items-center justify-center rounded-[6px] transition-all duration-300',
    size === 'sm' ? 'h-[29px] md:h-full' : 'h-full min-h-[29px]',
    canPress && 'cursor-pointer hover:scale-95',
    !canPress && 'cursor-default',
    highlighted && 'ring-1 ring-[#A26BFF]',
    winning && 'ds-roulette-cell-blink',
    disabled && 'opacity-60',
    className,
  );

  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        aria-pressed={chips.length > 0 || undefined}
        className={cn(sharedClassName, 'border-0 bg-transparent p-0 font-[inherit]')}
        onClick={onClick}
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        onFocus={() => onHoverChange?.(true)}
        onBlur={() => onHoverChange?.(false)}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={sharedClassName}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {content}
    </div>
  );
}

export type { RouletteCellProps } from './roulette-cell.types';
