import { Tag } from 'lucide-react';

export default function KeywordsTab({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <Tag className="mb-2 h-8 w-8 text-slate-400" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">No topics extracted yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-3">
        {keywords.map((keyword, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-full border border-pod-500/20 bg-pod-500/5 px-4 py-2 text-sm font-medium text-pod-700 transition-all hover:border-pod-500/40 hover:bg-pod-500/10 dark:text-pod-300"
          >
            <Tag size={14} className="text-pod-500" />
            {keyword}
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-500 dark:text-slate-400 italic">
        * Topics are automatically extracted by AI based on the podcast discussion.
      </p>
    </div>
  );
}
