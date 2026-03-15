import { useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { demoUsers } from '../data/mockEmployees.js'
import Card from '../components/ui/Card.jsx'

const roleOptions = [
  {
    role: 'rep',
    label: 'Supervisor',
    desc: 'Envía solicitudes de excepción y consulta tu desempeño 🚀',
    icon: '💪🏻',
    users: demoUsers.filter(u => u.role === 'rep'),
  },
  {
    role: 'data_person',
    label: 'Equipo de Data',
    desc: 'Revisa y procesa las solicitudes de excepción 🔥',
    icon: '🤩',
    users: demoUsers.filter(u => u.role === 'data_person'),
  },
  {
    role: 'manager',
    label: 'Líder de Inside Sales',
    desc: 'Aprueba excepciones y visualiza analíticas del equipo 💸',
    icon: '🚀',
    users: demoUsers.filter(u => u.role === 'manager'),
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

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
          {roleOptions.map(opt => (
            <div key={opt.role}>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">{opt.label}</p>
              {opt.users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/20 bg-white hover:bg-rappi-bg transition-all text-left mb-2"
                >
                  <div className="w-10 h-10 rounded-full bg-rappi-bg flex items-center justify-center text-xl flex-shrink-0">
                    {opt.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
