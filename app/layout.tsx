import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ScribbleShare - Free Collaborative Note-Making App",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  description:
    "A free and collaborative online note-making app for real-time drawing and sharing.",
  keywords:
    "collaborative drawing, online whiteboard, note-making, real-time collaboration",
  authors: [{ name: "Dermot Flanagan" }],
  openGraph: {
    title: "ScribbleShare - Free Collaborative Note-Making App",
    description:
      "A free and collaborative online note-making app for real-time drawing and sharing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
