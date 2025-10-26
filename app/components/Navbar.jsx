'use client';
import { useState, useEffect } from 'react';
import { Menu, Search, Heart, Film, Bell } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import LeftDrawer from './LeftDrawer';
import SearchOverlay from './SearchOverlay';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // ✅ Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (!navigator.serviceWorker.controller) {
        navigator.serviceWorker.register('/sw.js')
          .then(() => console.log('Service worker registered'))
          .catch(() => console.warn('Service worker registration failed'));
      }
    }

    // ✅ Listen for install prompt
    function beforeInstallHandler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      toast.success('App is ready to install! 🎉');
    }

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    return () => window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast('Install prompt not available yet — open the menu again later or use your browser’s install option.', {
        icon: 'ℹ️',
      });
      return;
    }

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        toast.success('App installed successfully! 🎊');
      } else {
        toast('Installation dismissed.', { icon: '🛑' });
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install error:', err);
      toast.error('Something went wrong during installation.');
    }
  };

  return (
    <>
      <header className="fixed inset-x-2 top-3 z-40">
        <div className="mx-auto max-w-6xl px-2 sm:px-4">
          <div className="flex items-center justify-between p-3 rounded-2xl card-glass backdrop-blur-md">
            
            {/* Left Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-md hover:bg-white/10 transition"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="select-none">
                <div className="text-white font-semibold tracking-widest text-base sm:text-lg" style={{ letterSpacing: 3 }}>
                  WALLIFY
                </div>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-md hover:bg-white/10 transition"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <a href="/motion" className="p-2 rounded-md hover:bg-white/10 transition">
                <Film className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>

              <a href="/favorites" className="p-2 rounded-md hover:bg-white/10 transition">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>

              <button className="p-2 rounded-md hover:bg-white/10 transition">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <LeftDrawer
            onClose={() => setDrawerOpen(false)}
            installPrompt={deferredPrompt}
            onInstallClick={handleInstallClick}
          />
        )}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}