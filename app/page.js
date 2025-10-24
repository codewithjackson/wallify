"use client";
import dynamic from "next/dynamic";

const WallpaperGrid = dynamic(() => import("./components/WallpaperGrid"), {
  ssr: false, // ✅ prevents prerendering errors
});

export default function Home() {
  return (
    <section className="mb-8">
      <div className="rounded-2xl p-8 mb-6 card-glass">
        <h1 className="text-3xl font-bold">For You</h1>
        <p className="text-gray-300 mt-2">
          Handpicked wallpapers just for you — pull down to refresh.
        </p>
      </div>

      <WallpaperGrid />
    </section>
  );
}