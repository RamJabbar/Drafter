import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Drafter',
  description: 'Main yang bener woe',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#0F0E0E] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-[#1D1616]/50 py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4">
            Isinya orang Jago semua
          </div>
        </footer>
      </body>
    </html>
  );
}
