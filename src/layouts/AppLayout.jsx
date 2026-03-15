import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-3 bg-rappi shadow-md">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-white/80 hover:text-white transition-colors text-xl leading-none"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          {/* Rappi Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/Rappi_logo.svg"
              alt="Rappi"
              className="h-7 object-contain brightness-0 invert"
            />
            <div className="w-px h-5 bg-white/30" />
            <span className="text-white/90 text-sm font-medium">Compensaciones & Excepciones</span>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
