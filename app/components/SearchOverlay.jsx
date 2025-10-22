'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { fetchCategoryPreview } from '../lib/api';
import { useRouter } from 'next/navigation';

const CATS = [
  { id: 'anime', name: 'Anime', q: 'anime' },
  { id: 'girl', name: 'Girl', q: 'girl aesthetic' },
  { id: 'lion', name: 'Lion', q: 'lion wallpaper' },
  { id: 'love', name: 'Love', q: 'love aesthetic' },
  { id: 'black', name: 'Black', q: 'black aesthetic' },
  { id: 'cars', name: 'Cars', q: 'sports cars' },
  { id: 'nature', name: 'Nature', q: 'nature' },
  { id: '3d', name: '3D', q: '3d wallpaper' },
  { id: 'abstract', name: 'Abstract', q: 'abstract art' },
  { id: 'space', name: 'Space', q: 'space wallpaper' }
];

export default function SearchOverlay({ onClose }) {
  const [q, setQ] = useState('');
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const results = await Promise.all(
          CATS.map(async (cat) => {
            try {
              const thumb = await fetchCategoryPreview(cat.q);
              return [cat.id, thumb];
            } catch {
              return [cat.id, null];
            }
          })
        );
        if (active) {
          const map = Object.fromEntries(results);
          setPreviews(map);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching previews:', err);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/?q=${encodeURIComponent(q.trim())}`);
    router.refresh();
    onClose && onClose();
  }

  function clickCat(cat) {
    router.push(`/?q=${encodeURIComponent(cat.q)}`);
    router.refresh();
    onClose && onClose();
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[10000] flex items-start justify-center"
    >
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-lg"></div>

      <motion.div 
        initial={{ y: -10, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: -6, opacity: 0 }} 
        transition={{ duration: 0.18 }} 
        className="relative w-full max-w-5xl mx-4 my-6 bg-[rgba(6,7,10,0.85)] card-glass p-4 rounded-2xl overflow-y-auto" 
        style={{ maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onClose} className="p-2 rounded-md hover:bg-white/3 transition"><ArrowLeft /></button>
          <form onSubmit={submit} className="flex-1">
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search wallpapers (anime, black aesthetic, lion)" 
              autoFocus 
              className="w-full rounded-full px-4 py-3 bg-white/5 text-white placeholder:text-gray-400 focus:outline-none" 
            />
          </form>
        </div>

        <div className="text-sm text-gray-300 mb-3">Popular categories</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATS.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => !loading && clickCat(cat)} 
              disabled={loading}
              className="relative rounded-xl overflow-hidden group h-36 w-full focus:outline-none"
            >
              {loading ? (
                // 🌌 Bluish neon shimmer with faint glow
                <div className="w-full h-full bg-gradient-to-r from-[#0a1a2f] via-[#155a9a] to-[#0a1a2f] animate-[shimmer_1.7s_infinite] bg-[length:200%_100%] rounded-xl shadow-[0_0_12px_2px_rgba(30,144,255,0.25)]"></div>
              ) : previews[cat.id] ? (
                <img 
                  src={previews[cat.id]} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-white/6 to-transparent flex items-center justify-center text-3xl">
                  {cat.name.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
              <div className="absolute left-3 bottom-3 text-white font-semibold">{cat.name}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 text-xs text-gray-400">Tap a category or type your own query above.</div>
      </motion.div>
    </motion.div>
  );
}

/* 🔹 Neon shimmer animation */
<style jsx global>{`
@keyframes shimmer {
  0% { background-position: -200% 0; filter: brightness(0.8); }
  50% { background-position: 200% 0; filter: brightness(1.3) drop-shadow(0 0 10px rgba(30,144,255,0.4)); }
  100% { background-position: -200% 0; filter: brightness(0.8); }
}
`}</style>