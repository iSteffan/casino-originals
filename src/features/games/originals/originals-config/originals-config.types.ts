import type { CSSProperties, ReactNode } from 'react';

import type { AutobetSessionStatusProps } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';

type OriginalsConfigMode = 'manual' | 'auto';

/** Primary auto action appearance: start (brand), stop/retry (destructive). */
type OriginalsConfigAutoActionVariant = 'start' | 'stop' | 'retry';

type OriginalsConfigAutobetSessionProps = Omit<AutobetSessionStatusProps, 'className'>;

interface OriginalsConfigProps {
  mode: OriginalsConfigMode;
  onModeChange?: (mode: OriginalsConfigMode) => void;
  tabsDisabled?: boolean;
  manualTabLabel?: string;
  autoTabLabel?: string;
  children?: ReactNode;
  manualActionLabel?: string;
  autoActionLabel?: string;
  /** Defaults to `start`. Use `stop` / `retry` for destructive autobet actions. */
  autoActionVariant?: OriginalsConfigAutoActionVariant;
  onManualAction?: () => void;
  onAutoAction?: () => void;
  manualActionDisabled?: boolean;
  autoActionDisabled?: boolean;
  manualActionPending?: boolean;
  /** Optional animated secondary action above primary manual button (e.g. Towers random pick). */
  manualSecondaryActionLabel?: string;
  onManualSecondaryAction?: () => void;
  manualSecondaryActionVisible?: boolean;
  manualSecondaryActionDisabled?: boolean;
  /** Optional secondary action above primary auto button (e.g. Towers clear selection). */
  autoSecondaryActionLabel?: string;
  onAutoSecondaryAction?: () => void;
  autoSecondaryActionDisabled?: boolean;
  /** Optional autobet status block shown above auto action buttons. */
  autobetSession?: OriginalsConfigAutobetSessionProps;
  /** Optional content above action buttons in both manual and auto modes (e.g. Keno auto pick row). */
  actionPrefix?: ReactNode;
  /** Sidebar width in px on `lg+`. Defaults to `280`. Mobile uses full width. */
  width?: number;
  /**
   * Theatre layout: do not reserve inactive tab height in the action stack
   * (`reserveInactiveHeight={false}` on mode stack). Desktop height still comes
   * from the parent flex row (`height: 100%` on the shell).
   */
  theatreMode?: boolean;
  className?: string;
  style?: CSSProperties;
}

export type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigAutobetSessionProps,
  OriginalsConfigMode,
  OriginalsConfigProps,
};
