'use client';

import { useEffect, useId, useRef, useState } from 'react';

import type { DiceControlsActiveField, DiceControlsProps } from './dice-controls.types';
import { DiceControlsSwapIcon } from './dice-controls-swap-icon';

import { cn } from '#ui/lib/cn';
import { useGroupedNumberInput } from '#ui/lib/hooks/use-grouped-number-input';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Input } from '#ui/primitives/inputs/input/input';
import { Label } from '#ui/primitives/inputs/label/label';

const fieldContainerClassName =
  'ds-originals-field rounded-ds-2xs border-transparent bg-ds-surface-tertiary h-8 py-0 pl-ds-3 pr-ds-2';

const MIN_MULTIPLIER = 1.01;
const LINKED_FIELD_STEP = 0.01;
const MIN_ROLL_VALUE = 3;
const MAX_ROLL_VALUE = 97;

const preventInputFocusSteal = (event: React.MouseEvent) => {
  event.preventDefault();
};

const diceControlsActionClassName = 'ds-dice-controls-action disabled:bg-transparent';

const keepDiceFieldText = (value: string) => value;

const clampDiceRollValue = (value: number) =>
  Number(Math.min(MAX_ROLL_VALUE, Math.max(MIN_ROLL_VALUE, value)).toFixed(2));

const normalizeDiceRtp = (rtp: number) => (rtp < 10 ? rtp * 100 : rtp);

function isDiceFieldInput(input: string) {
  if (input === '') return true;
  if (!/^\d*\.?\d*$/.test(input)) return false;
  const decimalIndex = input.indexOf('.');
  return decimalIndex === -1 || input.length - decimalIndex - 1 <= 2;
}

interface DiceControlsFieldOptions {
  value: number;
  isActive: boolean;
  onValueChange: (value: number) => void;
}

function useDiceControlsField({
  value,
  isActive,
  onValueChange,
}: DiceControlsFieldOptions) {
  const [text, setText] = useState(() => value.toFixed(2));
  const forceResync = useRef(false);
  const canonicalValue = value.toFixed(2);

  const field = useGroupedNumberInput({
    value: text,
    onChange: (next) => {
      forceResync.current = false;
      setText(next);
      const parsed = Number.parseFloat(next);
      if (Number.isFinite(parsed)) onValueChange(parsed);
    },
    validate: isDiceFieldInput,
    toEditable: keepDiceFieldText,
    toGrouped: keepDiceFieldText,
    normalizeChange: keepDiceFieldText,
    normalizeBlur: (source) => {
      const parsed = Number.parseFloat(source);
      if (!Number.isFinite(parsed)) return canonicalValue;
      const normalized = parsed.toFixed(2);
      return normalized === canonicalValue ? normalized : canonicalValue;
    },
  });

  useEffect(() => {
    if (!isActive || forceResync.current) {
      forceResync.current = false;
      setText(canonicalValue);
    }
  }, [canonicalValue, isActive]);

  const step = (delta: number) => {
    forceResync.current = true;
    const base = Number.parseFloat(text);
    const next = Number(((Number.isFinite(base) ? base : value) + delta).toFixed(2));
    onValueChange(next);
  };

  const markExternalChange = () => {
    forceResync.current = true;
  };

  return { field, step, text, markExternalChange };
}

interface DiceControlsStepperProps {
  disabled?: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
}

function DiceControlsStepper({
  disabled = false,
  decreaseLabel,
  increaseLabel,
  onDecrease,
  onIncrease,
}: DiceControlsStepperProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="link-white"
        iconOnly
        size="sm"
        className={cn(diceControlsActionClassName, '[&_svg]:!size-3')}
        disabled={disabled}
        aria-label={decreaseLabel}
        onMouseDown={preventInputFocusSteal}
        onClick={onDecrease}
      >
        <Icon name="minus" color="none" className="!size-3" />
      </Button>
      <span className="bg-ds-border-primary h-[22px] w-px" aria-hidden />
      <Button
        type="button"
        variant="link-white"
        iconOnly
        size="sm"
        className={cn(diceControlsActionClassName, '[&_svg]:!size-3')}
        disabled={disabled}
        aria-label={increaseLabel}
        onMouseDown={preventInputFocusSteal}
        onClick={onIncrease}
      >
        <Icon name="plus" color="none" className="!size-3" />
      </Button>
    </div>
  );
}

export function DiceControls({
  direction,
  onDirectionToggle,
  displayValue,
  winChance,
  multiplier,
  onDisplayValueChange,
  onWinChanceChange,
  onMultiplierChange,
  activeField: activeFieldProp,
  onActiveFieldChange,
  disabled = false,
  labels,
  className,
}: DiceControlsProps) {
  const rollId = useId();
  const multiplierId = useId();
  const winChanceId = useId();

  const isActiveFieldControlled = activeFieldProp !== undefined;
  const [uncontrolledActiveField, setUncontrolledActiveField] =
    useState<DiceControlsActiveField>(null);
  const activeField = isActiveFieldControlled ? activeFieldProp : uncontrolledActiveField;

  const setActiveField = (next: DiceControlsActiveField) => {
    if (!isActiveFieldControlled) setUncontrolledActiveField(next);
    onActiveFieldChange?.(next);
  };

  const rollField = useDiceControlsField({
    value: displayValue,
    isActive: activeField === 'roll',
    onValueChange: onDisplayValueChange,
  });
  const multiplierField = useDiceControlsField({
    value: multiplier,
    isActive: activeField === 'multiplier',
    onValueChange: onMultiplierChange,
  });
  const winField = useDiceControlsField({
    value: winChance,
    isActive: activeField === 'win',
    onValueChange: onWinChanceChange,
  });

  const rtpValue = normalizeDiceRtp(winChance * multiplier);

  const stepMultiplier = (delta: number) => {
    const base = Number.parseFloat(multiplierField.text);
    const inputMultiplier = Math.max(
      MIN_MULTIPLIER,
      Number(((Number.isFinite(base) ? base : multiplier) + delta).toFixed(2)),
    );

    const derivedDisplayValue =
      direction === 'UNDER'
        ? rtpValue / inputMultiplier
        : 100 - rtpValue / inputMultiplier;
    const nextDisplayValue = clampDiceRollValue(derivedDisplayValue);

    if (nextDisplayValue === displayValue && inputMultiplier !== multiplier) {
      const fallbackStep =
        direction === 'UNDER'
          ? delta < 0
            ? LINKED_FIELD_STEP
            : -LINKED_FIELD_STEP
          : delta < 0
            ? -LINKED_FIELD_STEP
            : LINKED_FIELD_STEP;

      onDisplayValueChange(displayValue + fallbackStep);
      return;
    }

    onMultiplierChange(inputMultiplier);
  };

  const rollLabel = direction === 'UNDER' ? labels.rollUnder : labels.rollOver;
  const multiplierDecreaseLabel =
    labels.decreaseMultiplier ?? `${labels.decrease} ${labels.multiplier}`;
  const multiplierIncreaseLabel =
    labels.increaseMultiplier ?? `${labels.increase} ${labels.multiplier}`;
  const winChanceDecreaseLabel =
    labels.decreaseWinChance ?? `${labels.decrease} ${labels.winChance}`;
  const winChanceIncreaseLabel =
    labels.increaseWinChance ?? `${labels.increase} ${labels.winChance}`;

  return (
    <div className={cn('gap-ds-3 grid grid-cols-1', className)}>
      <div>
        <Label htmlFor={rollId} className="mb-ds-1-5 block">
          {rollLabel}
        </Label>
        <Input
          id={rollId}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={rollField.field.displayValue}
          containerClassName={fieldContainerClassName}
          className="text-ds-body-lg font-ds-medium"
          onFocus={() => {
            setActiveField('roll');
            rollField.field.handleFocus();
          }}
          onBlur={() => {
            rollField.field.handleBlur();
            setActiveField(null);
          }}
          onChange={(event) => rollField.field.handleChange(event.target.value)}
          trailing={
            <Button
              type="button"
              variant="link-white"
              iconOnly
              size="sm"
              className={cn(diceControlsActionClassName, '[&_svg]:!size-6')}
              disabled={disabled}
              aria-label={labels.toggleDirection}
              onMouseDown={preventInputFocusSteal}
              onClick={() => {
                rollField.markExternalChange();
                onDirectionToggle();
              }}
            >
              <DiceControlsSwapIcon className="!size-6" />
            </Button>
          }
        />
      </div>

      <div>
        <Label htmlFor={multiplierId} className="mb-ds-1-5 block">
          {labels.multiplier}
        </Label>
        <Input
          id={multiplierId}
          type="text"
          inputMode="decimal"
          value={multiplierField.field.displayValue}
          disabled={disabled}
          containerClassName={fieldContainerClassName}
          className="text-ds-body-lg font-ds-medium"
          onFocus={() => {
            setActiveField('multiplier');
            multiplierField.field.handleFocus();
          }}
          onBlur={() => {
            multiplierField.field.handleBlur();
            setActiveField(null);
          }}
          onChange={(event) => multiplierField.field.handleChange(event.target.value)}
          trailing={
            <DiceControlsStepper
              disabled={disabled}
              decreaseLabel={multiplierDecreaseLabel}
              increaseLabel={multiplierIncreaseLabel}
              onDecrease={() => stepMultiplier(-0.01)}
              onIncrease={() => stepMultiplier(0.01)}
            />
          }
        />
      </div>

      <div>
        <Label htmlFor={winChanceId} className="mb-ds-1-5 block">
          {labels.winChance}
        </Label>
        <Input
          id={winChanceId}
          type="text"
          inputMode="decimal"
          value={winField.field.displayValue}
          disabled={disabled}
          containerClassName={fieldContainerClassName}
          className="text-ds-body-lg font-ds-medium"
          onFocus={() => {
            setActiveField('win');
            winField.field.handleFocus();
          }}
          onBlur={() => {
            winField.field.handleBlur();
            setActiveField(null);
          }}
          onChange={(event) => winField.field.handleChange(event.target.value)}
          trailing={
            <DiceControlsStepper
              disabled={disabled}
              decreaseLabel={winChanceDecreaseLabel}
              increaseLabel={winChanceIncreaseLabel}
              onDecrease={() => winField.step(-0.01)}
              onIncrease={() => winField.step(0.01)}
            />
          }
        />
      </div>
    </div>
  );
}

export type {
  DiceControlsActiveField,
  DiceControlsDirection,
  DiceControlsLabels,
  DiceControlsProps,
  DiceDirection,
} from './dice-controls.types';
