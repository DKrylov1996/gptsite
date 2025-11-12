export interface Album {
  rank: number
  title: string
  artist: string
  spotifyAlbumId?: string | null
  spotifyUrl?: string | null
  coverUrl?: string | null
  releaseDate?: string | null
  label?: string | null
  genres?: string[]
  reviewSnippet?: string | null
}

export interface YearCollection {
  year: number
  title: string
  description?: string | null
  albums: Album[]
}

export interface CollectionSummary {
  year: number
  title: string
  description?: string | null
}
