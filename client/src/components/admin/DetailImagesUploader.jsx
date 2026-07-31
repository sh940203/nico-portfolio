import { useRef, useState } from 'react'
import { uploadImage } from '../../api/works'
import LoadingSpinner from '../ui/LoadingSpinner'

// 細節圖多圖管理：可上傳多張、逐張刪除、編輯圖說
export default function DetailImagesUploader({ images = [], onChange, label = '細節圖（可多張）' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const uploaded = []
      for (const file of files) {
        const res = await uploadImage(file)
        uploaded.push({ url: res.data.data.url, publicId: res.data.data.publicId, caption: '' })
      }
      onChange([...images, ...uploaded])
    } catch {
      setError('部分圖片上傳失敗，請重試')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (i) => onChange(images.filter((_, idx) => idx !== i))
  const setCaption = (i, caption) => onChange(images.map((img, idx) => idx === i ? { ...img, caption } : img))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= images.length) return
    const next = [...images]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      <p className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest mb-1">{label}</p>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((img, i) => (
            <div key={i} className="relative group border border-np-gray-100">
              <img src={img.url} alt={img.caption || `細節 ${i + 1}`} className="w-full aspect-square object-cover" />
              <span className="absolute top-1 left-1 bg-np-black/70 text-np-white text-[10px] font-sans-tc px-1.5 py-0.5 rounded">{i + 1}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-np-black/70 text-np-white text-sm leading-none rounded-full hover:bg-np-red transition-colors"
                aria-label="刪除此圖"
              >
                ×
              </button>
              {/* 排序調度 */}
              <div className="absolute bottom-8 inset-x-0 flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="w-6 h-6 bg-np-black/70 text-np-white text-xs leading-none rounded-full hover:bg-np-red transition-colors disabled:opacity-20"
                  aria-label="往前移"
                >←</button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="w-6 h-6 bg-np-black/70 text-np-white text-xs leading-none rounded-full hover:bg-np-red transition-colors disabled:opacity-20"
                  aria-label="往後移"
                >→</button>
              </div>
              <input
                value={img.caption || ''}
                onChange={e => setCaption(i, e.target.value)}
                placeholder="圖說（選填）"
                className="w-full text-[11px] font-sans-tc px-1.5 py-1 border-t border-np-gray-100 bg-np-white focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-np-gray-400 hover:border-np-black cursor-pointer transition-colors py-4 flex items-center justify-center relative"
      >
        {uploading && (
          <div className="absolute inset-0 bg-np-white/80 flex items-center justify-center z-10"><LoadingSpinner /></div>
        )}
        <p className="font-sans-tc text-np-gray-400 text-sm text-center px-4">+ 新增細節圖（可一次選多張）</p>
      </div>

      {error && <p className="text-xs text-np-red font-sans-tc mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}
