import { MovieSearch } from '@/components/movie-search';

export default function SearchPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Search</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Search TMDB movies and add them to your watchlist.
      </p>
      <MovieSearch showStatuses={false} />
    </div>
  );
}
