'use client';

import type { ComponentProps, ReactNode } from 'react';

import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { formControlFocusRing, transitionColors } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import {
  smTypographyClasses,
  typographyClasses,
  type TypographyKind,
  typographyKindClasses,
  type TypographySize,
  type TypographyWeight,
} from '#ui/primitives/foundation/typography/typography';

const badgeWeights = {
  regular: 400,
  medium: 500,
  bold: 700,
} satisfies Record<string, TypographyWeight>;

type BadgeWeight = keyof typeof badgeWeights;

export const badgeVariants = cva(
  'rounded-ds-xxs gap-ds-1 inline-flex shrink-0 items-center justify-center whitespace-nowrap',
  {
    variants: {
      size: {
        sm: 'h-ds-5 px-ds-1-5 py-ds-1',
        md: 'h-ds-6 py-ds-1 pl-ds-1-5 pr-ds-2',
      },
      color: {
        default: 'bg-ds-surface-secondary text-ds-text-secondary',
        lime: 'bg-ds-surface-secondary text-ds-text-brand-primary',
        'lime-muted': 'bg-ds-surface-secondary text-ds-lime-500',
        'lime-online': 'bg-ds-brand-primary text-ds-text-black',
        purple: 'bg-ds-brand-secondary text-ds-text-white',
        'purple-muted': 'bg-ds-purple-800 text-ds-text-brand-secondary',
        success: 'bg-ds-surface-secondary text-ds-text-success',
        warning: 'bg-ds-surface-secondary text-ds-text-warning',
        muted: 'bg-ds-surface-secondary text-ds-text-tertiary',
      },
      bordered: {
        true: 'border border-current',
        false: '',
      },
      interactive: {
        true: transitionColors,
        false: '',
      },
    },
    compoundVariants: [
      {
        color: 'default',
        interactive: true,
        class: 'group-hover:bg-ds-surface-tertiary group-hover:text-ds-text-secondary',
      },
      {
        color: 'lime',
        interactive: true,
        class: 'group-hover:bg-ds-gray-700 group-hover:text-ds-text-brand-primary',
      },
      {
        color: 'lime-muted',
        interactive: true,
        class:
          'group-hover:bg-ds-brand-primary group-hover:text-ds-text-black group-hover:h-ds-6 group-hover:rounded-ds-2xs group-hover:text-ds-body-md group-hover:leading-ds-body-md group-hover:tracking-ds-body-md',
      },
      {
        color: 'warning',
        interactive: true,
        class: 'group-hover:bg-ds-surface-tertiary group-hover:text-ds-text-warning',
      },
      {
        color: ['lime-online', 'purple', 'purple-muted', 'success', 'muted'],
        interactive: true,
        class: 'group-hover:bg-ds-gray-700 group-hover:text-ds-text-primary',
      },
    ],
    defaultVariants: {
      size: 'md',
      color: 'default',
      bordered: false,
      interactive: false,
    },
  },
);

const badgeCountVariants = cva('', {
  variants: {
    color: {
      default: 'text-ds-text-brand-primary',
      lime: 'text-ds-text-brand-primary',
      'lime-muted': 'text-ds-lime-500',
      'lime-online': 'text-ds-text-black',
      purple: 'text-ds-text-white',
      'purple-muted': 'text-ds-text-brand-secondary',
      success: 'text-ds-text-success',
      warning: 'text-ds-text-warning',
      muted: 'text-ds-text-tertiary',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});

type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;

const badgeSmSizeClasses: Record<BadgeSize, string> = {
  sm: cn('sm:h-ds-5 sm:px-ds-1-5 sm:py-ds-1', smTypographyClasses(12, 500)),
  md: cn('sm:h-ds-6 sm:py-ds-1 sm:pl-ds-1-5 sm:pr-ds-2', smTypographyClasses(14, 500)),
};

const badgeCloseVariants = cva(
  [
    'rounded-ds-xxs flex shrink-0 cursor-pointer items-center justify-center',
    transitionColors,
    formControlFocusRing,
  ],
  {
    variants: {
      color: {
        default: 'text-ds-icon-secondary hover:text-ds-text-primary',
        lime: 'text-ds-icon-secondary hover:text-ds-text-primary',
        'lime-muted': 'text-ds-lime-500 hover:text-ds-text-primary',
        'lime-online': 'text-ds-text-black hover:text-ds-text-black',
        purple: 'text-ds-text-white hover:text-ds-text-white',
        'purple-muted': 'text-ds-text-brand-secondary hover:text-ds-text-primary',
        success: 'text-ds-text-success hover:text-ds-text-primary',
        warning: 'text-ds-text-warning hover:text-ds-text-primary',
        muted: 'text-ds-text-tertiary hover:text-ds-text-primary',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
);

type BadgeColor = NonNullable<VariantProps<typeof badgeVariants>['color']>;

const closeIconColor: Record<BadgeColor, ComponentProps<typeof Icon>['color']> = {
  default: 'secondary',
  lime: 'secondary',
  'lime-muted': 'brand-primary',
  'lime-online': 'black',
  purple: 'white',
  'purple-muted': 'brand-secondary',
  success: 'success',
  warning: 'warning',
  muted: 'secondary',
};

export function BadgeDot({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge-dot"
      className={cn('size-ds-2 flex shrink-0 items-center justify-center', className)}
      {...props}
    >
      <span className="bg-ds-brand-primary size-ds-1-5 rounded-ds-full" />
    </span>
  );
}

interface BadgeProps
  extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  smSize?: BadgeSize;
  weight?: BadgeWeight;
  textSize?: TypographySize;
  avatar?: ReactNode;
  leading?: ReactNode;
  textKind?: TypographyKind;
  count?: number;
  onClose?: () => void;
  closeLabel?: string;
}

export function Badge({
  className,
  size,
  smSize,
  color,
  asChild = false,
  weight = 'medium',
  textSize = 12,
  bordered,
  interactive,
  avatar,
  leading,
  textKind,
  count,
  onClose,
  closeLabel,
  children,
  ...props
}: BadgeProps) {
  const resolvedColor: BadgeColor = color ?? 'default';
  // figma Labels: lime-online leads with a black outlined ring, not the filled lime dot (invisible on lime);
  // pass leading={null} to opt out of the ring
  const resolvedLeading =
    leading !== undefined ? (
      leading
    ) : resolvedColor === 'lime-online' ? (
      <Icon name="circle" size={size === 'sm' ? 'sm' : 'md'} color="black" />
    ) : null;

  const countNode =
    count !== undefined ? (
      <span className={badgeCountVariants({ color: resolvedColor })}>{count}</span>
    ) : null;

  const closeButton = onClose ? (
    <button
      type="button"
      aria-label={closeLabel}
      onClick={onClose}
      className={badgeCloseVariants({ color: resolvedColor })}
    >
      <Icon name="close" size="sm" color={closeIconColor[resolvedColor]} />
    </button>
  ) : null;

  const badgeClassName = cn(
    badgeVariants({ size, color: resolvedColor, bordered, interactive }),
    typographyClasses(textSize, badgeWeights[weight]),
    smSize != null && badgeSmSizeClasses[smSize],
    textKind && typographyKindClasses(textKind),
    className,
  );

  if (asChild) {
    return (
      <Slot data-slot="badge" className={badgeClassName} {...props}>
        {avatar}
        {resolvedLeading}
        <Slottable>{children}</Slottable>
        {countNode}
        {closeButton}
      </Slot>
    );
  }

  return (
    <span
      data-slot="badge"
      role={onClose ? 'group' : undefined}
      className={badgeClassName}
      {...props}
    >
      {avatar}
      {resolvedLeading}
      {children}
      {countNode}
      {closeButton}
    </span>
  );
}
