import { useMemo, useState, useEffect, useRef } from 'react';
import { User, Type, Edit2, Check, X } from 'lucide-react';
import { updateSpeakers } from '../api/client';

function HighlightedText({ text, searchQuery }) {
  if (!searchQuery?.trim()) {
    return <span>{text}</span>;
  }

  const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-yellow-500/30 text-white rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function TranscriptTab({ podcast, searchQuery, currentTime, onSeek, onRefresh }) {
  const [fontSize, setFontSize] = useState(16); // Default 16px
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const activeSegmentRef = useRef(null);

  const segments = useMemo(() => {
    // If the active podcast data has segments, use them
    if (podcast.segments?.length > 0) return podcast.segments;

    // Otherwise fall back to a single block with the transcript text
    return [{
      speaker: 'Podcast Transcript',
      text: podcast.transcript || 'No transcript available.',
      start: 0,
      end: 9999
    }];
  }, [podcast]);

  // Find active segment based on current time
  const activeSegmentIdx = useMemo(() => {
    return segments.findIndex(s => currentTime >= s.start && currentTime < s.end);
  }, [segments, currentTime]);

  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeSegmentIdx]);

  const handleSpeakerEdit = (oldName) => {
    setEditingSpeaker(oldName);
    setNewSpeakerName(oldName);
  };

  const saveSpeakerName = async () => {
    if (!newSpeakerName.trim() || newSpeakerName === editingSpeaker) {
      setEditingSpeaker(null);
      return;
    }

    setIsUpdating(true);
    try {
      await updateSpeakers(podcast._id, editingSpeaker, newSpeakerName.trim());
      onRefresh(); // Trigger data reload in parent
      setEditingSpeaker(null);
    } catch (err) {
      console.error('Failed to update speaker:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-32">
      {/* Font Size Controls */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Type size={18} />
            <span className="text-xs font-medium uppercase tracking-wider">Text Size</span>
          </div>
          <input
            type="range"
            min="12"
            max="32"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="h-1.5 w-32 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--brand-500)]"
          />
          <span className="text-sm font-mono text-[var(--brand-500)] dark:text-[var(--brand-400)] w-8">{fontSize}px</span>
        </div>
      </div>

      {segments.map((segment, idx) => {
        const isActive = idx === activeSegmentIdx;
        return (
          <div
            key={idx}
            ref={isActive ? activeSegmentRef : null}
            onClick={() => onSeek(segment.start)}
            className={`flex gap-4 p-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'bg-[var(--brand-500)]/10 border-l-4 border-[var(--brand-500)] shadow-sm'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }`}
          >
            <div className="flex-shrink-0">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                isActive ? 'bg-[var(--brand-500)] border-[var(--brand-400)] text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[var(--brand-500)] dark:text-[var(--brand-400)]'
              }`}>
                <User className="h-5 w-5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {editingSpeaker === segment.speaker ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      className="text-sm font-bold bg-white dark:bg-slate-900 border border-[var(--brand-500)] rounded px-1 outline-none text-[var(--brand-600)] dark:text-[var(--brand-400)]"
                      value={newSpeakerName}
                      onChange={e => setNewSpeakerName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveSpeakerName()}
                    />
                    <button disabled={isUpdating} onClick={saveSpeakerName} className="text-green-500 hover:text-green-600">
                      <Check size={16} />
                    </button>
                    <button disabled={isUpdating} onClick={() => setEditingSpeaker(null)} className="text-red-500 hover:text-red-600">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/speaker">
                    <p className={`text-sm font-bold uppercase tracking-tight ${isActive ? 'text-[var(--brand-600)] dark:text-[var(--brand-300)]' : 'text-[var(--brand-500)] dark:text-[var(--brand-400)]'}`}>
                      {segment.speaker}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSpeakerEdit(segment.speaker); }}
                      className={`opacity-0 group-hover/speaker:opacity-100 transition-opacity ${isActive ? 'text-[var(--brand-600)] dark:text-[var(--brand-300)]' : 'text-slate-400 hover:text-[var(--brand-500)]'}`}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-mono text-slate-400">
                  {Math.floor(segment.start / 60)}:{(segment.start % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <p
                className={`leading-relaxed whitespace-pre-wrap ${isActive ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                <HighlightedText text={segment.text} searchQuery={searchQuery} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
