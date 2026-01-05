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
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
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
                      console.log('ServiceWorker registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('ServiceWorker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
