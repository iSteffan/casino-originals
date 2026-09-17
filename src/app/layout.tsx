import type { Metadata } from 'next';

import { AppChrome } from './app-chrome';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Casino Originals',
  description: 'Frontend-only originals games demo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body data-ds-motion-root="">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
