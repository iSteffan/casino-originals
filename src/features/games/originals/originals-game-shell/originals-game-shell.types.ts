import type { ReactNode } from 'react';

export interface OriginalsGameShellProps {
  /** Page-level controls. The app may keep the header outside the shell when needed. */
  header?: ReactNode;
  /** Controlled game configuration rendered beside the board on desktop. */
  config: ReactNode;
  /** Controlled game board. Game rules and API state stay in the app controller. */
  board: ReactNode;
  /** Constrains the desktop body to the height provided by the parent layout. */
  theatreMode?: boolean;
  className?: string;
}
