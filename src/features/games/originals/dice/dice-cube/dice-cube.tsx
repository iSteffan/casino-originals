import type { DiceCubeProps } from './dice-cube.types';
import {
  DICE_CUBE_ANIMATION_DURATION_MS,
  DICE_CUBE_MARKER_BOTTOM,
  DICE_CUBE_MARKER_STATES,
  getDiceCubeMarkerAnimationClass,
  getDiceCubeMarkerTransform,
  getDiceCubeShadowAnimationClass,
  getDiceMarkerIconSrc,
} from './dice-cube.utils';

import { cn } from '#ui/lib/cn';
import { Image } from '#ui/primitives/data-display/image/image';

export function DiceCube({
  markerValue,
  markerState = 'play',
  isAnimating = false,
  animationDirection = 'right',
  reducedMotion = false,
  markerClassName,
  shadowClassName,
}: DiceCubeProps) {
  const shouldAnimate = isAnimating && !reducedMotion;
  const markerAnimationClass = shouldAnimate
    ? getDiceCubeMarkerAnimationClass(animationDirection)
    : '';
  const shadowAnimationClass = shouldAnimate
    ? getDiceCubeShadowAnimationClass(animationDirection)
    : '';
  const travelAnimationClass = shouldAnimate ? 'dice-cube-travel-animate' : '';

  const travelStyle = {
    bottom: DICE_CUBE_MARKER_BOTTOM,
    transform: getDiceCubeMarkerTransform(markerValue),
    ['--dice-cube-animation-duration' as string]: `${DICE_CUBE_ANIMATION_DURATION_MS}ms`,
  } as const;

  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 z-10 h-[30px] w-full',
          travelAnimationClass,
          shadowClassName,
        )}
        style={travelStyle}
      >
        <div className="absolute left-0 top-0 h-[30px] w-[60px] -translate-x-1/2">
          <div className={cn('size-full', shadowAnimationClass)}>
            <Image
              src="/img/games/dice/dice-shadow.png"
              alt=""
              width={60}
              height={30}
              wrapperClassName="size-full"
              className="size-full object-contain"
              showSkeleton={false}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 z-30 h-12 w-full',
          travelAnimationClass,
          markerClassName,
        )}
        style={travelStyle}
      >
        <div className="absolute left-0 top-0 h-12 w-12 -translate-x-1/2">
          <div className={cn('relative size-full', markerAnimationClass)}>
            {DICE_CUBE_MARKER_STATES.map((state) => (
              <Image
                key={state}
                src={getDiceMarkerIconSrc(state)}
                alt=""
                width={48}
                height={48}
                wrapperClassName={cn(
                  'absolute inset-0 size-full',
                  markerState === state ? 'visible opacity-100' : 'invisible opacity-0',
                )}
                className="size-full object-contain"
                showSkeleton={false}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
