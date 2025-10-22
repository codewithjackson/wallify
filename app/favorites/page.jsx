'use client';
import { useFavorites } from './../hooks/useFavorites';

export default function FavoritesPage() {
  const fav = useFavorites();

  return (
    <section>
      <div className="rounded-2xl p-6 mb-6 card-glass">
        <h2 className="text-2xl font-semibold">My Favorites</h2>
        <p className="text-gray-400 mt-1">Your saved wallpapers. Stored locally in your browser.</p>
      </div>

      {fav.favorites.length === 0 ? (
        <div className="p-8 text-center text-gray-300">You haven’t saved any wallpapers yet. Explore and tap the heart to save favorites.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fav.favorites.map(item => (
            <div key={item.id} className="rounded-xl overflow-hidden bg-white/3">
              <img src={item.url || item.full} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-2 flex items-center justify-between">
                <a href={item.url || item.full} target="_blank" rel="noreferrer" className="text-sm text-gray-200">Open</a>
                <button onClick={() => fav.remove(item.id)} className="text-sm text-red-400">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
