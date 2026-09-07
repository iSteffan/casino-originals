import '../src/storybook.css';

import type { ComponentType } from 'react';

import type { IntlError } from 'next-intl';
import { IntlErrorCode, NextIntlClientProvider } from 'next-intl';

import addonDocs from '@storybook/addon-docs';
import { definePreview } from '@storybook/nextjs-vite';
import { themes } from 'storybook/theming';
import pseudoStates from 'storybook-addon-pseudo-states';

function onIntlError(error: IntlError) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) return;
  console.error(error);
}

function getMessageFallback({ key }: { key: string }) {
  return key;
}

function withNextIntl(Story: ComponentType) {
  return (
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={{}}
      onError={onIntlError}
      getMessageFallback={getMessageFallback}
    >
      <Story />
    </NextIntlClientProvider>
  );
}

export default definePreview({
  addons: [addonDocs(), pseudoStates()],
  decorators: [withNextIntl],
  initialGlobals: {
    backgrounds: { value: 'dark' },
  },
  parameters: {
    options: {
      storySort: {
        order: ['Intro', 'Primitives', 'Features'],
      },
    },
    docs: {
      theme: themes.dark,
    },
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#121418' },
        light: { name: 'Light', value: '#ffffff' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
});
