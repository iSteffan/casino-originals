'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DiceControls } from './dice-controls';
import {
  applyDiceDirectionToggle,
  applyDiceDisplayValueUpdate,
  applyDiceMultiplierUpdate,
  applyDiceWinChanceUpdate,
  DICE_DEFAULT_RTP,
  normalizeDiceRtp,
} from './dice-controls.story-math';
import type {
  DiceControlsActiveField,
  DiceControlsDirection,
} from './dice-controls.types';

import { diceStoryControlsLabels } from '#ui/features/games/originals/dice/dice-story-helpers';
import { OriginalsConfigWidthDecorator } from '#ui/features/games/originals/originals-config-width-decorator';

interface PlaygroundArgs {
  direction: DiceControlsDirection;
  displayValue: number;
  winChance: number;
  multiplier: number;
  activeField: DiceControlsActiveField;
  disabled: boolean;
  rtp: number;
}

function DiceControlsPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const rtpValue = normalizeDiceRtp(args.rtp);

  const applyLinked = (linked: {
    direction?: DiceControlsDirection;
    displayValue: number;
    winChance: number;
    multiplier: number;
  }) => {
    updateArgs({
      ...(linked.direction ? { direction: linked.direction } : {}),
      displayValue: linked.displayValue,
      winChance: linked.winChance,
      multiplier: linked.multiplier,
    });
  };

  return (
    <DiceControls
      direction={args.direction}
      onDirectionToggle={() =>
        applyLinked(applyDiceDirectionToggle(args.direction, args.displayValue, rtpValue))
      }
      displayValue={args.displayValue}
      winChance={args.winChance}
      multiplier={args.multiplier}
      onDisplayValueChange={(value) =>
        applyLinked(applyDiceDisplayValueUpdate(value, args.direction, rtpValue))
      }
      onWinChanceChange={(value) =>
        applyLinked(applyDiceWinChanceUpdate(value, args.direction, rtpValue))
      }
      onMultiplierChange={(value) =>
        applyLinked(applyDiceMultiplierUpdate(value, args.direction, rtpValue))
      }
      activeField={args.activeField}
      onActiveFieldChange={(activeField) => updateArgs({ activeField })}
      disabled={args.disabled}
      labels={diceStoryControlsLabels}
    />
  );
}

const initialLinked = applyDiceDisplayValueUpdate(50.25, 'UNDER', DICE_DEFAULT_RTP);

const meta = {
  title: 'Features/Games/Originals/Dice/Dice Controls',
  render: DiceControlsPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['direction', 'displayValue', 'disabled', 'rtp'],
    },
  },
  decorators: [OriginalsConfigWidthDecorator],
  argTypes: {
    direction: {
      control: { type: 'inline-radio' },
      options: ['UNDER', 'OVER'],
    },
    displayValue: { control: { type: 'number', min: 3, max: 97, step: 0.01 } },
    disabled: { control: { type: 'boolean' } },
    rtp: { control: { type: 'number', min: 90, max: 99, step: 0.1 } },
    winChance: { control: false },
    multiplier: { control: false },
    activeField: { control: false },
  },
  args: {
    direction: 'UNDER',
    displayValue: initialLinked.displayValue,
    winChance: initialLinked.winChance,
    multiplier: initialLinked.multiplier,
    activeField: null,
    disabled: false,
    rtp: DICE_DEFAULT_RTP,
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const RollOver: Story = {
  args: {
    direction: 'OVER',
    displayValue: applyDiceDisplayValueUpdate(62.5, 'OVER', DICE_DEFAULT_RTP)
      .displayValue,
    winChance: applyDiceDisplayValueUpdate(62.5, 'OVER', DICE_DEFAULT_RTP).winChance,
    multiplier: applyDiceDisplayValueUpdate(62.5, 'OVER', DICE_DEFAULT_RTP).multiplier,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
