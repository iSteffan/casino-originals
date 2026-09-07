import type { ReactNode } from 'react';

import { OriginalsGameShell } from './originals-game-shell/originals-game-shell';

import { cn } from '#ui/lib/cn';

type OriginalsConfigStoryLayoutProps = {
  /** When true, game row uses viewport height so config can stretch (`theatreMode` on config). */
  theatreMode?: boolean;
  children: ReactNode;
};

function GameBoardStub({ theatreMode }: { theatreMode: boolean }) {
  return (
    <div
      className={cn(
        'bg-ds-gray-800 rounded-ds-md min-w-0 flex-1',
        'hidden lg:block',
        theatreMode ? 'lg:min-h-0' : 'min-h-[16rem]',
      )}
      aria-hidden
    />
  );
}

/**
 * Storybook layout for originals config.
 * Always shows the game board stub on desktop; theatre row height applies when `theatreMode` is on.
 */
export function OriginalsConfigStoryLayout({
  theatreMode = false,
  children,
}: OriginalsConfigStoryLayoutProps) {
  return (
    <div className="bg-ds-black flex min-h-screen items-start justify-center p-ds-8">
      <div
        className={cn(
          'min-h-0 w-full max-w-[900px]',
          theatreMode && 'lg:h-[calc(100vh-10rem)]',
        )}
      >
        <OriginalsGameShell
          config={children}
          board={<GameBoardStub theatreMode={theatreMode} />}
          theatreMode={theatreMode}
        />
      </div>
    </div>
  );
}
