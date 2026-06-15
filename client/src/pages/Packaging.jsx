import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Lightbox from '../components/ui/Lightbox'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getWorks } from '../api/works'

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

export default function Packaging() {
  const [works, setWorks] = useState([])
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    getWorks({ category: 'packaging' })
      .then(res => setWorks(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  const navigate = (dir) => {
    setDirection(dir)
    setCurrent(c => Math.max(0, Math.min(works.length - 1, c + dir)))
  }

  const work = works[current]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="border-b-4 border-np-black pb-4 mb-8">
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tight text-np-black">Packaging Design</h1>
        <p className="font-sans-tc text-np-gray-400 text-sm mt-1">包裝設計作品集</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
      ) : works.length === 0 ? (
        <p className="text-np-gray-400 font-sans-tc text-center py-16">作品即將上線</p>
      ) : (
        <>
          {/* Main viewer */}
          <div className="relative overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={work.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
              >
                {/* Cover image */}
                <div className="bg-np-gray-100 overflow-hidden">
                  <img
                    src={work.coverImage.url}
                    alt={work.title}
                    className="w-full object-contain max-h-[60vh]"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-4">
                  <h2 className="font-display font-bold text-2xl text-np-black">{work.title}</h2>
                  <p className="font-sans-tc text-np-gray-400 text-sm">{work.year}{work.medium && ` · ${work.medium}`}</p>
                  {work.description && (
                    <p className="font-serif-tc text-np-gray-700 text-sm leading-relaxed">{work.description}</p>
                  )}

                  {/* Detail images */}
                  {work.detailImages?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest mb-2">細節圖</p>
                      <div className="grid grid-cols-3 gap-2">
                        {work.detailImages.map((img, i) => (
                          <button key={i} onClick={() => setLightbox(img)} className="overflow-hidden bg-np-gray-100">
                            <img
                              src={img.url}
                              alt={img.caption || `細節 ${i + 1}`}
                              className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 border-t-2 border-np-black pt-4">
            <button
              onClick={() => navigate(-1)}
              disabled={current === 0}
              className="font-display text-2xl text-np-black disabled:text-np-gray-400 hover:text-np-red transition-colors"
            >
              ← 上一件
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {works.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-np-red' : 'bg-np-gray-400'}`}
                  aria-label={`作品 ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(1)}
              disabled={current === works.length - 1}
              className="font-display text-2xl text-np-black disabled:text-np-gray-400 hover:text-np-red transition-colors"
            >
              下一件 →
            </button>
          </div>
        </>
      )}

      {lightbox && (
        <Lightbox
          src={lightbox.url}
          alt={lightbox.caption || ''}
          onClose={() => setLightbox(null)}
          title={lightbox.caption}
        />
      )}
    </div>
  )
}
