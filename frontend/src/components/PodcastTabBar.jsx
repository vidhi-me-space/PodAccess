import { X, Mic, Plus } from 'lucide-react';
import { usePodcasts } from '../context/PodcastContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function PodcastTabBar() {
  const { openPodcasts, closeTab, switchTab } = usePodcasts();
  const { id: activeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="border-b border-slate-200 bg-white/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 sticky top-0 z-40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center gap-1 overflow-x-auto no-scrollbar pt-2 scroll-smooth">
          {openPodcasts.map((p) => {
            const isActive = p.id === activeId;
            return (
              <div
                key={p.id}
                onClick={() => switchTab(p.id)}
                className={`group flex min-w-[120px] max-w-[200px] cursor-pointer items-center justify-between gap-2 rounded-t-lg border-x border-t px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-slate-200 bg-white text-[var(--brand-600)] dark:border-slate-800 dark:bg-slate-900 dark:text-[var(--brand-400)]'
                    : 'border-transparent text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Mic className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-[var(--brand-500)]' : 'text-slate-400'}`} />
                  <span className="truncate">{p.title}</span>
                </div>
                <button
                  onClick={(e) => closeTab(p.id, e)}
                  className={`rounded-full p-0.5 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-t-lg border-transparent text-slate-400 hover:bg-slate-100 hover:text-[var(--brand-500)] dark:hover:bg-slate-800/50 transition-all ml-1"
            title="Open new podcast"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
