"use client";
import { useEffect, useState } from "react";
import WallpaperGrid from "./components/WallpaperGrid";
import toast from "react-hot-toast";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // ✅ Capture install prompt globally
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("✅ Install prompt captured and ready!");
      toast.success("You can now install Wallify from the menu!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // ✅ Function to trigger install manually (if you ever need it on this page)
  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast("⚠️ Install prompt not ready yet — refresh or open menu later.");
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      toast.success("🎉 Wallify installed successfully!");
      setDeferredPrompt(null);
    } else {
      toast("Installation canceled.");
    }
  };

  return (
    <>
      <section className="mb-8">
        <div className="rounded-2xl p-8 mb-6 card-glass">
          <h1 className="text-3xl font-bold">For You</h1>
          <p className="text-gray-300 mt-2">
            Handpicked wallpapers just for you — pull down to refresh.
          </p>
        </div>

        <WallpaperGrid query={"trending"} />

        {/* Hidden global install trigger (optional) */}
        {/* You can trigger this manually for testing */}
        {/* <button onClick={handleInstall} className="hidden">Install</button> */}
      </section>
    </>
  );
}