'use client';

import { cn } from '#ui/lib/cn';

export function PlinkoBall({ className }: { className?: string }) {
  return <span className={cn('ds-plinko-ball', className)} aria-hidden="true" />;
}
