import { motion } from 'framer-motion'

interface Props {
  years: number[]
  currentYear: number
  onSelect: (year: number) => void
}

export function YearNavigator ({ years, currentYear, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {years.map(year => (
        <motion.button
          key={year}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(year)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            year === currentYear
              ? 'bg-accent text-white shadow-glow'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          {year}
        </motion.button>
      ))}
    </div>
  )
}
