import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Lightbox({ src, alt, onClose, title, subtitle, description, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext) onNext()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-np-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button
        className="absolute top-4 right-4 text-np-white text-3xl leading-none hover:text-np-red transition-colors z-10"
        onClick={onClose}
        aria-label="關閉"
      >
        ×
      </button>

      {onPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-np-white text-4xl hover:text-np-red transition-colors z-10 font-display"
          onClick={e => { e.stopPropagation(); onPrev() }}
          aria-label="上一件"
        >
          ←
        </button>
      )}
      {onNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-np-white text-4xl hover:text-np-red transition-colors z-10 font-display"
          onClick={e => { e.stopPropagation(); onNext() }}
          aria-label="下一件"
        >
          →
        </button>
      )}

      <div
        data-lenis-prevent
        className="flex flex-col md:flex-row gap-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[70vh] md:max-h-[80vh] max-w-full md:max-w-[60%] object-contain flex-shrink-0"
        />
        {(title || description) && (
          <div className="flex flex-col gap-3 text-left md:pt-4">
            {title && <h2 className="font-display font-bold text-np-white text-xl">{title}</h2>}
            {subtitle && <p className="font-sans-tc text-np-gray-400 text-sm">{subtitle}</p>}
            {description && <p className="font-serif-tc text-np-gray-100 text-sm leading-relaxed">{description}</p>}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
