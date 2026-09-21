'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AppHeader } from './app-header';
import { AppLayoutProvider } from './app-layout-provider';

import { useWallet } from '#ui/features/wallet/wallet-provider';

function AppHeaderPlayground({
  showMenuTrigger,
}: {
  showMenuTrigger?: boolean;
}) {
  const wallet = useWallet();

  return (
    <AppHeader
      showMenuTrigger={showMenuTrigger}
      currentBalance={wallet.currentBalance}
      currentFormattedAmount={wallet.currentFormattedAmount}
      items={wallet.items}
      onSelectBalance={wallet.onSelectBalance}
      displayFiat={wallet.displayFiat}
      onDisplayFiatChange={wallet.onDisplayFiatChange}
    />
  );
}

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
      <AppLayoutProvider>
        <Story />
      </AppLayoutProvider>
    ),
  ],
  render: (args) => <AppHeaderPlayground {...args} />,
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { showMenuTrigger: true },
};
