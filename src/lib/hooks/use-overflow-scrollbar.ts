'use client';

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefCallback,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { shouldReduceMotion } from '#ui/lib/motion';

interface ScrollDimensions {
  scrollWidth: number;
  clientWidth: number;
  measured: boolean;
}

type ScrollDirection = 'ltr' | 'rtl';

interface OverflowScrollbarOptions {
  enabled?: boolean;
  minThumbSize?: number;
  keyboardStep?: number;
}

interface OverflowScrollbar {
  scrollRef: RefObject<HTMLDivElement | null>;
  hasMeasured: boolean;
  hasOverflow: boolean;
  thumbWidth: number;
  setThumbNode: RefCallback<HTMLDivElement>;
  onThumbPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onTrackClick: (event: ReactMouseEvent<HTMLElement>) => void;
  scrollbarProps: {
    'aria-valuenow': number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-orientation': 'horizontal';
    tabIndex: number;
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function getThumbWidth(clientWidth: number, scrollWidth: number, minThumbSize: number) {
  if (clientWidth <= 0 || scrollWidth <= clientWidth) return 0;

  return Math.min(
    clientWidth,
    Math.max(minThumbSize, (clientWidth * clientWidth) / scrollWidth),
  );
}

function getLogicalScrollLeft(
  scrollLeft: number,
  maxScroll: number,
  direction: ScrollDirection,
) {
  return clamp(direction === 'rtl' ? -scrollLeft : scrollLeft, 0, maxScroll);
}

export function useOverflowScrollbar({
  enabled = true,
  minThumbSize = 24,
  keyboardStep = 48,
}: OverflowScrollbarOptions = {}): OverflowScrollbar {
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const ariaUpdateTimerRef = useRef<number | null>(null);
  const directionRef = useRef<ScrollDirection>('ltr');

  const [dimensions, setDimensions] = useState<ScrollDimensions>({
    scrollWidth: 0,
    clientWidth: 0,
    measured: false,
  });
  const [ariaValue, setAriaValue] = useState(0);

  const syncThumb = useCallback(() => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const scrollLeft = getLogicalScrollLeft(
      el.scrollLeft,
      maxScroll,
      directionRef.current,
    );
    const thumbWidth = getThumbWidth(el.clientWidth, el.scrollWidth, minThumbSize);
    const thumbTravel = el.clientWidth - thumbWidth;
    const logicalOffset = maxScroll > 0 ? (scrollLeft / maxScroll) * thumbTravel : 0;
    const offset =
      directionRef.current === 'rtl' ? thumbTravel - logicalOffset : logicalOffset;

    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translate3d(${offset}px, 0, 0)`;
  }, [minThumbSize]);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    directionRef.current = getComputedStyle(el).direction === 'rtl' ? 'rtl' : 'ltr';
    const next = {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      measured: true,
    };
    setDimensions((current) => {
      if (
        current.scrollWidth === next.scrollWidth &&
        current.clientWidth === next.clientWidth &&
        current.measured
      ) {
        return current;
      }
      return next;
    });
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    setAriaValue(getLogicalScrollLeft(el.scrollLeft, maxScroll, directionRef.current));
    syncThumb();
  }, [syncThumb]);

  useLayoutEffect(() => {
    if (!enabled) return undefined;

    const el = scrollRef.current;
    if (!el) return;
    let active = true;
    measure();
    const resizeObserver = new ResizeObserver(measure);
    const observeSizes = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(el);
      for (const child of Array.from(el.children)) resizeObserver.observe(child);
    };
    observeSizes();

    const mutationObserver = new MutationObserver(() => {
      measure();
      observeSizes();
    });
    mutationObserver.observe(el, {
      attributes: true,
      attributeFilter: ['data-state'],
      characterData: true,
      childList: true,
      subtree: true,
    });

    void document.fonts?.ready.then(() => {
      if (active) measure();
    });

    const handleScroll = () => {
      syncThumb();
      if (ariaUpdateTimerRef.current !== null) {
        window.clearTimeout(ariaUpdateTimerRef.current);
        ariaUpdateTimerRef.current = null;
      }
      ariaUpdateTimerRef.current = window.setTimeout(() => {
        ariaUpdateTimerRef.current = null;
        measure();
      }, 100);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      active = false;
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener('scroll', handleScroll);
      dragCleanupRef.current?.();
      if (ariaUpdateTimerRef.current !== null) {
        window.clearTimeout(ariaUpdateTimerRef.current);
        ariaUpdateTimerRef.current = null;
      }
    };
  }, [enabled, measure, syncThumb]);

  const hasOverflow = enabled && dimensions.scrollWidth > dimensions.clientWidth + 2;
  const maxScroll = Math.max(0, dimensions.scrollWidth - dimensions.clientWidth);
  const trackWidth = dimensions.clientWidth;
  const thumbWidth = getThumbWidth(trackWidth, dimensions.scrollWidth, minThumbSize);

  const scrollTo = useCallback((left: number, smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;

    const currentMaxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const logicalLeft = clamp(left, 0, currentMaxScroll);
    el.scrollTo({
      left: directionRef.current === 'rtl' ? -logicalLeft : logicalLeft,
      behavior: smooth && !shouldReduceMotion() ? 'smooth' : 'auto',
    });
  }, []);

  const handleTrackClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (event.target instanceof Node && thumbRef.current?.contains(event.target)) {
        return;
      }

      const el = scrollRef.current;
      if (!hasOverflow || !el || el.clientWidth <= 0) return;

      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const logicalRatio = directionRef.current === 'rtl' ? 1 - ratio : ratio;
      scrollTo(logicalRatio * Math.max(0, el.scrollWidth - el.clientWidth), true);
    },
    [hasOverflow, scrollTo],
  );

  const handleThumbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const el = scrollRef.current;
      if (!el) return;
      const scrollElement = el;

      const currentMaxScroll = Math.max(
        0,
        scrollElement.scrollWidth - scrollElement.clientWidth,
      );
      if (currentMaxScroll <= 0) return;
      const pointerId = event.pointerId;
      const thumbNode = event.currentTarget;

      dragStartRef.current = {
        x: event.clientX,
        scrollLeft: getLogicalScrollLeft(
          scrollElement.scrollLeft,
          currentMaxScroll,
          directionRef.current,
        ),
      };
      const currentThumbWidth = getThumbWidth(
        scrollElement.clientWidth,
        scrollElement.scrollWidth,
        minThumbSize,
      );
      const scale =
        currentMaxScroll / Math.max(1, scrollElement.clientWidth - currentThumbWidth);

      const onMove = (move: PointerEvent) => {
        if (move.pointerId !== pointerId) return;
        const delta = move.clientX - dragStartRef.current.x;
        const logicalDelta = directionRef.current === 'rtl' ? -delta : delta;
        const logicalLeft = clamp(
          dragStartRef.current.scrollLeft + logicalDelta * scale,
          0,
          currentMaxScroll,
        );
        scrollElement.scrollLeft =
          directionRef.current === 'rtl' ? -logicalLeft : logicalLeft;
      };
      function cleanup() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', finish);
        thumbNode.removeEventListener('lostpointercapture', finish);
        if (thumbNode.hasPointerCapture(pointerId)) {
          thumbNode.releasePointerCapture(pointerId);
        }
        dragCleanupRef.current = null;
      }
      function finish(pointerEvent: PointerEvent) {
        if (pointerEvent.pointerId !== pointerId) return;
        cleanup();
        setAriaValue(
          getLogicalScrollLeft(
            scrollElement.scrollLeft,
            currentMaxScroll,
            directionRef.current,
          ),
        );
      }

      dragCleanupRef.current?.();
      dragCleanupRef.current = cleanup;
      thumbNode.setPointerCapture(pointerId);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', finish);
      thumbNode.addEventListener('lostpointercapture', finish);
    },
    [minThumbSize],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const el = scrollRef.current;
      if (!hasOverflow || !el) return;

      const currentMaxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const left = getLogicalScrollLeft(
        el.scrollLeft,
        currentMaxScroll,
        directionRef.current,
      );
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          scrollTo(
            left + (directionRef.current === 'rtl' ? keyboardStep : -keyboardStep),
          );
          break;
        case 'ArrowRight':
          event.preventDefault();
          scrollTo(
            left + (directionRef.current === 'rtl' ? -keyboardStep : keyboardStep),
          );
          break;
        case 'Home':
          event.preventDefault();
          scrollTo(0);
          break;
        case 'End':
          event.preventDefault();
          scrollTo(currentMaxScroll);
          break;
      }
    },
    [hasOverflow, keyboardStep, scrollTo],
  );

  const setThumbRef = useCallback<RefCallback<HTMLDivElement>>(
    (node) => {
      thumbRef.current = node;
      syncThumb();
    },
    [syncThumb],
  );

  return {
    scrollRef,
    hasMeasured: dimensions.measured,
    hasOverflow,
    thumbWidth,
    setThumbNode: setThumbRef,
    onThumbPointerDown: handleThumbPointerDown,
    onTrackClick: handleTrackClick,
    scrollbarProps: {
      'aria-valuenow': ariaValue,
      'aria-valuemin': 0,
      'aria-valuemax': maxScroll,
      'aria-orientation': 'horizontal',
      tabIndex: 0,
      onKeyDown: handleKeyDown,
    },
  };
}
