import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  FileText,
  Search,
  Download,
  Zap,
  AlertCircle,
  Globe,
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import UrlInput from '../components/UrlInput';
import ProcessButton from '../components/ProcessButton';
import { uploadAudio, processUrl } from '../api/client';
import { usePodcasts } from '../context/PodcastContext';

const FEATURES = [
  {
    icon: Mic,
    title: 'AI Transcription',
    description: 'Powered by OpenAI Whisper for accurate speech-to-text conversion.',
  },
  {
    icon: FileText,
    title: 'Smart Summaries',
    description: 'Get short, detailed summaries and key takeaways automatically.',
  },
  {
    icon: Search,
    title: 'Searchable Transcripts',
    description: 'Find any word or phrase with highlighted search results.',
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Download formatted transcripts with speaker labels.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { openTab } = usePodcasts();
  const [mode, setMode] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('Original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    setError('');
    setIsProcessing(true);

    try {
      let result;

      if (mode === 'upload') {
        if (!selectedFile) {
          setError('Please select an audio file to upload');
          setIsProcessing(false);
          return;
        }
        result = await uploadAudio(selectedFile, title || undefined, language);
      } else {
        if (!url.trim()) {
          setError('Please enter a podcast URL');
          setIsProcessing(false);
          return;
        }
        result = await processUrl(url.trim(), title || undefined, language);
      }

      openTab(result.podcastId, title || result.title || 'Untitled Podcast');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess =
    mode === 'upload' ? !!selectedFile : !!url.trim();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-pod-500/10 blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-pod-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pod-500/30 bg-pod-500/10 px-4 py-1.5 text-sm font-medium text-pod-600 dark:text-pod-300">
            <Zap className="h-4 w-4" />
            Making podcasts accessible for everyone
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Turn podcasts into{' '}
            <span className="bg-gradient-to-r from-[var(--brand-500)] to-[var(--brand-600)] bg-clip-text text-transparent dark:from-[var(--brand-400)] dark:to-[var(--brand-500)]">
              accessible content
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Upload audio or paste a URL. PodAccess transcribes, summarizes, and
            extracts key points — making every podcast readable and searchable.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="glass-card p-6 sm:p-8 animate-slide-up">
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  mode === 'upload'
                    ? 'bg-pod-600 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  mode === 'url'
                    ? 'bg-pod-600 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Paste URL
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isProcessing}
                  placeholder="My Podcast Episode"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Target Language
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isProcessing}
                    className="input-field pl-10 cursor-pointer"
                  >
                    <option value="Original">🎵 Same as Audio</option>
                    <option value="English">🇺🇸 English</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                  </select>
                </div>
              </div>
            </div>

            {mode === 'upload' ? (
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                disabled={isProcessing}
              />
            ) : (
              <UrlInput value={url} onChange={setUrl} disabled={isProcessing} />
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <ProcessButton
              onClick={handleProcess}
              disabled={!canProcess}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50/50 px-4 py-20 transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-900/30 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Everything you need for podcast accessibility
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pod-500/10 dark:bg-pod-500/20">
                  <feature.icon className="h-6 w-6 text-pod-600 dark:text-pod-400" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
