'use client';

import type { ReactNode } from 'react';

import { GamesVolume } from '#ui/features/games/shared/game-player/games-volume/games-volume';
import { TheatreButton } from '#ui/features/games/shared/game-player/theatre-button/theatre-button';
import { formControlFocusRing, transitionColors } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Typography } from '#ui/primitives/foundation/typography/typography';
import { Link } from '#ui/primitives/navigation/link/link';

type GameHeaderProps = {
  title: string;
  subtitle?: string;
  headingAs?: 'h1' | 'h2';
  backHref?: string;
  onBackClick?: () => void;
  backLabel?: string;
  modeControl?: ReactNode;
  showVolumeControl?: boolean;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  isFavorite?: boolean;
  favoritePending?: boolean;
  onFavoriteClick?: () => void;
  favoriteLabel?: string;
  isTheatreMode?: boolean;
  onTheatreToggle?: () => void;
  theatreLabel?: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  fullscreenLabel?: string;
  fullscreenDisabled?: boolean;
  onFairnessClick?: () => void;
  fairnessLabel?: string;
  className?: string;
};

function BackControl({
  backHref,
  backLabel,
  onBackClick,
}: Pick<GameHeaderProps, 'backHref' | 'backLabel' | 'onBackClick'>) {
  const icon = (
    <Icon
      name="chevron-left"
      size="lg"
      color="none"
      className={cn(
        'text-ds-gray-500 group-hover:text-ds-gray-300 group-focus-visible:text-ds-gray-300',
        transitionColors,
      )}
    />
  );
  const className = cn(
    'size-ds-6 rounded-ds-xs group flex shrink-0 items-center justify-center border-0 bg-transparent p-0 no-underline',
    formControlFocusRing,
  );

  if (backHref) {
    return (
      <Link href={backHref} aria-label={backLabel} className={className}>
        {icon}
      </Link>
    );
  }

  if (onBackClick) {
    return (
      <button
        type="button"
        aria-label={backLabel}
        onClick={onBackClick}
        className={cn(className, 'cursor-pointer')}
      >
        {icon}
      </button>
    );
  }

  return null;
}

export function GameHeader({
  title,
  subtitle,
  headingAs = 'h1',
  backHref,
  onBackClick,
  backLabel = 'Back',
  modeControl,
  showVolumeControl = false,
  volume = 0.75,
  onVolumeChange,
  isFavorite = false,
  favoritePending = false,
  onFavoriteClick,
  favoriteLabel = 'Favorite',
  isTheatreMode = false,
  onTheatreToggle,
  theatreLabel = 'Theatre mode',
  isFullscreen = false,
  onFullscreenToggle,
  fullscreenLabel = 'Full screen',
  fullscreenDisabled = false,
  onFairnessClick,
  fairnessLabel = 'Provably fair',
  className,
}: GameHeaderProps) {
  const hasPrimaryActions = Boolean(
    onFavoriteClick || onTheatreToggle || onFullscreenToggle,
  );
  const hasPersistentPrimaryActions = Boolean(onFavoriteClick || onFullscreenToggle);
  const hasSecondaryActions = Boolean(
    (showVolumeControl && onVolumeChange) || onFairnessClick,
  );
  const hasDesktopOnlyActions = Boolean(
    onTheatreToggle && !hasPersistentPrimaryActions && !hasSecondaryActions,
  );

  return (
    <div
      className={cn(
        'gap-ds-2 md:mb-ds-0 md:min-h-ds-14 mb-ds-4 flex flex-col items-center justify-between md:flex-row',
        className,
      )}
    >
      <div className="gap-ds-4 mr-auto flex w-full min-w-0 flex-1 items-center md:w-auto">
        <div className="gap-ds-1 flex min-w-0 flex-initial items-center">
          <BackControl
            backHref={backHref}
            backLabel={backLabel}
            onBackClick={onBackClick}
          />
          <div className="flex min-w-0 flex-col">
            <Typography kind="white-16-700" as={headingAs} className="truncate">
              {title}
            </Typography>
            {subtitle ? (
              <Typography kind="secondary-12-400" as="span" className="truncate">
                {subtitle}
              </Typography>
            ) : null}
          </div>
        </div>
        {modeControl}
      </div>

      {hasPrimaryActions || hasSecondaryActions ? (
        <div
          className={cn(
            'gap-ds-4 flex w-full md:w-fit md:justify-end',
            hasSecondaryActions && hasPersistentPrimaryActions
              ? 'justify-between'
              : 'justify-start md:justify-end',
            hasDesktopOnlyActions && 'hidden lg:flex',
          )}
        >
          {hasPrimaryActions ? (
            <div
              className={cn(
                'gap-ds-1 flex',
                !hasPersistentPrimaryActions && 'hidden lg:flex',
              )}
            >
              {onFavoriteClick ? (
                <Button
                  type="button"
                  variant="gray-muted"
                  size="md"
                  className="w-ds-8 px-ds-3 py-ds-2 md:w-fit"
                  left={
                    <Icon
                      name={isFavorite ? 'favorites' : 'favorites-outline'}
                      size="sm"
                      color="white"
                    />
                  }
                  loading={favoritePending}
                  loadingLabel={favoriteLabel}
                  onClick={onFavoriteClick}
                  aria-label={favoriteLabel}
                  aria-pressed={isFavorite}
                >
                  <span className="hidden md:block">
                    <Typography kind="secondary-14-400" as="span">
                      {favoriteLabel}
                    </Typography>
                  </span>
                </Button>
              ) : null}

              {onTheatreToggle ? (
                <TheatreButton
                  isTheatreMode={isTheatreMode}
                  onTheatreToggle={onTheatreToggle}
                  aria-label={theatreLabel}
                />
              ) : null}

              {onFullscreenToggle ? (
                <Button
                  type="button"
                  variant={isFullscreen ? 'white' : 'gray-muted'}
                  size="md"
                  iconOnly
                  disabled={fullscreenDisabled}
                  aria-label={fullscreenLabel}
                  aria-pressed={isFullscreen}
                  onClick={onFullscreenToggle}
                  className="w-ds-8"
                >
                  <Icon
                    name="fullscreen"
                    size="sm"
                    color="none"
                    className={
                      fullscreenDisabled
                        ? undefined
                        : isFullscreen
                          ? 'text-ds-black'
                          : 'text-ds-white'
                    }
                  />
                </Button>
              ) : null}
            </div>
          ) : null}

          {hasSecondaryActions ? (
            <div className="gap-ds-4 flex">
              {showVolumeControl && onVolumeChange && (
                <div className="order-3 md:order-2">
                  <GamesVolume volume={volume} onVolumeChange={onVolumeChange} />
                </div>
              )}

              {onFairnessClick ? (
                <Button
                  type="button"
                  variant="gray-muted"
                  size="md"
                  iconOnly
                  className="w-ds-8 order-2 md:order-3"
                  aria-label={fairnessLabel}
                  onClick={onFairnessClick}
                >
                  <Icon name="safe-cert" size="sm" color="white" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type { GameHeaderProps };
