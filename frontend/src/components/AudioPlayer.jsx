import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';

export default function AudioPlayer({ src, currentTime, onTimeUpdate, onSeek }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  }, [onSeek]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    onTimeUpdate(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    onTimeUpdate(time);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-surface-950/90">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-pod-500 dark:bg-slate-800"
            />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-pod-500 dark:text-slate-400">
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-pod-500 text-white shadow-lg shadow-pod-500/30 hover:bg-pod-400 transition-all"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              <button className="text-slate-500 hover:text-pod-500 dark:text-slate-400">
                <SkipForward size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 size={20} className="text-slate-500 dark:text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  audioRef.current.volume = v;
                }}
                className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-pod-500 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
