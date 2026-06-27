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
            <Link to="/components" className="hover:underline">
              Components
            </Link>
            <Link to={`/profile/${user.id}`} className="hover:underline">
              {user.username}
            </Link>
            <Link to="/create" className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-400">
              + Create Build
            </Link>
            {user.role === 'admin' && (
            <Link to="/admin" className="bg-red-500 px-3 py-1 rounded hover:bg-red-400">
              Admin
            </Link>
            )}
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