'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { CoinflipSelectSide, type CoinflipSelectSideProps } from './coinflip-select-side';

import { coinflipStorySelectSideOptions } from '#ui/features/games/originals/coinflip/coinflip-story-helpers';
import { OriginalsConfigWidthDecorator } from '#ui/features/games/originals/originals-config-width-decorator';

function CoinflipSelectSidePlayground() {
  const [args, updateArgs] = useArgs<CoinflipSelectSideProps>();

  return (
    <CoinflipSelectSide
      value={args.value}
      onChange={(value) => updateArgs({ value })}
      options={args.options}
      labels={args.labels}
      disabled={args.disabled}
      className={args.className}
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Coinflip/Coinflip Select Side',
  component: CoinflipSelectSide,
  render: CoinflipSelectSidePlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['value', 'disabled'],
    },
  },
  decorators: [OriginalsConfigWidthDecorator],
  argTypes: {
    value: {
      control: { type: 'inline-radio' },
      options: ['HEADS', 'TAILS'],
    },
    disabled: { control: { type: 'boolean' } },
    onChange: { control: false },
    options: { control: false },
    labels: { control: false },
    className: { control: false },
  },
  args: {
    value: 'HEADS',
    onChange: () => undefined,
    options: coinflipStorySelectSideOptions,
    labels: { title: 'Select Side' },
    disabled: false,
  },
} satisfies Meta<typeof CoinflipSelectSide>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TailsSelected: Story = {
  args: {
    value: 'TAILS',
  },
};

export const Disabled: Story = {
  args: {
    value: 'HEADS',
    disabled: true,
  },
};

export const LongLocalizedLabels: Story = {
  globals: {
    viewport: { value: 'mobile1' },
  },
  args: {
    labels: { title: 'Select the side where the coin should land' },
    options: [
      { ...coinflipStorySelectSideOptions[0], label: 'Golden crown (heads)' },
      { ...coinflipStorySelectSideOptions[1], label: 'Purple shield (tails)' },
    ],
  },
};
