'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, Loader2 } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import Modal from './Modal';
import toast from 'react-hot-toast';

export default function WallpaperCard({ item }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fav = useFavorites();
  const isFav = fav.exists(item.id);

  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchMoved = useRef(false);

  const handleTouchStart = (e) => {
    touchMoved.current = false;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStart.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);
    if (dx > 8 || dy > 8) touchMoved.current = true; // more lenient threshold
  };

  const handleClickSafe = (action) => (e) => {
    e.stopPropagation(); // 🧱 prevent bubbling
    const now = Date.now();
    const touchDuration = now - touchStart.current.time;
    if (touchMoved.current || touchDuration > 300) return; // ignore long/scroll gestures
    action(e);
  };

  async function download() {
    try {
      setDownloading(true);
      const url = item.full || item.thumbnail;
      if (!url) throw new Error('No image URL found');

      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('Failed to fetch image');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `wallify-${item.id || Math.random().toString(36).slice(2)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    fav.toggle({
      id: item.id,
      url: item.full || item.thumbnail,
      title: item.title,
      description: item.description,
      tags: item.tags,
    });
    toast.success(!isFav ? 'Added to favorites 💖' : 'Removed from favorites 💔');
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="rounded-xl overflow-hidden relative group bg-white/5 backdrop-blur-md"
      >
        <div className="w-full h-52 bg-white/3 overflow-hidden">
          <img
            src={item.thumbnail || item.full}
            alt={item.title || 'wallpaper'}
            className={`w-full h-52 object-cover transition-all duration-500 ${
              loaded ? 'img-loaded' : 'img-blur'
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </div>

        {/* --- Button Overlay (tap-safe + responsive) --- */}
        <div className="absolute inset-0 flex items-end justify-center p-3 opacity-0 group-hover:opacity-100 transition">
          <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleClickSafe(() => setOpen(true))}
              className="px-4 py-1.5 rounded-full bg-black/40 text-white text-sm font-medium backdrop-blur-md hover:bg-black/60 transition"
            >
              View
            </button>

            <button
              onClick={handleClickSafe(download)}
              disabled={downloading}
              className={`px-4 py-1.5 rounded-full bg-black/40 text-white text-sm font-medium backdrop-blur-md flex items-center gap-1 hover:bg-black/60 transition ${
                downloading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {downloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span className="hidden sm:inline">
                {downloading ? 'Downloading...' : ''}
              </span>
            </button>

            <button
              onClick={handleClickSafe(toggleFav)}
              className="px-3 py-1.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
            >
              <Heart size={16} className={isFav ? 'text-red-400' : ''} />
            </button>
          </div>
        </div>
      </motion.div>

      {open && <Modal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}