import { motion } from 'framer-motion'
import { PlayIcon } from 'lucide-react'

import type { Album } from '../types'

interface Props {
  album: Album
}

export function AlbumCard ({ album }: Props) {
  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl bg-night/70 ring-1 ring-white/10 shadow-glow"
    >
      <div className="relative h-64 w-full overflow-hidden">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={`${album.title} album cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/20 text-5xl font-bold text-accent">
            {album.title.slice(0, 1)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" />
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accentSoft">
            #{album.rank}
          </span>
          {album.genres?.length ? (
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">
              {album.genres.slice(0, 2).join(' • ')}
            </span>
          ) : null}
        </div>
        <div>
          <h3 className="font-display text-2xl font-semibold text-white">{album.title}</h3>
          <p className="text-sm text-white/70">{album.artist}</p>
        </div>
        {album.reviewSnippet ? (
          <p className="text-sm text-white/60">{album.reviewSnippet}</p>
        ) : null}
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{album.releaseDate}</span>
          <span>{album.label}</span>
        </div>
        {album.spotifyUrl ? (
          <a
            href={album.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-highlight"
          >
            <PlayIcon className="h-4 w-4" /> Listen on Spotify
          </a>
        ) : null}
      </div>
    </motion.article>
  )
}
