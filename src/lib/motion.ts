import type { Transition } from 'framer-motion';

function getMotionOptions(
  element: HTMLElement,
  durationProperty = '--ds-duration-base',
  easingProperty = '--ds-ease-standard',
): KeyframeAnimationOptions {
  const styles = getComputedStyle(element);
  const durationValue = styles.getPropertyValue(durationProperty).trim();
  const duration = durationValue.endsWith('ms')
    ? Number.parseFloat(durationValue)
    : Number.parseFloat(durationValue) * 1000;

  return {
    duration: Number.isFinite(duration) ? duration : 0,
    easing: styles.getPropertyValue(easingProperty).trim() || 'linear',
  };
}

function shouldReduceMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getLayoutTransition(
  element: HTMLElement,
  durationProperty?: string,
): Transition {
  const { duration, easing } = getMotionOptions(element, durationProperty);
  const bezier = /^cubic-bezier\(([^)]+)\)$/
    .exec(easing ?? '')?.[1]
    ?.split(',')
    .map(Number);

  return {
    type: 'tween',
    duration: Number(duration) / 1000,
    ease:
      bezier?.length === 4 && bezier.every(Number.isFinite)
        ? (bezier as [number, number, number, number])
        : 'linear',
  };
}

export { getLayoutTransition, getMotionOptions, shouldReduceMotion };
