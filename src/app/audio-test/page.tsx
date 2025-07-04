"use client";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export default function AudioTest() {
  const audioUrl =
    "https://storage.googleapis.com/audio-sentences/sentence-0040d05f-0d71-4056-9fcc-fbe3ea6b9f6f.wav";

  const audioPlayer = useAudioPlayer(audioUrl, {
    onPlay: () => console.log("Audio started playing"),
    onPause: () => console.log("Audio paused"),
    onEnded: () => console.log("Audio ended"),
    onError: (error) => console.error("Audio error:", error),
  });

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Audio Player Test</h1>

      <div className="space-y-2">
        <p>Status: {audioPlayer.isPlaying ? "Playing" : "Stopped"}</p>
        {audioPlayer.isLoading && <p>Loading...</p>}
      </div>

      <div className="space-x-4">
        <button
          onClick={audioPlayer.togglePlayPause}
          disabled={audioPlayer.isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {audioPlayer.isLoading
            ? "Loading..."
            : audioPlayer.isPlaying
            ? "Pause"
            : "Play"}
        </button>

        <button
          onClick={audioPlayer.play}
          disabled={audioPlayer.isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Play
        </button>

        <button
          onClick={audioPlayer.stop}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
