'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { cn } from '#ui/lib/cn';

interface SideMenuGameListItem {
  id: string;
  label: string;
  href: string;
  imageSrc: string;
}

interface SideMenuGameListProps {
  title: string;
  items: readonly SideMenuGameListItem[];
  activeHref?: string;
  /** When true, items navigate with Next.js Link. When false, they only toggle selection. */
  navigate?: boolean;
  className?: string;
}

function SideMenuGameList({
  title,
  items,
  activeHref,
  navigate = false,
  className,
}: SideMenuGameListProps) {
  const [selectedHref, setSelectedHref] = useState(activeHref);

  useEffect(() => {
    setSelectedHref(activeHref);
  }, [activeHref]);

  const currentHref = navigate ? activeHref : selectedHref;

  return (
    <div data-slot="side-menu-game-list" className={cn('ds-side-menu-game-list', className)}>
      <p className="ds-side-menu-game-list-title">{title}</p>
      <ul className="ds-side-menu-game-list-items">
        {items.map((item) => {
          const active = item.href === currentHref;
          const itemClassName = cn(
            'ds-side-menu-game-list-item focus-visible:ds-focus-ring-inset',
          );
          const content = (
            <>
              <span className="ds-side-menu-game-list-thumb" aria-hidden>
                <img
                  src={item.imageSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="ds-side-menu-game-list-image"
                  draggable={false}
                />
              </span>
              <span className="ds-side-menu-game-list-label">{item.label}</span>
            </>
          );

          return (
            <li key={item.id}>
              {navigate ? (
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  data-active={active || undefined}
                  className={itemClassName}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-pressed={active}
                  data-active={active || undefined}
                  className={itemClassName}
                  onClick={() => setSelectedHref(item.href)}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { SideMenuGameList };
export type { SideMenuGameListItem, SideMenuGameListProps };
