import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import WorkCard from '../components/ui/WorkCard'
import Lightbox from '../components/ui/Lightbox'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getWorks } from '../api/works'
import { getSeries } from '../api/series'

// 畢業展覽已獨立成 /exhibition 頁，此頁不顯示
const EXCLUDED = ['exhibition']

function SeriesHeader({ s, count }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-end gap-4 mb-6 mt-16 first:mt-0"
    >
      <div className="w-2 h-10 bg-np-red flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="font-display font-black text-2xl md:text-4xl uppercase tracking-tight text-np-black">{s.en}</h2>
          <span className="font-serif-tc text-np-black text-lg font-bold">{s.label}</span>
          <span className="font-sans-tc text-np-gray-400 text-xs">{count} 件</span>
        </div>
        <p className="font-sans-tc text-np-gray-400 text-xs mt-1">{s.description}</p>
      </div>
    </motion.div>
  )
}

export default function Works() {
  const [works, setWorks] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    Promise.all([
      getWorks({ category: 'painting', limit: 100 }),
      getSeries('painting'),
    ])
      .then(([w, s]) => {
        setWorks(w.data.data)
        // 後台分類（依 display_order），排除已獨立的畢業展覽
        setSeries(s.data.data
          .filter(x => !EXCLUDED.includes(x.value))
          .map(x => ({ key: x.value, label: x.label, en: x.en, description: x.description })))
      })
      .finally(() => setLoading(false))
  }, [])

  // 分類群組 + 「其他」catch-all：未歸類或分類對不上（且非畢業展覽）的作品也要顯示，避免被靜默隱藏
  const knownKeys = new Set(series.map(s => s.key))
  const leftover = works.filter(w => w.series !== 'exhibition' && !knownKeys.has(w.series))
  const groups = leftover.length
    ? [...series, { key: '__other__', label: '其他', en: 'Others', description: '尚未歸類的作品' }]
    : series
  const worksOf = (g) => g.key === '__other__' ? leftover : works.filter(w => w.series === g.key)

  const ordered = groups.flatMap(worksOf)
  const currentWork = lightboxIndex !== null ? ordered[lightboxIndex] : null

  return (
    <div className="w-full px-4 md:px-10 py-8">
      <div className="border-b-4 border-np-black pb-4 mb-2">
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tight text-np-black leading-none">Works</h1>
        <p className="font-sans-tc text-np-gray-400 text-sm mt-2">作品集 · 繪畫 · IP · 海報設計</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
      ) : (
        groups.map(s => {
          const list = worksOf(s)
          if (list.length === 0) return null
          return (
            <section key={s.key}>
              <SeriesHeader s={s} count={list.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {list.map((w) => (
                  <WorkCard
                    key={w.id}
                    work={w}
                    index={ordered.indexOf(w)}
                    onClick={() => setLightboxIndex(ordered.indexOf(w))}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}

      {currentWork && (
        <Lightbox
          src={currentWork.coverImage.url}
          alt={currentWork.title}
          onClose={() => setLightboxIndex(null)}
          title={currentWork.title}
          subtitle={[currentWork.year, currentWork.medium].filter(Boolean).join(' · ')}
          description={currentWork.description}
          onPrev={lightboxIndex > 0 ? () => setLightboxIndex(i => i - 1) : null}
          onNext={lightboxIndex < ordered.length - 1 ? () => setLightboxIndex(i => i + 1) : null}
        />
      )}
    </div>
  )
}
