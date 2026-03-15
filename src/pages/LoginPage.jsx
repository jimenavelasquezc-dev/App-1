import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { demoUsers } from '../data/mockEmployees.js'
import { loadSupervisorEmails } from '../utils/csvLoader.js'

const dataUsers = demoUsers.filter(u => u.role === 'data_person')
const managers  = demoUsers.filter(u => u.role === 'manager')

// "alejandra.mejia@rappi.com" → "Alejandra Mejia"
function formatName(email) {
  const [local] = email.split('@')
  return local.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [supOpen, setSupOpen]   = useState(false)
  const [supEmails, setSupEmails] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    loadSupervisorEmails('2026-03').then(emails => {
      setSupEmails(emails)
      setLoading(false)
    })
  }, [])

  const handleLogin = (user) => {
    login(user)
    navigate(user.role === 'data_person' ? '/exceptions' : '/dashboard')
  }

  const loginAsSupervisor = (email) => {
    handleLogin({
      id:           email,
      name:         formatName(email),
      role:         'manager',
      supervisorId: email,   // used by dashboard to auto-filter
    })
  }

  return (
    <AuthLayout>
      <div className="rounded-xl shadow-sm border border-gray-200 p-6" style={{ backgroundColor: '#FF441F' }}>
        <h2 className="text-lg font-semibold text-white mb-1">¿Con qué perfil ingresas hoy? 🔥</h2>
        <p className="text-white/75 text-sm mb-6">Sin contraseña — entorno de demostración.</p>

        <div className="space-y-3">

          {/* ── Supervisores — dropdown con nombres reales del CSV ── */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Supervisor</p>
            <div className="relative">
              <button
                onClick={() => setSupOpen(o => !o)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/20 bg-white hover:bg-rappi-bg transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-rappi-bg flex items-center justify-center text-xl flex-shrink-0">
                  💪🏻
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Supervisores</p>
                  <p className="text-xs text-gray-500">
                    {loading ? 'Cargando...' : `${supEmails.length} supervisores · elige el tuyo 🚀`}
                  </p>
                </div>
                <span className={`text-gray-400 text-sm transition-transform duration-200 ${supOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {supOpen && (
                <div className="mt-1 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                  {loading ? (
                    <p className="text-xs text-gray-400 text-center py-4">Cargando supervisores...</p>
                  ) : supEmails.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No se encontraron supervisores en el CSV.</p>
                  ) : supEmails.map((email, i) => (
                    <button
                      key={email}
                      onClick={() => loginAsSupervisor(email)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-rappi-bg transition-colors ${i !== 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           style={{ backgroundColor: '#FF441F' }}>
                        {formatName(email).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-semibold">{formatName(email)}</p>
                        <p className="text-xs text-gray-400">{email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Equipo de Data ── */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Equipo de Data</p>
            {dataUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/20 bg-white hover:bg-rappi-bg transition-all text-left mb-2"
              >
                <div className="w-10 h-10 rounded-full bg-rappi-bg flex items-center justify-center text-xl flex-shrink-0">🤩</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">Revisa y procesa las solicitudes de excepción 🔥</p>
                </div>
              </button>
            ))}
          </div>

          {/* ── Líder de Inside Sales ── */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Líder de Inside Sales</p>
            {managers.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/20 bg-white hover:bg-rappi-bg transition-all text-left mb-2"
              >
                <div className="w-10 h-10 rounded-full bg-rappi-bg flex items-center justify-center text-xl flex-shrink-0">🚀</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">Aprueba excepciones y ve las analíticas del equipo 💸</p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </AuthLayout>
  )
}
