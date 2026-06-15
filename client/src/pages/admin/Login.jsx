import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import useAuthStore from '../../store/authStore'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const loginStore = useAuthStore(s => s.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      loginStore(res.data.data.token, res.data.data.name)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || '登入失敗，請確認帳號密碼')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-np-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="border-b-4 border-np-black pb-4 mb-8 text-center">
          <h1 className="font-display font-black text-3xl uppercase tracking-widest text-np-black">Admin</h1>
          <p className="font-sans-tc text-np-gray-400 text-xs mt-1">後台管理系統</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border-b border-np-gray-400 bg-transparent font-sans-tc text-np-black text-sm py-2 focus:outline-none focus:border-np-black transition-colors"
              placeholder="admin@portfolio.com"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest">密碼</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border-b border-np-gray-400 bg-transparent font-sans-tc text-np-black text-sm py-2 focus:outline-none focus:border-np-black transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-np-red font-sans-tc">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-np-black text-np-white font-display tracking-widest uppercase text-sm px-8 py-3 hover:bg-np-red transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
