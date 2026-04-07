'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { logout, me, type AuthMe } from '@/lib/auth-api';
import { usePathname, useRouter } from 'next/navigation';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthMe | null>(null);
  const [headerQuery, setHeaderQuery] = useState('');

  useEffect(() => {
    void me().then(setUser).catch(() => setUser(null));
  }, [pathname]);

  return (
    <header className="border-b border-blue-900/60 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-blue-100">
            MovieHub
          </Link>
          <div className="hidden md:block">
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const query = headerQuery.trim();
                if (query.length < 2) return;
                router.push(`/search?query=${encodeURIComponent(query)}`);
              }}
            >
              <input
                className="w-56 rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-xs text-slate-100"
                placeholder="Search movies... e.g. Dune"
                value={headerQuery}
                onChange={(event) => setHeaderQuery(event.target.value)}
              />
              <button type="submit" className="btn-primary px-3 py-2 text-xs">
                Search
              </button>
            </form>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="btn-ghost">
            Home
          </Link>
          <Link href="/search" className="btn-ghost">
            Search
          </Link>
          <Link href="/watchlist" className="btn-ghost">
            Watchlist
          </Link>
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-blue-800/70 bg-slate-900 px-3 py-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  {user.email[0]?.toUpperCase() ?? 'U'}
                </span>
                <span className="max-w-[180px] truncate text-xs text-slate-300">
                  {user.email}
                </span>
              </div>
              <button
                className="btn-ghost"
                onClick={() =>
                  void logout().then(() => {
                    setUser(null);
                    window.location.href = '/login';
                  })
                }
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
