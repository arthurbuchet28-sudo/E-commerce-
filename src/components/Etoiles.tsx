import { motion } from 'framer-motion';

export function Etoiles({ nombre }: { nombre: 1 | 2 | 3 }) {
  return (
    <div className="flex justify-center gap-2" role="img" aria-label={`${nombre} étoile${nombre > 1 ? 's' : ''} sur 3`}>
      {[1, 2, 3].map((i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-14 w-14 ${i === 2 ? '-mt-3 h-16 w-16' : ''}`}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.4 + i * 0.25 }}
          aria-hidden
        >
          <path
            d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
            className={i <= nombre ? 'fill-amber-400 stroke-amber-600' : 'fill-slate-200 stroke-slate-300 dark:fill-slate-700 dark:stroke-slate-600'}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </motion.svg>
      ))}
    </div>
  );
}
