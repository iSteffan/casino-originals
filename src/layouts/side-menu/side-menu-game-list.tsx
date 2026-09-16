'use client';

import { useEffect, useState } from 'react';

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
  className?: string;
}

function SideMenuGameList({
  title,
  items,
  activeHref,
  className,
}: SideMenuGameListProps) {
  const [selectedHref, setSelectedHref] = useState(activeHref);

  useEffect(() => {
    setSelectedHref(activeHref);
  }, [activeHref]);

  return (
    <div data-slot="side-menu-game-list" className={cn('ds-side-menu-game-list', className)}>
      <p className="ds-side-menu-game-list-title">{title}</p>
      <ul className="ds-side-menu-game-list-items">
        {items.map((item) => {
          const active = item.href === selectedHref;

          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={active}
                data-active={active || undefined}
                className="ds-side-menu-game-list-item focus-visible:ds-focus-ring-inset"
                onClick={() => setSelectedHref(item.href)}
              >
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
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { SideMenuGameList };
export type { SideMenuGameListItem, SideMenuGameListProps };
