import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Crown, Pencil, PlusCircle, Trash2 } from 'lucide-react'

import {
  createCollection,
  deleteCollection,
  fetchCollections,
  setCurrentYear,
  updateCollection
} from '../../api/collections'
import type { YearCollection } from '../../types'
import { CollectionForm } from '../../components/admin/CollectionForm'

export function AdminDashboard () {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['collections'], queryFn: fetchCollections })
  const [editingCollection, setEditingCollection] = useState<YearCollection | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collections'] })
      setIsCreating(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateCollection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collections'] })
      setEditingCollection(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collections'] })
    }
  })

  const currentYearMutation = useMutation({
    mutationFn: setCurrentYear,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collections'] })
    }
  })

  const handleCreate = async (collection: YearCollection) => {
    setError('')
    await createMutation.mutateAsync(collection).catch(err => {
      setError(err?.response?.data?.error || 'Unable to create collection')
    })
  }

  const handleUpdate = async (collection: YearCollection) => {
    setError('')
    await updateMutation.mutateAsync(collection).catch(err => {
      setError(err?.response?.data?.error || 'Unable to update collection')
    })
  }

  const handleDelete = async (year: number) => {
    setError('')
    if (!window.confirm(`Delete collection for ${year}?`)) return
    await deleteMutation.mutateAsync(year).catch(err => {
      setError(err?.response?.data?.error || 'Unable to delete collection')
    })
  }

  const handleCurrentYear = async (year: number) => {
    setError('')
    await currentYearMutation.mutateAsync(year).catch(err => {
      setError(err?.response?.data?.error || 'Unable to update current year')
    })
  }

  const sortedCollections = useMemo(() => data?.collections ?? [], [data])

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/50">
          <Crown className="h-4 w-4 text-highlight" /> Annual curator dashboard
        </div>
        <h1 className="font-display text-3xl font-semibold">
          Manage {sortedCollections.length} curated year{sortedCollections.length === 1 ? '' : 's'}
        </h1>
        <p className="max-w-2xl text-sm text-white/60">
          Add new annual lists, enrich album metadata via Spotify, and keep the spotlight year up to date. All changes are
          instantly reflected on the public site.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => {
            setEditingCollection(null)
            setIsCreating(true)
          }}
          className="inline-flex items-center gap-2 rounded-full bg-highlight/90 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-night transition hover:bg-highlight"
        >
          <PlusCircle className="h-4 w-4" /> New collection
        </button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <section className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-white/60">Loading collections…</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedCollections.map(collection => (
              <motion.article
                key={collection.year}
                layout
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-accent/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accentSoft">
                      {collection.year}
                    </span>
                    {data?.currentYear === collection.year ? (
                      <span className="rounded-full bg-highlight/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-highlight">
                        Current spotlight
                      </span>
                    ) : null}
                  </div>
                  <h2 className="font-display text-xl">{collection.title}</h2>
                  <p className="max-w-xl text-sm text-white/60">{collection.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCurrentYear(collection.year)}
                    disabled={currentYearMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-highlight hover:text-highlight disabled:opacity-60"
                  >
                    <Calendar className="h-4 w-4" /> Make current
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setEditingCollection(collection)
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-highlight hover:text-highlight"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(collection.year)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-red-300 transition hover:border-red-400 hover:text-red-300 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence mode="popLayout">
        {isCreating ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <CollectionForm
              mode="create"
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </motion.div>
        ) : null}

        {editingCollection ? (
          <motion.div
            key={editingCollection.year}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <CollectionForm
              mode="edit"
              initialCollection={editingCollection}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCollection(null)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
