import { motion } from 'framer-motion'
import TiltCard from './TiltCard'
import useHasHover from '../../hooks/useHasHover'
import { thumbUrl } from '../../lib/img'

export default function WorkCard({ work, onClick, index = 0 }) {
  const hasHover = useHasHover()

  // ── 觸控裝置：捲動驅動（彩色、標題常駐、淡入+縮放、輕點開大圖）──
  if (!hasHover) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6, delay: (index % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onClick(work)}
        aria-label={`查看 ${work.title}`}
        className="group w-full block text-left border border-np-gray-100 bg-np-white overflow-hidden"
      >
        <div className="relative overflow-hidden aspect-square bg-np-gray-100">
          <img
            src={thumbUrl(work.coverImage.url)}
            alt={work.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          {work.isFeatured && (
            <span className="absolute top-2 left-2 bg-np-red text-np-white text-[10px] font-sans-tc px-1.5 py-0.5">精選</span>
          )}
        </div>
        {/* 標題常駐於圖片下方 */}
        <div className="px-2.5 py-2 border-t border-np-gray-100">
          <p className="font-display font-bold text-[13px] leading-tight text-np-black truncate">{work.title}</p>
          {(work.year || work.medium) && (
            <p className="text-[11px] font-sans-tc text-np-gray-400 mt-0.5 truncate">
              {[work.year, work.medium].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </motion.button>
    )
  }

  // ── 桌機：hover 灰階→彩色、3D 傾斜、浮現標題 ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard
        ariaLabel={`查看 ${work.title}`}
        onClick={() => onClick(work)}
        className="group w-full block overflow-hidden border border-np-gray-100 bg-np-white shadow-sm hover:shadow-xl transition-shadow duration-300"
      >
        <div className="relative overflow-hidden aspect-square bg-np-gray-100">
          <img
            src={thumbUrl(work.coverImage.url)}
            alt={work.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out [will-change:filter,transform]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-np-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-3 text-left translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <p className="font-display text-sm font-bold leading-tight text-np-white">{work.title}</p>
              {work.year && <p className="text-xs font-sans-tc text-np-gray-100 mt-0.5">{work.year}{work.medium && ` · ${work.medium}`}</p>}
            </div>
          </div>
          {work.isFeatured && (
            <span className="absolute top-2 left-2 bg-np-red text-np-white text-[10px] font-sans-tc px-1.5 py-0.5 z-10">精選</span>
          )}
        </div>
      </TiltCard>
    </motion.div>
  )
}
