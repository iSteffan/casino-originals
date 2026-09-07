import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Tabs, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Primitives/Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => (
    <div className="p-ds-6">
      <div className="w-[280px] max-w-full">
        <div className="ds-originals-config-shell h-auto lg:h-auto lg:!w-full lg:!max-w-full">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList
              color="brand"
              variant="filled"
              className="w-full"
              containerClassName="overflow-visible w-full border-transparent"
            >
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="auto">Auto</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList
              color="brand"
              variant="filled"
              className="w-full"
              containerClassName="overflow-visible w-full border-transparent"
            >
              <TabsTrigger value="manual" disabled>
                Manual
              </TabsTrigger>
              <TabsTrigger value="auto" disabled>
                Auto
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  ),
};
