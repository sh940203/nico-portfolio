import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { getWorks } from '../../api/works'
import { getMessages } from '../../api/contact'

function AdminNav() {
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <nav className="border-b-2 border-np-black bg-np-white px-4 py-3 flex items-center justify-between">
      <span className="font-display font-bold text-lg uppercase tracking-widest">Admin</span>
      <div className="flex items-center gap-4">
        <Link to="/admin/works" className="text-sm font-sans-tc text-np-gray-700 hover:text-np-red">作品管理</Link>
        <Link to="/admin/packaging" className="text-sm font-sans-tc text-np-gray-700 hover:text-np-red">包裝設計</Link>
        <Link to="/admin/messages" className="text-sm font-sans-tc text-np-gray-700 hover:text-np-red">聯絡訊息</Link>
        <Link to="/admin/series" className="text-sm font-sans-tc text-np-gray-700 hover:text-np-red">分類管理</Link>
        <Link to="/admin/profile" className="text-sm font-sans-tc text-np-gray-700 hover:text-np-red">個人資料</Link>
        <button onClick={handleLogout} className="text-sm font-sans-tc text-np-gray-400 hover:text-np-red transition-colors">登出</button>
      </div>
    </nav>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ paintings: 0, packaging: 0, unread: 0 })

  useEffect(() => {
    Promise.all([
      getWorks({ category: 'painting', limit: 1 }),
      getWorks({ category: 'packaging', limit: 1 }),
      getMessages({ isRead: false }),
    ]).then(([p, k, m]) => {
      setStats({
        paintings: p.data.pagination.total,
        packaging: k.data.pagination.total,
        unread: m.data.data.length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-np-white">
      <AdminNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-display font-bold text-2xl text-np-black mb-6">快速統計</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '畫作', value: stats.paintings, link: '/admin/works' },
            { label: '包裝作品', value: stats.packaging, link: '/admin/packaging' },
            { label: '未讀訊息', value: stats.unread, link: '/admin/messages' },
          ].map(({ label, value, link }) => (
            <Link key={label} to={link} className="border-2 border-np-black p-6 hover:bg-np-gray-100 transition-colors">
              <p className="font-display font-black text-4xl text-np-black">{value}</p>
              <p className="font-sans-tc text-np-gray-700 text-sm mt-1">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export { AdminNav }
