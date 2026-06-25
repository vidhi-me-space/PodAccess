import { Link } from 'react-router-dom';
import { Headphones, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ThemePicker from './ThemePicker';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-surface-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] shadow-lg shadow-[var(--brand-500)]/30 transition-transform group-hover:scale-105">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Pod<span className="text-[var(--brand-500)] dark:text-[var(--brand-400)]">Access</span>
            </span>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Podcast Accessibility Platform
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--brand-500)]/30 bg-[var(--brand-500)]/10 px-3 py-1 text-xs font-medium text-[var(--brand-600)] dark:text-[var(--brand-400)] sm:flex">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </span>
          <ThemePicker />
          <ThemeToggle />
          <Link
            to="/"
            className="btn-secondary text-sm"
          >
            New Podcast
          </Link>
        </div>
      </div>
    </nav>
  );
}
