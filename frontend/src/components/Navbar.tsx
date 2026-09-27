'use client';

import Link from 'next/link';
import { Swords } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#1D1616]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20 font-bold">
            <Swords className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-tight">
              Drafter
            </span>
            <span className="text-[11px] font-medium text-slate-400 leading-none">
              Maen yang bener woe
            </span>
          </div>
        </Link>


      </div>
    </header>
  );
}
