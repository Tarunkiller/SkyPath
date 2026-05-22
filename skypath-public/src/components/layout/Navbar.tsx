'use client';

import Link from 'next/link';
import { useUserStore } from '../../store/userStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const user = useUserStore((state) => state.user);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900">SkyPath</Link>
        <nav className="flex items-center gap-3">
          <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-slate-900">Search</Link>
          <Link href="/bookings" className="text-sm font-medium text-slate-600 hover:text-slate-900">My Bookings</Link>
          {user ? (
            <Link href="/bookings" className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Dashboard</Link>
          ) : (
            <Link href="/login" className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
