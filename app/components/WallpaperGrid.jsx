'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchWallpapers } from '../lib/api';
import WallpaperCard from './WallpaperCard';

export default function WallpaperGrid() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinel = useRef();
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const pulling = useRef(false);
  const scrollRef = useRef();

  const searchParams = useSearchParams();
  const qParam = searchParams.get('q');
  const query = qParam && qParam.trim() !== '' ? qParam.trim().toLowerCase() : 'trending';

  // 🧠 Reset state whenever query changes
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [query]);

  // 📦 Fetch wallpapers (with smart prefetch for categories)
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const res = await fetchWallpapers(query, page, { signal: controller.signal });
        if (!active) return;

        // Generate unique IDs safely
        const uniqueItems = res.map((item, index) => ({
          ...item,
          _uniqueId: `${item.id || 'noid'}-${query}-${page}-${index}-${Math.random().toString(36).slice(2, 8)}`
        }));

        if (page === 1) {
          setItems(uniqueItems);
        } else {
          setItems(prev => {
            const seen = new Set(prev.map(it => it._uniqueId));
            return [...prev, ...uniqueItems.filter(it => !seen.has(it._uniqueId))];
          });
        }

        if (!res || res.length === 0) setHasMore(false);
      } catch (e) {
        if (e.name !== 'AbortError') console.error('WallpaperGrid fetch error', e);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, page]);

  // 🌀 Infinite scroll observer
  useEffect(() => {
    if (!sentinel.current) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loading && hasMore) {
          setPage(prev => prev + 1);
        }
      });
    }, { rootMargin: '400px' });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [loading, hasMore]);

  // 🔄 Pull-to-refresh logic
  useEffect(() => {
    const el = scrollRef.current || document;

    function onTouchStart(e) {
      if ((window.scrollY || window.pageYOffset) > 8) return;
      touchStartY.current = e.touches[0].clientY;
      touchCurrentY.current = touchStartY.current;
      pulling.current = true;
    }

    function onTouchMove(e) {
      if (!pulling.current) return;
      touchCurrentY.current = e.touches[0].clientY;
      const diff = touchCurrentY.current - touchStartY.current;
      if (diff > 80) {
        pulling.current = false;
        doRefresh();
      }
    }

    function onTouchEnd() {
      pulling.current = false;
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [query]);

  // 🧽 Refresh function
  async function doRefresh() {
    try {
      setRefreshing(true);
      setPage(1);
      const fresh = await fetchWallpapers(query, 1);
      const randomized = fresh.map((it, i) => ({
        ...it,
        _uniqueId: `${it.id || 'noid'}-${query}-${i}-${Math.random().toString(36).slice(2, 6)}`
      }));
      setItems(randomized);
      setHasMore(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error('refresh error', e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }

  // 💠 Loading skeletons
  const skeletonArray = Array.from({ length: 8 });

  return (
    <div className="relative" ref={scrollRef}>
      {refreshing && (
        <div className="ptr-indicator text-center text-gray-400 py-3">Refreshing…</div>
      )}

      {/* 🖼️ Premium Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading && items.length === 0 ? (
          skeletonArray.map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden relative">
              <div className="w-full h-64 md:h-72 skeleton rounded-xl" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 p-12">
            Nothing found for "{query}" — try another category.
          </div>
        ) : (
          items.map(it => <WallpaperCard key={it._uniqueId} item={it} />)
        )}
      </div>

      <div ref={sentinel} className="mt-6 flex items-center justify-center h-20">
        {loading ? (
          <div className="text-gray-300">Loading…</div>
        ) : !hasMore ? (
          <div className="text-gray-500">No more wallpapers</div>
        ) : null}
      </div>
    </div>
  );
}