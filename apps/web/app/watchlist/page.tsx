import { MovieSearch } from '@/components/movie-search';

export const dynamic = 'force-dynamic';

export default function WatchlistPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Manage movie statuses for your demo profile.
      </p>
      <MovieSearch showSearch={false} />
    </div>
  );
}
