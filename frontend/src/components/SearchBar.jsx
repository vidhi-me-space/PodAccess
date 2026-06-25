import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch, onClear, isSearching }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search inside transcript..."
        className="input-field pl-11 pr-20"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="rounded-lg bg-pod-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-pod-500 disabled:opacity-50"
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
