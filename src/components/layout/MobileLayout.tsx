import React, { useState, useEffect } from 'react';
import BottomNavigation from './BottomNavigation';
import MiniPlayer from './MiniPlayer';
import { Moon, Sun } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, showNav = true }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') !== 'false';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  return (
    <div className={`min-h-screen max-w-md mx-auto relative overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Light mode background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-100 -z-10 dark:hidden" />

      {/* Dark mode background — deep navy like Image 2 */}
      <div
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{
          background: "linear-gradient(160deg, #0f0c29 0%, #1a1a4e 40%, #0f2027 100%)"
        }}
      />

      {/* Subtle glow blobs dark mode */}
      <div className="fixed top-0 right-0 w-80 h-80 rounded-full -z-10 pointer-events-none hidden dark:block"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />
      <div className="fixed bottom-1/3 left-0 w-64 h-64 rounded-full -z-10 pointer-events-none hidden dark:block"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)" }}
      />

      {/* Light mode blobs */}
      <div className="fixed top-0 right-0 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl -z-10 pointer-events-none dark:hidden" />
      <div className="fixed bottom-1/3 left-0 w-56 h-56 bg-sky-200/40 rounded-full blur-3xl -z-10 pointer-events-none dark:hidden" />

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 dark:bg-white/10 backdrop-blur-md border border-indigo-200 dark:border-white/10 shadow-sm hover:scale-105 transition-all"
        aria-label="Toggle dark mode"
      >
        {darkMode
          ? <Sun className="w-4 h-4 text-yellow-400" />
          : <Moon className="w-4 h-4 text-indigo-600" />
        }
      </button>

      {/* Content */}
      <main className={`relative z-10 ${showNav ? 'pb-[100px]' : ''}`}>
        {children}
      </main>

      {showNav && <MiniPlayer />}
      {showNav && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;
