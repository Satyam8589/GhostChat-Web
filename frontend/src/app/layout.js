import { Outfit } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "GhostChat - Secure End-to-End Encrypted Messaging",
  description:
    "Experience truly private conversations with military-grade encryption. GhostChat offers secure messaging, group chats, and file sharing with zero data collection.",
  keywords: [
    "secure messaging",
    "encrypted chat",
    "private messaging",
    "end-to-end encryption",
    "secure chat app",
  ],
  authors: [{ name: "GhostChat Team" }],
  creator: "GhostChat",
  publisher: "GhostChat",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GhostChat",
  },
  openGraph: {
    title: "GhostChat - Secure Messaging",
    description: "Private, encrypted messaging for everyone",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostChat - Secure Messaging",
    description: "Private, encrypted messaging for everyone",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="icon" href="/icon-192x192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link
          rel="mask-icon"
          href="/icon-maskable-512x512.svg"
          color="#9333ea"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased">
        <ReduxProvider>{children}</ReduxProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                      console.log('[PWA] ServiceWorker registered:', registration.scope);
                      
                      // Check for updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[PWA] New version available');
                            if (confirm('New version available! Reload to update?')) {
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }
                          }
                        });
                      });
                    })
                    .catch(function(error) {
                      console.log('[PWA] ServiceWorker registration failed:', error);
                    });
                });
                
                // Handle service worker updates
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
