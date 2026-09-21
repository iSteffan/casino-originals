import type { OriginalsGameShellProps } from './originals-game-shell.types';

import { cn } from '#ui/lib/cn';

/**
 * Shared presentational frame for Originals games.
 *
 * State, API calls and game rules belong to an app-side controller. That controller
 * feeds controlled config and board adapters into this shell, keeping both views in
 * sync without coupling the design-system package to a game engine.
 */
export function OriginalsGameShell({
  header,
  config,
  board,
  theatreMode = false,
  className,
}: OriginalsGameShellProps) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col',
        theatreMode && 'h-full min-h-0',
        className,
      )}
    >
      {header}

      <div
        data-slot="originals-game-body"
        className={cn(
          'bg-ds-black relative flex min-h-0 flex-col gap-4 max-lg:h-auto lg:flex-row lg:items-stretch lg:gap-2',
          theatreMode && 'h-full flex-1 overflow-hidden',
        )}
      >
        {/* DOM order matches visual order on all breakpoints (config, then board). */}
        <div
          data-slot="originals-game-config"
          className={cn(
            'w-full shrink-0 lg:w-fit',
            theatreMode && 'lg:h-full lg:min-h-0',
          )}
        >
          {config}
        </div>

        <div
          data-slot="originals-game-board"
          className={cn(
            'relative isolate flex w-full min-w-0 flex-col max-lg:overflow-visible lg:min-h-0 lg:flex-1 lg:overflow-hidden',
            theatreMode && 'lg:h-full',
          )}
        >
          {board}
        </div>
      </div>
    </div>
  );
}

export type { OriginalsGameShellProps } from './originals-game-shell.types';
