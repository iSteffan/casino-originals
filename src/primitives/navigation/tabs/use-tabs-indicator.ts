'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { TabsIndicatorState } from './tabs.types';

import { getMotionOptions, shouldReduceMotion } from '#ui/lib/motion';

interface TabsIndicatorTransform {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

function useTabsIndicator(enabled: boolean) {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const transformRef = useRef<TabsIndicatorTransform | null>(null);
  const [indicator, setIndicator] = useState<TabsIndicatorState>({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
    visible: false,
  });
  const firstMeasure = useRef(true);

  useEffect(() => {
    if (!enabled) return undefined;

    const list = listRef.current;
    if (!list) return undefined;
    let active = true;

    const update = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]',
      );
      if (!active) {
        setIndicator((current) =>
          current.visible ? { ...current, visible: false } : current,
        );
        return;
      }

      const currentRect = indicatorRef.current?.getBoundingClientRect();
      const targetRect = active.getBoundingClientRect();
      transformRef.current =
        !firstMeasure.current &&
        currentRect &&
        currentRect.width > 0 &&
        currentRect.height > 0 &&
        targetRect.width > 0 &&
        targetRect.height > 0
          ? {
              scaleX: currentRect.width / targetRect.width,
              scaleY: currentRect.height / targetRect.height,
              translateX: currentRect.left - targetRect.left,
              translateY: currentRect.top - targetRect.top,
            }
          : null;

      const nextIndicator = {
        left: active.offsetLeft,
        width: active.offsetWidth,
        top: active.offsetTop,
        height: active.offsetHeight,
        visible: true,
      };
      setIndicator((current) =>
        current.left === nextIndicator.left &&
        current.width === nextIndicator.width &&
        current.top === nextIndicator.top &&
        current.height === nextIndicator.height &&
        current.visible === nextIndicator.visible
          ? current
          : nextIndicator,
      );
      if (firstMeasure.current) {
        firstMeasure.current = false;
      }
    };

    const resize = new ResizeObserver(update);
    const observeSizes = () => {
      resize.disconnect();
      resize.observe(list);
      for (const trigger of list.querySelectorAll<HTMLElement>(
        '[data-slot="tabs-trigger"]',
      )) {
        resize.observe(trigger);
      }
    };

    update();
    observeSizes();

    const mutation = new MutationObserver(() => {
      update();
      observeSizes();
    });
    mutation.observe(list, {
      attributes: true,
      attributeFilter: ['data-state'],
      characterData: true,
      childList: true,
      subtree: true,
    });

    void document.fonts?.ready.then(() => {
      if (active) update();
    });

    return () => {
      active = false;
      mutation.disconnect();
      resize.disconnect();
    };
  }, [enabled]);

  useLayoutEffect(() => {
    const indicatorNode = indicatorRef.current;
    const transform = transformRef.current;
    transformRef.current = null;
    animationRef.current?.cancel();

    if (
      !indicatorNode ||
      !transform ||
      shouldReduceMotion() ||
      typeof indicatorNode.animate !== 'function'
    ) {
      return undefined;
    }

    const { scaleX, scaleY, translateX, translateY } = transform;
    const hasVisibleChange =
      Math.abs(translateX) > 0.5 ||
      Math.abs(translateY) > 0.5 ||
      Math.abs(scaleX - 1) > 0.005 ||
      Math.abs(scaleY - 1) > 0.005;

    if (!hasVisibleChange) return undefined;

    const animation = indicatorNode.animate(
      [
        {
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'top left',
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          transformOrigin: 'top left',
        },
      ],
      getMotionOptions(indicatorNode, '--ds-duration-base', '--ds-ease-emphasized'),
    );
    animationRef.current = animation;

    return () => animation.cancel();
  }, [
    indicator.height,
    indicator.left,
    indicator.top,
    indicator.visible,
    indicator.width,
  ]);

  return { indicator, indicatorRef, listRef };
}

export { useTabsIndicator };
