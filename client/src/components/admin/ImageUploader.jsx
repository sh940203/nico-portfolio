import { useState, useRef } from 'react'
import { uploadImage } from '../../api/works'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ImageUploader({ onUploaded, label = '封面圖' }) {
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setUploading(true)
    setError('')
    try {
      const res = await uploadImage(file)
      onUploaded(res.data.data)
    } catch {
      setError('上傳失敗，請重試')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <p className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-np-gray-400 hover:border-np-black cursor-pointer transition-colors min-h-32 flex items-center justify-center relative overflow-hidden"
      >
        {uploading && (
          <div className="absolute inset-0 bg-np-white/80 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {preview ? (
          <img src={preview} alt="preview" className="max-h-40 object-contain" />
        ) : (
          <p className="font-sans-tc text-np-gray-400 text-sm text-center p-4">拖曳圖片至此<br />或點擊選取</p>
        )}
      </div>
      {error && <p className="text-xs text-np-red font-sans-tc mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}
