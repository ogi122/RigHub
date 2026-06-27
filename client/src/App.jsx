import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import BuildDetail from './pages/BuildDetail'
import BuildCreator from './pages/BuildCreator'
import ComponentsBrowser from './pages/ComponentsBrowser'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/builds/:id" element={<BuildDetail />} />
        <Route path="/create" element={<BuildCreator />} />
        <Route path="/components" element={<ComponentsBrowser />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
