import type { ReactNode } from 'react';

/** Inner content width inside `ds-originals-config-shell` (matches `--originals-config-width`). */
const ORIGINALS_CONFIG_WIDTH = 280;

export function OriginalsConfigWidthDecorator(Story: () => ReactNode) {
  return (
    <div
      className="bg-ds-gray-900 rounded-ds-md p-ds-4 max-w-full"
      style={{ width: ORIGINALS_CONFIG_WIDTH }}
    >
      <Story />
    </div>
  );
}
