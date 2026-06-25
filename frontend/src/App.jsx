import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import { PodcastProvider } from './context/PodcastContext';

function App() {
  return (
    <PodcastProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard/:id" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </PodcastProvider>
  );
}

export default App;
