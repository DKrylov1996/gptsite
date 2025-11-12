import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Props {
  year: number
  title: string
  description?: string | null
}

export function CollectionHero ({ year, title, description }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-accent/40 via-night to-night p-10 ring-1 ring-white/10"
    >
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-highlight/20 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-accentSoft">
          <Sparkles className="h-4 w-4" /> Spotlight Selection {year}
        </div>
        <div>
          <h1 className="font-display text-5xl font-semibold leading-tight text-white md:text-6xl">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-3xl text-lg text-white/70">{description}</p>
          ) : null}
        </div>
        <p className="text-sm text-white/50">
          Explore the definitive Top 10 albums curated for passionate listeners. Swipe through years, filter by vibe, and dive
          straight into Spotify to experience every record instantly.
        </p>
      </div>
    </motion.section>
  )
}
