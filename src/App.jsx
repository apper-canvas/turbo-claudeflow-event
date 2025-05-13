import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import ConvertedTextView from './pages/ConvertedTextView';
import NotFound from './pages/NotFound';
import getIcon from './utils/iconUtils';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const MoonIcon = getIcon('Moon');
  const SunIcon = getIcon('Sun');
  const WavesIcon = getIcon('Waves');
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-800 transition-colors duration-200">
      <header className="py-4 px-4 md:px-6 bg-white dark:bg-surface-900 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
              className="text-primary"
            >
              <WavesIcon size={28} />
            </motion.div>
            <h1 className="text-2xl font-bold text-primary dark:text-primary-light">ClaudeFlow</h1>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/view" element={<ConvertedTextView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="py-4 px-4 md:px-6 bg-white dark:bg-surface-900 shadow-inner">
        <div className="container mx-auto text-center text-sm text-surface-500">
          <p>© {new Date().getFullYear()} ClaudeFlow - Convert Claude's text with ease</p>
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
      />
    </div>
  );
}

export default App;