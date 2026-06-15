import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminNav } from './Dashboard'
import WorkForm from '../../components/admin/WorkForm'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { getWorks, deleteWork } from '../../api/works'

export default function WorksManager() {
  return <WorksManagerBase category="painting" title="畫作管理" />
}

export function WorksManagerBase({ category, title }) {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getWorks({ category, limit: 100 })
      setWorks(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [category])

  const handleDelete = async (work) => {
    if (!window.confirm(`確定刪除「${work.title}」？此操作無法復原。`)) return
    setDeleting(work.id)
    try {
      await deleteWork(work.id)
      setWorks(ws => ws.filter(w => w.id !== work.id))
    } catch {
      alert('刪除失敗')
    } finally {
      setDeleting(null)
    }
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditing(null)
    load()
  }

  return (
    <div className="min-h-screen bg-np-white">
      <AdminNav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-np-black">{title}</h2>
            <p className="font-sans-tc text-np-gray-400 text-sm">共 {works.length} 件</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="bg-np-black text-np-white font-display uppercase tracking-widest text-sm px-5 py-2.5 hover:bg-np-red transition-colors"
          >
            + 新增
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : works.length === 0 ? (
          <p className="text-np-gray-400 font-sans-tc text-center py-16">尚無作品</p>
        ) : (
          <div className="border-t-2 border-np-black">
            {works.map(work => (
              <div key={work.id} className="flex items-center gap-4 py-3 border-b border-np-gray-100">
                <img src={work.coverImage.url} alt={work.title} className="w-14 h-14 object-cover grayscale flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans-tc font-medium text-np-black text-sm truncate">{work.title}</p>
                  <p className="font-sans-tc text-np-gray-400 text-xs">{work.year}{work.medium && ` · ${work.medium}`}</p>
                  <div className="flex gap-2 mt-0.5">
                    {!work.isVisible && <span className="text-[10px] bg-np-gray-100 text-np-gray-700 px-1.5 py-0.5 font-sans-tc">隱藏</span>}
                    {work.isFeatured && <span className="text-[10px] bg-np-red text-np-white px-1.5 py-0.5 font-sans-tc">精選</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditing(work); setShowForm(true) }}
                    className="text-xs font-sans-tc text-np-gray-700 hover:text-np-red transition-colors px-2 py-1 border border-np-gray-400 hover:border-np-red"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(work)}
                    disabled={deleting === work.id}
                    className="text-xs font-sans-tc text-np-gray-400 hover:text-np-red transition-colors px-2 py-1 border border-np-gray-100 hover:border-np-red disabled:opacity-40"
                  >
                    {deleting === work.id ? '...' : '刪除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <WorkForm
          category={category}
          work={editing}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
