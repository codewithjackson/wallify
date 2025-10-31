'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Heart, Wallpaper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchWallpapers } from '../lib/api';
import { useFavorites } from '../hooks/useFavorites';
import { toast } from 'react-hot-toast';

export default function Modal({ item: initialItem, onClose }) {
  const [item, setItem] = useState(initialItem);
  const [downloading, setDownloading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fav = useFavorites();

  useEffect(() => {
    setIsClient(true);
    // 🔒 Disable background scroll when modal opens
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Restore when closed
    };
  }, []);

  // ✨ Allow closing modal with Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isFav = isClient ? fav.exists(item.id) : false;

  async function download() {
    if (!isClient) return;
    try {
      setDownloading(true);
      const imageUrl = item.full || item.thumbnail;
      if (!imageUrl) throw new Error('No image URL found');

      const response = await fetch(`/api/download?url=${encodeURIComponent(imageUrl)}`);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `wallify-${item.id || Math.random().toString(36).slice(2)}.jpg`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success('🎉 Download started!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download image 😢');
    } finally {
      setDownloading(false);
    }
  }

  function toggleFav() {
    if (!isClient) return;
    fav.toggle({
      id: item.id,
      url: item.full || item.thumbnail,
      title: item.title,
      description: item.description,
      tags: item.tags,
    });
    toast.success(isFav ? 'Removed from favorites 💔' : 'Added to favorites 💖');
  }

  function setAsWallpaper() {
    if (!isClient) return;
    const imageUrl = item.full || item.thumbnail;
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

    if (isAndroid && isPWA) {
      try {
        const intentUrl = `intent:${imageUrl}#Intent;action=android.intent.action.VIEW;type=image/*;end`;
        window.location.href = intentUrl;
        toast('Opening wallpaper setup...');
      } catch (err) {
        console.error(err);
        toast.error('Could not launch wallpaper intent.');
      }
    } else if (isAndroid) {
      window.open(imageUrl, '_blank');
      toast('Open the image and set it as wallpaper manually 🌌');
    } else {
      toast('Automatic wallpaper setup works on Android PWAs only 💫');
    }
  }

  if (!isClient) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* ✨ Background overlay (click to close) */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        ></div>

        {/* ✨ Main modal content */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl rounded-2xl p-4 card-glass border border-white/6 bg-[#0b0f17]/90 backdrop-blur-md overflow-y-auto max-h-[90vh]"
        >
          {/* ✖️ Close button */}
          <div className="flex justify-end sticky top-0 bg-[#0b0f17]/70 backdrop-blur-md z-10 p-2 rounded-t-2xl">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <X />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 🖼️ Image Preview */}
            <div className="md:col-span-2 rounded-lg overflow-hidden flex items-center justify-center bg-black/20">
              <img
                src={item.full || item.thumbnail}
                alt={item.title}
                className="max-h-[70vh] object-contain"
              />
            </div>

            {/* 💖 Buttons + Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleFav}
                  className="px-3 py-2 rounded-xl bg-white/6 flex items-center gap-1"
                >
                  <Heart className={isFav ? 'text-red-400' : ''} size={16} />
                  <span>Favorite</span>
                </button>

                <button
                  onClick={download}
                  disabled={downloading}
                  className={`px-3 py-2 rounded-xl bg-white/6 flex items-center gap-1 ${
                    downloading ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  <Download size={16} />
                  <span>{downloading ? 'Downloading...' : 'Download'}</span>
                </button>

                <button
                  onClick={setAsWallpaper}
                  className="px-3 py-2 rounded-xl bg-white/6 flex items-center gap-1"
                >
                  <Wallpaper size={16} />
                  <span>Set Wallpaper</span>
                </button>

                <button
                  onClick={() =>
                    navigator.share
                      ? navigator.share({
                          title: item.title || 'Wallpaper',
                          url: item.full || item.thumbnail,
                        })
                      : toast('Share not supported on this device')
                  }
                  className="px-3 py-2 rounded-xl bg-white/6 flex items-center gap-1"
                >
                  <span>Share</span>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  {item.title || 'Wallpaper'}
                </h3>
                <p className="text-sm text-gray-300">
                  {item.description ||
                    (item.tags && item.tags.join(', ')) ||
                    'Beautiful wallpaper'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}