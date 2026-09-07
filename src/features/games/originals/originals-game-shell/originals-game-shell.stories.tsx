'use client';

import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OriginalsGameShell } from './originals-game-shell';

import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function OriginalsGameShellExample({ theatreMode = false }: { theatreMode?: boolean }) {
  const [isTheatreMode, setIsTheatreMode] = useState(theatreMode);
  const [volume, setVolume] = useState(0.75);

  useEffect(() => {
    setIsTheatreMode(theatreMode);
  }, [theatreMode]);

  return (
    <div
      className={cn(
        'bg-ds-black p-ds-4 md:p-ds-8 w-full',
        isTheatreMode ? 'h-dvh' : 'min-h-screen',
      )}
    >
      <OriginalsGameShell
        theatreMode={isTheatreMode}
        header={
          <GameHeader
            title="Original game"
            backHref="#"
            showVolumeControl
            volume={volume}
            onVolumeChange={setVolume}
            isTheatreMode={isTheatreMode}
            onTheatreToggle={() => setIsTheatreMode((value) => !value)}
          />
        }
        config={
          <div className="bg-ds-surface-secondary p-ds-4 rounded-ds-sm flex h-full min-h-72 items-center justify-center">
            <Typography kind="secondary-14-500">Controlled config slot</Typography>
          </div>
        }
        board={
          <div className="bg-ds-surface-tertiary p-ds-4 min-h-78 rounded-ds-sm flex flex-1 items-center justify-center lg:h-full">
            <Typography kind="secondary-14-500">Controlled board slot</Typography>
          </div>
        }
      />
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Originals Game Shell',
  component: OriginalsGameShellExample,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  args: {
    theatreMode: false,
  },
} satisfies Meta<typeof OriginalsGameShellExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TheatreMode: Story = {
  args: { theatreMode: true },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
