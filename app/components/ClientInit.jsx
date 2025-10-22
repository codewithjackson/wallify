'use client';
import { useEffect } from 'react';

export default function ClientInit() {
  useEffect(() => {
    // === Register the service worker ===
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('./service-worker.js');
          console.log('✅ Service Worker registered:', registration.scope);
        } catch (err) {
          console.error('❌ Service Worker registration failed:', err);
        }
      });
    }

    // === Handle PWA install prompt ===
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      console.log('📲 App install prompt captured and ready!');
      window.dispatchEvent(new Event('installpromptready')); // 👈 notify UI
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}