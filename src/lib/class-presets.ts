// Focus ring conventions:
// 1. `formControlFocusRing` — on the focusable element itself (outer ring). Default.
// 2. `formControlFocusRingInset` — on a focusable element inside a clipping viewport.
// 3. `*Within` — on a wrapper that owns the visual focus for a nested control.
export const formControlFocusRing = 'outline-none focus-visible:ds-focus-ring';

export const formControlFocusRingInset = 'outline-none focus-visible:ds-focus-ring-inset';

export const formControlFocusRingWithin = 'has-[:focus-visible]:ds-focus-ring';

export const formControlFocusRingWithinInset = 'has-[:focus-visible]:ds-focus-ring-inset';

export const formControlDisabled =
  'disabled:border-ds-border-tertiary disabled:pointer-events-none';

export const fadeAnimationClasses = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=open]:duration-ds-base data-[state=closed]:duration-ds-fast',
  'data-[state=open]:ease-ds-entrance data-[state=closed]:ease-ds-exit',
  'motion-reduce:animate-none',
];

export const tooltipAnimationClasses = [
  'data-[state=delayed-open]:animate-in data-[state=instant-open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:fade-in-0',
  'data-[state=delayed-open]:duration-ds-fast data-[state=instant-open]:duration-ds-fast data-[state=closed]:duration-ds-instant',
  'data-[state=delayed-open]:ease-ds-entrance data-[state=instant-open]:ease-ds-entrance data-[state=closed]:ease-ds-exit',
  'motion-reduce:animate-none',
];

export const floatingAnimationClasses = [
  ...fadeAnimationClasses,
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
];

export const dialogAnimationClasses = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'origin-center data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  'data-[state=open]:duration-ds-slow data-[state=closed]:duration-ds-base',
  'data-[state=open]:ease-ds-entrance data-[state=closed]:ease-ds-exit',
  'motion-reduce:animate-none',
];

export const dividerClasses = 'bg-ds-border-tertiary';

export const transitionColors = 'transition-colors duration-ds-base ease-ds-emphasized';

export const transitionTransform =
  'transition-transform duration-ds-base ease-ds-standard';

export const transitionOpacity = 'transition-opacity duration-ds-base ease-ds-standard';
