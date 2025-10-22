'use client';
import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// ✅ Custom hook for easy use anywhere
export function useToast() {
  return {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast(msg),
  };
}

export default function ToastProvider() {
  useEffect(() => {
    // ✅ Listen for messages from the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data || {};
        switch (data.type) {
          case 'DOWNLOAD_COMPLETE':
            toast.success(data.message || 'Download completed!');
            break;
          case 'ERROR':
            toast.error(data.message || 'Something went wrong!');
            break;
          case 'INFO':
            toast(data.message || 'Info');
            break;
          default:
            break;
        }
      });
    }
  }, []);

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
        },
      }}
    />
  );
}