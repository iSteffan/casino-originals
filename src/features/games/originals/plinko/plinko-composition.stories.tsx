'use client';

import { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoOriginalsView } from './plinko-originals-view';
import { usePlinkoOriginalsController } from './use-plinko-originals-controller';
import { usePlinkoSession } from './use-plinko-session';

import type { OriginalsConfigMode } from '#ui/features/games/originals/originals-config/originals-config.types';
import { cn } from '#ui/lib/cn';

interface PlaygroundArgs {
  theatreMode: boolean;
  volume: number;
  reducedMotion: boolean;
  /** Initial session settings (read once on mount). */
  initialMode: OriginalsConfigMode;
  initialRisk: string;
  initialRows: number;
  initialTurboMode: boolean;
  initialRounds: string;
}

type UpdateArgs = (patch: Partial<PlaygroundArgs>) => void;

/**
 * React/session hooks live here. Storybook preview hooks (useArgs) stay in
 * PlinkoCompositionStory, same split as the roulette and blackjack compositions.
 * Game rules live in plinko-engine / use-plinko-session; the story only wires args.
 */
function PlinkoCompositionPlayground({
  args,
  updateArgs,
}: {
  args: PlaygroundArgs;
  updateArgs: UpdateArgs;
}) {
  const session = usePlinkoSession({
    initialMode: args.initialMode,
    initialRisk: args.initialRisk,
    initialRows: args.initialRows,
    initialTurboMode: args.initialTurboMode,
    initialRounds: args.initialRounds,
    initialVolume: args.volume,
    reducedMotion: args.reducedMotion,
  });
  const view = usePlinkoOriginalsController(session);
  const { setVolume } = session;

  // Volume drives sounds and the win-modal cue inside the session.
  useEffect(() => {
    setVolume(args.volume);
  }, [args.volume, setVolume]);

  // Header + theatre sync are args-driven (roulette composition parity) so the
  // controls panel and the header toggles never disagree.
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
      <PlinkoOriginalsView
        config={view.config}
        board={view.board}
        winOverlay={view.winOverlay}
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
function PlinkoCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  return <PlinkoCompositionPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Composition',
  render: PlinkoCompositionStory,
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
    initialRisk: { control: false },
    initialRows: { control: false },
    initialTurboMode: { control: false },
    initialRounds: { control: false },
  },
  args: {
    theatreMode: false,
    volume: 0.75,
    reducedMotion: false,
    initialMode: 'manual',
    initialRisk: 'medium',
    initialRows: 16,
    initialTurboMode: false,
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
    initialRisk: 'high',
    initialRows: 12,
    initialTurboMode: true,
    initialRounds: '20',
  },
};

export const ReducedMotion: Story = {
  args: { reducedMotion: true },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
