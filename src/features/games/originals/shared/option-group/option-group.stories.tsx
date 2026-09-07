import { type ReactNode, useEffect, useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OptionGroup } from './option-group';
import type { OptionGroupLayout, OptionGroupOption } from './option-group.types';

/** Inner content width inside `ds-originals-config-shell` (matches `--originals-config-width`). */
const ORIGINALS_CONFIG_WIDTH = 280;

const defaultOptionLabels = 'Classic Risk, Low Risk, Medium Risk, High Risk';

const disabledStoryOptions: OptionGroupOption[] = [
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' },
];

function parseOptionLabels(input: string): OptionGroupOption<string>[] {
  return input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((label, index) => ({
      value: String(index),
      label,
    }));
}

function OriginalsConfigWidthDecorator(Story: () => ReactNode) {
  return (
    <div
      className="bg-ds-gray-900 rounded-ds-md p-ds-4 max-w-full"
      style={{ width: ORIGINALS_CONFIG_WIDTH }}
    >
      <Story />
    </div>
  );
}

interface PlaygroundArgs {
  label: string;
  disabled: boolean;
  layout: OptionGroupLayout;
  optionLabels: string;
}

function OptionGroupPlayground({
  label,
  disabled,
  layout,
  optionLabels,
}: PlaygroundArgs) {
  const options = useMemo(() => parseOptionLabels(optionLabels), [optionLabels]);
  const [value, setValue] = useState('0');

  useEffect(() => {
    setValue((current) => {
      if (options.some((option) => option.value === current)) return current;
      return options[0]?.value ?? '0';
    });
  }, [options]);

  if (options.length === 0) {
    return (
      <p className="text-ds-body-md text-ds-text-secondary">
        Add comma-separated labels in controls to render options.
      </p>
    );
  }

  return (
    <OptionGroup
      label={label}
      value={value}
      onChange={setValue}
      options={options}
      disabled={disabled}
      layout={layout}
      columns={3}
      autoRowMax={4}
      truncateLabel
    />
  );
}

const meta = {
  title: 'Features/Games/Originals/Shared/Option Group',
  component: OptionGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    onChange: { control: false },
    options: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  decorators: [OriginalsConfigWidthDecorator],
} satisfies Meta<typeof OptionGroup>;

export default meta;

type Story = StoryObj<typeof OptionGroup>;

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: {
    controls: {
      include: ['label', 'disabled', 'layout', 'optionLabels'],
    },
  },
  argTypes: {
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    layout: {
      control: { type: 'select' },
      options: ['auto', 'row', 'column', 'grid'],
    },
    optionLabels: {
      control: { type: 'text' },
      description:
        'Comma-separated option labels. Add or remove entries to update the group.',
    },
  },
  args: {
    label: 'Risk',
    disabled: false,
    layout: 'auto',
    optionLabels: defaultOptionLabels,
  },
  render: (args) => <OptionGroupPlayground {...args} />,
};

export const Disabled: Story = {
  render: function DisabledStory() {
    const [value, setValue] = useState('medium');

    return (
      <OptionGroup
        label="Risk"
        value={value}
        onChange={setValue}
        options={disabledStoryOptions}
        layout="grid"
        columns={3}
        truncateLabel
        disabled
      />
    );
  },
};
