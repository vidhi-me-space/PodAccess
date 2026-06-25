import { Link2 } from 'lucide-react';

export default function UrlInput({ value, onChange, disabled }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Link2 className="h-4 w-4 text-pod-400" />
        Podcast Audio URL
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://example.com/podcast-episode.mp3"
        className="input-field"
      />
      <p className="text-xs text-slate-500">
        Paste a direct link to an MP3, WAV, or M4A file, or a podcast page with an embedded audio player.
      </p>
    </div>
  );
}
