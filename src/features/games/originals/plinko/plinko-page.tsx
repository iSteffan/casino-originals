'use client';

import { PlinkoOriginalsView } from '#ui/features/games/originals/plinko/plinko-originals-view';
import { usePlinkoOriginalsController } from '#ui/features/games/originals/plinko/use-plinko-originals-controller';
import { usePlinkoSession } from '#ui/features/games/originals/plinko/use-plinko-session';

export function PlinkoPage() {
  const session = usePlinkoSession();
  const view = usePlinkoOriginalsController(session);

  return (
    <PlinkoOriginalsView
      config={view.config}
      board={view.board}
      header={view.header}
      theatreMode={view.theatreMode}
      theatreModeActive={view.theatreModeActive}
      theatreLayoutActive={view.theatreLayoutActive}
      theatreSync={view.theatreSync}
    />
  );
}
