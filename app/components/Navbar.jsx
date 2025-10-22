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
      <header className="fixed inset-x-4 top-4 z-40">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between p-3 rounded-2xl card-glass">
            <div className="flex items-center gap-3">
              <button aria-label="menu" onClick={() => setDrawerOpen(true)} className="p-2 rounded-md hover:bg-white/3 transition"><Menu /></button>
              <div className="select-none">
                <div className="text-white font-semibold tracking-widest text-lg" style={{ letterSpacing: 4 }}>WALLIFY</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-md hover:bg-white/3 transition"><Search /></button>
              <a href="/motion" className="p-2 rounded-md hover:bg-white/3 transition"><Film /></a>
              <a href="/favorites" className="p-2 rounded-md hover:bg-white/3 transition"><Heart /></a>
              <button className="p-2 rounded-md hover:bg-white/3 transition"><Bell /></button>
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