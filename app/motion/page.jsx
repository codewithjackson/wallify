'use client';
import { useEffect, useState } from 'react';
import { fetchMotionVideos } from './../lib/api';
import { Play, Download } from 'lucide-react';

export default function MotionPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchMotionVideos('live wallpapers', 1);
        if (!active) return;
        setItems(res.slice(0, 60));
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  function download(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallify-motion-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <section>
      <div className="rounded-2xl p-6 mb-6 card-glass">
        <h2 className="text-2xl font-semibold">Wallify Motion</h2>
        <p className="text-gray-300 mt-1">Short aesthetic video clips — tap to play or download.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_,i)=>(
            <div key={i} className="rounded-xl overflow-hidden relative">
              <div className="w-full h-44 skeleton rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(v => (
            <div key={v.id} className="rounded-xl overflow-hidden bg-white/3 relative">
              {v.video ? (
                <video controls className="w-full h-44 object-cover bg-black">
                  <source src={v.video} type="video/mp4" />
                </video>
              ) : (
                <img src={v.thumbnail || ''} className="w-full h-44 object-cover" alt={v.title} />
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {v.video && <button onClick={() => download(v.video)} className="px-2 py-1 rounded bg-white/6"><Download size={14} /></button>}
              </div>
              <div className="p-2">
                <div className="text-sm text-gray-200">{v.title || v.tags?.[0] || 'Clip'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
