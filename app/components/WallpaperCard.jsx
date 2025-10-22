'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, Loader2 } from 'lucide-react'; // Added loader icon
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

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch image');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `wallify-${item.id || Math.random().toString(36).slice(2)}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      toast.success('Download started 🎉');
    } catch (err) {
      console.error(err);
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
      tags: item.tags
    });
    toast.success(!isFav ? 'Added to favorites 💖' : 'Removed from favorites 💔');
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl overflow-hidden relative group bg-white/3"
      >
        <div className="w-full h-52 bg-white/3 overflow-hidden">
          <img
            src={item.thumbnail || item.full}
            alt={item.title || 'wallpaper'}
            className={`w-full h-52 object-cover transition-all duration-400 ${
              loaded ? 'img-loaded' : 'img-blur'
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </div>

        <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition">
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1 rounded-full bg-white/6"
            >
              View
            </button>

            <button
              onClick={download}
              disabled={downloading}
              className={`px-3 py-1 rounded-full bg-white/6 flex items-center gap-1 transition-all ${
                downloading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {downloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span className="text-xs">{downloading ? 'Downloading' : ''}</span>
            </button>

            <button
              onClick={toggleFav}
              className="px-3 py-1 rounded-full bg-white/6"
            >
              <Heart className={isFav ? 'text-red-400' : ''} />
            </button>
          </div>
        </div>
      </motion.div>

      {open && <Modal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}