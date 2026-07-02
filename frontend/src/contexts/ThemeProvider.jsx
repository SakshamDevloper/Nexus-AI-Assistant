import { useEffect, createContext, useContext } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}