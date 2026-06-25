import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Assistant from './pages/Assistant'
import History from './pages/History'
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
