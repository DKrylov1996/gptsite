import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { fetchCollections } from '../api/collections'
import { AlbumCard } from '../components/AlbumCard'
import { CollectionFilters } from '../components/CollectionFilters'
import { CollectionHero } from '../components/CollectionHero'
import { YearNavigator } from '../components/YearNavigator'
import type { Album } from '../types'

export function HomePage () {
  const { data, isLoading } = useQuery({ queryKey: ['collections'], queryFn: fetchCollections })
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'rank' | 'title' | 'artist'>('rank')
  const [activeGenre, setActiveGenre] = useState('')

  const currentCollection = useMemo(() => {
    if (!data) return null
    const year = selectedYear ?? data.currentYear
    return data.collections.find(collection => collection.year === year) ?? data.collections[0]
  }, [data, selectedYear])

  const genres = useMemo(() => {
    if (!currentCollection) return []
    const genreSet = new Set<string>()
    currentCollection.albums.forEach(album => album.genres?.forEach(genre => genreSet.add(genre)))
    return Array.from(genreSet).sort()
  }, [currentCollection])

  const filteredAlbums = useMemo(() => {
    if (!currentCollection) return []

    const matchesSearch = (album: Album) => {
      const haystack = `${album.title} ${album.artist} ${album.label ?? ''}`.toLowerCase()
      return haystack.includes(search.toLowerCase())
    }

    const matchesGenre = (album: Album) => {
      if (!activeGenre) return true
      return album.genres?.includes(activeGenre)
    }

    const sorted = [...currentCollection.albums]
      .filter(album => matchesSearch(album) && matchesGenre(album))
      .sort((a, b) => {
        if (sort === 'rank') return a.rank - b.rank
        if (sort === 'title') return a.title.localeCompare(b.title)
        return a.artist.localeCompare(b.artist)
      })

    return sorted
  }, [currentCollection, search, activeGenre, sort])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    )
  }

  if (!data || !currentCollection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night text-white/60">
        Unable to load collections.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night pb-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 md:px-10">
        <header className="flex flex-col gap-6">
          <CollectionHero year={currentCollection.year} title={currentCollection.title} description={currentCollection.description} />
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Навигация по годам</span>
            <YearNavigator
              years={data.collections.map(collection => collection.year)}
              currentYear={currentCollection.year}
              onSelect={setSelectedYear}
            />
          </div>
        </header>

        <CollectionFilters
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
          genres={genres}
          activeGenre={activeGenre}
          setActiveGenre={setActiveGenre}
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAlbums.map(album => (
              <motion.div
                key={`${album.rank}-${album.title}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AlbumCard album={album} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}
