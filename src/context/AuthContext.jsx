import { createContext, useContext, useState, useEffect } from 'react'
import { demoUsers } from '../data/mockEmployees.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rappi_auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (user) => {
    setCurrentUser(user)
    localStorage.setItem('rappi_auth_user', JSON.stringify(user))
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('rappi_auth_user')
  }

  return (
    <AuthContext.Provider value={{ currentUser, role: currentUser?.role ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
