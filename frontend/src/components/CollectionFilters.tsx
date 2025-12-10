import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'

interface Props {
  search: string
  setSearch: (value: string) => void
  sort: 'rank' | 'title' | 'artist'
  setSort: (value: 'rank' | 'title' | 'artist') => void
  genres: string[]
  activeGenre: string
  setActiveGenre: (genre: string) => void
}

export function CollectionFilters ({ search, setSearch, sort, setSort, genres, activeGenre, setActiveGenre }: Props) {
  const sortOptions = useMemo(
    () => [
      { value: 'rank' as const, label: 'По номеру в списке' },
      { value: 'title' as const, label: 'Название альбома' },
      { value: 'artist' as const, label: 'Исполнитель' }
    ],
    []
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/50">
        <Filter className="h-4 w-4" /> Сортировка
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Поиск по названию альбома, исполнителю"
          className="w-full rounded-2xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex shrink-0 gap-2">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSort(option.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                sort === option.value ? 'bg-accent text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {/*<button*/}
        {/*  onClick={() => setActiveGenre('')}*/}
        {/*  className={`rounded-full px-3 py-1 text-xs font-medium transition ${*/}
        {/*    activeGenre === '' ? 'bg-highlight/80 text-night' : 'bg-white/10 text-white/60 hover:bg-white/20'*/}
        {/*  }`}*/}
        {/*>*/}
        {/*  All genres*/}
        {/*</button>*/}
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeGenre === genre ? 'bg-highlight/80 text-night' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </motion.section>
  )
}
