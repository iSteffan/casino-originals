import type { ComponentProps } from 'react';
import { createElement } from 'react';

import { cn } from '#ui/lib/cn';

type TypographyColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'white'
  | 'black'
  | 'brand-primary'
  | 'brand-secondary'
  | 'foreground-tertiary'
  | 'foreground-quaternary'
  | 'error'
  | 'warning'
  | 'success'
  | 'info';

type TypographyBaseSize = 10 | 12 | 14 | 16 | 20 | 24 | 32;
type TypographySize = TypographyBaseSize | 'body-responsive' | 'label-responsive';
type TypographyWeight = 400 | 500 | 700;
type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
type TypographyTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
type TypographyFamily = 'default' | 'mono';
type TypographyWrap = 'normal' | 'break-words' | 'break-all' | 'truncate';

export type TypographyKind = `${TypographyColor}-${TypographySize}-${TypographyWeight}`;

type TypographyTag =
  | 'p'
  | 'span'
  | 'div'
  | 'label'
  | 'li'
  | 'dt'
  | 'dd'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

const colorClasses: Record<TypographyColor, string> = {
  inherit: 'text-current',
  primary: 'text-ds-text-primary',
  secondary: 'text-ds-text-secondary',
  tertiary: 'text-ds-text-tertiary',
  white: 'text-ds-text-white',
  black: 'text-ds-text-black',
  'brand-primary': 'text-ds-text-brand-primary',
  'brand-secondary': 'text-ds-text-brand-secondary',
  'foreground-tertiary': 'text-ds-foreground-tertiary',
  'foreground-quaternary': 'text-ds-foreground-quaternary',
  error: 'text-ds-text-error',
  warning: 'text-ds-text-warning',
  success: 'text-ds-text-success',
  info: 'text-ds-text-info',
};

const sizeClasses: Record<TypographySize, string> = {
  10: 'text-ds-body-sm leading-ds-body-sm tracking-ds-body-sm',
  12: 'text-ds-body-md leading-ds-body-md tracking-ds-body-md',
  14: 'text-ds-body-lg leading-ds-body-lg tracking-ds-body-lg',
  16: 'text-ds-display-sm leading-ds-display-sm tracking-ds-display-sm',
  20: 'text-ds-display-md leading-ds-display-md tracking-ds-display-md',
  24: 'text-ds-display-lg leading-ds-display-lg tracking-ds-display-lg',
  32: 'text-ds-display-xl leading-ds-display-xl tracking-ds-display-xl',
  'body-responsive': [
    'text-ds-body-md leading-ds-body-md tracking-ds-body-md',
    'md:text-ds-body-lg md:leading-ds-body-lg md:tracking-ds-body-lg',
  ].join(' '),
  'label-responsive': [
    'text-ds-body-sm leading-ds-body-sm tracking-ds-body-sm',
    'xl:text-ds-body-md xl:leading-ds-body-md xl:tracking-ds-body-md',
  ].join(' '),
};

const smSizeClasses: Record<TypographyBaseSize, string> = {
  10: 'sm:text-ds-body-sm sm:leading-ds-body-sm sm:tracking-ds-body-sm',
  12: 'sm:text-ds-body-md sm:leading-ds-body-md sm:tracking-ds-body-md',
  14: 'sm:text-ds-body-lg sm:leading-ds-body-lg sm:tracking-ds-body-lg',
  16: 'sm:text-ds-display-sm sm:leading-ds-display-sm sm:tracking-ds-display-sm',
  20: 'sm:text-ds-display-md sm:leading-ds-display-md sm:tracking-ds-display-md',
  24: 'sm:text-ds-display-lg sm:leading-ds-display-lg sm:tracking-ds-display-lg',
  32: 'sm:text-ds-display-xl sm:leading-ds-display-xl sm:tracking-ds-display-xl',
};

const weightClasses: Record<TypographyWeight, string> = {
  400: 'font-ds-regular',
  500: 'font-ds-medium',
  700: 'font-ds-bold',
};

const smWeightClasses: Record<TypographyWeight, string> = {
  400: 'sm:font-ds-regular',
  500: 'sm:font-ds-medium',
  700: 'sm:font-ds-bold',
};

const alignClasses: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const transformClasses: Record<TypographyTransform, string> = {
  none: '',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
};

const familyClasses: Record<TypographyFamily, string> = {
  default: '',
  mono: 'font-ds-mono',
};

const wrapClasses: Record<TypographyWrap, string> = {
  normal: '',
  'break-words': 'break-words',
  'break-all': 'break-all',
  truncate: 'truncate',
};

const kindClasses = Object.fromEntries(
  Object.entries(colorClasses).flatMap(([color, colorClass]) =>
    Object.entries(sizeClasses).flatMap(([size, sizeClass]) =>
      Object.entries(weightClasses).map(([weight, weightClass]) => [
        `${color}-${size}-${weight}`,
        cn(colorClass, sizeClass, weightClass),
      ]),
    ),
  ),
) as Record<TypographyKind, string>;

interface TypographyProps extends Omit<ComponentProps<'p'>, 'align' | 'color'> {
  kind: TypographyKind;
  as?: TypographyTag;
  align?: TypographyAlign;
  smSize?: TypographyBaseSize;
  smWeight?: TypographyWeight;
  transform?: TypographyTransform;
  family?: TypographyFamily;
  wrap?: TypographyWrap;
}

export function typographyClasses(size: TypographySize, weight: TypographyWeight) {
  return cn(sizeClasses[size], weightClasses[weight]);
}

export function smTypographyClasses(size: TypographyBaseSize, weight: TypographyWeight) {
  return cn(smSizeClasses[size], smWeightClasses[weight]);
}

export function typographyKindClasses(kind: TypographyKind) {
  return kindClasses[kind];
}

export function Typography({
  kind,
  as = 'p',
  align = 'left',
  smSize,
  smWeight,
  transform = 'none',
  family = 'default',
  wrap = 'normal',
  className,
  ...props
}: TypographyProps) {
  return createElement(as, {
    'data-slot': 'typography',
    className: cn(
      typographyKindClasses(kind),
      smSize != null && smSizeClasses[smSize],
      smWeight != null && smWeightClasses[smWeight],
      alignClasses[align],
      transformClasses[transform],
      familyClasses[family],
      wrapClasses[wrap],
      className,
    ),
    ...props,
  });
}

export type {
  TypographyAlign,
  TypographyColor,
  TypographyFamily,
  TypographySize,
  TypographyTransform,
  TypographyWeight,
  TypographyWrap,
};
