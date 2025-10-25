'use client';
import { useState } from 'react';
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
        className="rounded-xl overflow-hidden relative group bg-white/5"
      >
        {/* 🖼️ Image */}
        <div className="w-full h-52 bg-white/10 overflow-hidden">
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

        {/* 🎛️ Buttons */}
        <div
          className="
            absolute inset-x-0 bottom-0 
            flex flex-wrap justify-center gap-2 
            p-3 
            opacity-100 md:opacity-0 md:group-hover:opacity-100 
            transition-all duration-300 
            bg-gradient-to-t from-black/60 to-transparent
          "
        >
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-1.5 rounded-full bg-white/20 text-sm text-white hover:bg-white/30 backdrop-blur-sm transition"
          >
            View
          </button>

          <button
            onClick={download}
            disabled={downloading}
            className={`px-4 py-1.5 rounded-full bg-white/20 text-sm text-white flex items-center gap-1 hover:bg-white/30 backdrop-blur-sm transition ${
              downloading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {downloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {downloading && <span>Downloading...</span>}
          </button>

          <button
            onClick={toggleFav}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition"
          >
            <Heart size={18} className={isFav ? 'text-red-400 fill-red-400' : 'text-white'} />
          </button>
        </div>
      </motion.div>

      {open && <Modal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}