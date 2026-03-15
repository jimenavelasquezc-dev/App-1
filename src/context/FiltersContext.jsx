import { createContext, useContext, useState } from 'react'

const FiltersContext = createContext(null)

export function FiltersProvider({ children }) {
  const [country, setCountry] = useState('all')
  const [supervisorId, setSupervisorId] = useState('all')

  const reset = () => { setCountry('all'); setSupervisorId('all') }

  return (
    <FiltersContext.Provider value={{ country, setCountry, supervisorId, setSupervisorId, reset }}>
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  return useContext(FiltersContext)
}
