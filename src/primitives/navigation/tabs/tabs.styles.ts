import { cva } from 'class-variance-authority';

import { formControlFocusRingInset, transitionColors } from '#ui/lib/class-presets';
import { typographyClasses } from '#ui/primitives/foundation/typography/typography';

const indicatorVariants = cva('absolute z-0', {
  variants: {
    color: {
      default: 'bg-ds-surface-tertiary rounded-ds-5px',
      brand: 'bg-ds-brand-secondary rounded-ds-5px',
      white: 'bg-ds-text-primary rounded-ds-5px',
      glow: 'ds-tabs-glow',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});

const triggerVariants = cva(
  [
    'gap-ds-1 relative z-10 flex items-center justify-center whitespace-nowrap',
    typographyClasses(14, 500),
    'cursor-pointer disabled:opacity-50',
    transitionColors,
    formControlFocusRingInset,
    'text-ds-button-gray-default-text hover:text-ds-button-gray-hover-text',
  ],
  {
    variants: {
      color: {
        default: 'data-[state=active]:text-ds-text-primary',
        brand: 'data-[state=active]:text-ds-text-primary',
        white: 'data-[state=active]:text-ds-text-black',
        glow: 'text-ds-text-secondary hover:text-ds-text-white data-[state=active]:text-ds-text-white',
      },
      orientation: {
        horizontal: 'min-w-fit flex-1 px-4',
        vertical: 'w-full flex-none px-4',
      },
      variant: {
        bordered: 'rounded-ds-5px',
        filled: 'rounded-ds-5px',
        game: 'ds-tabs-game-trigger rounded-ds-2xs h-[42px] max-h-[42px] min-h-[42px] min-w-0 overflow-hidden border px-3 md:h-10 md:max-h-10 md:min-h-10',
      },
    },
    compoundVariants: [
      {
        variant: 'bordered',
        color: 'glow',
        orientation: 'horizontal',
        class: 'gap-ds-2 rounded-ds-xs px-ds-3 flex-none',
      },
      {
        variant: 'game',
        color: 'glow',
        class: 'ds-tabs-game-trigger-glow',
      },
    ],
    defaultVariants: {
      color: 'default',
      orientation: 'horizontal',
      variant: 'bordered',
    },
  },
);

export { indicatorVariants, triggerVariants };
