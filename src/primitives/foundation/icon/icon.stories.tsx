import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Icon } from './icon';

const meta = {
  title: 'Primitives/Foundation/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-x-ds-8 gap-y-ds-8 p-ds-6 grid grid-cols-2 sm:grid-cols-4">
      {(
        [
          ['volume', 'header volume'],
          ['wide', 'theatre'],
          ['fullscreen', 'fullscreen'],
          ['info', 'bet amount tooltip'],
          ['warning', 'threshold'],
          ['infinite', 'rounds'],
          ['check', 'autobet status'],
          ['chevron-left', 'back'],
        ] as const
      ).map(([name, label]) => (
        <div key={name} className="gap-ds-2 flex min-w-0 flex-col items-center">
          <Icon name={name} size="lg" color="white" />
          <span className="text-ds-body-sm text-ds-text-secondary text-center break-words">
            {label}
          </span>
        </div>
      ))}
    </div>
  ),
};
