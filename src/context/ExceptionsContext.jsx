import { createContext, useContext, useReducer, useEffect } from 'react'
import { seedExceptions } from '../data/mockExceptions.js'

const ExceptionsContext = createContext(null)
const STORAGE_KEY = 'rappi_exceptions'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : seedExceptions
  } catch {
    return seedExceptions
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SUBMIT': {
      const next = [action.payload, ...state]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    }
    case 'ADD_COMMENT': {
      const next = state.map(ex =>
        ex.id === action.id
          ? { ...ex, comments: [...ex.comments, action.comment] }
          : ex
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    }
    case 'SET_STATUS': {
      const next = state.map(ex =>
        ex.id === action.id
          ? {
              ...ex,
              status: action.status,
              ...(action.status === 'under_review' ? {} : {
                resolution: action.resolution,
                resolvedBy: action.resolvedBy,
                resolvedAt: new Date().toISOString(),
              }),
            }
          : ex
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    }
    case 'RESET': {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedExceptions))
      return seedExceptions
    }
    default:
      return state
  }
}

export function ExceptionsProvider({ children }) {
  const [exceptions, dispatch] = useReducer(reducer, null, loadFromStorage)

  const submitException = (data) => dispatch({ type: 'SUBMIT', payload: data })
  const addComment = (id, comment) => dispatch({ type: 'ADD_COMMENT', id, comment })
  const setStatus = (id, status, resolution, resolvedBy) =>
    dispatch({ type: 'SET_STATUS', id, status, resolution, resolvedBy })
  const resetData = () => dispatch({ type: 'RESET' })

  return (
    <ExceptionsContext.Provider value={{ exceptions, submitException, addComment, setStatus, resetData }}>
      {children}
    </ExceptionsContext.Provider>
  )
}

export function useExceptions() {
  return useContext(ExceptionsContext)
}
