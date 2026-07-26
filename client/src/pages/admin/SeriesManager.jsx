import { useEffect, useState } from 'react'
import { AdminNav } from './Dashboard'
import { getSeries, createSeries, updateSeries, deleteSeries } from '../../api/series'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const CATEGORIES = [
  { key: 'painting', title: '作品集分類' },
  { key: 'packaging', title: '包裝設計分類' },
]

const inputClass = 'w-full border-b border-np-gray-400 bg-transparent font-sans-tc text-np-black text-sm py-1.5 focus:outline-none focus:border-np-black transition-colors'

function SeriesRow({ s, onSave, onDelete }) {
  const [edit, setEdit] = useState({ label: s.label, en: s.en || '', description: s.description || '', displayOrder: s.displayOrder })
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const dirty = edit.label !== s.label || edit.en !== (s.en || '') || edit.description !== (s.description || '') || edit.displayOrder !== s.displayOrder

  const save = async () => { setSaving(true); await onSave(s.id, edit); setSaving(false) }
  const remove = async () => { setBusy(true); await onDelete(s); setBusy(false) }

  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_1.4fr_auto] gap-3 items-center py-3 border-b border-np-gray-100">
      <input
        type="number"
        value={edit.displayOrder}
        onChange={e => setEdit(v => ({ ...v, displayOrder: Number(e.target.value) }))}
        className={`${inputClass} text-center`}
        title="排序"
      />
      <input value={edit.label} onChange={e => setEdit(v => ({ ...v, label: e.target.value }))} className={inputClass} placeholder="中文名稱" />
      <input value={edit.en} onChange={e => setEdit(v => ({ ...v, en: e.target.value }))} className={inputClass} placeholder="英文名稱" />
      <input value={edit.description} onChange={e => setEdit(v => ({ ...v, description: e.target.value }))} className={inputClass} placeholder="說明" />
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="text-xs font-sans-tc px-2 py-1 border border-np-black hover:bg-np-black hover:text-np-white transition-colors disabled:opacity-30"
        >
          {saving ? '...' : '儲存'}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="text-xs font-sans-tc px-2 py-1 border border-np-gray-400 text-np-gray-400 hover:border-np-red hover:text-np-red transition-colors disabled:opacity-40"
        >
          刪除
        </button>
      </div>
    </div>
  )
}

function AddRow({ category, onAdd }) {
  const [form, setForm] = useState({ label: '', en: '', description: '', displayOrder: 99 })
  const [saving, setSaving] = useState(false)
  const add = async () => {
    if (!form.label.trim()) return
    setSaving(true)
    await onAdd({ ...form, category })
    setForm({ label: '', en: '', description: '', displayOrder: 99 })
    setSaving(false)
  }
  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_1.4fr_auto] gap-3 items-center py-3 bg-np-gray-100 px-2">
      <input type="number" value={form.displayOrder} onChange={e => setForm(v => ({ ...v, displayOrder: Number(e.target.value) }))} className={`${inputClass} text-center`} />
      <input value={form.label} onChange={e => setForm(v => ({ ...v, label: e.target.value }))} className={inputClass} placeholder="中文名稱 *" />
      <input value={form.en} onChange={e => setForm(v => ({ ...v, en: e.target.value }))} className={inputClass} placeholder="英文名稱" />
      <input value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} className={inputClass} placeholder="說明" />
      <button
        onClick={add}
        disabled={!form.label.trim() || saving}
        className="text-xs font-sans-tc px-3 py-1 bg-np-black text-np-white hover:bg-np-red transition-colors disabled:opacity-40 flex-shrink-0"
      >
        {saving ? '...' : '+ 新增'}
      </button>
    </div>
  )
}

export default function SeriesManager() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await getSeries()
      setList(res.data.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500) }

  const handleAdd = async (data) => {
    try { await createSeries(data); flash('已新增分類'); await load() }
    catch (e) { flash(e.response?.data?.error || '新增失敗') }
  }
  const handleSave = async (id, data) => {
    try { await updateSeries(id, data); flash('已更新'); await load() }
    catch (e) { flash(e.response?.data?.error || '更新失敗') }
  }
  const handleDelete = async (s) => {
    if (!window.confirm(`確定刪除分類「${s.label}」？`)) return
    try { await deleteSeries(s.id); flash('已刪除'); await load() }
    catch (e) { flash(e.response?.data?.error || '刪除失敗') }
  }

  return (
    <div className="min-h-screen bg-np-white">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 border-b-2 border-np-black pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-np-black">分類系列管理</h2>
            <p className="font-sans-tc text-np-gray-400 text-sm mt-1">新增／編輯／刪除作品分類，前台會依此顯示與排序</p>
          </div>
          {msg && <span className="font-sans-tc text-sm text-np-red">{msg}</span>}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          CATEGORIES.map(cat => {
            const rows = list.filter(s => s.category === cat.key)
            return (
              <section key={cat.key} className="mb-12">
                <h3 className="font-display font-bold text-base uppercase tracking-widest border-l-2 border-np-red pl-3 mb-3">{cat.title}</h3>
                <div className="grid grid-cols-[2rem_1fr_1fr_1.4fr_auto] gap-3 text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest px-2 pb-1">
                  <span className="text-center">排序</span><span>中文</span><span>英文</span><span>說明</span><span></span>
                </div>
                {rows.map(s => (
                  <SeriesRow key={s.id} s={s} onSave={handleSave} onDelete={handleDelete} />
                ))}
                <div className="mt-3">
                  <AddRow category={cat.key} onAdd={handleAdd} />
                </div>
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}
