'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  ROULETTE_WHEEL_NUMBERS,
  calculateRouletteDefaultRotation,
  calculateRouletteSpinToRotation,
  type RouletteWheelNumber,
} from '../roulette.constants';
import type { RouletteWheelProps } from './roulette-wheel.types';

import { cn } from '#ui/lib/cn';

export function RouletteWheel({
  start,
  winningBet,
  onSpinningEnd,
  layoutType = 'european',
  automaticSpinning = true,
  spinLaps = 3,
  spinDuration = 3,
  spinEaseFunction = 'ease-out',
  isStopping = false,
  className,
}: RouletteWheelProps) {
  const numberListRef = useRef<HTMLUListElement>(null);
  const isSpinningRef = useRef(false);
  const anglePerTile = 360 / ROULETTE_WHEEL_NUMBERS.length;

  const doSpin = useCallback(() => {
    const listElement = numberListRef.current;
    if (listElement == null || winningBet === '-1' || isStopping) return;
    if (isSpinningRef.current) return;

    isSpinningRef.current = true;
    listElement.removeAttribute('data-spintoindex');

    const betIndex = ROULETTE_WHEEL_NUMBERS.indexOf(winningBet);

    window.setTimeout(() => {
      if (isStopping) {
        isSpinningRef.current = false;
        return;
      }

      listElement.setAttribute('data-spintoindex', `${betIndex}`);
      listElement.style.setProperty('--wheel-rotation-function', String(spinEaseFunction));
      listElement.style.setProperty('--wheel-rotation-duration', `${spinDuration}s`);
      listElement.style.setProperty(
        '--wheel-rotation',
        `${calculateRouletteSpinToRotation(winningBet, spinLaps)}deg`,
      );

      window.setTimeout(() => {
        isSpinningRef.current = false;
        onSpinningEnd?.(winningBet);
      }, spinDuration * 1000);
    }, 100);
  }, [winningBet, spinEaseFunction, spinDuration, spinLaps, onSpinningEnd, isStopping]);

  useEffect(() => {
    if (winningBet === '-1' || start === false || isStopping) return;
    doSpin();
  }, [winningBet, start, doSpin, isStopping]);

  return (
    <div className={cn('roulette-wheel-container font-ds-medium', className)}>
      <div
        className={cn(
          'roulette-wheel-plate',
          automaticSpinning && 'automatic-spinning',
        )}
      >
        <div className="roulette-wheel-inner-border" />
        <ul className={cn('roulette-wheel-inner', layoutType)} ref={numberListRef}>
          <div className="roulette-wheel-lines">
            {ROULETTE_WHEEL_NUMBERS.map((_, index) => (
              <span
                key={`line-${index}`}
                className="roulette-wheel-line"
                style={{
                  transform: `rotateZ(${
                    calculateRouletteDefaultRotation(index) - anglePerTile / 2
                  }deg) translateX(-50%)`,
                }}
              />
            ))}
          </div>
          {ROULETTE_WHEEL_NUMBERS.map((number, index) => (
            <li
              key={`wheel-${number}`}
              data-bet={number}
              className="roulette-wheel-bet-number"
              style={{
                transform: `rotateZ(${calculateRouletteDefaultRotation(index)}deg)`,
              }}
            >
              <label htmlFor={`wheel-pit-${number}`}>
                <input
                  type="radio"
                  name="pit"
                  id={`wheel-pit-${number}`}
                  defaultValue={number}
                  readOnly
                />
                <span className="roulette-wheel-pit">{number}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export type { RouletteWheelProps } from './roulette-wheel.types';
export type { RouletteWheelNumber };
