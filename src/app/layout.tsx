import type { Metadata } from 'next';

import { Providers } from './providers';
import { AppHeaderShell } from '#ui/layouts/app-header/app-header-shell';
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
      <body>
        <Providers>
          <AppHeaderShell>{children}</AppHeaderShell>
        </Providers>
      </body>
    </html>
  );
}
