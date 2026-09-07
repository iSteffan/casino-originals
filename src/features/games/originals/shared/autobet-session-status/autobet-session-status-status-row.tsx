import type {
  AutobetSessionState,
  AutobetSessionStatusContent,
} from './autobet-session-status.types';
import { getStatusSeparatorClassName } from './autobet-session-status.utils';

import { cn } from '#ui/lib/cn';
import { Icon } from '#ui/primitives/foundation/icon/icon';

interface AutobetSessionStatusStatusRowProps {
  state: AutobetSessionState;
  content: AutobetSessionStatusContent;
}

function StatusIndicator({ indicator }: Pick<AutobetSessionStatusContent, 'indicator'>) {
  if (indicator === 'live-pulse') {
    return (
      <span
        aria-hidden
        className="ds-autobet-session-status-live-dot ds-autobet-session-status-live-dot-pulse"
      />
    );
  }

  if (indicator === 'ready-dot') {
    return <span aria-hidden className="ds-autobet-session-status-live-dot" />;
  }

  if (indicator === 'complete-check') {
    return <Icon name="check" size="sm" color="success" />;
  }

  return null;
}

export function AutobetSessionStatusStatusRow({
  state,
  content,
}: AutobetSessionStatusStatusRowProps) {
  const separatorClassName = getStatusSeparatorClassName(state);

  return (
    <div className="gap-ds-1-5 flex items-center justify-center">
      <StatusIndicator indicator={content.indicator} />
      <span
        className={cn('ds-autobet-session-status-status-title', content.titleClassName)}
      >
        {content.title}
      </span>
      {content.subtitle ? (
        <>
          <span
            className={cn(
              'ds-autobet-session-status-status-subtitle',
              separatorClassName,
            )}
          >
            ・
          </span>
          <span
            className={cn(
              'ds-autobet-session-status-status-subtitle',
              content.subtitleClassName,
            )}
          >
            {content.subtitle}
          </span>
        </>
      ) : null}
    </div>
  );
}
