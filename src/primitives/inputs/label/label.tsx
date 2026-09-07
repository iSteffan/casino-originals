import type { ComponentProps, ReactNode } from 'react';

import { cn } from '#ui/lib/cn';
import {
  typographyClasses,
  type TypographyWeight,
} from '#ui/primitives/foundation/typography/typography';

interface LabelProps extends ComponentProps<'label'> {
  required?: boolean;
  adornment?: ReactNode;
  weight?: TypographyWeight;
}

export function Label({
  className,
  children,
  required = false,
  adornment,
  weight = 700,
  ...props
}: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        typographyClasses(12, weight),
        'text-ds-text-primary gap-ds-1 flex items-center',
        className,
      )}
      {...props}
    >
      <span className="gap-ds-0-5 flex items-center">
        {children}
        {required && <span className="text-ds-field-required">*</span>}
      </span>
      {adornment}
    </label>
  );
}
