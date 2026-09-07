import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { cn } from '#ui/lib/cn';

type GradientTone = 'neutral' | 'lime' | 'purple';
type GradientSurface = 'primary' | 'secondary';
type GradientRadius = 'xs' | 'md';

const radiusClasses: Record<GradientRadius, string> = {
  xs: 'rounded-ds-xs',
  md: 'rounded-ds-md',
};

interface GradientCardOwnProps {
  as?: ElementType;
  tone?: GradientTone;
  surface?: GradientSurface;
  radius?: GradientRadius;
  className?: string;
}

export type GradientCardProps = GradientCardOwnProps &
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Omit<ComponentPropsWithoutRef<any>, keyof GradientCardOwnProps>;

export function GradientCard({
  as: Root = 'div',
  tone = 'neutral',
  surface = 'primary',
  radius = 'md',
  className,
  ...props
}: GradientCardProps) {
  return (
    <Root
      data-slot="gradient-card"
      data-tone={tone}
      data-surface={surface}
      className={cn('ds-gradient-card', radiusClasses[radius], className)}
      {...props}
    />
  );
}

export type { GradientRadius, GradientSurface, GradientTone };
