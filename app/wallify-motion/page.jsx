'use client';
import { motion } from 'framer-motion';

export default function MotionPage() {
  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-white mb-3"
      >
        🚧 Wallify Motion
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-gray-300 text-lg"
      >
        Coming Soon — Stay tuned for beautiful animated wallpapers ✨
      </motion.p>
    </section>
  );
}