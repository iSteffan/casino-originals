'use client';

import { useCallback } from 'react';

import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from '#ui/primitives/controls/slider/slider';
import type { IconName } from '#ui/primitives/foundation/icon/icon';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#ui/primitives/overlays/popover/popover';

type GamesVolumeProps = {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
  label?: string;
};

function getVolumeIconName(volume: number): IconName {
  if (volume === 0) return 'mute';
  if (volume < 0.5) return 'volume-low';
  return 'volume';
}

export function GamesVolume({
  volume,
  onVolumeChange,
  className,
  label = 'Game volume',
}: GamesVolumeProps) {
  const isOff = volume === 0;
  const iconName = getVolumeIconName(volume);

  const handleSliderChange = useCallback(
    ([nextValue]: number[]) => {
      onVolumeChange(nextValue / 100);
    },
    [onVolumeChange],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="bare"
          iconOnly
          size="md"
          aria-label={label}
          className={cn(
            'size-ds-8 bg-ds-brand-white p-ds-1-5 rounded-ds-full min-w-0 border-0 shadow-none',
            'hover:bg-ds-gray-300 data-[state=open]:bg-ds-gray-300',
            'data-[state=open]:ring-ds-purple-300 data-[state=open]:ring-offset-ds-gray-950 data-[state=open]:ring-1 data-[state=open]:ring-offset-1',
            isOff &&
              'bg-ds-gray-800 hover:bg-ds-gray-700 data-[state=open]:bg-ds-gray-700',
            className,
          )}
        >
          <Icon
            name={iconName}
            size="lg"
            color="none"
            className={cn(isOff ? 'text-ds-white' : 'text-ds-gray-950')}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        aria-label={label}
        align="center"
        side="bottom"
        sideOffset={8}
        className="mx-ds-3 w-auto border-0 bg-transparent p-0 shadow-none outline-none focus-visible:outline-none"
      >
        <div className="bg-ds-gray-950 ring-ds-gray-700 h-ds-6 rounded-ds-xxl px-ds-2-5 py-ds-2 flex w-24 items-center ring-1">
          <SliderRoot
            min={0}
            max={100}
            step={1}
            value={[Math.round(volume * 100)]}
            onValueChange={handleSliderChange}
            className="w-full"
          >
            <SliderTrack className="ds-slider-volume-track">
              <SliderRange className="ds-slider-volume-range" />
            </SliderTrack>
            <SliderThumb aria-label={label} className="ds-slider-volume-thumb" />
          </SliderRoot>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type { GamesVolumeProps };
