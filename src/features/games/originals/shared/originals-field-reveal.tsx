'use client';

import type { ReactNode } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '#ui/lib/cn';

type OriginalsFieldRevealOffset = '1' | '2';

const OFFSET_VAR: Record<OriginalsFieldRevealOffset, string> = {
  '1': 'var(--ds-spacing-1)',
  '2': 'var(--ds-spacing-2)',
};

interface OriginalsFieldRevealProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  offset?: OriginalsFieldRevealOffset;
}

/** Animated field feedback wrapper (errors, warnings). Mirrors web `ThresholdWarning`. */
export function OriginalsFieldReveal({
  open,
  children,
  className,
  offset = '1',
}: OriginalsFieldRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.3;
  const marginTop = OFFSET_VAR[offset];

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration, ease: 'easeInOut' }}
          className={cn('overflow-hidden', className)}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
