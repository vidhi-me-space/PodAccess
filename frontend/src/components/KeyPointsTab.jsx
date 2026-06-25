import { CheckCircle2 } from 'lucide-react';

export default function KeyPointsTab({ keyPoints }) {
  if (!keyPoints?.length) {
    return <p className="text-slate-500 animate-fade-in">No key points available.</p>;
  }

  return (
    <ul className="space-y-4 animate-fade-in">
      {keyPoints.map((point, i) => (
        <li
          key={i}
          className="flex gap-4 rounded-xl border border-slate-800 bg-slate-800/30 p-4 transition-colors hover:border-slate-700"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-pod-500/20">
            <CheckCircle2 className="h-4 w-4 text-pod-400" />
          </div>
          <p className="leading-relaxed text-slate-300">{point}</p>
        </li>
      ))}
    </ul>
  );
}
