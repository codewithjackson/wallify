'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';

export default function WallpaperCard({ item }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchMoved = useRef(false);

  // ✅ Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

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
    if (dx > 8 || dy > 8) touchMoved.current = true;
  };

  return (
    <>
      {/* 🖼️ Wallpaper Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={() => {
          if (!touchMoved.current) setOpen(true);
        }}
        className="rounded-2xl overflow-hidden relative group bg-white/5 backdrop-blur-md transition-all cursor-pointer"
      >
        {/* Image */}
        <div className="w-full h-72 md:h-80 lg:h-96 bg-white/5 overflow-hidden">
          <img
            src={item.thumbnail || item.full}
            alt={item.title || 'wallpaper'}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              loaded ? 'opacity-100' : 'opacity-0 scale-105 blur-md'
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </div>

        {/* Optional hover effect overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
      </motion.div>

      {/* 💫 Modal */}
      <AnimatePresence>
        {open && (
          <Modal
            key="wallpaper-modal"
            item={item}
            isOpen={open}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}