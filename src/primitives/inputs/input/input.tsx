'use client';

import type { ComponentProps, FocusEventHandler, ReactNode } from 'react';
import { useState } from 'react';

import { transitionColors } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Badge } from '#ui/primitives/data-display/badge/badge';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { typographyClasses } from '#ui/primitives/foundation/typography/typography';

interface InputProps extends ComponentProps<'input'> {
  leading?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
  variant?: 'filled' | 'transparent';
  containerClassName?: string;
  onFocusLeave?: FocusEventHandler<HTMLDivElement>;
}

export function Input({
  className,
  containerClassName,
  leading,
  trailing,
  invalid = false,
  variant = 'filled',
  disabled,
  onFocusLeave,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
  return (
    <div
      data-slot="input-wrapper"
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      onPointerDown={(event) => {
        const target = event.target;

        if (
          !(target instanceof Element) ||
          target.closest('input, button, a, select, textarea')
        ) {
          return;
        }

        event.preventDefault();
        event.currentTarget.querySelector<HTMLInputElement>('input')?.focus();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onFocusLeave?.(event);
        }
      }}
      className={cn(
        'rounded-ds-xs border-ds-border-primary gap-ds-2 px-ds-3 py-ds-2-5 group flex h-10 w-full min-w-0 items-center border',
        variant === 'transparent' ? 'bg-transparent' : 'bg-ds-surface-secondary',
        transitionColors,
        'has-[:focus-visible]:border-ds-border-focus has-[:focus-visible]:ds-ring-focus',
        'data-[invalid]:border-ds-border-error data-[invalid]:focus-within:border-ds-border-error data-[invalid]:focus-within:ds-ring-error',
        'data-[disabled]:bg-ds-surface-tertiary data-[disabled]:cursor-not-allowed',
        containerClassName,
      )}
    >
      {leading}
      <input
        data-slot="input"
        disabled={disabled}
        aria-invalid={ariaInvalid ?? (invalid || undefined)}
        className={cn(
          typographyClasses(14, 400),
          'text-ds-text-primary w-0 min-w-0 flex-1 bg-transparent outline-none',
          'placeholder:text-ds-text-tertiary',
          'disabled:text-ds-text-tertiary disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}

export function InputPrefix({ className, children, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="input-prefix"
      className={cn(
        typographyClasses(14, 500),
        'border-ds-border-primary text-ds-text-secondary pr-ds-3 flex h-full items-center border-r',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function InputButton({ className, children, ...props }: ComponentProps<'button'>) {
  return (
    <Button
      data-slot="input-button"
      type="button"
      variant="gray"
      size="lg"
      className={cn('-mr-ds-3 rounded-l-ds-none rounded-r-ds-7px !h-[38px]', className)}
      {...props}
    >
      {children}
    </Button>
  );
}

type InputTagRemoveProps =
  | { onRemove?: undefined; removeLabel?: undefined }
  | { onRemove: () => void; removeLabel: string };

type InputTagProps = Omit<
  ComponentProps<typeof Badge>,
  'color' | 'size' | 'onClose' | 'closeLabel' | 'count' | 'leading'
> &
  InputTagRemoveProps;

export function InputTag({
  className,
  children,
  avatar,
  onRemove,
  removeLabel,
  ...props
}: InputTagProps) {
  return (
    <Badge
      data-slot="input-tag"
      size="sm"
      avatar={avatar}
      onClose={onRemove}
      closeLabel={removeLabel}
      className={cn('shrink-0', className)}
      {...props}
    >
      {children}
    </Badge>
  );
}

interface PasswordInputProps extends InputProps {
  showLabel: string;
  hideLabel: string;
}

export function PasswordInput({
  trailing,
  type: _type,
  showLabel,
  hideLabel,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? 'text' : 'password'}
      trailing={
        <>
          {trailing}
          <Button
            type="button"
            variant="bare"
            iconOnly
            aria-label={visible ? hideLabel : showLabel}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget
                .closest('[data-slot="input-wrapper"]')
                ?.querySelector<HTMLInputElement>('input')
                ?.focus();
            }}
            onClick={() => setVisible((prev) => !prev)}
            className="size-auto"
          >
            <Icon name={visible ? 'eye-off' : 'eye'} size="md" color="secondary" />
          </Button>
        </>
      }
      {...props}
    />
  );
}
