import { cn } from '#ui/lib/cn';

interface AutobetSessionStatusStatProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export function AutobetSessionStatusStat({
  label,
  value,
  valueClassName,
}: AutobetSessionStatusStatProps) {
  return (
    <div className="gap-ds-0-5 flex min-w-0 flex-col">
      <span className="ds-autobet-session-status-stat-label">{label}</span>
      <span className={cn('ds-autobet-session-status-stat-value', valueClassName)}>
        {value}
      </span>
    </div>
  );
}
