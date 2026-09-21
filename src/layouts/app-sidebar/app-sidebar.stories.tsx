'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { AppSidebar } from './app-sidebar';
import { APP_SIDEBAR_GAMES } from './app-sidebar-games';

import { useWallet } from '#ui/features/wallet/wallet-provider';

function AppSidebarPlayground() {
  const wallet = useWallet();
  const [{ expanded, activeHref }, updateArgs] = useArgs<{
    expanded: boolean;
    activeHref?: string;
  }>();

  return (
    <AppSidebar
      activeHref={activeHref}
      expanded={expanded}
      onToggle={() => updateArgs({ expanded: !expanded })}
      balances={wallet.balances}
      setBalance={wallet.setBalance}
      className="ds-app-sidebar-story min-h-dvh"
    />
  );
}

const meta = {
  title: 'Layout/App Sidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  args: {
    activeHref: APP_SIDEBAR_GAMES[0]?.href,
    expanded: true,
  },
  argTypes: {
    expanded: { control: { type: 'boolean' } },
  },
  render: AppSidebarPlayground,
} satisfies Meta<typeof AppSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Collapsed: Story = {
  args: { expanded: false },
};
