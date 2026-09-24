import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CoinflipPage } from '#ui/features/games/originals/coinflip/coinflip-page';
import { DicePage } from '#ui/features/games/originals/dice/dice-page';
import { KenoPage } from '#ui/features/games/originals/keno/keno-page';
import { MinesPage } from '#ui/features/games/originals/mines/mines-page';
import { APP_SIDEBAR_GAMES } from '#ui/layouts/app-sidebar/app-sidebar-games';

const GAME_PAGES = {
  coinflip: CoinflipPage,
  dice: DicePage,
  keno: KenoPage,
  mines: MinesPage,
} as const;

type GameSlug = (typeof APP_SIDEBAR_GAMES)[number]['id'];

function isGameSlug(value: string): value is GameSlug {
  return APP_SIDEBAR_GAMES.some((game) => game.id === value);
}

export function generateStaticParams() {
  return APP_SIDEBAR_GAMES.map((game) => ({ game: game.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  const item = APP_SIDEBAR_GAMES.find((entry) => entry.id === game);

  return {
    title: item ? `${item.label} | Casino Originals` : 'Casino Originals',
    description: item
      ? `Play ${item.label} вЂ” frontend originals demo`
      : 'Frontend-only originals games demo',
  };
}

export default async function GameRoutePage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;

  if (!isGameSlug(game)) notFound();

  const Page = GAME_PAGES[game as keyof typeof GAME_PAGES];
  if (!Page) {
    const item = APP_SIDEBAR_GAMES.find((entry) => entry.id === game);

    return (
      <main className="bg-ds-black text-ds-text-primary flex min-h-full flex-col items-center justify-center gap-3 p-8">
        <h1 className="text-ds-xl font-semibold">{item?.label ?? 'Game'}</h1>
        <p className="text-ds-text-secondary text-ds-sm">Coming soon.</p>
      </main>
    );
  }

  return <Page />;
}
