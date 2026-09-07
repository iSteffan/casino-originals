'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Image } from './image';

const meta = {
  title: 'Primitives/Data Display/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="gap-ds-3 p-ds-6 flex flex-col">
      <span className="text-ds-body-sm text-ds-text-secondary">win modal currency</span>
      <Image
        src="/icon/animate-icons/strike-coin.svg"
        alt=""
        width={32}
        height={32}
        wrapperClassName="size-8 rounded-ds-full"
        className="size-8 object-contain"
        showSkeleton={false}
      />
    </div>
  ),
};
