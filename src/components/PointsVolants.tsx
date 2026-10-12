import { AnimatePresence, motion } from 'framer-motion';

export type Envol = { id: number; points: number; de: { x: number; y: number }; vers: { x: number; y: number } };

/** Les points s'envolent du bouton choisi vers le compteur de score. */
export function PointsVolants({ envols, onFini }: { envols: Envol[]; onFini: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      <AnimatePresence>
        {envols.map((e) => (
          <motion.div
            key={e.id}
            className="absolute left-0 top-0 font-display text-3xl font-extrabold text-amber-400 drop-shadow-[0_2px_0_rgba(76,29,149,0.9)]"
            initial={{ x: e.de.x, y: e.de.y, scale: 0.6, opacity: 0 }}
            animate={{
              x: [e.de.x, e.de.x, e.vers.x],
              y: [e.de.y, e.de.y - 40, e.vers.y],
              scale: [0.6, 1.3, 0.7],
              opacity: [0, 1, 0.9],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.35, 1], ease: 'easeInOut' }}
            onAnimationComplete={() => onFini(e.id)}
            style={{ translateX: '-50%', translateY: '-50%' }}
          >
            +{e.points}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
