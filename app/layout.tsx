import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saarthi AI — Copilot & Advocate for Gig Workers',
  description: 'AI-powered assistant for gig and informal workers: earnings tracking, welfare schemes, emergency safety, and dispute drafting.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-yellow-400 focus:text-black focus:font-bold focus:rounded-md focus:shadow-xl">
          Skip to main content
        </a>
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
