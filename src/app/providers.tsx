'use client';

import { useState, type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlErrorCode, NextIntlClientProvider, type IntlError } from 'next-intl';

function onIntlError(error: IntlError) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) return;
  console.error(error);
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={{}}
      onError={onIntlError}
      getMessageFallback={({ key }) => key}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  );
}
