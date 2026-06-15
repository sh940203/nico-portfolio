import { useState } from 'react'
import { sendMessage } from '../api/contact'
import { aboutData } from '../data/about'

const initialForm = { name: '', email: '', message: '' }

function validate({ name, email, message }) {
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = '姓名至少 2 個字'
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = '請輸入有效的 Email'
  if (!message || message.trim().length < 10) errors.message = '訊息至少 10 個字'
  if (message && message.length > 1000) errors.message = '訊息不可超過 1000 字'
  return errors
}

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('loading')
    try {
      await sendMessage(form)
      setStatus('success')
      setForm(initialForm)
    } catch {
      setStatus('error')
    }
  }

  const inputClass = (field) =>
    `w-full border-b ${errors[field] ? 'border-np-red' : 'border-np-gray-400'} bg-transparent font-sans-tc text-np-black text-sm py-2 focus:outline-none focus:border-np-black transition-colors`

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="border-b-4 border-np-black pb-4 mb-8">
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tight text-np-black">Contact</h1>
        <p className="font-sans-tc text-np-gray-400 text-sm mt-1">聯絡我</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: info */}
        <div className="flex flex-col gap-6 border-r-0 md:border-r border-np-gray-100 md:pr-12">
          <p className="font-serif-tc text-np-gray-700 text-sm leading-relaxed">
            歡迎任何合作洽詢或設計相關詢問。<br />
            無論是品牌設計、包裝合作或任何有趣的提案，<br />
            都歡迎與我聯絡。
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-np-red flex-shrink-0" />
              <a href={`mailto:${aboutData.contact.email}`} className="font-sans-tc text-np-gray-700 text-sm hover:text-np-red transition-colors">
                {aboutData.contact.email}
              </a>
            </div>
            {aboutData.contact.instagram && (
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-np-red flex-shrink-0" />
                <span className="font-sans-tc text-np-gray-700 text-sm">{aboutData.contact.instagram}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: form */}
        <div>
          {status === 'success' ? (
            <div className="bg-np-black text-np-white p-6">
              <p className="font-display italic text-xl mb-2">✓ 訊息已刊登。</p>
              <p className="font-serif-tc text-sm text-np-gray-100">感謝您的來信，我將盡快回覆。</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 text-xs font-sans-tc text-np-gray-400 hover:text-np-white underline underline-offset-2"
              >
                再次填寫
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              <div>
                <label className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest">姓名</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass('name')} placeholder="您的姓名" />
                {errors.name && <p className="text-xs text-np-red font-sans-tc mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass('email')} placeholder="your@email.com" />
                {errors.email && <p className="text-xs text-np-red font-sans-tc mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-[10px] font-sans-tc text-np-gray-400 uppercase tracking-widest">訊息</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className={`${inputClass('message')} resize-none`}
                  placeholder="您的訊息內容..."
                />
                <div className="flex justify-between mt-1">
                  {errors.message
                    ? <p className="text-xs text-np-red font-sans-tc">{errors.message}</p>
                    : <span />
                  }
                  <p className="text-xs text-np-gray-400 font-sans-tc">{form.message.length} / 1000</p>
                </div>
              </div>

              {status === 'error' && (
                <p className="text-sm text-np-red font-sans-tc">送出失敗，請稍後再試。</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="self-start bg-np-black text-np-white font-display tracking-widest uppercase text-sm px-8 py-3 hover:bg-np-red transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? '送出中...' : '送出訊息 →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
