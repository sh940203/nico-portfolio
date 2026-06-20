import { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'
import { createWork, updateWork } from '../../api/works'

const INIT = {
  title: '',
  series: '',
  year: new Date().getFullYear(),
  medium: '',
  description: '',
  isVisible: true,
  isFeatured: false,
  displayOrder: 0,
}

const SERIES_OPTIONS = {
  painting: [
    { value: 'ryu', label: '精選系列｜入禾 RYU' },
    { value: 'ip', label: 'IP 設計' },
    { value: 'exhibition', label: '畢業展覽｜青蘋果作品展' },
    { value: 'handdrawn', label: '手繪創作' },
  ],
  packaging: [
    { value: 'bento', label: '沙卡里巴 便當盒' },
    { value: 'egg', label: '神福 雞蛋盒' },
  ],
}

export default function WorkForm({ category, work, onSaved, onCancel }) {
  const [form, setForm] = useState(INIT)
  const [coverImage, setCoverImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (work) {
      setForm({
        title: work.title || '',
        series: work.series || '',
        year: work.year || new Date().getFullYear(),
        medium: work.medium || '',
        description: work.description || '',
        isVisible: work.isVisible !== false,
        isFeatured: !!work.isFeatured,
        displayOrder: work.displayOrder || 0,
      })
      // 保留現有封面圖
      setCoverImage(work.coverImage || null)
    } else {
      setForm(INIT)
      setCoverImage(null)
    }
  }, [work])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!coverImage?.url) { setError('請上傳封面圖'); return }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, category, coverImage }
      if (work) {
        await updateWork(work.id, payload)
      } else {
        await createWork(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || '儲存失敗，請確認後台伺服器已啟動')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border-b border-np-gray-400 bg-transparent font-sans-tc text-np-black text-sm py-2 focus:outline-none focus:border-np-black transition-colors'
  const labelClass = 'text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest'

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 bg-np-black/60 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onCancel}
    >
      <div
        className="bg-np-white w-full max-w-lg my-8 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b-2 border-np-black pb-3">
          <h2 className="font-display font-bold text-xl">{work ? '編輯作品' : '新增作品'}</h2>
          <button onClick={onCancel} className="text-2xl text-np-gray-400 hover:text-np-red leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 封面圖：編輯時顯示現有封面 */}
          <ImageUploader
            onUploaded={setCoverImage}
            label="封面圖"
            initialImage={work?.coverImage || null}
          />

          <div>
            <label className={labelClass}>標題 *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>分類系列</label>
            <select
              value={form.series}
              onChange={e => setForm(f => ({ ...f, series: e.target.value }))}
              className={inputClass}
            >
              <option value="">— 未分類 —</option>
              {(SERIES_OPTIONS[category] || []).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>年份 *</label>
              <input
                type="number"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>媒材</label>
              <input
                value={form.medium}
                onChange={e => setForm(f => ({ ...f, medium: e.target.value }))}
                className={inputClass}
                placeholder="壓克力、畫布"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>作品說明</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>排序</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))}
                  className="accent-np-red"
                />
                <span className="font-sans-tc text-np-gray-700 text-sm">公開顯示</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                  className="accent-np-red"
                />
                <span className="font-sans-tc text-np-gray-700 text-sm">精選作品</span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-np-red font-sans-tc">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-np-black text-np-white font-display uppercase tracking-widest text-sm py-3 hover:bg-np-red transition-colors disabled:opacity-60"
            >
              {loading ? '儲存中...' : '儲存'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-np-black font-display uppercase tracking-widest text-sm py-3 hover:bg-np-gray-100 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
