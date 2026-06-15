import { useEffect, useState } from 'react'
import { AdminNav } from './Dashboard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { getMessages, markAsRead, deleteMessage } from '../../api/contact'

export default function MessagesManager() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMessages()
      setMessages(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRead = async (id) => {
    try {
      await markAsRead(id)
      setMessages(ms => ms.map(m => m.id === id ? { ...m, isRead: true } : m))
    } catch {}
  }

  const handleDelete = async (msg) => {
    if (!window.confirm(`確定刪除來自 ${msg.name} 的訊息？`)) return
    setDeleting(msg.id)
    try {
      await deleteMessage(msg.id)
      setMessages(ms => ms.filter(m => m.id !== msg.id))
    } catch {
      alert('刪除失敗')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (ts) => new Date(ts * 1000).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-np-white">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-np-black">聯絡訊息</h2>
          <p className="font-sans-tc text-np-gray-400 text-sm">
            共 {messages.length} 則，未讀 {messages.filter(m => !m.isRead).length} 則
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : messages.length === 0 ? (
          <p className="text-np-gray-400 font-sans-tc text-center py-16">暫無訊息</p>
        ) : (
          <div className="border-t-2 border-np-black">
            {messages.map(msg => (
              <div key={msg.id} className={`border-b border-np-gray-100 ${!msg.isRead ? 'bg-np-gray-100/50' : ''}`}>
                <div
                  className="flex items-center gap-4 py-3 px-2 cursor-pointer hover:bg-np-gray-100 transition-colors"
                  onClick={() => {
                    setExpanded(e => e === msg.id ? null : msg.id)
                    if (!msg.isRead) handleRead(msg.id)
                  }}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!msg.isRead ? 'bg-np-red' : 'bg-np-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-sans-tc text-sm truncate ${!msg.isRead ? 'font-bold text-np-black' : 'text-np-gray-700'}`}>
                      {msg.name}
                      <span className="font-normal text-np-gray-400 ml-2 text-xs">{msg.email}</span>
                    </p>
                    <p className="font-sans-tc text-np-gray-400 text-xs truncate">{msg.message}</p>
                  </div>
                  <p className="font-sans-tc text-np-gray-400 text-xs flex-shrink-0">{formatDate(msg.created_at)}</p>
                  <div className="flex gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {!msg.isRead && (
                      <button onClick={() => handleRead(msg.id)} className="text-xs font-sans-tc text-np-gray-700 hover:text-np-red px-2 py-1 border border-np-gray-400 hover:border-np-red transition-colors">
                        標記已讀
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg)}
                      disabled={deleting === msg.id}
                      className="text-xs font-sans-tc text-np-gray-400 hover:text-np-red px-2 py-1 border border-np-gray-100 hover:border-np-red transition-colors disabled:opacity-40"
                    >
                      {deleting === msg.id ? '...' : '刪除'}
                    </button>
                  </div>
                </div>

                {expanded === msg.id && (
                  <div className="px-8 pb-4">
                    <p className="font-serif-tc text-np-gray-700 text-sm leading-relaxed whitespace-pre-wrap border-l-2 border-np-red pl-4">
                      {msg.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
