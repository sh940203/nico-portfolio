import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: '首頁' },
  { to: '/about', label: '關於我' },
  { to: '/works', label: '作品集' },
  { to: '/exhibition', label: '畢業展覽' },
  { to: '/packaging', label: '包裝設計' },
  { to: '/contact', label: '聯絡' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b-2 border-np-black bg-np-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-display font-bold text-lg tracking-widest text-np-black uppercase">
          Nico
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-sans-tc tracking-wide transition-colors ${isActive ? 'text-np-red font-medium' : 'text-np-gray-700 hover:text-np-red'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="選單"
        >
          <span className={`block w-5 h-0.5 bg-np-black transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-np-black transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-np-black transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-np-gray-100 bg-np-white px-4 py-3 flex flex-col gap-3">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-sans-tc py-1 ${isActive ? 'text-np-red font-medium' : 'text-np-gray-700'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
