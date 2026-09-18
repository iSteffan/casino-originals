'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AppHeader } from './app-header';
import { AppHeaderProvider } from './app-header-provider';
import { AppLayoutProvider } from './app-layout-provider';

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
        <AppLayoutProvider>
          <Story />
        </AppLayoutProvider>
      </AppHeaderProvider>
    ),
  ],
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { showMenuTrigger: true },
};