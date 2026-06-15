import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * 3D 滑鼠傾斜卡片：依游標位置產生透視傾斜與光澤。
 */
export default function TiltCard({ children, className = '', max = 12, onClick, ariaLabel }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18 })
  const sy = useSpring(y, { stiffness: 200, damping: 18 })

  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max])
  const glareX = useTransform(sx, [-0.5, 0.5], ['0%', '100%'])

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      whileTap={{ scale: 0.97 }}
      className={`relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-np-red ${className}`}
    >
      <div style={{ transform: 'translateZ(0)' }}>{children}</div>
      {/* 光澤 */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(glareX, (gx) => `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) ${gx}, transparent 70%)`),
        }}
      />
    </motion.button>
  )
}
