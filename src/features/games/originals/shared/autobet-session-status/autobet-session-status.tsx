import type { AutobetSessionStatusProps } from './autobet-session-status.types';
import {
  getAutobetSessionStatusContent,
  getNetProfitValueClassName,
  resolveAutobetSessionStatusLabels,
} from './autobet-session-status.utils';
import { AutobetSessionStatusStat } from './autobet-session-status-stat';
import { AutobetSessionStatusStatusRow } from './autobet-session-status-status-row';

import { cn } from '#ui/lib/cn';

export function AutobetSessionStatus({
  state,
  totalWagered,
  netProfit,
  winRate,
  labels,
  className,
}: AutobetSessionStatusProps) {
  const resolvedLabels = resolveAutobetSessionStatusLabels(labels);
  const statusContent = getAutobetSessionStatusContent(state, resolvedLabels);
  const netProfitClassName = getNetProfitValueClassName(netProfit);

  return (
    <div role="status" className={cn('ds-autobet-session-status', className)}>
      <AutobetSessionStatusStatusRow state={state} content={statusContent} />

      <div className="gap-x-ds-2 gap-y-ds-2 grid min-w-0 grid-cols-3">
        <AutobetSessionStatusStat
          label={resolvedLabels.totalWagered}
          value={totalWagered}
        />
        <AutobetSessionStatusStat
          label={resolvedLabels.netProfit}
          value={netProfit}
          valueClassName={netProfitClassName}
        />
        <AutobetSessionStatusStat label={resolvedLabels.winRate} value={winRate} />
      </div>
    </div>
  );
}

export type { AutobetSessionStatusProps } from './autobet-session-status.types';
