import type { SideMenuGameListItem } from '#ui/layouts/side-menu/side-menu-game-list';

export const APP_SIDEBAR_GAMES: readonly SideMenuGameListItem[] = [
  {
    id: 'mines',
    label: 'Mines',
    href: '/games/mines',
    imageSrc: '/img/games/sidebar/mines.png',
  },
  {
    id: 'towers',
    label: 'Towers',
    href: '/games/towers',
    imageSrc: '/img/games/sidebar/towers.png',
  },
  {
    id: 'dice',
    label: 'Dice',
    href: '/games/dice',
    imageSrc: '/img/games/sidebar/dice.png',
  },
  {
    id: 'keno',
    label: 'Keno',
    href: '/games/keno',
    imageSrc: '/img/games/sidebar/keno.png',
  },
  {
    id: 'coinflip',
    label: 'Coin Flip',
    href: '/games/coinflip',
    imageSrc: '/img/games/sidebar/coinflip.png',
  },
] as const;

/** Maps a Storybook story id to the live app sidebar href. */
export function getAppSidebarActiveHref(storyId?: string): string | undefined {
  if (!storyId) return undefined;
  return APP_SIDEBAR_GAMES.find((game) => storyId.includes(`-${game.id}-`))?.href;
}

/** Maps the current Next.js pathname to a sidebar href. */
export function getAppSidebarHrefFromPathname(pathname?: string | null): string | undefined {
  if (!pathname) return undefined;
  return APP_SIDEBAR_GAMES.find((game) => pathname === game.href || pathname.startsWith(`${game.href}/`))
    ?.href;
}
