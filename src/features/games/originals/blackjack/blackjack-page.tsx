'use client';

import { BlackjackProvider } from '#ui/features/games/originals/blackjack/blackjack-session-context';
import { BlackjackOriginalsView } from '#ui/features/games/originals/blackjack/blackjack-originals-view';
import { useBlackjackOriginalsController } from '#ui/features/games/originals/blackjack/use-blackjack-originals-controller';
import { useBlackjackSession } from '#ui/features/games/originals/blackjack/use-blackjack-session';

function BlackjackPageInner() {
  const session = useBlackjackSession();
  const view = useBlackjackOriginalsController(session);

  return (
    <BlackjackOriginalsView
      config={view.config}
      configExamples={view.configExamples}
      winOverlay={view.winOverlay}
      header={view.header}
      theatreMode={view.theatreMode}
      theatreModeActive={view.theatreModeActive}
      theatreLayoutActive={view.theatreLayoutActive}
      theatreSync={view.theatreSync}
    />
  );
}

export function BlackjackPage() {
  return (
    <BlackjackProvider>
      <BlackjackPageInner />
    </BlackjackProvider>
  );
}