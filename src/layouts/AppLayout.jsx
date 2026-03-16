import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'

export default function AppLayout() {
  const [collapsed, setCollapsed]     = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden off-screen on mobile, shown as overlay when open */}
      <div className={`
        fixed inset-y-0 left-0 z-30 lg:static lg:z-auto
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <Sidebar
          collapsed={collapsed}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 py-3 bg-rappi shadow-md flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="text-white/80 hover:text-white transition-colors text-xl leading-none lg:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-white/80 hover:text-white transition-colors text-xl leading-none hidden lg:block"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/Rappi_logo.svg"
              alt="Rappi"
              className="h-7 object-contain brightness-0 invert flex-shrink-0"
            />
            <div className="w-px h-5 bg-white/30 flex-shrink-0" />
            <span className="text-white/90 text-sm font-medium truncate hidden sm:block">
              Compensaciones & Excepciones
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
