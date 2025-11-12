import { api } from './client'
import type { Album, CollectionSummary, YearCollection } from '../types'

export async function fetchCollections () {
  const { data } = await api.get<{ collections: YearCollection[]; currentYear: number }>('/collections')
  return data
}

export async function fetchCollectionByYear (year: number) {
  const { data } = await api.get<YearCollection>(`/collections/${year}`)
  return data
}

export async function fetchCurrentCollection () {
  const { data } = await api.get<{ collection: YearCollection | null; year: number }>('/collections/current')
  return data
}

export async function createCollection (collection: YearCollection) {
  const { data } = await api.post<YearCollection>('/admin/collections', collection)
  return data
}

export async function updateCollection (collection: YearCollection) {
  const { data } = await api.put<YearCollection>(`/admin/collections/${collection.year}`, collection)
  return data
}

export async function deleteCollection (year: number) {
  await api.delete(`/admin/collections/${year}`)
}

export async function setCurrentYear (year: number) {
  const { data } = await api.patch<{ currentYear: number }>('/admin/current-year', { currentYear: year })
  return data
}

export type { Album, YearCollection, CollectionSummary }
