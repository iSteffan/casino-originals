import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Typography } from './typography';

const meta = {
  title: 'Primitives/Foundation/Typography',
  component: Typography,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-ds-4 p-ds-6 flex max-w-[28rem] flex-col">
      <Typography kind="white-16-700">You win!</Typography>
      <Typography kind="white-14-400" className="text-ds-gray-600">
        Multiplier
        <span className="text-ds-text-brand-primary ml-[5px]">x2.00</span>
      </Typography>
      <Typography kind="white-20-700">1,250.00</Typography>
      <Typography kind="secondary-14-500">Controlled config slot</Typography>
      <Typography kind="white-16-700" as="h1">
        Original game
      </Typography>
    </div>
  ),
};
