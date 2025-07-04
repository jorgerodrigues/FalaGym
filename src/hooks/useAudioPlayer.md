# useAudioPlayer Hook

A React hook for managing audio playback with play/pause/stop functionality and loading states.

## Features

- ✅ Play/pause/stop audio controls
- ✅ Loading state management
- ✅ Automatic cleanup on component unmount
- ✅ Error handling with callbacks
- ✅ TypeScript support
- ✅ Event callbacks for play, pause, end, and error events

## Usage

### Basic Usage

```tsx
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

function AudioComponent() {
  const audioUrl = 'https://example.com/audio.mp3';
  const { isPlaying, togglePlayPause, stop, isLoading } = useAudioPlayer(audioUrl);

  return (
    <div>
      <button onClick={togglePlayPause} disabled={isLoading}>
        {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### With Event Callbacks

```tsx
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

function AudioComponent() {
  const audioUrl = 'https://example.com/audio.mp3';
  
  const audioPlayer = useAudioPlayer(audioUrl, {
    onPlay: () => console.log('Audio started playing'),
    onPause: () => console.log('Audio paused'),
    onEnded: () => console.log('Audio playback ended'),
    onError: (error) => console.error('Audio error:', error),
  });

  return (
    <div>
      <p>Status: {audioPlayer.isPlaying ? 'Playing' : 'Stopped'}</p>
      {audioPlayer.isLoading && <p>Loading...</p>}
      
      <button onClick={audioPlayer.togglePlayPause}>
        {audioPlayer.isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={audioPlayer.play}>Play</button>
      <button onClick={audioPlayer.stop}>Stop</button>
    </div>
  );
}
```

## API

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `audioUrl` | `string \| undefined` | - | URL of the audio file to play |
| `options` | `UseAudioPlayerOptions` | `{}` | Optional configuration object |

### Options

| Option | Type | Description |
|--------|------|-------------|
| `onPlay` | `() => void` | Callback when audio starts playing |
| `onPause` | `() => void` | Callback when audio is paused |
| `onEnded` | `() => void` | Callback when audio playback ends |
| `onError` | `(error: Error) => void` | Callback when an error occurs |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `isPlaying` | `boolean` | Whether audio is currently playing |
| `isLoading` | `boolean` | Whether audio is currently loading |
| `togglePlayPause` | `() => void` | Toggle between play and pause |
| `play` | `() => void` | Start playing audio |
| `stop` | `() => void` | Stop and cleanup audio |

## Behavior

- **Automatic Cleanup**: The hook automatically cleans up audio resources when the component unmounts or when the audio URL changes.
- **Single Instance**: Only one audio instance can play at a time. Starting a new audio will stop the previous one.
- **Error Handling**: Errors are logged to the console and trigger the `onError` callback if provided.
- **Loading States**: The hook provides loading states for better UX when audio is being loaded.

## Examples

### Audio Player with Visual Feedback

```tsx
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { PlayIcon, PauseIcon, LoadingSpinner } from '@/icons';

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const { isPlaying, togglePlayPause, isLoading } = useAudioPlayer(audioUrl);

  return (
    <button
      onClick={togglePlayPause}
      disabled={isLoading}
      className="p-2 rounded-full hover:bg-gray-100"
      aria-label={isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
    >
      {isLoading ? (
        <LoadingSpinner size={24} />
      ) : isPlaying ? (
        <PauseIcon size={24} />
      ) : (
        <PlayIcon size={24} />
      )}
    </button>
  );
}
```

### Audio Player with Progress Tracking

```tsx
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

function AudioPlayerWithProgress({ audioUrl }: { audioUrl: string }) {
  const [playCount, setPlayCount] = useState(0);
  
  const audioPlayer = useAudioPlayer(audioUrl, {
    onPlay: () => console.log('Started playing'),
    onEnded: () => {
      setPlayCount(prev => prev + 1);
      console.log('Playback ended');
    },
    onError: (error) => console.error('Playback failed:', error),
  });

  return (
    <div>
      <p>Play count: {playCount}</p>
      <button onClick={audioPlayer.togglePlayPause}>
        {audioPlayer.isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

## Migration from Manual Audio Implementation

If you're migrating from a manual audio implementation, here's how to convert:

### Before (Manual Implementation)
```tsx
const [isPlaying, setIsPlaying] = useState(false);
const audioRef = useRef<HTMLAudioElement | null>(null);

const handlePlay = () => {
  if (audioRef.current) {
    audioRef.current.pause();
  }
  
  const audio = new Audio(audioUrl);
  audioRef.current = audio;
  
  audio.addEventListener('ended', () => setIsPlaying(false));
  audio.addEventListener('error', () => setIsPlaying(false));
  
  audio.play()
    .then(() => setIsPlaying(true))
    .catch(error => console.error('Error:', error));
};

useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, []);
```

### After (Using useAudioPlayer)
```tsx
const { isPlaying, play } = useAudioPlayer(audioUrl, {
  onError: (error) => console.error('Error:', error),
});
```

## Notes

- The hook uses the Web Audio API and requires a user gesture to start playback (browser security requirement).
- Audio files should be accessible via CORS if loaded from a different domain.
- The hook is optimized for single audio playback scenarios.