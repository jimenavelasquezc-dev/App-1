import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useExceptions } from '../../context/ExceptionsContext.jsx'

const navItems = [
  { to: '/dashboard',      label: 'Dashboard',           icon: '🚀', roles: ['rep', 'manager', 'data_person'] },
  { to: '/exceptions/new', label: 'Nueva Excepción',     icon: '💸', roles: ['rep'] },
  { to: '/exceptions',     label: 'Cola de Excepciones', icon: '🔥', roles: ['manager', 'data_person'] },
]

export default function Sidebar({ collapsed, onClose }) {
  const { currentUser, role, logout } = useAuth()
  const { resetData } = useExceptions()

  const handleReset = () => {
    resetData()
    window.location.reload()
  }

  return (
    <aside className={`flex flex-col h-full bg-gray-900 text-white transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <img src="/Rappi_logo.svg" alt="Rappi" className={`object-contain brightness-0 invert flex-shrink-0 ${collapsed ? 'h-6' : 'h-7'}`} />
        {!collapsed && <span className="font-bold text-sm tracking-wide truncate">Comp Manager</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems
          .filter(item => item.roles.includes(role))
          .map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/exceptions'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-rappi text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-3 space-y-2">
        {!collapsed && (
          <>
            <div className="px-2 py-1">
              <p className="text-xs text-gray-400">Conectado como</p>
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400">
                {role === 'data_person' ? 'Equipo de Data' : role === 'manager' ? 'Líder de Inside Sales' : 'Supervisor'}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              🔄 Reiniciar Demo
            </button>
          </>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="flex-shrink-0">→</span>
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
