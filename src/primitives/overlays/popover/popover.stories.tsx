import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Popover, PopoverContent, PopoverTrigger } from './popover';

import { Button } from '#ui/primitives/actions/button/button';
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from '#ui/primitives/controls/slider/slider';
import { Icon } from '#ui/primitives/foundation/icon/icon';

const meta = {
  title: 'Primitives/Overlays/Popover',
  component: PopoverContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PopoverContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="bare"
          iconOnly
          size="md"
          aria-label="Game volume"
          className="size-ds-8 bg-ds-brand-white p-ds-1-5 rounded-ds-full min-w-0"
        >
          <Icon name="volume" size="lg" color="none" className="text-ds-gray-950" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Game volume"
        align="center"
        side="bottom"
        sideOffset={8}
        className="mx-ds-3 w-auto border-0 bg-transparent p-0 shadow-none outline-none"
      >
        <div className="bg-ds-gray-950 ring-ds-gray-700 h-ds-6 rounded-ds-xxl px-ds-2-5 py-ds-2 flex w-24 items-center ring-1">
          <SliderRoot min={0} max={100} step={1} defaultValue={[75]} className="w-full">
            <SliderTrack className="ds-slider-volume-track">
              <SliderRange className="ds-slider-volume-range" />
            </SliderTrack>
            <SliderThumb aria-label="Game volume" className="ds-slider-volume-thumb" />
          </SliderRoot>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
