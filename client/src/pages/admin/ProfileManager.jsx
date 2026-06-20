import { useEffect, useState } from 'react'
import { AdminNav } from './Dashboard'
import { getProfile, updateProfile } from '../../api/profile'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const labelClass = 'text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest block mb-1'
const inputClass = 'w-full border-b border-np-gray-400 bg-transparent font-sans-tc text-np-black text-sm py-2 focus:outline-none focus:border-np-black transition-colors'
const sectionClass = 'border-t border-np-gray-100 pt-6'

// ──────────────────────────────────────────
// 可排序列表輸入（學歷、社群連結等）
function ListEditor({ label, value = [], onChange, fields }) {
  const add = () => onChange([...value, Object.fromEntries(fields.map(f => [f.key, '']))])
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(value.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-col gap-3">
        {value.map((item, i) => (
          <div key={i} className="flex gap-2 items-start bg-np-gray-100 p-3">
            <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${fields.length}, 1fr)` }}>
              {fields.map(f => (
                <div key={f.key}>
                  <span className="text-[9px] font-sans-tc text-np-gray-400 uppercase">{f.label}</span>
                  <input
                    value={item[f.key] || ''}
                    onChange={e => update(i, f.key, e.target.value)}
                    placeholder={f.placeholder || ''}
                    className="w-full border-b border-np-gray-400 bg-transparent text-xs font-sans-tc py-1 focus:outline-none focus:border-np-black"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-np-gray-400 hover:text-np-red text-lg leading-none mt-1 flex-shrink-0"
            >×</button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="border border-dashed border-np-gray-400 hover:border-np-black text-np-gray-400 hover:text-np-black font-sans-tc text-xs py-2 transition-colors"
        >
          + 新增
        </button>
      </div>
    </div>
  )
}

// 純字串陣列輸入（技能、證照）
function TagsEditor({ label, value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !value.includes(v)) { onChange([...value, v]); setInput('') }
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((v, i) => (
          <span key={i} className="flex items-center gap-1 bg-np-gray-100 font-sans-tc text-xs px-2 py-1">
            {v}
            <button type="button" onClick={() => remove(i)} className="text-np-gray-400 hover:text-np-red leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder || '輸入後按 Enter'}
          className={`${inputClass} flex-1`}
        />
        <button type="button" onClick={add} className="border border-np-gray-400 hover:border-np-black text-xs font-sans-tc px-3 transition-colors">
          新增
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
export default function ProfileManager() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfile()
      .then(r => setProfile(r.data.data))
      .catch(() => setError('讀取失敗'))
      .finally(() => setLoading(false))
  }, [])

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await updateProfile(profile)
      setProfile(res.data.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || '儲存失敗，請確認後台伺服器已啟動')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-np-white">
      <AdminNav />
      <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-np-white">
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 border-b-2 border-np-black pb-4">
          <h2 className="font-display font-bold text-2xl text-np-black">個人資料管理</h2>
          <p className="font-sans-tc text-np-gray-400 text-sm mt-1">編輯關於頁面的個人資訊、學歷與作品集連結</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* 基本資料 */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-base uppercase tracking-widest border-l-2 border-np-red pl-3">基本資料</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>中文姓名</label>
                <input value={profile?.nameZh || ''} onChange={e => set('nameZh', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>英文姓名</label>
                <input value={profile?.nameEn || ''} onChange={e => set('nameEn', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>暱稱／品牌名</label>
                <input value={profile?.nickname || ''} onChange={e => set('nickname', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>出生日期</label>
                <input type="date" value={profile?.birthDate || ''} onChange={e => set('birthDate', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>電話</label>
                <input value={profile?.phone || ''} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="0905-616-725" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={profile?.email || ''} onChange={e => set('email', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>個人簡介</label>
              <textarea
                value={profile?.bio || ''}
                onChange={e => set('bio', e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="一段話介紹自己的創作方向、個性或設計理念…"
              />
            </div>
          </div>

          {/* 學歷 */}
          <div className={`${sectionClass} flex flex-col gap-4`}>
            <h3 className="font-display font-bold text-base uppercase tracking-widest border-l-2 border-np-red pl-3">學歷</h3>
            <ListEditor
              label="學校（由舊到新排列）"
              value={profile?.education || []}
              onChange={v => set('education', v)}
              fields={[
                { key: 'school', label: '學校', placeholder: '嶺東科技大學' },
                { key: 'dept',   label: '科系／班別', placeholder: '時尚經營系' },
                { key: 'year',   label: '畢業年份', placeholder: '2026' },
              ]}
            />
          </div>

          {/* 技能 */}
          <div className={`${sectionClass} flex flex-col gap-4`}>
            <h3 className="font-display font-bold text-base uppercase tracking-widest border-l-2 border-np-red pl-3">技能</h3>
            <TagsEditor
              label="軟體／技能（輸入後按 Enter 新增）"
              value={profile?.skills || []}
              onChange={v => set('skills', v)}
              placeholder="Adobe Illustrator"
            />
          </div>

          {/* 證照 */}
          <div className={`${sectionClass} flex flex-col gap-4`}>
            <h3 className="font-display font-bold text-base uppercase tracking-widest border-l-2 border-np-red pl-3">證照</h3>
            <TagsEditor
              label="證照名稱（輸入後按 Enter 新增）"
              value={profile?.licenses || []}
              onChange={v => set('licenses', v)}
              placeholder="TQC+ 影像處理 PhotoShop 2016 專業級"
            />
          </div>

          {/* 社群連結 */}
          <div className={`${sectionClass} flex flex-col gap-4`}>
            <h3 className="font-display font-bold text-base uppercase tracking-widest border-l-2 border-np-red pl-3">個人檔案連結</h3>
            <ListEditor
              label="社群、作品集、個人網頁"
              value={profile?.links || []}
              onChange={v => set('links', v)}
              fields={[
                { key: 'label', label: '名稱', placeholder: 'Instagram' },
                { key: 'url',   label: 'URL', placeholder: 'https://instagram.com/...' },
              ]}
            />
          </div>

          {/* 儲存 */}
          <div className="sticky bottom-0 bg-np-white border-t border-np-gray-100 py-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-np-black text-np-white font-display uppercase tracking-widest text-sm py-3 hover:bg-np-red transition-colors disabled:opacity-60"
            >
              {saving ? '儲存中...' : '儲存個人資料'}
            </button>
            {saved && <p className="font-sans-tc text-sm text-green-600">✓ 已儲存</p>}
            {error && <p className="font-sans-tc text-sm text-np-red">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}
