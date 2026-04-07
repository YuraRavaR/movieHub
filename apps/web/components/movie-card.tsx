'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { MoviePoster } from './movie-poster';

type MovieCardProps = {
  title: string;
  subtitle?: string;
  topMeta?: string;
  description?: string;
  genres?: string[];
  voteAverage?: number | null;
  posterPath?: string | null;
  actions?: ReactNode;
};

export function MovieCard({
  title,
  subtitle,
  topMeta,
  description,
  genres = [],
  voteAverage = null,
  posterPath,
  actions,
}: MovieCardProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldClamp = useMemo(() => (description?.length ?? 0) > 110, [description]);

  return (
    <li className="flex min-h-32 items-start justify-between gap-3 rounded-xl border border-blue-900/60 bg-slate-900 p-3">
      <div className="flex items-start gap-3">
        <MoviePoster title={title} posterPath={posterPath} size="md" />
        <div className="flex max-w-xl flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="text-base font-bold leading-5 text-blue-100">{title}</div>
            {topMeta ? (
              <span className="rounded-full border border-blue-800/70 bg-slate-950 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                {topMeta}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <div className="mt-1 text-xs font-medium text-slate-400">{subtitle}</div>
          ) : null}
          {voteAverage !== null ? (
            <div className="mt-1 text-xs text-slate-300">
              Average rating: {voteAverage}/10
            </div>
          ) : null}
          {genres.length > 0 ? (
            <div className="mt-1 text-xs text-blue-300">
              {genres.join(', ')}
            </div>
          ) : null}
          {description ? (
            <p
              className={`mt-2 max-w-xl text-xs leading-5 text-slate-300 ${
                shouldClamp && !expanded ? 'desc-clamp-2' : ''
              }`}
            >
              {description}
            </p>
          ) : null}
          {description && shouldClamp ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 text-xs font-medium text-blue-300 hover:text-blue-200"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-col gap-2">{actions}</div> : null}
    </li>
  );
}
