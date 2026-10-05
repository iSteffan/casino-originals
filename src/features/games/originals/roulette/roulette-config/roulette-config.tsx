'use client';

import type { RouletteConfigProps } from './roulette-config.types';

import { OriginalsConfig } from '#ui/features/games/originals/originals-config/originals-config';
import { RoundsInput } from '#ui/features/games/originals/shared/rounds-input/rounds-input';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const DEFAULT_LABELS = {
  chips: 'Chips',
  undo: 'Undo',
  clear: 'Clear',
  rounds: 'Number of Bets',
} as const;

export function RouletteConfig({
  shell,
  chips,
  selectedChip,
  onSelectChip,
  onUndo,
  onClear,
  fieldsDisabled = false,
  totalLabel,
  rounds,
  onRoundsChange,
  undoIcon,
  clearIcon,
  labels: labelsProp,
  className,
}: RouletteConfigProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  return (
    <OriginalsConfig
      mode={shell.mode}
      onModeChange={shell.onModeChange}
      manualTabLabel={shell.manualTabLabel}
      autoTabLabel={shell.autoTabLabel}
      manualActionLabel={shell.manualActionLabel}
      autoActionLabel={shell.autoActionLabel}
      autoActionVariant={shell.autoActionVariant}
      onManualAction={shell.onManualAction}
      onAutoAction={shell.onAutoAction}
      manualActionDisabled={shell.manualActionDisabled}
      autoActionDisabled={shell.autoActionDisabled}
      tabsDisabled={shell.tabsDisabled}
      theatreMode={shell.theatreMode}
      width={shell.width}
      className={className}
      autobetSession={shell.autobetSession}
    >
      <fieldset disabled={fieldsDisabled} className="flex flex-col gap-3">
        <legend className="text-ds-text-primary text-ds-sm font-ds-bold mb-1">
          {labels.chips}
        </legend>

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <Button
            type="button"
            variant="gray"
            size="sm"
            aria-label={labels.undo}
            disabled={fieldsDisabled}
            onClick={onUndo}
            className="rounded-ds-full size-8 shrink-0 p-0"
          >
            {undoIcon ?? labels.undo}
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {chips.map((chip) => {
              const selected = chip.value === selectedChip;
              return (
                <button
                  key={chip.value}
                  type="button"
                  aria-pressed={selected}
                  aria-label={chip.label ?? String(chip.value)}
                  disabled={fieldsDisabled}
                  onClick={() => onSelectChip(chip.value)}
                  className={cn(
                    'relative flex size-12 items-center justify-center transition-all disabled:opacity-50',
                    selected
                      ? 'scale-110 rounded-full ring-1 ring-white'
                      : 'opacity-70 hover:opacity-100',
                  )}
                >
                  {chip.src ? (
                    <img
                      src={chip.src}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="pointer-events-none absolute inset-0 size-full object-contain"
                    />
                  ) : null}
                  <span
                    className="relative z-[1] text-[11px] font-ds-bold text-ds-white"
                    style={{ textShadow: '0 1.25px 0 rgba(0, 0, 0, 0.25)' }}
                  >
                    {chip.label ?? chip.value}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="gray"
            size="sm"
            aria-label={labels.clear}
            disabled={fieldsDisabled}
            onClick={onClear}
            className="rounded-ds-full size-8 shrink-0 p-0"
          >
            {clearIcon ?? labels.clear}
          </Button>
        </div>

        <Typography as="p" kind="secondary-12-400" className="m-0">
          {totalLabel}
        </Typography>

        {shell.mode === 'auto' ? (
          <RoundsInput
            label={labels.rounds}
            value={rounds}
            onChange={onRoundsChange}
            disabled={fieldsDisabled}
          />
        ) : null}
      </fieldset>
    </OriginalsConfig>
  );
}

export type {
  RouletteConfigChipOption,
  RouletteConfigLabels,
  RouletteConfigProps,
} from './roulette-config.types';
