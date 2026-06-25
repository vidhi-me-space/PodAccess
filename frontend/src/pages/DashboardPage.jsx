import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  AlignLeft,
  List,
  Lightbulb,
  Download,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Languages,
  Tag as TagIcon,
  Globe,
  X
} from 'lucide-react';
import { getPodcast, searchTranscript, translatePodcast, getPodcastPDFUrl } from '../api/client';
import { downloadTranscriptPDF } from '../utils/pdfExport';
import { usePodcasts } from '../context/PodcastContext';
import LoadingSpinner, { ProcessingAnimation } from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import TranscriptTab from '../components/TranscriptTab';
import SummaryTab from '../components/SummaryTab';
import KeyPointsTab from '../components/KeyPointsTab';
import AudioPlayer from '../components/AudioPlayer';
import KeywordsTab from '../components/KeywordsTab';
import PodcastTabBar from '../components/PodcastTabBar';

const TABS = [
  { id: 'transcript', label: 'Transcript', icon: FileText },
  { id: 'short', label: 'Short Summary', icon: AlignLeft },
  { id: 'detailed', label: 'Detailed Summary', icon: List },
  { id: 'keypoints', label: 'Key Points', icon: Lightbulb },
  { id: 'keywords', label: 'Topics', icon: TagIcon },
];

const LANGUAGES = [
  { code: 'Original', name: '🎵 Same as Audio' },
  { code: 'English', name: '🇺🇸 English' },
  { code: 'Hindi', name: '🇮🇳 Hindi' },
];

const POLL_INTERVAL = 3000;

export default function DashboardPage() {
  const { id } = useParams();
  const { openTab } = usePodcasts();
  const [podcast, setPodcast] = useState(null);
  const [activeTab, setActiveTab] = useState('transcript');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [selectedLang, setSelectedLang] = useState('Original');
  const [pendingLang, setPendingLang] = useState('Original');
  const [pdfOptions, setPdfOptions] = useState({
    transcript: true,
    shortSummary: true,
    detailedSummary: true,
    keyPoints: true,
    topics: true,
  });

  const fetchPodcast = useCallback(async () => {
    try {
      const data = await getPodcast(id);
      setPodcast(data);
      setError('');

      if (data.title) {
        openTab(id, data.title);
      }

      if (data.status === 'processing') {
        setProcessingStage((prev) => Math.min(prev + 1, 3));
      }

      // If the podcast was processed with a specific language,
      // and we haven't manually changed languages yet,
      // ensure the translation state is null (since original IS the language)
      // but we could also handle UI selection here if needed.

      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load podcast');
      return null;
    }
  }, [id]);

  useEffect(() => {
    let pollTimer;

    const init = async () => {
      setLoading(true);
      const data = await fetchPodcast();
      setLoading(false);

      if (data?.status === 'processing') {
        pollTimer = setInterval(async () => {
          const updated = await fetchPodcast();
          if (updated?.status !== 'processing') {
            clearInterval(pollTimer);
          }
        }, POLL_INTERVAL);
      }
    };

    init();

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [fetchPodcast]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const results = await searchTranscript(query, id);
      setSearchResults(results);
    } catch {
      setSearchResults(null);
    }
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleDownloadPDF = () => {
    if (podcast?.status === 'completed') {
      const pdfUrl = getPodcastPDFUrl(id, pdfOptions);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const defaultBaseUrl = apiUrl.includes('/api') ? apiUrl.split('/api')[0] : (apiUrl || 'http://localhost:5000');
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).replace('/api', '');

      let fullUrl = pdfUrl;
      if (!pdfUrl.startsWith('http')) {
        fullUrl = baseUrl + (pdfUrl.startsWith('/') ? '' : '/') + pdfUrl;
      }

      // Use a link element to trigger download - more reliable than window.open
      const link = document.createElement('a');
      link.href = fullUrl;
      link.target = '_blank';
      link.download = `${podcast.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowPdfDialog(false);
    }
  };

  const handleTranslate = async (lang) => {
    // If selecting Original/English, just revert to default data
    if (lang === 'Original' || lang === 'English') {
      setTranslation(null);
      setSelectedLang(lang);
      return;
    }

    setIsTranslating(true);
    setSelectedLang(lang);
    try {
      const result = await translatePodcast(id, lang);
      // Ensure result contains data before setting
      if (result && result.transcript) {
        // Carry over ALL fields from original podcast, then overwrite with translated ones
        const updatedTranslation = {
          ...podcast,
          ...result,
          language: lang
        };
        setTranslation(updatedTranslation);
        setActiveTab('transcript');
      }
    } catch (err) {
      console.error('Translation failed:', err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to translate. Please check your connection or try again.';
      alert(errorMsg);
    } finally {
      setIsTranslating(false);
    }
  };

  const activePodcast = translation || podcast;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingSpinner message="Loading dashboard..." size="lg" />
      </div>
    );
  }

  if (error && !podcast) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-xl font-semibold text-white">Error</h2>
        <p className="mb-6 text-slate-400">{error}</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  if (podcast?.status === 'processing') {
    const stages = [
      'Uploading audio...',
      'Transcribing with Whisper...',
      'Generating summaries...',
      'Almost done...',
    ];

    return (
      <div className="px-4 py-20">
        <ProcessingAnimation stage={stages[processingStage]} />
        <p className="mt-6 text-center text-sm text-slate-500">
          This may take a few minutes depending on audio length.
        </p>
      </div>
    );
  }

  if (podcast?.status === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-xl font-semibold text-white">Processing Failed</h2>
        <p className="mb-6 text-slate-400">{podcast.errorMessage || 'An error occurred'}</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Try Again
        </Link>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingSpinner message="Loading podcast data..." size="lg" />
      </div>
    );
  }

  return (
    <>
      <PodcastTabBar />
      <div className="px-4 py-8 sm:px-6 lg:px-8 pb-40">
        <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-pod-600 dark:text-slate-400 dark:hover:text-pod-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{podcast.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(podcast.uploadDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {/* Language Display & Change Option */}
                <div className="flex items-center gap-3 border-l border-slate-300 dark:border-slate-700 pl-4">
                  <Globe className="h-4 w-4 text-[var(--brand-500)]" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {selectedLang === 'Original' ? (podcast.initialLanguage || 'Original') : selectedLang}
                  </span>
                  <button
                    onClick={() => {
                      setPendingLang(selectedLang);
                      setShowLangDialog(true);
                    }}
                    className="text-xs font-bold text-[var(--brand-500)] hover:opacity-80 flex items-center gap-1 transition-all"
                  >
                    Change Language
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setShowPdfDialog(true)} className="btn-secondary self-start">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* PDF Export Dialog */}
        {showPdfDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-card w-full max-w-md p-6 shadow-2xl animate-slide-up">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="h-5 w-5 text-[var(--brand-500)]" />
                  Customize PDF Export
                </h3>
                <button onClick={() => setShowPdfDialog(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                Select the sections you want to include in your generated PDF document.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { id: 'transcript', label: 'Full Transcript', icon: FileText },
                  { id: 'shortSummary', label: 'Short Summary', icon: AlignLeft },
                  { id: 'detailedSummary', label: 'Detailed Summary', icon: List },
                  { id: 'keyPoints', label: 'Key Highlights', icon: Lightbulb },
                  { id: 'topics', label: 'Main Topics', icon: TagIcon },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${pdfOptions[opt.id] ? 'bg-[var(--brand-500)]/10 text-[var(--brand-500)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <opt.icon size={18} />
                      </div>
                      <span className={`font-medium transition-colors ${pdfOptions[opt.id] ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={pdfOptions[opt.id]}
                        onChange={() => setPdfOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id] }))}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--brand-500)]"></div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPdfDialog(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 btn-primary py-3 text-sm"
                >
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language Selection Dialog */}
        {showLangDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-card w-full max-w-sm p-6 shadow-2xl animate-slide-up">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Languages className="h-5 w-5 text-[var(--brand-500)]" />
                  Select Language
                </h3>
                <button onClick={() => setShowLangDialog(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setPendingLang(l.code);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl border p-4 transition-all ${
                      pendingLang === l.code
                        ? 'border-[var(--brand-500)] bg-[var(--brand-500)]/5 text-[var(--brand-600)] dark:text-[var(--brand-400)]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <span className="font-medium">{l.name}</span>
                    {pendingLang === l.code && (
                      <div className="h-2 w-2 rounded-full bg-[var(--brand-500)]" />
                    )}
                  </button>
                ))}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowLangDialog(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleTranslate(pendingLang);
                      setShowLangDialog(false);
                    }}
                    className="flex-1 btn-primary py-3 text-sm"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search (transcript tab only) */}
        {activeTab === 'transcript' && (
          <div className="mb-6 animate-slide-up">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isSearching={isSearching}
            />
            {searchResults && searchQuery && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Found {searchResults.results[0]?.matchCount || 0} matches for &quot;
                {searchQuery}&quot;
              </p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-4 text-sm font-medium transition-colors sm:px-6 ${
                  activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 relative">
            {isTranslating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] dark:bg-slate-900/60 rounded-b-xl animate-fade-in">
                <LoadingSpinner message={`Translating to ${selectedLang}...`} />
              </div>
            )}
            {activeTab === 'transcript' && (
              <TranscriptTab
                podcast={activePodcast}
                searchQuery={searchQuery}
                currentTime={currentTime}
                onSeek={(t) => {
                  setSeekTime(t);
                  setCurrentTime(t);
                }}
                onRefresh={fetchPodcast}
              />
            )}
            {activeTab === 'short' && (
              <SummaryTab content={activePodcast.shortSummary} type="short" />
            )}
            {activeTab === 'detailed' && (
              <SummaryTab content={activePodcast.detailedSummary} type="detailed" />
            )}
            {activeTab === 'keypoints' && (
              <KeyPointsTab keyPoints={activePodcast.keyPoints} />
            )}
            {activeTab === 'keywords' && (
              <KeywordsTab keywords={activePodcast.keywords} />
            )}
          </div>
        </div>
      </div>

            {/* Audio Player Component */}
            {podcast.audioUrl && (
              <AudioPlayer
                src={(() => {
                  const apiUrl = import.meta.env.VITE_API_URL || '';
                  const defaultBaseUrl = apiUrl.includes('/api') ? apiUrl.split('/api')[0] : (apiUrl || 'http://localhost:5000');
                  const baseUrl = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).replace('/api', '');
                  return baseUrl + (podcast.audioUrl.startsWith('/') ? '' : '/') + podcast.audioUrl;
                })()}
                currentTime={currentTime}
                onTimeUpdate={setCurrentTime}
                onSeek={seekTime}
              />
            )}
      </div>
    </>
  );
}
