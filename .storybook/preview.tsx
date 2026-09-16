import '../src/storybook.css';

import type { ComponentType } from 'react';

import type { IntlError } from 'next-intl';
import { IntlErrorCode, NextIntlClientProvider } from 'next-intl';

import addonDocs from '@storybook/addon-docs';
import { definePreview } from '@storybook/nextjs-vite';
import { themes } from 'storybook/theming';
import pseudoStates from 'storybook-addon-pseudo-states';

import { AppHeaderShell } from '#ui/layouts/app-header/app-header-shell';
import { getAppSidebarActiveHref } from '#ui/layouts/app-sidebar/app-sidebar-games';

if (typeof document !== 'undefined') {
  document.body.setAttribute('data-ds-motion-root', '');
}

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

function withAppHeader(
  Story: ComponentType,
  context?: {
    viewMode?: string;
    id?: string;
    parameters?: { appHeader?: boolean };
  },
) {
  if (context?.viewMode === 'docs' || context?.parameters?.appHeader === false) {
    return <Story />;
  }

  return (
    <AppHeaderShell activeGameHref={getAppSidebarActiveHref(context?.id)}>
      <Story />
    </AppHeaderShell>
  );
}

export default definePreview({
  addons: [addonDocs(), pseudoStates()],
  decorators: [withNextIntl, withAppHeader],
  initialGlobals: {
    backgrounds: { value: 'dark' },
  },
  parameters: {
    options: {
      storySort: {
        order: ['Layout', 'Features', ['Games', ['Originals'], 'Cashier']],
      },
    },
    docs: {
      theme: themes.dark,
    },
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: 'var(--color-ds-surface-primary)' },
        light: { name: 'Light', value: 'var(--color-ds-white)' },
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
