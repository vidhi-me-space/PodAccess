import { Loader2, Headphones, Wand2, Sparkles, FileSearch, CheckCircle2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-pod-500/20" />
        <Loader2 className={`${sizeClasses[size]} animate-spin text-pod-400`} />
      </div>
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}

export function ProcessingAnimation({ stage }) {
  const stages = [
    { label: 'Uploading audio...', icon: Headphones },
    { label: 'Transcribing with Whisper...', icon: Wand2 },
    { label: 'Generating summaries...', icon: Sparkles },
    { label: 'Almost done...', icon: FileSearch },
  ];

  const currentIdx = stages.findIndex(s => s.label === stage);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in py-10">
      <div className="relative">
        <div className="h-32 w-32 rounded-full border-4 border-pod-500/20 dark:border-pod-500/10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-pod-500" />
        </div>
        <svg className="absolute inset-0 h-32 w-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * (currentIdx + 1)) / stages.length}
            className="text-pod-500 transition-all duration-1000 ease-in-out"
          />
        </svg>
      </div>

      <div className="w-full max-w-md space-y-4">
        {stages.map((s, i) => {
          const isCompleted = i < currentIdx;
          const isActive = i === currentIdx;

          return (
            <div
              key={s.label}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-500 ${
                isActive
                  ? 'border-pod-500 bg-pod-500/5 shadow-lg shadow-pod-500/10 scale-105'
                  : isCompleted
                  ? 'border-green-500/20 bg-green-500/5 opacity-60'
                  : 'border-slate-200 dark:border-slate-800 opacity-30'
              }`}
            >
              <div className={`rounded-xl p-2 ${
                isActive ? 'bg-pod-500 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <s.icon size={20} className={isActive ? 'animate-pulse' : ''} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isActive ? 'text-pod-600 dark:text-pod-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {s.label}
                </p>
                {isActive && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-pod-500 animate-shimmer" style={{ width: '40%' }}></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SkeletonLoader({ lines = 5 }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="loading-shimmer h-4 rounded-lg"
          style={{ width: `${85 - i * 8}%` }}
        />
      ))}
    </div>
  );
}
