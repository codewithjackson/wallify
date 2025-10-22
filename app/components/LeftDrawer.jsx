'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, DownloadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: '3d', label: '3D', q: '3d wallpaper', emoji: '🌀' },
  { id: 'abstract', label: 'Abstract', q: 'abstract art', emoji: '🎨' },
  { id: 'anime', label: 'Anime', q: 'anime', emoji: '🌸' },
  { id: 'girl', label: 'Girl', q: 'girl aesthetic', emoji: '👩' },
  { id: 'lion', label: 'Lion', q: 'lion wallpaper', emoji: '🦁' },
  { id: 'love', label: 'Love', q: 'love aesthetic', emoji: '❤️' },
  { id: 'black', label: 'Black', q: 'black aesthetic', emoji: '🖤' },
  { id: 'cars', label: 'Cars', q: 'sports cars', emoji: '🚗' },
  { id: 'nature', label: 'Nature', q: 'nature', emoji: '🌿' },
  { id: 'space', label: 'Space', q: 'space wallpaper', emoji: '🌌' },
  { id: 'minimal', label: 'Minimal', q: 'minimal wallpaper', emoji: '🧑‍🎨' },
];

export default function LeftDrawer({ onClose }) {
  const router = useRouter();
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 🧠 Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // 📲 Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log('📲 Install prompt event captured.');
      window.deferredPrompt = e; // store globally too
      setDeferredPrompt(e);
      setCanInstall(true);
      toast.success('🎉 App install ready! Open menu to install.');
    };

    // 🎉 Handle successful install
    const handleAppInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      toast.success('✅ Wallify installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 🔍 If prompt was captured in another component
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const navTo = (path) => {
    onClose?.();
    router.push(path);
  };

  // 💾 Trigger install
  const handleInstall = async () => {
    if (installed) {
      toast('✅ Wallify is already installed.');
      return;
    }

    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (!promptEvent) {
      toast.error('⚠️ Install prompt not available yet.\nTry refreshing, then reopen this menu.');
      console.warn('⚠️ No install prompt available.');
      return;
    }

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'accepted') {
      toast.success('📱 Installing Wallify...');
      console.log('✅ User accepted install.');
    } else {
      toast('Installation cancelled.');
      console.log('❌ User dismissed install.');
    }

    setDeferredPrompt(null);
    setCanInstall(false);
    window.deferredPrompt = null;
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-lg"
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed inset-y-0 left-0 z-[10000] w-80 bg-[rgba(6,7,10,0.98)] backdrop-blur-xl border-r border-white/6 p-5 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-lg">WALLIFY</div>
          <button className="p-2" onClick={onClose}><X /></button>
        </div>

        <nav className="space-y-3 mb-4">
          <button onClick={() => navTo('/')} className="w-full text-left py-2 px-3 rounded-md hover:bg-white/5">Home</button>
          <button onClick={() => navTo('/motion')} className="w-full text-left py-2 px-3 rounded-md hover:bg-white/5">Wallify Motion</button>
          <button onClick={() => navTo('/favorites')} className="w-full text-left py-2 px-3 rounded-md hover:bg-white/5">Favorites</button>

          {/* ✅ Install Button */}
          <button
            onClick={handleInstall}
            disabled={!canInstall && !installed}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-md font-medium transition ${
              installed
                ? 'bg-green-600 text-white cursor-not-allowed'
                : canInstall
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white hover:opacity-90 animate-pulse'
                : 'bg-white/5 text-gray-400 cursor-not-allowed'
            }`}
          >
            <DownloadCloud />
            {installed
              ? 'App Installed'
              : canInstall
              ? 'Install Wallify'
              : 'Install Not Ready'}
          </button>
        </nav>

        <hr className="border-white/6 my-3" />

        {/* Categories */}
        <div>
          <div className="text-sm text-gray-300 mb-2">Explore Categories</div>
          <ul className="space-y-2">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => navTo(`/?q=${encodeURIComponent(cat.q)}`)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition w-full text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center text-xl">
                    {cat.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{cat.label}</div>
                    <div className="text-xs text-gray-400">{cat.q}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-xs text-gray-400">Built with ❤️ — Wallify</div>
      </motion.aside>
    </>
  );
}