export default function SummaryTab({ content, type = 'detailed' }) {
  if (!content) {
    return (
      <p className="text-slate-500 animate-fade-in dark:text-slate-400">No summary available.</p>
    );
  }

  // Handle both string and array formats for flexibility
  const displayContent = Array.isArray(content) ? content.join('\n\n') : content;

  if (type === 'short') {
    return (
      <div className="animate-fade-in">
        <div className="rounded-2xl border border-pod-500/20 bg-pod-500/5 p-6 dark:border-pod-500/30 dark:bg-pod-500/10">
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">{displayContent}</p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {displayContent.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      </div>
    );
  }

  // Support various paragraph splitters (\n\n, \n, or bullet points)
  // We first try to split by double newlines, then by single if the text is still a single block
  let paragraphs = displayContent
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 1 && displayContent.includes('\n')) {
    paragraphs = displayContent
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
