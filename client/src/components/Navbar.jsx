import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold">
        RigHub
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>Pozdrav, {user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-blue-800 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar