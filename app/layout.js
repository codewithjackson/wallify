// ✅ app/layout.js — Server Component (no "use client" here)
import './globals.css';
import Navbar from './components/Navbar';
import ToastProvider from './components/ToastProvider';
import ClientInit from './components/ClientInit'; // handles service worker + PWA setup

export const metadata = {
  title: 'Wallify',
  description: 'Premium wallpapers — Wallify',
  manifest: '/manifest.json',
  themeColor: '#0b0f17',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f17] text-white">
        <ToastProvider />
        <Navbar />
        <ClientInit /> {/* ✅ PWA setup (registers service worker) */}
        <main className="pt-28 px-6 pb-12 max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}