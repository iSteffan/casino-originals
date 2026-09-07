'use client';

import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GameWinModal } from './game-win-modal';

import { Button } from '#ui/primitives/actions/button/button';
import { Image } from '#ui/primitives/data-display/image/image';

const storyCurrencyIcon = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={32}
    height={32}
    wrapperClassName="size-8 rounded-ds-full"
    className="size-8 object-contain"
    showSkeleton={false}
  />
);

interface PlaygroundArgs {
  open: boolean;
  title: string;
  multiplierLabel: string;
  multiplier: string;
  formattedWinAmount: string;
  reducedMotion: boolean;
  contentClassName?: string;
}

function GameWinModalPlayground({
  open: openArg,
  title,
  multiplierLabel,
  multiplier,
  formattedWinAmount,
  reducedMotion,
  contentClassName,
}: PlaygroundArgs) {
  const [open, setOpen] = useState(openArg);

  useEffect(() => {
    setOpen(openArg);
  }, [openArg]);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-4">
      <div className="h-78 bg-ds-black rounded-ds-sm relative w-full overflow-hidden">
        <GameWinModal
          open={open}
          title={title}
          multiplierLabel={multiplierLabel}
          multiplier={multiplier}
          formattedWinAmount={formattedWinAmount}
          currencyIcon={storyCurrencyIcon}
          reducedMotion={reducedMotion}
          contentClassName={contentClassName}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={() => setOpen(true)}>
          Show win
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Hide win
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Shared/Game Win Modal',
  component: GameWinModalPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: [
        'open',
        'title',
        'multiplierLabel',
        'multiplier',
        'formattedWinAmount',
        'reducedMotion',
        'contentClassName',
      ],
    },
  },
  argTypes: {
    open: { control: { type: 'boolean' } },
    title: { control: { type: 'text' } },
    multiplierLabel: { control: { type: 'text' } },
    multiplier: { control: { type: 'text' } },
    formattedWinAmount: { control: { type: 'text' } },
    reducedMotion: { control: { type: 'boolean' } },
    contentClassName: { control: { type: 'text' } },
  },
} satisfies Meta<typeof GameWinModalPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

const playgroundDefaultArgs = {
  open: true,
  title: 'You win!',
  multiplierLabel: 'Multiplier',
  multiplier: 'x2.00',
  formattedWinAmount: '2,000.00',
  reducedMotion: false,
  contentClassName: '',
} satisfies PlaygroundArgs;

export const Playground: Story = {
  args: playgroundDefaultArgs,
};

export const Closed: Story = {
  args: {
    ...playgroundDefaultArgs,
    open: false,
  },
};

export const LargeAmount: Story = {
  args: {
    ...playgroundDefaultArgs,
    formattedWinAmount: '123,456,789.99',
  },
};

export const Narrow: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    ...playgroundDefaultArgs,
    formattedWinAmount: '123,456,789.99',
  },
};
