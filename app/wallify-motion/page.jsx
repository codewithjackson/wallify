'use client';
import { motion } from 'framer-motion';

export default function WallifyMotionComingSoon() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
      >
        Wallify Motion 🎥
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-gray-300 text-lg md:text-xl"
      >
        Coming Soon... Stay tuned for stunning live wallpapers ✨
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5, repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
        className="mt-10 text-sm text-gray-400"
      >
        Loading creativity...
      </motion.div>
    </section>
  );
}