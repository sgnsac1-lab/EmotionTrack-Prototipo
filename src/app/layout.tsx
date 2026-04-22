import type { Metadata } from "next";
import {Toaster} from 'sonner'
import "./globals.css";

export const metadata: Metadata = {
  title: "EmotionTrack EXPO",
  description: "ia que calcula el engagment de una presentacion en vivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full w-full antialiased`}
    >
      <body className="min-h-full w-full flex flex-col">{children}<Toaster position="bottom-right" richColors theme="dark" /></body>
    </html>
  );
}
