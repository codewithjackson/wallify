// lib/api.js
// Client wrapper that talks to server-side proxy (/api/proxy).
// Adds short in-memory cache for faster UI and uses AbortController to cancel previous requests.

const CACHE = new Map();
const CACHE_TTL_MS = 1000 * 60 * 1; // 1 minute cache

const RANDOM_TOPICS = [
  "anime",
  "nature",
  "cars",
  "technology",
  "space",
  "city",
  "abstract",
  "gaming",
  "animals",
  "fantasy",
  "architecture"
];

// Utility to shuffle an array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function callProxy({ source = 'static', q = 'trending', page = 1, signal } = {}) {
  const key = `${source}::${q}::${page}`;
  const now = Date.now();
  const entry = CACHE.get(key);
  if (entry && (now - entry.ts) < CACHE_TTL_MS) return entry.data;

  const url = `/api/proxy?source=${encodeURIComponent(source)}&q=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      console.error('proxy call failed', res.status);
      return [];
    }
    const json = await res.json();
    if (!json.ok) return [];
    CACHE.set(key, { ts: Date.now(), data: json.data || [] });
    return json.data || [];
  } catch (e) {
    if (e.name === 'AbortError') return [];
    console.error('callProxy error', e);
    return [];
  }
}

export async function fetchWallpapers(query = 'trending', page = 1, opts = {}) {
  const controller = new AbortController();
  if (opts.signal) opts.signal.addEventListener('abort', () => controller.abort());

  // 🌈 If homepage (trending/random) → load from multiple random categories
  if (query === 'trending' || query === 'random' || query === '') {
    const randomTopics = shuffle([...RANDOM_TOPICS]).slice(0, 5); // pick 5 random topics
    const promises = randomTopics.map(topic =>
      callProxy({ source: 'static', q: topic, page, signal: controller.signal })
    );
    const results = await Promise.all(promises);
    const merged = results.flat();

    // Remove duplicates by unique `id`
    const unique = Array.from(new Map(merged.map(it => [it.id, it])).values());

    // Shuffle for random display
    return shuffle(unique);
  }

  // 🧩 Default behavior for normal queries
  return await callProxy({ source: 'static', q: query, page, signal: controller.signal });
}

export async function fetchMotionVideos(query = 'live wallpapers', page = 1, opts = {}) {
  const controller = new AbortController();
  if (opts.signal) opts.signal.addEventListener('abort', () => controller.abort());
  return await callProxy({ source: 'video', q: query, page, signal: controller.signal });
}

export async function fetchCategoryPreview(query = 'nature') {
  const list = await fetchWallpapers(query, 1);
  if (list && list.length > 0) return list[0].thumbnail || list[0].full || null;
  return null;
}