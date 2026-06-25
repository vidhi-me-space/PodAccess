import { useCallback, useState } from 'react';
import { Upload, FileAudio, X } from 'lucide-react';

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/mp4'];
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.m4a'];

export default function FileUpload({ onFileSelect, selectedFile, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload an MP3, WAV, or M4A file');
      return false;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File size must be under 25MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleFile = useCallback(
    (file) => {
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const clearFile = () => {
    onFileSelect(null);
    setError('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className="relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300"
          style={{
            borderColor: isDragging ? 'var(--brand-500)' : undefined,
            backgroundColor: isDragging ? 'rgba(var(--brand-rgb), 0.1)' : undefined,
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
            cursor: disabled ? 'default' : 'pointer'
          }}
        >
          <input
            type="file"
            accept=".mp3,.wav,.m4a,audio/*"
            onChange={handleChange}
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Upload className="mx-auto mb-4 h-10 w-10 text-slate-400 transition-colors duration-300" style={{ color: isDragging ? 'var(--brand-500)' : undefined }} />
          <p className="mb-1 font-medium text-slate-700 dark:text-slate-200">
            Drop your audio file here or click to browse
          </p>
          <p className="text-sm text-slate-500">MP3, WAV, or M4A • Max 25MB</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 shadow-sm transition-all duration-300">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(var(--brand-rgb), 0.15)' }}
          >
            <FileAudio className="h-6 w-6" style={{ color: 'var(--brand-500)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-700 dark:text-slate-200">{selectedFile.name}</p>
            <p className="text-sm text-slate-500">{formatSize(selectedFile.size)}</p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            disabled={disabled}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
