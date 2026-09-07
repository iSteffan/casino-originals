import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const DS_FONT_SIZES = [
  'ds-xxs',
  'ds-xs',
  'ds-sm',
  'ds-base',
  'ds-lg',
  'ds-xlg',
  'ds-xl',
  'ds-2xl',
  'ds-body-sm',
  'ds-body-md',
  'ds-body-lg',
  'ds-display-sm',
  'ds-display-md',
  'ds-display-lg',
  'ds-display-xl',
];

const DS_LINE_HEIGHTS = [
  'ds-solid',
  'ds-relaxed',
  'ds-body-sm',
  'ds-body-md',
  'ds-body-lg',
  'ds-display-sm',
  'ds-display-md',
  'ds-display-lg',
  'ds-display-xl',
];

const DS_LETTER_SPACINGS = [
  'ds-wide',
  'ds-wider',
  'ds-gift-card-amount',
  'ds-body-sm',
  'ds-body-md',
  'ds-body-lg',
  'ds-display-sm',
  'ds-display-md',
  'ds-display-lg',
  'ds-display-xl',
];

const DS_SHADOWS = ['ds-sm', 'ds-lg', 'ds-2xl'];

const DS_SPACINGS = [
  'ds-0',
  'ds-0-5',
  'ds-1',
  'ds-1-5',
  'ds-2',
  'ds-2-5',
  'ds-3',
  'ds-3-5',
  'ds-4',
  'ds-5',
  'ds-6',
  'ds-7',
  'ds-8',
  'ds-9',
  'ds-10',
  'ds-11',
  'ds-12',
  'ds-13',
  'ds-14',
  'ds-15',
  'ds-16',
  'ds-none',
  'ds-xxs',
  'ds-xs',
  'ds-sm',
  'ds-md',
  'ds-lg',
  'ds-xl',
  'ds-xxl',
];

const DS_RADII = [
  'ds-none',
  'ds-3xs',
  'ds-2xs',
  'ds-xxs',
  'ds-xs',
  'ds-sm',
  'ds-md',
  'ds-lg',
  'ds-xl',
  'ds-xxl',
  'ds-2px',
  'ds-5px',
  'ds-7px',
  'ds-9px',
  'ds-10px',
  'ds-11px',
  'ds-13px',
  'ds-full',
];

const twMerge = extendTailwindMerge<'ds-focus-ring'>({
  extend: {
    theme: {
      spacing: DS_SPACINGS,
      radius: DS_RADII,
      shadow: DS_SHADOWS,
    },
    classGroups: {
      'font-size': [{ text: DS_FONT_SIZES }],
      'font-family': [{ font: ['ds-text', 'ds-display', 'ds-mono'] }],
      'font-weight': [{ font: ['ds-regular', 'ds-medium', 'ds-semibold', 'ds-bold'] }],
      leading: [{ leading: DS_LINE_HEIGHTS }],
      tracking: [{ tracking: DS_LETTER_SPACINGS }],
      'ds-focus-ring': ['ds-focus-ring', 'ds-focus-ring-inset'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
