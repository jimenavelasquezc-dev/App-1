import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { demoUsers } from '../data/mockEmployees.js'

const reps        = demoUsers.filter(u => u.role === 'rep')
const dataUsers   = demoUsers.filter(u => u.role === 'data_person')
const managers    = demoUsers.filter(u => u.role === 'manager')

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [supOpen, setSupOpen] = useState(false)

  const handleLogin = (user) => {
    login(user)
    navigate(user.role === 'data_person' ? '/exceptions' : '/dashboard')
  }

  return (
    <AuthLayout>
      <div className="rounded-xl shadow-sm border border-gray-200 p-6" style={{ backgroundColor: '#FF441F' }}>
        <h2 className="text-lg font-semibold text-white mb-1">¿Con qué perfil ingresas hoy? 🔥</h2>
        <p className="text-white/75 text-sm mb-6">Sin contraseña — entorno de demostración.</p>

        <div className="space-y-3">

          {/* ── Supervisores — dropdown ── */}
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
                  <p className="text-xs text-gray-500">Consulta tu desempeño y envía solicitudes 🚀</p>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 ${supOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {supOpen && (
                <div className="mt-1 rounded-xl border border-white/20 bg-white shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                  {reps.map((user, i) => (
                    <button
                      key={user.id}
                      onClick={() => handleLogin(user)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-rappi-bg transition-colors ${i !== 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-rappi/10 flex items-center justify-center text-xs font-bold text-rappi flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">{user.name}</span>
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
