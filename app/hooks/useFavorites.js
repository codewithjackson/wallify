'use client';
import { useState, useEffect } from 'react';

const KEY = 'wallify:favorites:v1';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false); // <— ensures we only access localStorage on client

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    try {
      const raw = localStorage.getItem(KEY);
      setFavorites(raw ? JSON.parse(raw) : []);
    } catch {
      setFavorites([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // wait until hydration
    try {
      localStorage.setItem(KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites, hydrated]);

  function exists(id) {
    return favorites.some((f) => f.id === id);
  }
  function toggle(item) {
    setFavorites((prev) => {
      const found = prev.find((p) => p.id === item.id);
      return found ? prev.filter((p) => p.id !== item.id) : [item, ...prev];
    });
  }
  function remove(id) {
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  }
  function clear() {
    setFavorites([]);
  }

  return { favorites, exists, toggle, remove, clear, hydrated };
}