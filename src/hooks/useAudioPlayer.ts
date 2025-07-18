import { useRef, useState, useEffect, useCallback } from "react";

interface UseAudioPlayerOptions {
  /**
   * Callback function called when audio playback ends
   */
  onEnded?: () => void;
  /**
   * Callback function called when an error occurs during playback
   */
  onError?: (error: Error) => void;
  /**
   * Callback function called when audio starts playing
   */
  onPlay?: () => void;
  /**
   * Callback function called when audio is paused
   */
  onPause?: () => void;
}

interface UseAudioPlayerReturn {
  /**
   * Whether audio is currently playing
   */
  isPlaying: boolean;
  /**
   * Toggle between play and pause
   */
  togglePlayPause: () => void;
  /**
   * Start playing audio
   */
  play: () => void;
  /**
   * Stop and cleanup audio
   */
  stop: () => void;
  /**
   * Whether audio is currently loading
   */
  isLoading: boolean;
}

/**
 * Hook for managing audio playback with play/pause/stop functionality
 * @param audioUrl - URL of the audio file to play
 * @param options - Optional configuration object
 * @returns Object with audio control functions and state
 */
export const useAudioPlayer = (
  audioUrl?: string,
  options?: UseAudioPlayerOptions
): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { onEnded, onError, onPlay, onPause } = options || {};

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setIsLoading(false);
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const error = new Error("Audio playback failed");
    setIsPlaying(false);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("ended", handleEnded);
      audioRef.current.removeEventListener("error", handleError);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, [handleEnded, handleError]);

  const stop = useCallback(() => {
    cleanup();
    onPause?.();
  }, [cleanup, onPause]);

  const play = useCallback(() => {
    if (!audioUrl) {
      return;
    }

    // Clean up any existing audio
    cleanup();

    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Add event listeners
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      setIsLoading(true);

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          onPlay?.();
        })
        .catch((error) => {
          setIsPlaying(false);
          setIsLoading(false);
          onError?.(error);
        });
    } catch (error) {
      setIsPlaying(false);
      setIsLoading(false);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    }
  }, [audioUrl, onPlay, onError, cleanup, handleEnded, handleError]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, stop, play]);

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isPlaying,
    togglePlayPause,
    play,
    stop,
    isLoading,
  };
};
