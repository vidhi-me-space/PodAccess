import { useState, useEffect } from 'react';
import { Palette, X } from 'lucide-react';

const THEMES = [
  { id: 'teal', name: 'Teal (Default)', color: '#14b8a6', hover: '#0d9488' },
  { id: 'blue', name: 'Ocean Blue', color: '#3b82f6', hover: '#2563eb' },
  { id: 'pink', name: 'Rose Pink', color: '#f43f5e', hover: '#e11d48' },
  { id: 'yellow', name: 'Golden Yellow', color: '#eab308', hover: '#ca8a04' },
  { id: 'purple', name: 'Deep Purple', color: '#8b5cf6', hover: '#7c3aed' },
  { id: 'orange', name: 'Bright Orange', color: '#f97316', hover: '#ea580c' },
];

export default function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('site-theme') || 'teal';
  });

  useEffect(() => {
    const theme = THEMES.find(t => t.id === activeTheme) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--brand-500', theme.color);
    root.style.setProperty('--brand-600', theme.hover);
    root.style.setProperty('--brand-400', theme.color + 'cc'); // Adding transparency

    // Convert hex to RGB for box-shadows
    const r = parseInt(theme.color.slice(1, 3), 16);
    const g = parseInt(theme.color.slice(3, 5), 16);
    const b = parseInt(theme.color.slice(5, 7), 16);
    root.style.setProperty('--brand-rgb', `${r}, ${g}, ${b}`);

    localStorage.setItem('site-theme', activeTheme);
  }, [activeTheme]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        title="Customize Theme"
      >
        <Palette className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-[100] w-48 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-fade-in dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pick a Color</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setActiveTheme(theme.id);
                  setIsOpen(false);
                }}
                className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                  activeTheme === theme.id ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                }`}
                style={{ backgroundColor: theme.color }}
                title={theme.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
