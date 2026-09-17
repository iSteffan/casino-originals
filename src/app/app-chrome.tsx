'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { AppHeaderShell } from '#ui/layouts/app-header/app-header-shell';
import { getAppSidebarHrefFromPathname } from '#ui/layouts/app-sidebar/app-sidebar-games';

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppHeaderShell activeGameHref={getAppSidebarHrefFromPathname(pathname)} navigate>
      {children}
    </AppHeaderShell>
  );
}
