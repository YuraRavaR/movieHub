import { MovieSearch } from '@/components/movie-search';

const DEMO_USER_EMAIL = 'demo@moviehub.local';

export default function WatchlistPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Manage movie statuses for your demo profile.
      </p>
      <MovieSearch userEmail={DEMO_USER_EMAIL} showSearch={false} />
    </div>
  );
}
