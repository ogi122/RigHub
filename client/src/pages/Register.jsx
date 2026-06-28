import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const navigate = useNavigate()

  function validateUsername(value) {
    if (value.length < 3 || value.length > 20) {
      return 'Username must be between 3 and 20 characters'
    }
    return ''
  }

  function validatePassword(value) {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number'
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter'
    }
    return ''
  }

  function handleUsernameChange(e) {
    const value = e.target.value
    setUsername(value)
    setUsernameError(validateUsername(value))
  }

  function handlePasswordChange(e) {
    const value = e.target.value
    setPassword(value)
    setPasswordError(validatePassword(value))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const usernameValidation = validateUsername(username)
    const passwordValidation = validatePassword(password)

    setUsernameError(usernameValidation)
    setPasswordError(passwordValidation)

    if (usernameValidation || passwordValidation) {
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Register</h1>

        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
        />
        {usernameError && (
          <p className="text-red-500 text-sm mt-1 mb-3">{usernameError}</p>
        )}
        {!usernameError && <div className="mb-4" />}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border dark:border-gray-600 p-2 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
        />
        {passwordError && (
          <p className="text-red-500 text-sm mt-1 mb-3">{passwordError}</p>
        )}
        {!passwordError && <div className="mb-4" />}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition">
          Register
        </button>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 dark:text-blue-400">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register