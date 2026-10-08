'use client';

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';

import {
  getPlinkoDropPath,
  PLINKO_BALL_RADIUS,
  PLINKO_HOP_HEIGHT,
  type PlinkoPathPoint,
} from './plinko-board.path';
import type {
  PlinkoBallDrop,
  PlinkoBallLandEvent,
  PlinkoMultiplierLand,
  PlinkoPinHit,
} from './plinko-board.types';
import { getPlinkoMultiplierColor } from './plinko-board.utils';

import { useMediaQuery } from '#ui/lib/hooks/use-media-query';
import { getMotionOptions, shouldReduceMotion } from '#ui/lib/motion';

export interface PlinkoFlightBall {
  id: string;
  startX: number;
  startY: number;
}

interface Flight {
  id: string;
  bucketIndex: number;
  multiplier: number;
  color: string;
  points: PlinkoPathPoint[];
  durationMs: number;
  pointIndex: number;
  frame: number;
  cancelled: boolean;
}

interface UsePlinkoBallDropsOptions {
  drops?: readonly PlinkoBallDrop[];
  rows: number;
  multipliers: readonly number[];
  turboMode: boolean;
  reducedMotion: boolean;
  onBallLand?: (event: PlinkoBallLandEvent) => void;
  onPinHit: (hit: PlinkoPinHit) => void;
  onMultiplierLand: (land: PlinkoMultiplierLand) => void;
  onFeedbackReset: () => void;
}

const PLINKO_HOP_DURATION_FALLBACK_MS = {
  normal: 300,
  turbo: 150,
} as const;

function getPlinkoHopDurationMs(turboMode: boolean): number {
  const fallback = turboMode
    ? PLINKO_HOP_DURATION_FALLBACK_MS.turbo
    : PLINKO_HOP_DURATION_FALLBACK_MS.normal;
  if (typeof document === 'undefined') return fallback;

  const duration = Number(
    getMotionOptions(
      document.documentElement,
      turboMode ? '--ds-duration-fast' : '--ds-duration-slow',
    ).duration,
  );

  return Number.isFinite(duration) && duration > 0 ? duration : fallback;
}

function applyBallPosition(element: HTMLDivElement | undefined, x: number, y: number) {
  if (!element) return;
  element.style.transform = `translate(${x - PLINKO_BALL_RADIUS}px, ${y - PLINKO_BALL_RADIUS}px)`;
}

export function usePlinkoBallDrops({
  drops,
  rows,
  multipliers,
  turboMode,
  reducedMotion,
  onBallLand,
  onPinHit,
  onMultiplierLand,
  onFeedbackReset,
}: UsePlinkoBallDropsOptions) {
  const [flightBalls, setFlightBalls] = useState<PlinkoFlightBall[]>([]);
  const ballRefs = useRef(new Map<string, HTMLDivElement>());
  const flights = useRef(new Map<string, Flight>());
  const startedDropIds = useRef(new Set<string>());
  const eventSeq = useRef(0);
  const geometryKey = `${rows}:${multipliers.join(',')}`;
  const geometryKeyRef = useRef(geometryKey);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const effectiveReducedMotion = reducedMotion || prefersReducedMotion;
  const notifyBallLand = useEffectEvent((event: PlinkoBallLandEvent) => {
    onBallLand?.(event);
  });
  const notifyPinHit = useEffectEvent(onPinHit);
  const notifyMultiplierLand = useEffectEvent(onMultiplierLand);
  const resetFeedback = useEffectEvent(onFeedbackReset);

  const nextEventId = (prefix: string) => {
    eventSeq.current += 1;
    return `${prefix}-${eventSeq.current}`;
  };

  const setBallRef = (id: string, element: HTMLDivElement | null) => {
    if (element) ballRefs.current.set(id, element);
    else ballRefs.current.delete(id);
  };

  const finishFlight = useEffectEvent((flight: Flight, showFeedback = true) => {
    if (flight.cancelled || flights.current.get(flight.id) !== flight) return;

    flight.cancelled = true;
    cancelAnimationFrame(flight.frame);

    const landPoint = flight.points[flight.points.length - 1];
    const landedBall = ballRefs.current.get(flight.id);
    if (landedBall) landedBall.style.willChange = '';
    if (landPoint) applyBallPosition(landedBall, landPoint.x, landPoint.y);

    if (showFeedback) {
      notifyMultiplierLand({
        index: flight.bucketIndex,
        eventId: nextEventId('land'),
      });
    }
    notifyBallLand({
      id: flight.id,
      bucketIndex: flight.bucketIndex,
      multiplier: flight.multiplier,
      color: flight.color,
    });

    flights.current.delete(flight.id);
    setFlightBalls((current) => current.filter((ball) => ball.id !== flight.id));
  });

  useEffect(() => {
    // Map/Set instances are created once and never reassigned.
    const activeFlights = flights.current;
    const balls = ballRefs.current;
    const startedIds = startedDropIds.current;
    return () => {
      const activeIds = new Set<string>();
      activeFlights.forEach((flight) => {
        activeIds.add(flight.id);
        flight.cancelled = true;
        cancelAnimationFrame(flight.frame);
        const ball = balls.get(flight.id);
        if (ball) ball.style.willChange = '';
      });
      activeFlights.clear();
      activeIds.forEach((id) => startedIds.delete(id));
      setFlightBalls((current) => current.filter((ball) => !activeIds.has(ball.id)));
    };
  }, []);

  useLayoutEffect(() => {
    if (geometryKeyRef.current === geometryKey) return;

    geometryKeyRef.current = geometryKey;
    resetFeedback();
    Array.from(flights.current.values()).forEach((flight) => {
      finishFlight(flight, false);
    });
  }, [geometryKey]);

  useLayoutEffect(() => {
    if (!effectiveReducedMotion) return;

    resetFeedback();
    Array.from(flights.current.values()).forEach((flight) => {
      finishFlight(flight, false);
    });
  }, [effectiveReducedMotion]);

  useEffect(() => {
    const queuedDropIds = new Set((drops ?? []).map((drop) => drop.id));
    startedDropIds.current.forEach((id) => {
      if (!queuedDropIds.has(id) && !flights.current.has(id)) {
        startedDropIds.current.delete(id);
      }
    });

    for (const drop of drops ?? []) {
      if (startedDropIds.current.has(drop.id) || flights.current.has(drop.id)) continue;

      const multiplier = multipliers[drop.bucketIndex] ?? 0;
      const color = getPlinkoMultiplierColor(drop.bucketIndex, multipliers.length);
      const skipTravel = effectiveReducedMotion || shouldReduceMotion();
      const points = skipTravel
        ? []
        : getPlinkoDropPath(rows, drop.bucketIndex, multipliers);
      const start = points[0];
      if (!skipTravel && !start) continue;

      const flight: Flight = {
        id: drop.id,
        bucketIndex: drop.bucketIndex,
        multiplier,
        color,
        points,
        durationMs: getPlinkoHopDurationMs(turboMode),
        pointIndex: 0,
        frame: 0,
        cancelled: false,
      };
      startedDropIds.current.add(drop.id);
      flights.current.set(drop.id, flight);

      const hopTo = (from: PlinkoPathPoint, to: PlinkoPathPoint, onDone: () => void) => {
        const hopStart = performance.now();
        const hopHeight = from.kind === 'pin' ? PLINKO_HOP_HEIGHT : 0;
        let hopWillChange = false;

        const tick = (now: number) => {
          if (flight.cancelled) return;

          const progress = Math.min((now - hopStart) / flight.durationMs, 1);
          const x = from.x + (to.x - from.x) * progress;
          const y =
            from.y +
            (to.y - from.y) * progress +
            hopHeight * 4 * (progress - progress * progress);
          const ball = ballRefs.current.get(flight.id);
          if (ball) {
            if (!hopWillChange) {
              ball.style.willChange = 'transform';
              hopWillChange = true;
            }
            applyBallPosition(ball, x, y);
          }

          if (progress < 1) {
            flight.frame = requestAnimationFrame(tick);
            return;
          }

          if (ball) ball.style.willChange = '';
          onDone();
        };

        flight.frame = requestAnimationFrame(tick);
      };

      const step = () => {
        if (flight.cancelled) return;

        const from = flight.points[flight.pointIndex];
        const to = flight.points[flight.pointIndex + 1];
        if (!from || !to) {
          finishFlight(flight);
          return;
        }

        hopTo(from, to, () => {
          if (to.pinId) {
            notifyPinHit({ pinId: to.pinId, eventId: nextEventId(to.pinId) });
          }
          flight.pointIndex += 1;
          step();
        });
      };

      queueMicrotask(() => {
        if (flight.cancelled || flights.current.get(flight.id) !== flight) return;
        if (skipTravel) {
          finishFlight(flight, false);
          return;
        }

        setFlightBalls((current) => [
          ...current,
          { id: drop.id, startX: start!.x, startY: start!.y },
        ]);
        flight.frame = requestAnimationFrame(() => {
          if (flight.cancelled) return;
          applyBallPosition(ballRefs.current.get(flight.id), start!.x, start!.y);
          step();
        });
      });
    }
  }, [drops, effectiveReducedMotion, multipliers, rows, turboMode]);

  return { effectiveReducedMotion, flightBalls, setBallRef };
}
