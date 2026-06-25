import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PodcastContext = createContext();

export function PodcastProvider({ children }) {
  const [openPodcasts, setOpenPodcasts] = useState(() => {
    const saved = localStorage.getItem('openPodcasts');
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('openPodcasts', JSON.stringify(openPodcasts));
  }, [openPodcasts]);

  const openTab = (id, title) => {
    setOpenPodcasts(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) return prev;
      return [...prev, { id, title }];
    });
    navigate(`/dashboard/${id}`);
  };

  const closeTab = (id, e) => {
    if (e) e.stopPropagation();

    setOpenPodcasts(prev => {
      const filtered = prev.filter(p => p.id !== id);

      // If we closed the active tab, navigate to the next one or home
      if (location.pathname === `/dashboard/${id}`) {
        if (filtered.length > 0) {
          navigate(`/dashboard/${filtered[filtered.length - 1].id}`);
        } else {
          navigate('/');
        }
      }
      return filtered;
    });
  };

  const switchTab = (id) => {
    navigate(`/dashboard/${id}`);
  };

  return (
    <PodcastContext.Provider value={{ openPodcasts, openTab, closeTab, switchTab }}>
      {children}
    </PodcastContext.Provider>
  );
}

export const usePodcasts = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcasts must be used within a PodcastProvider');
  }
  return context;
};
