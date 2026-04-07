import Image from 'next/image';

type MoviePosterProps = {
  title: string;
  posterPath: string | null | undefined;
  size?: 'sm' | 'md';
};

export function MoviePoster({ title, posterPath, size = 'md' }: MoviePosterProps) {
  const sizes = size === 'sm' ? 'h-20 w-14' : 'h-28 w-20';

  return (
    <div
      className={`${sizes} overflow-hidden rounded-md border border-blue-900/60 bg-slate-800`}
    >
      {posterPath ? (
        <Image
          src={`https://image.tmdb.org/t/p/w185${posterPath}`}
          alt={title}
          width={80}
          height={112}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
          <span className="text-xl">🎬</span>
          <span className="px-1 text-[9px] font-medium leading-3 text-blue-200">
            No poster
          </span>
        </div>
      )}
    </div>
  );
}
