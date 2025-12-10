import { FormEvent, useMemo, useState } from 'react'
import { Plus, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Album, YearCollection } from '../../types'

interface Props {
  mode: 'create' | 'edit'
  initialCollection?: YearCollection
  onSubmit: (collection: YearCollection) => Promise<void> | void
  onCancel?: () => void
}

const emptyAlbum = (rank: number): Album => ({
  rank,
  title: '',
  artist: '',
  spotifyAlbumId: '',
  spotifyUrl: '',
  coverUrl: '',
  releaseDate: '',
  label: '',
  genres: [],
  reviewSnippet: ''
})

function CollectionForm ({ mode, initialCollection, onSubmit, onCancel }: Props) {
  const [collection, setCollection] = useState<YearCollection>(() => {
    if (initialCollection) {
      return JSON.parse(JSON.stringify(initialCollection))
    }
    return {
      year: new Date().getFullYear(),
      title: 'Top 10 Albums of ' + new Date().getFullYear(),
      description: '',
      albums: Array.from({ length: 10 }, (_, index) => emptyAlbum(index + 1))
    }
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAlbumChange = (index: number, field: keyof Album, value: string) => {
    setCollection(prev => {
      const albums = [...prev.albums]
      const nextAlbum = { ...albums[index] }
      if (field === 'genres') {
        nextAlbum.genres = value.split(',').map(item => item.trim()).filter(Boolean)
      } else {
        // @ts-ignore
          nextAlbum[field] = value
      }
      albums[index] = nextAlbum
      return { ...prev, albums }
    })
  }

  const handleBasicChange = (field: keyof YearCollection, value: string) => {
    setCollection(prev => ({ ...prev, [field]: field === 'year' ? Number(value) : value }))
  }

  const addAlbumRow = () => {
    setCollection(prev => {
      if (prev.albums.length >= 10) {
        return prev
      }
      const rank = prev.albums.length + 1
      return { ...prev, albums: [...prev.albums, emptyAlbum(rank)] }
    })
  }

  const canAddAlbum = collection.albums.length < 10

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (!collection.albums.length) {
        throw new Error('Add at least one album to the collection')
      }
      const normalized: YearCollection = {
        ...collection,
        albums: collection.albums.map((album, index) => ({
          ...album,
          rank: index + 1,
          genres: album.genres ?? []
        }))
      }
      await onSubmit(normalized)
    } catch (err: any) {
      setError(err?.message || 'Unable to save collection')
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = useMemo(() => (mode === 'create' ? 'Create Collection' : `Edit ${collection.year}`), [mode, collection.year])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-white/60">Manage year metadata and album lineup. Genres are comma separated.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          Year
          <input
            value={collection.year}
            onChange={event => handleBasicChange('year', event.target.value)}
            type="number"
            min="1900"
            className="rounded-2xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Collection title
          <input
            value={collection.title}
            onChange={event => handleBasicChange('title', event.target.value)}
            className="rounded-2xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm md:col-span-2">
          Description
          <textarea
            value={collection.description ?? ''}
            onChange={event => handleBasicChange('description', event.target.value)}
            rows={3}
            className="rounded-2xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">Albums ({collection.albums.length})</h3>
        <button
          type="button"
          onClick={addAlbumRow}
          disabled={!canAddAlbum}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-highlight hover:text-highlight disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add album
        </button>
        {!canAddAlbum ? <span className="text-xs uppercase tracking-[0.2em] text-white/40">Top 10 limit reached</span> : null}
      </div>

      <div className="flex flex-col gap-6">
        {collection.albums.map((album, index) => (
          <motion.fieldset
            key={index}
            layout
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <legend className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/50">
              <span>Album #{index + 1}</span>
            </legend>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Album title
                <input
                  value={album.title}
                  onChange={event => handleAlbumChange(index, 'title', event.target.value)}
                  required
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Artist
                <input
                  value={album.artist}
                  onChange={event => handleAlbumChange(index, 'artist', event.target.value)}
                  required
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Spotify Album ID
                <input
                  value={album.spotifyAlbumId ?? ''}
                  onChange={event => handleAlbumChange(index, 'spotifyAlbumId', event.target.value)}
                  placeholder="Optional"
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Spotify URL
                <input
                  value={album.spotifyUrl ?? ''}
                  onChange={event => handleAlbumChange(index, 'spotifyUrl', event.target.value)}
                  placeholder="https://"
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Cover image URL
                <input
                  value={album.coverUrl ?? ''}
                  onChange={event => handleAlbumChange(index, 'coverUrl', event.target.value)}
                  placeholder="https://"
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Release date
                <input
                  value={album.releaseDate ?? ''}
                  onChange={event => handleAlbumChange(index, 'releaseDate', event.target.value)}
                  placeholder="2024-01-01"
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Label
                <input
                  value={album.label ?? ''}
                  onChange={event => handleAlbumChange(index, 'label', event.target.value)}
                  placeholder="Record label"
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Genres
                <input
                  value={album.genres?.join(', ') ?? ''}
                  onChange={event => handleAlbumChange(index, 'genres', event.target.value)}
                  placeholder="Indie, Dream Pop"
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                Review snippet
                <textarea
                  value={album.reviewSnippet ?? ''}
                  onChange={event => handleAlbumChange(index, 'reviewSnippet', event.target.value)}
                  rows={2}
                  className="rounded-2xl border border-white/10 bg-night/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            </div>
          </motion.fieldset>
        ))}
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {isSubmitting ? 'Saving…' : 'Save collection'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-highlight hover:text-highlight"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default CollectionForm
