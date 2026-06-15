import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'

// Apple 官網式平滑慣性捲動（參考江婉綾履歷的做法）
// - 桌機滑鼠/觸控板：Lenis 慣性平滑
// - 手機觸控：原生捲動（手感最佳），scroll-linked 動畫照常
// - prefers-reduced-motion：完全停用
export default function SmoothScroll({ children }) {
  const location = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.2,
    })
    window.__lenis = lenis

    let raf = 0
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)

    const onClick = (e) => {
      const anchor = e.target?.closest?.('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -40 }) }
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      window.__lenis = undefined
      lenis.destroy()
    }
  }, [])

  // 換頁時回到頂部（平滑）
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
  }, [location.pathname])

  return children
}
