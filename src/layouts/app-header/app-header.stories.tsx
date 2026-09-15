'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AppHeader } from './app-header';
import { AppHeaderProvider } from './app-header-provider';

const meta = {
  title: 'Layout/App Header',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  decorators: [
    (Story) => (
      <AppHeaderProvider>
        <Story />
      </AppHeaderProvider>
    ),
  ],
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
