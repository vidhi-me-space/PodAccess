import { ArrowRight, Loader2 } from 'lucide-react';

export default function ProcessButton({ onClick, disabled, isProcessing, label = 'Process Podcast' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing}
      className="btn-primary mt-6 w-full"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
