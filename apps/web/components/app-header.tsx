import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="border-b border-blue-900/60 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-blue-100">
          MovieHub
        </Link>
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
        </nav>
      </div>
    </header>
  );
}
