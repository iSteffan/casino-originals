'use client';

import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { getMotionOptions, shouldReduceMotion } from '#ui/lib/motion';

type SwapTransitionMode = 'crossfade' | 'fade';
type SwapTransitionEntrance = 'fade' | 'self';
type SwapTransitionElement = 'div' | 'span';

interface Layer {
  key: string;
  node: ReactNode;
}

interface TransitionState {
  shown: Layer;
  outgoing: Layer | null;
  revision: number;
}

interface SwapTransitionProps {
  swapKey: string | number;
  children: ReactNode;
  /** 'crossfade' keeps the outgoing layer fading out beneath the incoming (they
   * overlap); 'fade' drops the outgoing instantly so only the incoming fades in
   * (no overlap). */
  mode?: SwapTransitionMode;
  /** 'self' skips the incoming fade for children that animate their own entrance. */
  entrance?: SwapTransitionEntrance;
  /** 'span' keeps the stack valid inside phrasing content (grid still applies). */
  as?: SwapTransitionElement;
  className?: string;
}

function SwapTransition({
  swapKey,
  children,
  mode = 'crossfade',
  entrance = 'fade',
  as: Element = 'div',
  className,
}: SwapTransitionProps) {
  const key = String(swapKey);
  const currentRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const handledRevisionRef = useRef(0);
  const [transition, setTransition] = useState<TransitionState>({
    shown: { key, node: children },
    outgoing: null,
    revision: 0,
  });
  const [reduced, setReduced] = useState(shouldReduceMotion);

  if (transition.shown.key !== key) {
    setTransition({
      shown: { key, node: children },
      outgoing: mode === 'crossfade' && !reduced ? transition.shown : null,
      revision: transition.revision + 1,
    });
  }

  const outgoing = mode === 'crossfade' && !reduced ? transition.outgoing : null;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(shouldReduceMotion());
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    if ((reduced || mode === 'fade') && transition.outgoing) {
      setTransition((current) => ({ ...current, outgoing: null }));
    }
  }, [mode, reduced, transition.outgoing]);

  useLayoutEffect(() => {
    if (transition.revision === 0 || handledRevisionRef.current === transition.revision) {
      if (transition.outgoing) {
        setTransition((current) => ({ ...current, outgoing: null }));
      }
      return;
    }

    handledRevisionRef.current = transition.revision;

    const current = currentRef.current;
    const outgoingLayer = outgoingRef.current;
    const computedOutgoingOpacity = outgoingLayer
      ? Number.parseFloat(getComputedStyle(outgoingLayer).opacity)
      : 1;
    const outgoingOpacity = Number.isFinite(computedOutgoingOpacity)
      ? computedOutgoingOpacity
      : 1;

    for (const animation of animationsRef.current) animation.cancel();
    const animations: Animation[] = [];
    animationsRef.current = animations;

    if (reduced) return;

    if (current && entrance === 'fade' && typeof current.animate === 'function') {
      animations.push(
        current.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          getMotionOptions(current, '--ds-duration-base', '--ds-ease-entrance'),
        ),
      );
    }

    if (outgoingLayer && typeof outgoingLayer.animate === 'function') {
      animations.push(
        outgoingLayer.animate([{ opacity: outgoingOpacity }, { opacity: 0 }], {
          ...getMotionOptions(outgoingLayer, '--ds-duration-base', '--ds-ease-emphasized'),
          fill: 'forwards',
        }),
      );
    }

    const revision = transition.revision;

    const removeOutgoing = () => {
      if (animationsRef.current !== animations) return;

      setTransition((currentTransition) =>
        currentTransition.revision === revision && currentTransition.outgoing
          ? { ...currentTransition, outgoing: null }
          : currentTransition,
      );
    };

    if (animations.length === 0) {
      removeOutgoing();
      return undefined;
    }

    void Promise.allSettled(animations.map((animation) => animation.finished)).then(
      removeOutgoing,
    );

    return () => {
      if (animationsRef.current !== animations) return;

      animationsRef.current = [];
      for (const animation of animations) animation.cancel();
    };
  }, [entrance, mode, transition.revision, reduced]);

  return (
    <Element data-slot="swap-transition" className={className}>
      {outgoing ? (
        <Element
          ref={outgoingRef}
          key={outgoing.key}
          data-slot="swap-transition-layer"
          data-swap="out"
          aria-hidden
          inert
        >
          {outgoing.node}
        </Element>
      ) : null}
      <Element
        ref={currentRef}
        key={key}
        data-slot="swap-transition-layer"
        data-swap="in"
      >
        {children}
      </Element>
    </Element>
  );
}

export { SwapTransition };
export type {
  SwapTransitionElement,
  SwapTransitionEntrance,
  SwapTransitionMode,
  SwapTransitionProps,
};
