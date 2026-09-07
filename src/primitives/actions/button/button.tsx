import {
  Children,
  cloneElement,
  type ComponentProps,
  isValidElement,
  type ReactNode,
} from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { formControlFocusRing, transitionColors } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { LoadingIcon } from '#ui/primitives/foundation/icon/icons/loading';
import {
  Typography,
  typographyClasses,
  type TypographyKind,
} from '#ui/primitives/foundation/typography/typography';

export const buttonVariants = cva(
  [
    'gap-ds-1 inline-flex shrink-0 items-center justify-center whitespace-nowrap',
    'cursor-pointer',
    transitionColors,
    formControlFocusRing,
    'disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-ds-button-brand-primary-default-background text-ds-button-brand-primary-default-text',
          'hover:bg-ds-button-brand-primary-hover-background hover:text-ds-button-brand-primary-hover-text',
          'disabled:bg-ds-button-brand-primary-disabled-background disabled:text-ds-button-brand-primary-disabled-text',
        ],
        secondary: [
          'bg-ds-button-brand-secondary-default-background text-ds-button-brand-secondary-default-text',
          'hover:bg-ds-button-brand-secondary-hover-background hover:text-ds-button-brand-secondary-hover-text',
          'disabled:bg-ds-button-brand-secondary-disabled-background disabled:text-ds-button-brand-secondary-disabled-text',
        ],
        white: [
          'bg-ds-button-white-default-background text-ds-button-white-default-text',
          'hover:bg-ds-button-white-hover-background hover:text-ds-button-white-hover-text',
          'disabled:bg-ds-button-white-disabled-background disabled:text-ds-button-white-disabled-text',
        ],
        gray: [
          'bg-ds-button-gray-default-background text-ds-button-gray-default-text',
          'hover:bg-ds-button-gray-hover-background hover:text-ds-button-gray-hover-text',
          'disabled:bg-ds-button-gray-disabled-background disabled:text-ds-button-gray-disabled-text',
        ],
        'gray-solid': [
          'bg-ds-gray-800 text-ds-gray-150',
          'hover:bg-ds-gray-700 hover:text-ds-text-primary',
          'disabled:bg-ds-gray-900 disabled:text-ds-gray-700',
        ],
        'gray-muted': [
          'bg-ds-button-gray-muted-default-background text-ds-button-gray-muted-default-text',
          'hover:bg-ds-button-gray-muted-hover-background hover:text-ds-button-gray-muted-hover-text',
          'disabled:bg-ds-button-gray-muted-disabled-background disabled:text-ds-button-gray-muted-disabled-text',
        ],
        ghost: [
          'text-ds-button-ghost-default-text border border-transparent bg-transparent',
          'ds-button-ghost-glow',
          'hover:text-ds-button-ghost-hover-text',
          'focus-visible:text-ds-button-ghost-hover-text',
          'disabled:text-ds-button-ghost-disabled-text disabled:border-ds-border-tertiary',
        ],
        'link-color': [
          'text-ds-button-link-color-default-text',
          'hover:text-ds-button-link-color-hover-text',
          'disabled:text-ds-button-link-color-disabled-text',
        ],
        'link-white': [
          'text-ds-button-link-white-default-text',
          'hover:text-ds-button-link-white-hover-text',
          'disabled:text-ds-button-link-white-disabled-text',
        ],
        bare: [
          'text-ds-text-secondary border-0 bg-transparent',
          'hover:text-ds-text-primary',
          'disabled:text-ds-text-secondary disabled:opacity-50',
        ],
        subtle: [
          'text-ds-text-primary border-0 bg-transparent',
          'hover:bg-ds-surface-secondary',
          'disabled:text-ds-text-primary disabled:opacity-50',
        ],
      },
      size: {
        sm: cn(
          'h-ds-6 px-ds-1-5 rounded-ds-xs [&_svg]:size-ds-3',
          typographyClasses(12, 500),
        ),
        md: cn(
          'h-ds-8 px-ds-2 rounded-ds-xs [&_svg]:size-ds-4',
          typographyClasses(14, 500),
        ),
        lg: cn(
          'h-ds-10 px-ds-2-5 rounded-ds-xs [&_svg]:size-ds-5',
          typographyClasses(14, 500),
        ),
      },
      iconOnly: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { size: 'sm', iconOnly: true, class: 'w-ds-6 px-0' },
      { size: 'md', iconOnly: true, class: 'w-ds-8 px-0' },
      { size: 'lg', iconOnly: true, class: 'w-ds-10 px-0' },
      { variant: 'link-color', class: 'rounded-ds-2xs h-auto px-0' },
      { variant: 'link-white', class: 'rounded-ds-2xs h-auto px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      iconOnly: false,
    },
  },
);

type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

function getButtonTextKind(size?: ButtonSize | null): TypographyKind {
  return size === 'sm' ? 'secondary-12-500' : 'secondary-14-500';
}

function isButtonTextChild(child: ReactNode) {
  return (typeof child === 'string' && child !== '') || typeof child === 'number';
}

function ButtonText({ kind, children }: { kind: TypographyKind; children: ReactNode }) {
  return (
    <Typography kind={kind} as="span" className="text-current">
      {children}
    </Typography>
  );
}

function renderButtonChildren(children: ReactNode, kind: TypographyKind) {
  return Children.map(children, (child) =>
    isButtonTextChild(child) ? <ButtonText kind={kind}>{child}</ButtonText> : child,
  );
}

function renderButtonSlotChild(children: ReactNode, kind: TypographyKind) {
  if (Children.count(children) !== 1) {
    return children;
  }

  const child = Children.only(children);

  if (!isValidElement<{ children?: ReactNode }>(child)) {
    return child;
  }

  return cloneElement(child, undefined, renderButtonChildren(child.props.children, kind));
}

interface ButtonProps
  extends Omit<ComponentProps<'button'>, 'color'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  left?: ReactNode;
  right?: ReactNode;
  textKind?: TypographyKind;
}

export function Button({
  className,
  variant,
  size,
  iconOnly,
  asChild = false,
  loading = false,
  loadingLabel,
  left,
  right,
  textKind,
  children,
  ...props
}: ButtonProps) {
  const resolvedTextKind = textKind ?? getButtonTextKind(size);

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        aria-busy={loading || undefined}
        className={cn(
          buttonVariants({ variant, size, iconOnly }),
          loading && 'pointer-events-none',
          className,
        )}
        {...props}
      >
        {renderButtonSlotChild(children, resolvedTextKind)}
      </Slot>
    );
  }

  if (loading && iconOnly) {
    return (
      <button
        data-slot="button"
        aria-busy
        className={cn(
          buttonVariants({ variant, size, iconOnly }),
          'pointer-events-none',
          className,
        )}
        {...props}
        disabled={loading || props.disabled}
      >
        <LoadingIcon className="animate-spin motion-reduce:animate-none" />
        <Typography
          kind={resolvedTextKind}
          as="span"
          className="sr-only text-current"
          role="status"
          aria-live="polite"
        >
          {loadingLabel}
        </Typography>
      </button>
    );
  }

  return (
    <button
      data-slot="button"
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({ variant, size, iconOnly }),
        loading && 'pointer-events-none',
        className,
      )}
      {...props}
      disabled={loading || props.disabled}
    >
      {loading ? (
        <LoadingIcon className="animate-spin motion-reduce:animate-none" />
      ) : (
        left
      )}
      {renderButtonChildren(children, resolvedTextKind)}
      {right}
    </button>
  );
}
