// app/api/proxy/route.js
// Server-side proxy for fetching wallpapers/videos and normalizing responses.

import { NextResponse } from 'next/server';

/* ============ API SOURCES ============ */
const STATIC_BASE = "https://ab-pinetrest.abrahamdw882.workers.dev/?query=";
const VIDEO_BASE = "https://ab-pintrestvid.abrahamdw882.workers.dev/?q=";

/* ============ CATEGORY POOL (for random home feed) ============ */
const RANDOM_CATEGORIES = [
  "anime", "nature", "cars", "love", "space", "abstract",
  "black aesthetic", "minimal", "3d wallpaper", "girl aesthetic", "lion wallpaper"
];

/* ============ Helper Functions ============ */
function pickImageField(item) {
  if (!item || typeof item !== 'object') return null;
  return (
    item.thumbnail ||
    item.thumb ||
    item.image ||
    item.image_url ||
    item.img ||
    item.url ||
    item.src ||
    (item.media && (item.media.src || item.media.image)) ||
    null
  );
}

function pickVideoField(item) {
  if (!item || typeof item !== 'object') return null;
  return (
    item.video ||
    item.mp4 ||
    item.src ||
    item.url ||
    (item.media && (item.media.mp4 || item.media.video)) ||
    null
  );
}

function normalizeImage(item, idx) {
  const baseId = item.id || item.post_id || item.uid || item.key || `img_${idx}`;
  const id = `${baseId}_${Math.floor(Math.random() * 1e9)}`; // ensure uniqueness
  const thumbnail = pickImageField(item);
  const full = item.full || item.full_url || item.original || thumbnail;
  const title = item.title || item.name || item.alt || (item.tags && item.tags[0]) || '';
  const description = item.description || item.desc || item.caption || '';
  const tags = item.tags || item.categories || [];
  return { id, title, thumbnail, full, tags, description, raw: item };
}

function normalizeVideo(item, idx) {
  const baseId = item.id || item.post_id || item.uid || `vid_${idx}`;
  const id = `${baseId}_${Math.floor(Math.random() * 1e9)}`; // ensure uniqueness
  const thumbnail = item.thumb || item.poster || pickImageField(item);
  const video = pickVideoField(item);
  const title = item.title || item.name || '';
  const description = item.description || item.caption || '';
  const tags = item.tags || [];
  return { id, title, thumbnail, video, tags, description, raw: item };
}

/* HTML fallback: extract <img src=""> tags if no JSON is returned */
function parseHtmlForImagesServer(html, baseUrl) {
  try {
    const re = /<img[^>]+src=(["'])(.*?)\1/gi;
    const out = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      const src = m[2];
      try {
        const abs = new URL(src, baseUrl).toString();
        out.push({
          id: `html_img_${out.length}_${Math.floor(Math.random() * 1e9)}`,
          thumbnail: abs,
          full: abs,
          title: '',
          description: '',
          tags: [],
        });
      } catch (ignore) {}
    }
    return out;
  } catch {
    return [];
  }
}

/* Generic fetch + normalize */
async function fetchAndNormalizeExternal(url, type = 'image') {
  try {
    const res = await fetch(url);
    const text = await res.text();

    // Try JSON parsing
    try {
      const json = JSON.parse(text);
      const list = Array.isArray(json)
        ? json
        : json.results || json.items || json.data || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((it, i) =>
          type === 'image' ? normalizeImage(it, i) : normalizeVideo(it, i)
        );
      }
    } catch {
      // Continue to HTML fallback
    }

    // HTML fallback
    const imgs = parseHtmlForImagesServer(text, url);
    if (imgs.length > 0) return imgs;

    return [];
  } catch (err) {
    console.error('proxy fetch error:', err, url);
    return [];
  }
}

/* ============ Main GET Handler ============ */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get('source') || 'static').toLowerCase();
    const q = searchParams.get('q') || searchParams.get('query');
    const page = searchParams.get('page') || '1';

    // === If no query provided (home page), fetch random mix ===
    if (!q) {
      const selected = RANDOM_CATEGORIES.sort(() => 0.5 - Math.random()).slice(0, 3);
      const allResults = await Promise.all(
        selected.map(cat =>
          fetchAndNormalizeExternal(`${STATIC_BASE}${encodeURIComponent(cat)}`, 'image')
        )
      );
      const merged = allResults.flat();
      return NextResponse.json({ ok: true, data: merged });
    }

    // === Handle video or image mode ===
    if (source === 'video') {
      const endpoint = `${VIDEO_BASE}${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`;
      const normalized = await fetchAndNormalizeExternal(endpoint, 'video');
      return NextResponse.json({ ok: true, data: normalized });
    } else {
      const endpoint = `${STATIC_BASE}${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`;
      const normalized = await fetchAndNormalizeExternal(endpoint, 'image');
      return NextResponse.json({ ok: true, data: normalized });
    }
  } catch (e) {
    console.error('proxy route error:', e);
    return NextResponse.json(
      { ok: false, data: [], error: String(e) },
      { status: 500 }
    );
  }
}