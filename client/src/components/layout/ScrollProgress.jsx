import { motion, useScroll, useSpring } from 'framer-motion'

// 頂部捲動進度條（捲動驅動視覺回饋，桌機/手機皆有）
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-np-red origin-left z-[60]"
    />
  )
}
