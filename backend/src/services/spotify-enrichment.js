import fetch from 'node-fetch'

let cachedToken = null
let tokenExpiry = 0

async function getAccessToken () {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    console.warn('Spotify token request failed', await response.text())
    return null
  }

  const data = await response.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken
}

async function fetchAlbum (albumId) {
  const token = await getAccessToken()
  if (!token) {
    return null
  }

  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    console.warn('Spotify album fetch failed', await response.text())
    return null
  }

  return response.json()
}

export async function enrichAlbumsWithSpotify (collection) {
  const albums = await Promise.all(collection.albums.map(async album => {
    if (!album.spotifyAlbumId) {
      return {
        ...album,
        spotifyUrl: album.spotifyUrl || null,
        coverUrl: album.coverUrl || null
      }
    }

    const spotifyData = await fetchAlbum(album.spotifyAlbumId)
    if (!spotifyData) {
      return {
        ...album,
        spotifyUrl: album.spotifyUrl || (album.spotifyAlbumId ? `https://open.spotify.com/album/${album.spotifyAlbumId}` : null)
      }
    }

    const primaryImage = spotifyData.images?.[0]?.url || album.coverUrl || null
    const spotifyUrl = spotifyData.external_urls?.spotify || album.spotifyUrl || null
    return {
      ...album,
      title: album.title || spotifyData.name,
      artist: album.artist || spotifyData.artists?.map(artist => artist.name).join(', '),
      coverUrl: primaryImage,
      spotifyUrl,
      releaseDate: album.releaseDate || spotifyData.release_date,
      label: album.label || spotifyData.label,
      genres: album.genres?.length ? album.genres : spotifyData.genres || [],
      spotifyAlbumId: album.spotifyAlbumId
    }
  }))

  return { ...collection, albums }
}
