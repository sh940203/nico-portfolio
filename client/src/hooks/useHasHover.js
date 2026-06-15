import { useEffect, useState } from 'react'

// 偵測裝置是否支援 hover（桌機滑鼠 = true；手機/觸控 = false）
export default function useHasHover() {
  const [hasHover, setHasHover] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
      : true
  )

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const handler = (e) => setHasHover(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return hasHover
}
