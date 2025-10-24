'use client';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ClientInit() {
  useEffect(() => {
    // === Register service worker ===
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope);

            // 🔄 Listen for updates to service worker
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast('🆕 New update available! Refreshing...');
                  console.log('🔁 New Service Worker installed — reloading page...');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            });
          })
          .catch((error) => {
            console.log('❌ Service Worker registration failed:', error);
          });
      });

      // ♻️ When the new service worker takes control, reload the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 New Service Worker activated, refreshing...');
        window.location.reload();
      });
    }

    // === Handle PWA install prompt ===
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      console.log('📲 App install prompt captured!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}