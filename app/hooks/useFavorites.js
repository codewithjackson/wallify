'use client';
import { useState, useEffect } from 'react';
const KEY = 'wallify:favorites:v1';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); setFavorites(raw ? JSON.parse(raw) : []); } catch { setFavorites([]); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  function exists(id) { return favorites.some(f => f.id === id); }
  function toggle(item) { setFavorites(prev => { const found = prev.find(p => p.id === item.id); if (found) return prev.filter(p => p.id !== item.id); return [item, ...prev]; }); }
  function remove(id) { setFavorites(prev => prev.filter(p => p.id !== id)); }
  function clear() { setFavorites([]); }

  return { favorites, exists, toggle, remove, clear };
}
