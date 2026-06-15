import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Masthead from '../components/layout/Masthead'
import WorkCard from '../components/ui/WorkCard'
import Lightbox from '../components/ui/Lightbox'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getWorks } from '../api/works'

// 首頁三大主圖：電繪、油畫、粉彩各一
const HIGHLIGHTS = [
  { key: 'ryu', label: '電繪插畫', en: 'Digital Art' },
  { key: 'oil', label: '油畫', en: 'Oil Painting' },
  { key: 'pastel', label: '粉彩', en: 'Pastel' },
]

// 各類預覽
const CATEGORIES = [
  { key: 'ryu', label: '電繪插畫', to: '/works' },
  { key: 'ip', label: 'IP 設計', to: '/works' },
  { key: 'poster', label: '海報設計', to: '/works' },
  { key: 'exhibition', label: '畢業展覽', to: '/exhibition' },
]

function SectionLabel({ children, accent = 'red' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-2 h-6 ${accent === 'red' ? 'bg-np-red' : 'bg-np-black'}`} />
      <h2 className="font-display font-bold text-2xl uppercase tracking-widest text-np-black">{children}</h2>
      <div className="flex-1 h-px bg-np-gray-400" />
    </div>
  )
}

export default function Home() {
  const [paintings, setPaintings] = useState([])
  const [packaging, setPackaging] = useState([])
  const [lightbox, setLightbox] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getWorks({ category: 'painting', limit: 100 }),
      getWorks({ category: 'packaging', limit: 10 }),
    ]).then(([p, k]) => {
      setPaintings(p.data.data)
      setPackaging(k.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const pick = (series) => paintings.find(w => w.series === series)
  const highlights = HIGHLIGHTS.map(h => ({ ...h, work: pick(h.key) })).filter(h => h.work)

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* 首屏：Masthead + 完整照片，100% 縮放下整張可見（扣掉 sticky header 高度） */}
      <section className="h-[calc(100svh-3.5rem)] flex flex-col">
        <Masthead />
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 min-h-0 w-full bg-np-gray-100 overflow-hidden group flex items-center justify-center py-3"
        >
          <img
            src="/hero.jpg"
            alt="林姿余 Nico"
            className="max-w-full max-h-full w-auto h-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-1000"
            onError={e => { e.target.style.display = 'none' }}
          />
        </motion.div>
        {/* 下滑提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col items-center gap-1 py-3 border-t-2 border-np-black"
        >
          <span className="text-[10px] font-sans-tc text-np-gray-400 tracking-widest uppercase">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="text-np-red text-lg leading-none"
          >↓</motion.span>
        </motion.div>
      </section>

      {/* 介紹文字（下滑後，報紙圖說風格） */}
      <div className="border-b-2 border-np-black">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 px-2 md:px-6 py-8 md:border-r-2 border-np-black">
            <p className="text-[10px] font-sans-tc text-np-red tracking-widest uppercase mb-2">About Me</p>
            <p className="font-serif-tc text-np-gray-700 text-base md:text-lg leading-loose">
              您好，我是 <span className="text-np-black font-bold">Nico</span>，畢業於嶺東科大時尚經營系。兼具商業行銷思維與豐富的視覺企劃實力，是一位具備跨界解決問題能力的設計人。
            </p>
            <Link to="/about" className="inline-block mt-4 text-sm font-sans-tc text-np-red hover:underline underline-offset-4">
              閱讀完整介紹 →
            </Link>
          </div>
          <div className="px-2 md:px-6 py-8 flex flex-col gap-3 justify-center">
            <p className="text-[10px] font-sans-tc text-np-gray-400 tracking-widest uppercase">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {['包裝設計', '平面設計', 'IP 設計', '行銷企劃', '影音剪輯'].map(t => (
                <span key={t} className="text-[11px] font-sans-tc text-np-gray-700 border border-np-gray-400 px-2 py-1">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 三大主圖：電繪 / 油畫 / 粉彩 */}
      <div className="py-10 border-b-2 border-np-black">
        <SectionLabel>Selected Works</SectionLabel>
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map(({ label, en, work }, i) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className="font-display font-bold text-sm uppercase tracking-widest text-np-red mb-1">{en}</p>
                <p className="font-serif-tc text-np-gray-700 text-xs mb-2">{label}</p>
                <WorkCard work={work} index={i} onClick={setLightbox} />
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-6 text-right">
          <Link to="/works" className="text-sm font-sans-tc text-np-gray-700 hover:text-np-red transition-colors">查看全部作品 →</Link>
        </div>
      </div>

      {/* 各類預覽 */}
      <div className="py-10 border-b-2 border-np-black">
        <SectionLabel accent="black">Categories 各類作品</SectionLabel>
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(({ key, label, to }, i) => {
              const work = pick(key)
              if (!work) return null
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link to={to} className="group block relative overflow-hidden border border-np-gray-100">
                    <div className="aspect-[4/5] overflow-hidden bg-np-gray-100">
                      <img src={work.coverImage.url} alt={label} loading="lazy"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                    </div>
                    <div className="absolute inset-0 bg-np-black/30 group-hover:bg-np-black/50 transition-colors flex items-center justify-center">
                      <span className="font-display font-bold text-np-white text-lg tracking-wider text-center px-2">{label}</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* 包裝設計 */}
      <div className="py-10">
        <SectionLabel>Packaging Design</SectionLabel>
        {!loading && packaging.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packaging.slice(0, 2).map((pkg, i) => (
              <motion.button
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative w-full overflow-hidden group cursor-pointer"
                onClick={() => setLightbox(pkg)}
              >
                <img src={pkg.coverImage.url} alt={pkg.title}
                  className="w-full h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-np-black/80 to-transparent p-4 text-left">
                  <p className="font-display text-np-white font-bold text-lg">{pkg.title}</p>
                  <p className="font-sans-tc text-np-gray-100 text-xs mt-0.5">{pkg.year}</p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : !loading && (
          <p className="text-np-gray-400 font-sans-tc text-sm py-8 text-center">作品即將上線</p>
        )}
        <div className="mt-6 text-right">
          <Link to="/packaging" className="text-sm font-sans-tc text-np-gray-700 hover:text-np-red transition-colors">查看包裝設計 →</Link>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.coverImage.url}
          alt={lightbox.title}
          title={lightbox.title}
          subtitle={[lightbox.year, lightbox.medium].filter(Boolean).join(' · ')}
          description={lightbox.description}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
