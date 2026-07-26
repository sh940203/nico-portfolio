import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import WorkCard from '../components/ui/WorkCard'
import Lightbox from '../components/ui/Lightbox'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getWorks } from '../api/works'

const GROUPS = [
  { level: 'university', label: '大學畢業展覽', en: 'University', desc: '嶺東科技大學 · 青蘋果作品展 — 主視覺・三聯畫・周邊' },
  { level: 'highschool', label: '高中畢業展覽', en: 'High School', desc: '明道中學 美工科 · 美二2 肖像畫作品展' },
  { level: '__other__',  label: '其他', en: 'Others', desc: '尚未標註階段的展覽作品' },
]

function GroupHeader({ g, count }) {
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
          <h2 className="font-display font-black text-2xl md:text-4xl uppercase tracking-tight text-np-black">{g.en}</h2>
          <span className="font-serif-tc text-np-black text-lg font-bold">{g.label}</span>
          <span className="font-sans-tc text-np-gray-400 text-xs">{count} 件</span>
        </div>
        <p className="font-sans-tc text-np-gray-400 text-xs mt-1">{g.desc}</p>
      </div>
    </motion.div>
  )
}

export default function Exhibition() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(null)

  useEffect(() => {
    getWorks({ category: 'painting', series: 'exhibition', limit: 100 })
      .then(res => setWorks(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  // 依群組順序攤平；「其他」收納未標註 level 的作品，避免被靜默隱藏
  const knownLevels = new Set(['university', 'highschool'])
  const worksOf = (g) => g.level === '__other__'
    ? works.filter(w => !knownLevels.has(w.level))
    : works.filter(w => w.level === g.level)
  const ordered = GROUPS.flatMap(worksOf)
  const current = idx !== null ? ordered[idx] : null

  return (
    <div className="w-full px-4 md:px-10 py-8">
      <div className="border-b-4 border-np-black pb-4 mb-6">
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tight text-np-black leading-none">Graduation</h1>
        <p className="font-serif-tc text-np-black text-lg font-bold mt-2">畢業展覽</p>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="font-serif-tc text-np-gray-700 text-sm md:text-base leading-loose max-w-3xl mb-4"
      >
        從高中到大學，持續以美術專業參與畢業展覽企劃。大學期間擔任美編與核心幹部，主導主視覺、IP 角色、周邊與大型輸出設計，建立完整的視覺識別。
      </motion.p>

      {loading ? (
        <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
      ) : (
        GROUPS.map(g => {
          const list = worksOf(g)
          if (list.length === 0) return null
          return (
            <section key={g.level}>
              <GroupHeader g={g} count={list.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {list.map((w) => (
                  <WorkCard key={w.id} work={w} index={ordered.indexOf(w)} onClick={() => setIdx(ordered.indexOf(w))} />
                ))}
              </div>
            </section>
          )
        })
      )}

      {current && (
        <Lightbox
          src={current.coverImage.url}
          alt={current.title}
          onClose={() => setIdx(null)}
          title={current.title}
          subtitle={[current.year, current.medium].filter(Boolean).join(' · ')}
          description={current.description}
          onPrev={idx > 0 ? () => setIdx(i => i - 1) : null}
          onNext={idx < ordered.length - 1 ? () => setIdx(i => i + 1) : null}
        />
      )}
    </div>
  )
}
