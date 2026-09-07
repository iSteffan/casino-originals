'use client';

import type { CSSProperties, ReactNode } from 'react';

import type { OriginalsConfigMode, OriginalsConfigProps } from './originals-config.types';
import { OriginalsConfigModeStack } from './originals-config-mode-stack';

import { AutobetSessionStatus } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Tabs, TabsList, TabsTrigger } from '#ui/primitives/navigation/tabs/tabs';

interface ActionPanelProps {
  actionPrefix?: ReactNode;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  onSecondary?: () => void;
  /** When set, the secondary slides in/out; undefined renders it statically. */
  secondarySlideInVisible?: boolean;
  primaryLabel?: string;
  primaryDisabled?: boolean;
  primaryPending?: boolean;
  onPrimary?: () => void;
  primaryDestructive?: boolean;
}

function ActionPanel({
  actionPrefix,
  secondaryLabel,
  secondaryDisabled = false,
  onSecondary,
  secondarySlideInVisible,
  primaryLabel,
  primaryDisabled = false,
  primaryPending = false,
  onPrimary,
  primaryDestructive = false,
}: ActionPanelProps) {
  const secondaryButton = secondaryLabel ? (
    <Button
      type="button"
      variant="gray"
      size="md"
      className="rounded-ds-2xs h-ds-8 w-full"
      disabled={secondaryDisabled}
      onClick={onSecondary}
    >
      {secondaryLabel}
    </Button>
  ) : null;

  return (
    <div className="flex h-full min-w-0 flex-col justify-end">
      {actionPrefix ? <div className="mb-ds-2">{actionPrefix}</div> : null}
      {secondaryButton && secondarySlideInVisible !== undefined ? (
        <div
          inert={!secondarySlideInVisible}
          className={cn(
            'ds-originals-config-secondary-slide',
            secondarySlideInVisible && 'ds-originals-config-secondary-slide-open',
          )}
        >
          {secondaryButton}
        </div>
      ) : secondaryButton ? (
        <div className="mb-ds-2">{secondaryButton}</div>
      ) : null}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className={cn(
          'ds-originals-config-action rounded-ds-2xs',
          primaryDestructive && [
            'bg-ds-error-500 text-ds-text-black',
            'hover:bg-ds-error-500/90 hover:text-ds-text-black',
            'disabled:bg-ds-error-500 disabled:text-ds-text-black disabled:opacity-50',
          ],
          primaryPending &&
            (primaryDestructive
              ? 'bg-ds-error-500 text-ds-text-black pointer-events-none opacity-50'
              : [
                  'pointer-events-none',
                  'bg-ds-button-brand-primary-disabled-background',
                  'text-ds-button-brand-primary-disabled-text',
                ]),
        )}
        disabled={primaryDisabled}
        aria-disabled={primaryPending || undefined}
        aria-busy={primaryPending || undefined}
        onClick={primaryPending ? undefined : onPrimary}
      >
        {primaryLabel}
      </Button>
    </div>
  );
}

export function OriginalsConfig({
  mode,
  onModeChange,
  tabsDisabled = false,
  manualTabLabel = 'Manual',
  autoTabLabel = 'Auto',
  children,
  manualActionLabel = 'Place Bet',
  autoActionLabel = 'Start Autobet',
  autoActionVariant = 'start',
  onManualAction,
  onAutoAction,
  manualActionDisabled = false,
  autoActionDisabled = false,
  manualActionPending = false,
  manualSecondaryActionLabel,
  onManualSecondaryAction,
  manualSecondaryActionVisible = false,
  manualSecondaryActionDisabled = false,
  autoSecondaryActionLabel,
  onAutoSecondaryAction,
  autoSecondaryActionDisabled = false,
  autobetSession,
  actionPrefix,
  width = 280,
  theatreMode = false,
  className,
  style,
}: OriginalsConfigProps) {
  const autoActionIsDestructive =
    autoActionVariant === 'stop' || autoActionVariant === 'retry';
  const shellStyle = Object.assign({}, style, {
    '--originals-config-width': `${width}px`,
  }) as CSSProperties;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (mode === 'manual' && !manualActionDisabled && !manualActionPending) {
          onManualAction?.();
        }
      }}
      style={shellStyle}
      className={cn('ds-originals-config-shell', className)}
    >
      <div className="w-full shrink-0">
        <Tabs
          className="w-full"
          value={mode}
          onValueChange={(value) => onModeChange?.(value as OriginalsConfigMode)}
        >
          <TabsList
            color="brand"
            variant="filled"
            className="w-full"
            containerClassName="overflow-visible w-full border-transparent"
          >
            <TabsTrigger value="manual" disabled={tabsDisabled}>
              {manualTabLabel}
            </TabsTrigger>
            <TabsTrigger value="auto" disabled={tabsDisabled}>
              {autoTabLabel}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="gap-ds-3 flex w-full min-w-0 flex-1 flex-col max-lg:contents lg:min-h-0 lg:overflow-hidden">
        {children ? (
          <div className="no-scrollbar order-2 flex min-h-0 flex-col lg:order-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden">
            {children}
            {autobetSession ? (
              <OriginalsConfigModeStack
                mode={mode}
                reserveInactiveHeight={!theatreMode}
                className="mt-ds-3"
                manual={null}
                auto={
                  <AutobetSessionStatus
                    state={autobetSession.state}
                    totalWagered={autobetSession.totalWagered}
                    netProfit={autobetSession.netProfit}
                    winRate={autobetSession.winRate}
                    labels={autobetSession.labels}
                  />
                }
              />
            ) : null}
          </div>
        ) : (
          <div className="order-2 min-h-0 lg:order-1 lg:flex-1" aria-hidden />
        )}

        <div className="order-1 w-full shrink-0 lg:order-2 lg:mt-auto">
          <OriginalsConfigModeStack
            mode={mode}
            reserveInactiveHeight={!theatreMode}
            className="w-full"
            manual={
              <ActionPanel
                actionPrefix={actionPrefix}
                secondaryLabel={manualSecondaryActionLabel}
                secondarySlideInVisible={manualSecondaryActionVisible}
                secondaryDisabled={manualSecondaryActionDisabled}
                onSecondary={onManualSecondaryAction}
                primaryLabel={manualActionLabel}
                primaryDisabled={manualActionDisabled}
                primaryPending={manualActionPending}
                onPrimary={onManualAction}
              />
            }
            auto={
              <ActionPanel
                actionPrefix={actionPrefix}
                secondaryLabel={autoSecondaryActionLabel}
                secondaryDisabled={autoSecondaryActionDisabled}
                onSecondary={onAutoSecondaryAction}
                primaryLabel={autoActionLabel}
                primaryDisabled={autoActionDisabled}
                onPrimary={onAutoAction}
                primaryDestructive={autoActionIsDestructive}
              />
            }
          />
        </div>
      </div>
    </form>
  );
}

export type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigAutobetSessionProps,
  OriginalsConfigMode,
  OriginalsConfigProps,
} from './originals-config.types';
export { OriginalsConfigModeStack } from './originals-config-mode-stack';
