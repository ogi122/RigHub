import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const dropdownRef = useRef(null)

  function handleLogout() {
    logout()
    setDropdownOpen(false)
    navigate('/login')
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode)
  }

  // Primjenjuje 'dark' klasu na <html> i pamti izbor u localStorage,
  // pokreće se i pri prvom učitavanju stranice (da ne nestane na refresh)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 border-b-2 border-blue-800">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-white text-blue-600 rounded-lg p-2 group-hover:bg-blue-50 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3H7v2H5v2H3v2h2v2H3v2h2v2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v-2h2v-2h-2V9h2V7h-2V5h-2V3h-2v2h-2V3H9zm0 4h6v8H9V7z" />
              <line x1="1" y1="8" x2="3" y2="8" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="16" x2="3" y2="16" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="21" y1="8" x2="23" y2="8" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="21" y1="16" x2="23" y2="16" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="1" x2="8" y2="3" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="1" x2="16" y2="3" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="21" x2="8" y2="23" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="21" x2="16" y2="23" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Rig<span className="text-blue-200">Hub</span>
          </span>
        </Link>

        {/* Hamburger - samo mobilni */}
        <button
          className="md:hidden text-xl cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Desktop meni */}
        <div className="hidden md:flex items-center gap-6">

          {/* Dark mode toggle - switch */}
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${darkMode ? 'bg-blue-900' : 'bg-blue-400'
              }`}
            title="Toggle dark mode"
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${darkMode ? 'left-7' : 'left-1'
                }`}
            />
          </button>

          <Link
            to="/components"
            className="border border-white px-4 py-1.5 rounded font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Components
          </Link>

          {user ? (
            <>
              <Link
                to="/create"
                className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded hover:bg-blue-50 transition"
              >
                + Create Build
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-red-500 px-4 py-1.5 rounded hover:bg-red-400 transition"
                >
                  Admin
                </Link>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                >
                  <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold">{user.username}</span>
                  <span className="text-xs">{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded shadow-lg z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="font-bold text-sm">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-base hover:bg-gray-100 transition"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                    </Link>
                    <hr />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-base text-red-500 hover:bg-gray-100 transition"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 font-semibold px-4 py-1.5 rounded hover:bg-blue-50 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobilni meni */}
      {menuOpen && (
        <div className="md:hidden flex flex-col mt-4 border-t border-blue-500 divide-y divide-blue-500">
          <Link
            to="/components"
            onClick={() => setMenuOpen(false)}
            className="py-3 cursor-pointer hover:bg-blue-700 transition px-1"
          >
            Components
          </Link>
          {user ? (
            <>
              <Link
                to="/create"
                onClick={() => setMenuOpen(false)}
                className="py-3 cursor-pointer hover:bg-blue-700 transition px-1"
              >
                + Create Build
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 cursor-pointer hover:bg-blue-700 transition px-1"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to={`/profile/${user.id}`}
                onClick={() => setMenuOpen(false)}
                className="py-3 cursor-pointer hover:bg-blue-700 transition px-1"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-left py-3 px-1 text-red-300 cursor-pointer hover:bg-blue-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="py-3 cursor-pointer hover:bg-blue-700 transition px-1"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="py-3 cursor-pointer hover:bg-blue-700 transition px-1"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar