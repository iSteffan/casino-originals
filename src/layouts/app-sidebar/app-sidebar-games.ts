import type { SideMenuGameListItem } from '#ui/layouts/side-menu/side-menu-game-list';

export const APP_SIDEBAR_GAMES: readonly SideMenuGameListItem[] = [
  {
    id: 'mines',
    label: 'Mines',
    href: 'features-games-originals-mines-mines-composition--playground',
    imageSrc: '/img/games/sidebar/mines.png',
  },
  {
    id: 'towers',
    label: 'Towers',
    href: 'features-games-originals-towers-towers-composition--playground',
    imageSrc: '/img/games/sidebar/towers.png',
  },
  {
    id: 'dice',
    label: 'Dice',
    href: 'features-games-originals-dice-dice-composition--playground',
    imageSrc: '/img/games/sidebar/dice.png',
  },
  {
    id: 'keno',
    label: 'Keno',
    href: 'features-games-originals-keno-keno-composition--playground',
    imageSrc: '/img/games/sidebar/keno.png',
  },
  {
    id: 'coinflip',
    label: 'Coin Flip',
    href: 'features-games-originals-coinflip-coinflip-composition--playground',
    imageSrc: '/img/games/sidebar/coinflip.png',
  },
];

export function getAppSidebarActiveHref(storyId?: string): string | undefined {
  if (!storyId) return undefined;
  return APP_SIDEBAR_GAMES.find((game) => storyId.includes(`-${game.id}-`))?.href;
}
