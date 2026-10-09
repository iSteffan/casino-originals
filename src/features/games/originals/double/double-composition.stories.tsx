'use client';

import { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import type { DoubleBetType } from './double.types';
import { DoubleOriginalsView } from './double-originals-view';
import { useDoubleOriginalsController } from './use-double-originals-controller';
import { useDoubleSession } from './use-double-session';

import type { OriginalsConfigMode } from '#ui/features/games/originals/originals-config/originals-config.types';
import { cn } from '#ui/lib/cn';

interface PlaygroundArgs {
  theatreMode: boolean;
  volume: number;
  reducedMotion: boolean;
  /** Initial session settings (read once on mount). */
  initialMode: OriginalsConfigMode;
  initialBetTypes: DoubleBetType[];
  initialRounds: string;
}

type UpdateArgs = (patch: Partial<PlaygroundArgs>) => void;

/**
 * React/session hooks live here. Storybook preview hooks (useArgs) stay in
 * DoubleCompositionStory, same split as the plinko and roulette compositions.
 * The round loop and rules live in double-engine / use-double-session.
 */
function DoubleCompositionPlayground({
  args,
  updateArgs,
}: {
  args: PlaygroundArgs;
  updateArgs: UpdateArgs;
}) {
  const session = useDoubleSession({
    initialMode: args.initialMode,
    initialBetTypes: args.initialBetTypes,
    initialRounds: args.initialRounds,
    initialVolume: args.volume,
    reducedMotion: args.reducedMotion,
  });
  const view = useDoubleOriginalsController(session);
  const { setVolume } = session;

  // Volume drives the start/scroll/win sounds inside the session.
  useEffect(() => {
    setVolume(args.volume);
  }, [args.volume, setVolume]);

  const header = {
    ...view.header,
    volume: args.volume,
    isTheatreMode: args.theatreMode,
    onVolumeChange: (volume: number) => updateArgs({ volume }),
    onTheatreToggle: () => updateArgs({ theatreMode: !args.theatreMode }),
  };
  const theatreSync = {
    theatreMode: args.theatreMode,
    onExitTheatre: () => updateArgs({ theatreMode: false }),
  };

  return (
    <div
      className={cn(
        'bg-ds-black w-full',
        view.theatreLayoutActive ? 'h-dvh overflow-hidden' : 'min-h-screen',
      )}
    >
      <DoubleOriginalsView
        config={view.config}
        board={view.board}
        header={header}
        theatreMode={view.theatreMode}
        theatreModeActive={view.theatreModeActive}
        theatreLayoutActive={view.theatreLayoutActive}
        theatreSync={theatreSync}
      />
    </div>
  );
}

/** Storybook preview hooks only; no React/session hooks here. */
function DoubleCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  return <DoubleCompositionPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Double/Double Composition',
  render: DoubleCompositionStory,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['theatreMode', 'volume', 'reducedMotion'],
    },
  },
  argTypes: {
    theatreMode: { control: { type: 'boolean' } },
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    reducedMotion: { control: { type: 'boolean' } },
    initialMode: { control: false },
    initialBetTypes: { control: false },
    initialRounds: { control: false },
  },
  args: {
    theatreMode: false,
    volume: 0.75,
    reducedMotion: false,
    initialMode: 'manual',
    initialBetTypes: [],
    initialRounds: '10',
  } satisfies PlaygroundArgs,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TheatreMode: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: { theatreMode: true },
};

export const AutoMode: Story = {
  args: {
    initialMode: 'auto',
    initialBetTypes: ['RED', 'JOKER'],
    initialRounds: '20',
  },
};

export const ReducedMotion: Story = {
  args: { reducedMotion: true },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
