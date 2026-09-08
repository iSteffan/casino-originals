'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import {
  type CoinflipAnimationSources,
  type CoinflipAnimationVideo,
  isCoinflipSameColorVideo,
} from './coinflip-coin.utils';

// A loaded round must not wait forever for a blocked decoder, network, or seek.
const PLAYBACK_STALL_TIMEOUT_MS = 15_000;

interface ResolvedCoinflipAnimation {
  videoSrc: CoinflipAnimationVideo;
  sourceKey: string;
  sources: CoinflipAnimationSources;
}

interface UseCoinflipCoinVideosOptions {
  animation: ResolvedCoinflipAnimation;
  isVideoPlaying: boolean;
  onVideoEnd: () => void;
  onPlaybackError: (error: Error) => void;
  onVideoDurationReady?: (duration: number) => void;
  reducedMotion?: boolean;
  turboMode?: boolean;
  volume?: number;
}

export function useCoinflipCoinVideos({
  animation,
  isVideoPlaying,
  onVideoEnd,
  onPlaybackError,
  onVideoDurationReady,
  reducedMotion = false,
  turboMode = false,
  volume = 1,
}: UseCoinflipCoinVideosOptions) {
  const videosBySourceKey = useRef<Map<string, HTMLVideoElement>>(new Map());
  const reducedMotionSettlementRef = useRef<string | null>(null);
  const [visibleAnimation, setVisibleAnimation] =
    useState<ResolvedCoinflipAnimation>(animation);
  const notifyVideoEnd = useEffectEvent(onVideoEnd);
  const notifyPlaybackError = useEffectEvent(onPlaybackError);
  const notifyVideoDurationReady = useEffectEvent((duration: number) => {
    onVideoDurationReady?.(duration);
  });

  const safeVolume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
  const playbackRate = turboMode ? 2.0 : 1.0;
  const {
    videoSrc,
    sourceKey,
    sources: { mp4, webm },
  } = animation;

  useEffect(() => {
    // Reapply settings when a new source mounts without restarting active playback.
    videosBySourceKey.current.forEach((video) => {
      video.volume = safeVolume;
      video.playbackRate = playbackRate;
    });
  }, [playbackRate, safeVolume, sourceKey]);

  useEffect(() => {
    const currentVideo = videosBySourceKey.current.get(sourceKey);
    if (!currentVideo) return;

    const listeners = new AbortController();
    let disposed = false;
    let playbackSettled = false;
    let playbackTimeout: number | undefined;
    let lastPlaybackTime = currentVideo.currentTime;
    const failedSources = new Set<HTMLSourceElement>();
    const selectedAnimation: ResolvedCoinflipAnimation = {
      videoSrc,
      sourceKey,
      sources: { mp4, webm },
    };

    // Disposal rejects stale async work; settlement deduplicates end and error events.
    const settlePlayback = (error?: Error) => {
      if (disposed || playbackSettled) return;

      playbackSettled = true;
      window.clearTimeout(playbackTimeout);
      listeners.abort();
      currentVideo.pause();

      if (error) {
        notifyPlaybackError(error);
        return;
      }

      notifyVideoEnd();
    };

    const handleMediaError = (event: Event) => {
      if (event.target instanceof HTMLSourceElement) {
        failedSources.add(event.target);
        if (failedSources.size < currentVideo.querySelectorAll('source').length) return;
      }

      const errorCode = currentVideo.error?.code;
      settlePlayback(
        new Error(
          errorCode
            ? `Coinflip animation failed to load (media error ${errorCode}).`
            : 'Coinflip animation failed to load.',
        ),
      );
    };

    const reportDuration = () => {
      if (disposed || !currentVideo.duration || !Number.isFinite(currentVideo.duration)) {
        return;
      }

      notifyVideoDurationReady(currentVideo.duration);
    };

    const showStaticFrame = () => {
      if (disposed) return;

      if (isCoinflipSameColorVideo(videoSrc)) {
        currentVideo.currentTime = 0;
      }

      currentVideo.pause();
      setVisibleAnimation(selectedAnimation);
    };

    currentVideo.addEventListener('error', handleMediaError, {
      capture: true,
      signal: listeners.signal,
    });

    if (isVideoPlaying) {
      const armPlaybackTimeout = () => {
        window.clearTimeout(playbackTimeout);
        playbackTimeout = window.setTimeout(() => {
          settlePlayback(new Error('Coinflip animation stopped making progress.'));
        }, PLAYBACK_STALL_TIMEOUT_MS);
      };

      armPlaybackTimeout();
      currentVideo.addEventListener(
        'timeupdate',
        () => {
          if (currentVideo.currentTime === lastPlaybackTime) return;
          lastPlaybackTime = currentVideo.currentTime;
          armPlaybackTimeout();
        },
        { signal: listeners.signal },
      );
    }

    if (isVideoPlaying && reducedMotion) {
      const settleOnFinalFrame = () => {
        if (disposed || reducedMotionSettlementRef.current === sourceKey) return;

        currentVideo.pause();
        setVisibleAnimation(selectedAnimation);
        reportDuration();
        reducedMotionSettlementRef.current = sourceKey;
        settlePlayback();
      };

      const showFinalFrame = () => {
        if (disposed || reducedMotionSettlementRef.current === sourceKey) return;

        try {
          currentVideo.pause();

          if (!Number.isFinite(currentVideo.duration) || currentVideo.duration <= 0) {
            settlePlayback(new Error('Coinflip final frame is unavailable.'));
            return;
          }

          const finalFrameTime = Math.max(0, currentVideo.duration - 1 / 60);
          const alreadyAtFinalFrame =
            Math.abs(currentVideo.currentTime - finalFrameTime) < 1 / 120;

          if (alreadyAtFinalFrame) {
            if (currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              settleOnFinalFrame();
            } else {
              currentVideo.addEventListener('loadeddata', settleOnFinalFrame, {
                once: true,
                signal: listeners.signal,
              });
            }
            return;
          }

          currentVideo.addEventListener('seeked', settleOnFinalFrame, {
            once: true,
            signal: listeners.signal,
          });
          currentVideo.currentTime = finalFrameTime;
        } catch (error: unknown) {
          settlePlayback(
            error instanceof Error
              ? error
              : new Error('Coinflip final frame could not be shown.'),
          );
        }
      };

      if (currentVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
        showFinalFrame();
      } else {
        currentVideo.addEventListener('loadedmetadata', showFinalFrame, {
          once: true,
          signal: listeners.signal,
        });
        currentVideo.load();
      }
    } else if (isVideoPlaying) {
      currentVideo.addEventListener('ended', () => settlePlayback(), {
        once: true,
        signal: listeners.signal,
      });

      if (currentVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
        currentVideo.currentTime = 0;
      }

      void currentVideo
        .play()
        .then(() => {
          if (disposed || playbackSettled) return;

          setVisibleAnimation(selectedAnimation);
          reportDuration();
        })
        .catch((error: unknown) => {
          settlePlayback(
            error instanceof Error
              ? error
              : new Error('Coinflip animation playback failed.'),
          );
        });
    } else {
      reducedMotionSettlementRef.current = null;

      if (currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        showStaticFrame();
      } else {
        currentVideo.addEventListener('loadeddata', showStaticFrame, {
          once: true,
          signal: listeners.signal,
        });

        if (currentVideo.readyState === HTMLMediaElement.HAVE_NOTHING) {
          currentVideo.load();
        }
      }
    }

    videosBySourceKey.current.forEach((video, mountedSourceKey) => {
      if (mountedSourceKey !== sourceKey) video.pause();
    });

    return () => {
      disposed = true;
      window.clearTimeout(playbackTimeout);
      listeners.abort();
      currentVideo.pause();
    };
  }, [isVideoPlaying, mp4, reducedMotion, sourceKey, videoSrc, webm]);

  function setVideoRef(sourceKey: string, element: HTMLVideoElement | null) {
    if (element) {
      element.volume = safeVolume;
      element.playbackRate = playbackRate;
      videosBySourceKey.current.set(sourceKey, element);
      return;
    }

    videosBySourceKey.current.delete(sourceKey);
  }

  return {
    setVideoRef,
    visibleAnimation,
  };
}
