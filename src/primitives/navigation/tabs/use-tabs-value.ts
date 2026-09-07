'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseTabsValueOptions {
  value?: string;
  defaultValue?: string;
  values?: readonly string[];
  onValueChange?: (value: string) => void | Promise<void>;
}

interface UseTabsValueResult {
  value?: string;
  hasInteracted: boolean;
  isOptimistic: boolean;
  onValueChange: (value: string) => void;
}

function useTabsValue({
  value,
  defaultValue,
  values,
  onValueChange,
}: UseTabsValueOptions): UseTabsValueResult {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(
    () => defaultValue ?? values?.[0],
  );
  const [optimisticValue, setOptimisticValue] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const requestIdRef = useRef(0);
  const valueSet = useMemo(() => (values ? new Set(values) : null), [values]);
  const committedValue = isControlled ? value : uncontrolledValue;
  const resolvedValue = optimisticValue ?? committedValue ?? defaultValue ?? values?.[0];
  const isOptimistic = optimisticValue !== null && optimisticValue !== committedValue;

  useEffect(() => {
    setOptimisticValue(null);
  }, [value]);

  useEffect(() => {
    if (!valueSet) return;

    setOptimisticValue((currentValue) =>
      currentValue && valueSet.has(currentValue) ? currentValue : null,
    );

    if (!isControlled) {
      setUncontrolledValue((currentValue) =>
        currentValue && valueSet.has(currentValue)
          ? currentValue
          : (defaultValue ?? values?.[0]),
      );
    }
  }, [defaultValue, isControlled, valueSet, values]);

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (valueSet && !valueSet.has(nextValue)) {
        return;
      }

      setHasInteracted(true);

      if (isControlled) {
        setOptimisticValue(nextValue === committedValue ? null : nextValue);
      } else {
        setUncontrolledValue(nextValue);
        setOptimisticValue(null);
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const result = onValueChange?.(nextValue);

      if (result && typeof result.then === 'function') {
        const clearOptimisticValue = () => {
          if (requestIdRef.current === requestId) {
            setOptimisticValue(null);
          }
        };

        result.then(clearOptimisticValue, clearOptimisticValue);
      }
    },
    [committedValue, isControlled, onValueChange, valueSet],
  );

  return {
    value: resolvedValue,
    hasInteracted,
    isOptimistic,
    onValueChange: handleValueChange,
  };
}

export { useTabsValue };
