import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "GhostChat - Secure End-to-End Encrypted Messaging",
  description: "Experience truly private conversations with military-grade encryption. GhostChat offers secure messaging, group chats, and file sharing with zero data collection.",
  keywords: ["secure messaging", "encrypted chat", "private messaging", "end-to-end encryption", "secure chat app"],
  authors: [{ name: "GhostChat Team" }],
  creator: "GhostChat",
  publisher: "GhostChat",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
