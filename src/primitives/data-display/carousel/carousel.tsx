'use client';

import type { ComponentProps, KeyboardEvent } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { UseEmblaCarouselType } from 'embla-carousel-react';
import useEmblaCarousel from 'embla-carousel-react';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type CarouselOrientation = 'horizontal' | 'vertical';

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: CarouselOrientation;
  label?: string;
  setApi?: (api: CarouselApi) => void;
}

interface CarouselContextValue {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  opts?: CarouselOptions;
  orientation: CarouselOrientation;
  plugins?: CarouselPlugin;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

export function Carousel({
  orientation = 'horizontal',
  opts,
  plugins,
  label,
  setApi,
  className,
  children,
  ...props
}: ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!api) return;
      if (event.target !== event.currentTarget) return;

      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

      if (event.key === prevKey) {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === nextKey) {
        event.preventDefault();
        scrollNext();
      }
    },
    [api, orientation, scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api) return;

    setApi?.(api);
    updateScrollState(api);
    api.on('reInit', updateScrollState);
    api.on('select', updateScrollState);

    return () => {
      api.off('reInit', updateScrollState);
      api.off('select', updateScrollState);
    };
  }, [api, setApi, updateScrollState]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation,
        plugins,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn(
          'rounded-ds-xs relative max-w-full',
          formControlFocusRing,
          className,
        )}
        role="region"
        aria-label={label}
        tabIndex={0}
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

interface CarouselContentProps extends ComponentProps<'div'> {
  overflow?: 'hidden' | 'default';
  viewportClassName?: string;
}

export function CarouselContent({
  className,
  overflow = 'hidden',
  viewportClassName,
  ...props
}: CarouselContentProps) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className={cn(overflow !== 'default' && 'overflow-hidden', viewportClassName)}
      data-slot="carousel-content"
    >
      <div
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CarouselItem({ className, ...props }: ComponentProps<'div'>) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
}

interface CarouselControlProps extends ComponentProps<typeof Button> {
  label: string;
}

export function CarouselPrevious({ className, label, ...props }: CarouselControlProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant="gray"
      size="md"
      iconOnly
      className={cn(
        'rounded-ds-full absolute',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label={label}
      {...props}
    >
      <Icon name="chevron-left" />
    </Button>
  );
}

export function CarouselNext({ className, label, ...props }: CarouselControlProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant="gray"
      size="md"
      iconOnly
      className={cn(
        'rounded-ds-full absolute',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label={label}
      {...props}
    >
      <Icon name="chevron-right" />
    </Button>
  );
}

export type { CarouselApi, CarouselOptions, CarouselPlugin, CarouselProps };
