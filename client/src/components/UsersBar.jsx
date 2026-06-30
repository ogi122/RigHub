import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function UsersBar() {
  const [users, setUsers] = useState([])
  const scrollRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const movedDistance = useRef(0)

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/users/all')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error))
  }, [])

  function handleMouseDown(e) {
    isDragging.current = true
    startX.current = e.pageX
    scrollLeftStart.current = scrollRef.current.scrollLeft
    movedDistance.current = 0
  }

  function handleMouseMove(e) {
    if (!isDragging.current) return
    e.preventDefault()
    const distance = e.pageX - startX.current
    movedDistance.current = Math.abs(distance)
    scrollRef.current.scrollLeft = scrollLeftStart.current - distance
  }

  function handleMouseUp() {
    isDragging.current = false
  }

  function handleLinkClick(e) {
    // Ako je miš pomjeren vise od 5px tokom klika, to je bio drag, ne klik - sprijeci navigaciju
    if (movedDistance.current > 5) {
      e.preventDefault()
    }
  }

  if (users.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 border-b-4 border-blue-400 dark:border-gray-900 px-4 py-1">
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
      >
        {users.map((user, index) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            draggable={false}
            onClick={handleLinkClick}
            className={`flex flex-col items-center gap-2 flex-shrink-0 px-5 py-2 hover:bg-gray-50 transition ${index !== users.length - 1 ? 'border-r border-gray-200' : ''}`}
          >
            {user.avatar_url ? (
              <img
                src={`http://localhost:5000${user.avatar_url}`}
                alt={user.username}
                draggable={false}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-blue-500">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-black dark:text-gray-300 w-16 text-center truncate">
              {user.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default UsersBar