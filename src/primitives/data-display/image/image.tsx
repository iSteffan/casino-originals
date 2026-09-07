'use client';

import type { ComponentPropsWithoutRef, ReactNode, Ref, SyntheticEvent } from 'react';
import { useCallback, useState } from 'react';

import NextImage, { getImageProps } from 'next/image';

import { cn } from '#ui/lib/cn';
import { Skeleton } from '#ui/primitives/feedback/skeleton/skeleton';

type ImagePhase = 'pending' | 'loaded' | 'error';
type ImageRenderMode = 'native' | 'next';
type ImageDimension = number | `${number}`;

type ImageDimensions =
  | { height?: never; width?: never }
  | { height: ImageDimension; width: ImageDimension };

type ImageElementProps = Omit<
  ComponentPropsWithoutRef<'img'>,
  'alt' | 'children' | 'height' | 'src' | 'width'
> & {
  alt: string;
  src: string;
};

interface ImageArtDirectionSource {
  media: string;
  src: string;
  sizes?: string;
}

type ImageProps = Omit<ImageElementProps, 'src'> &
  ImageDimensions & {
    /** Custom fallbacks own their accessible name and semantics. */
    fallback?: ReactNode;
    ref?: Ref<HTMLImageElement>;
    showSkeleton?: boolean;
    /** Art-direction overrides. The first matching media wins, so order them narrowest first. */
    sources?: ImageArtDirectionSource[];
    src?: string;
    unoptimized?: boolean;
    wrapperClassName?: string;
  };

const OPTIMIZABLE_IMAGE_HOSTS = new Set([
  'a.espncdn.com',
  'cdn.betstrike.com',
  'cdn.oddsjam.com',
  'cdn.opticodds.com',
]);

function normalizeImageSrc(src: string) {
  const normalizedSrc = src.trim();
  return normalizedSrc.startsWith('//') ? `https:${normalizedSrc}` : normalizedSrc;
}

function supportsNextImageOptimization(src: string) {
  try {
    const url = new URL(src, 'https://local.betstrike');

    if (url.pathname.toLowerCase().endsWith('.svg')) return false;
    if (src.startsWith('/')) return true;

    return (
      url.protocol === 'https:' &&
      (OPTIMIZABLE_IMAGE_HOSTS.has(url.hostname) ||
        /^cdn\.[^.]+\.betstrike\.com$/i.test(url.hostname))
    );
  } catch {
    return false;
  }
}

function resolveArtDirectionSource(source: ImageArtDirectionSource, sizes?: string) {
  const src = normalizeImageSrc(source.src);
  const resolvedSizes = source.sizes ?? sizes;
  if (!src) return undefined;

  if (!supportsNextImageOptimization(src)) {
    return { media: source.media, sizes: undefined, srcSet: src };
  }

  const { props } = getImageProps({
    alt: '',
    fill: true,
    sizes: resolvedSizes ?? '100vw',
    src,
  });

  // No candidate list when the optimizer is off (development, custom loaders):
  // a single-URL srcSet still art-directs correctly.
  if (!props.srcSet) {
    return { media: source.media, sizes: undefined, srcSet: props.src ?? src };
  }

  return { media: source.media, sizes: props.sizes, srcSet: props.srcSet };
}

function getAspectRatio(width?: ImageDimension, height?: ImageDimension) {
  if (width === undefined || height === undefined) return undefined;

  const numericWidth = Number(width);
  const numericHeight = Number(height);

  if (
    !Number.isFinite(numericWidth) ||
    !Number.isFinite(numericHeight) ||
    numericWidth <= 0 ||
    numericHeight <= 0
  ) {
    return undefined;
  }

  return `${numericWidth} / ${numericHeight}`;
}

function hasValidDimensions(width?: ImageDimension, height?: ImageDimension) {
  if (width === undefined && height === undefined) return true;
  if (width === undefined || height === undefined) return false;

  return [width, height].every((value) => {
    const numericValue = Number(value);
    return Number.isInteger(numericValue) && numericValue > 0;
  });
}

function hasConflictingFillStyle(style: ImageElementProps['style']) {
  return Boolean(
    (style?.position && style.position !== 'absolute') ||
    (style?.width && style.width !== '100%') ||
    (style?.height && style.height !== '100%'),
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

type DefaultFallbackProps = Pick<
  ImageElementProps,
  | 'alt'
  | 'aria-describedby'
  | 'aria-hidden'
  | 'aria-label'
  | 'aria-labelledby'
  | 'role'
  | 'title'
>;

function DefaultFallback({
  alt,
  'aria-describedby': ariaDescribedBy,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  role,
  title,
}: DefaultFallbackProps) {
  const isHidden = ariaHidden === true || ariaHidden === 'true';
  const isPresentational = role === 'none' || role === 'presentation';
  const omitsAccessibleName = isHidden || isPresentational;

  return (
    <div
      data-slot="image-fallback"
      role={
        isHidden
          ? undefined
          : (role ?? (alt || ariaLabel || ariaLabelledBy ? 'img' : undefined))
      }
      aria-describedby={omitsAccessibleName ? undefined : ariaDescribedBy}
      aria-hidden={ariaHidden}
      aria-label={
        omitsAccessibleName
          ? undefined
          : (ariaLabel ?? (!ariaLabelledBy && alt ? alt : undefined))
      }
      aria-labelledby={omitsAccessibleName ? undefined : ariaLabelledBy}
      title={title}
      className="bg-ds-surface-tertiary flex size-full items-center justify-center"
    >
      <svg
        aria-hidden
        viewBox="0 0 32 16"
        fill="currentColor"
        className="text-ds-brand-primary max-w-ds-16 h-auto w-2/5"
      >
        <path d="M8.37548 0.842962C8.27624 0.700343 8.37346 0.5 8.54191 0.5H31.794C31.9213 0.5 32.0181 0.61983 31.9971 0.751412L31.0362 6.77244C31.0196 6.87645 30.9337 6.95266 30.833 6.95266H12.7317C12.6659 6.95266 12.604 6.91971 12.5652 6.864L8.37548 0.842962Z" />
        <path d="M23.6245 15.157C23.7238 15.2997 23.6265 15.5 23.4581 15.5H0.206019C0.0786979 15.5 -0.018128 15.3802 0.00287227 15.2486L0.963824 9.22755C0.980424 9.12354 1.06633 9.04734 1.16697 9.04734H19.2683C19.3341 9.04734 19.396 9.08029 19.4348 9.136L23.6245 15.157Z" />
      </svg>
    </div>
  );
}

type ImageSourceProps = ImageElementProps &
  ImageDimensions & {
    fallback: ReactNode;
    mode: ImageRenderMode;
    ref?: Ref<HTMLImageElement>;
    showSkeleton: boolean;
    sources?: ImageArtDirectionSource[];
  };

function ImageSource({
  src,
  srcSet,
  alt,
  width,
  height,
  className,
  fallback,
  mode,
  ref,
  showSkeleton,
  sources,
  onLoad,
  onError,
  ...props
}: ImageSourceProps) {
  const [phase, setPhase] = useState<ImagePhase>('pending');
  const revealBeforeHydration =
    props.loading === 'eager' || props.fetchPriority === 'high';

  const measureRef = useCallback(
    (node: HTMLImageElement | null) => {
      assignRef(ref, node);
      if (!node?.complete) return;
      setPhase(node.naturalWidth > 0 ? 'loaded' : 'error');
    },
    [ref],
  );

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setPhase('loaded');
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setPhase('error');
    onError?.(event);
  };

  if (phase === 'error') return fallback;

  const commonProps = {
    ...props,
    alt,
    className: cn(
      'duration-ds-slow ease-ds-standard relative z-10 size-full object-cover transition-opacity motion-reduce:transition-none',
      className,
      phase !== 'loaded' && !revealBeforeHydration && 'opacity-0',
    ),
    decoding: props.decoding ?? 'async',
    onError: handleError,
    onLoad: handleLoad,
    ref: measureRef,
    src,
  };
  const imageElement =
    mode === 'native' ? (
      <img {...commonProps} alt={alt} width={width} height={height} srcSet={srcSet} />
    ) : width !== undefined && height !== undefined ? (
      <NextImage {...commonProps} width={width} height={height} />
    ) : (
      <NextImage {...commonProps} fill />
    );

  const artDirectionSources = (sources ?? []).flatMap((source) => {
    const resolved = resolveArtDirectionSource(source, props.sizes);
    return resolved?.srcSet ? [resolved] : [];
  });

  return (
    <>
      {showSkeleton && (
        <Skeleton
          aria-hidden
          className={cn(
            'rounded-ds-none duration-ds-slow ease-ds-standard pointer-events-none absolute inset-0 z-0 size-full animate-none opacity-100 transition-opacity motion-reduce:transition-none',
            phase === 'loaded' &&
              'opacity-0 delay-[var(--ds-duration-slow)] motion-reduce:delay-0',
          )}
        />
      )}
      {artDirectionSources.length > 0 ? (
        <picture>
          {artDirectionSources.map((source) => (
            <source
              key={source.media}
              media={source.media}
              sizes={source.sizes}
              srcSet={source.srcSet}
            />
          ))}
          {imageElement}
        </picture>
      ) : (
        imageElement
      )}
    </>
  );
}

export function Image({
  src,
  srcSet,
  alt,
  width,
  height,
  className,
  wrapperClassName,
  fallback,
  ref,
  showSkeleton = true,
  unoptimized = false,
  ...props
}: ImageProps) {
  const resolvedSrc = typeof src === 'string' ? normalizeImageSrc(src) : '';
  const dimensions: ImageDimensions =
    width === undefined || height === undefined ? {} : { height, width };
  const aspectRatio = getAspectRatio(width, height);
  const dimensionsAreValid = hasValidDimensions(width, height);
  const usesFill = width === undefined && height === undefined;
  const mode: ImageRenderMode =
    srcSet ||
    unoptimized ||
    (usesFill && hasConflictingFillStyle(props.style)) ||
    !supportsNextImageOptimization(resolvedSrc)
      ? 'native'
      : 'next';
  const requestKey = JSON.stringify([
    mode,
    resolvedSrc,
    srcSet,
    props.sizes,
    props.sources,
    width,
    height,
  ]);
  const fallbackContent = fallback ?? (
    <DefaultFallback
      alt={alt}
      aria-describedby={props['aria-describedby']}
      aria-hidden={props['aria-hidden']}
      aria-label={props['aria-label']}
      aria-labelledby={props['aria-labelledby']}
      role={props.role}
      title={props.title}
    />
  );

  return (
    <div
      data-slot="image"
      style={{ aspectRatio }}
      className={cn('relative block overflow-hidden', wrapperClassName)}
    >
      {resolvedSrc && dimensionsAreValid ? (
        <ImageSource
          key={requestKey}
          {...props}
          {...dimensions}
          src={resolvedSrc}
          srcSet={srcSet}
          alt={alt}
          className={className}
          fallback={fallbackContent}
          mode={mode}
          ref={ref}
          showSkeleton={showSkeleton}
        />
      ) : (
        fallbackContent
      )}
    </div>
  );
}

export type { ImageArtDirectionSource, ImageProps };
