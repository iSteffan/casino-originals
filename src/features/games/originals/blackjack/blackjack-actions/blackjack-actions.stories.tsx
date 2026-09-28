'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BlackjackActions } from './blackjack-actions';

const meta = {
  title: 'Features/Games/Originals/Blackjack/Blackjack Actions',
  component: BlackjackActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  args: {
    actions: [
      { id: 'hit', label: 'Hit', disabled: false, onClick: () => undefined },
      { id: 'stand', label: 'Stand', disabled: false, onClick: () => undefined },
      { id: 'double', label: 'Double', disabled: false, onClick: () => undefined },
      { id: 'split', label: 'Split', disabled: true, onClick: () => undefined },
    ],
  },
} satisfies Meta<typeof BlackjackActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllDisabled: Story = {
  args: {
    actions: [
      { id: 'hit', label: 'Hit', disabled: true, onClick: () => undefined },
      { id: 'stand', label: 'Stand', disabled: true, onClick: () => undefined },
      { id: 'double', label: 'Double', disabled: true, onClick: () => undefined },
      { id: 'split', label: 'Split', disabled: true, onClick: () => undefined },
    ],
  },
};

export const CanSplit: Story = {
  args: {
    actions: [
      { id: 'hit', label: 'Hit', disabled: false, onClick: () => undefined },
      { id: 'stand', label: 'Stand', disabled: false, onClick: () => undefined },
      { id: 'double', label: 'Double', disabled: false, onClick: () => undefined },
      { id: 'split', label: 'Split', disabled: false, onClick: () => undefined },
    ],
  },
};
