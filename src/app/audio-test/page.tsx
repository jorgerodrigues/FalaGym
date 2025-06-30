"use client";
import { useRef } from "react";

export default function AudioTest() {
  const audioRef = useRef<HTMLAudioElement>(null);
  return (
    <div>
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.play();
          }
        }}
      >
        Play
      </button>
      <audio
        ref={audioRef}
        src={
          "https://storage.googleapis.com/audio-sentences/sentence-0040d05f-0d71-4056-9fcc-fbe3ea6b9f6f.wav"
        }
      />
    </div>
  );
}
