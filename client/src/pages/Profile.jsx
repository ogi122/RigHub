import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BuildCard from '../components/BuildCard'

function Profile() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const fileInputRef = useRef(null)

  const [profileUser, setProfileUser] = useState(null)
  const [myBuilds, setMyBuilds] = useState([])
  const [likedBuilds, setLikedBuilds] = useState([])
  const [activeTab, setActiveTab] = useState('builds')
  const [loading, setLoading] = useState(true)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  useEffect(() => {
    fetchProfileData()
  }, [id])

  function fetchProfileData() {
    fetch(`http://localhost:5000/api/auth/user/${id}`)
      .then((res) => res.json())
      .then((data) => setProfileUser(data))
      .catch((error) => console.error('Error fetching user:', error))

    fetch(`http://localhost:5000/api/builds/user/${id}`)
      .then((res) => res.json())
      .then((data) => setMyBuilds(data))
      .catch((error) => console.error('Error fetching builds:', error))

    fetch(`http://localhost:5000/api/likes/user/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLikedBuilds(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching liked builds:', error)
        setLoading(false)
      })
  }

  function handleAvatarClick() {
    fileInputRef.current.click()
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setAvatarUploading(true)
    setAvatarError('')

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const response = await fetch('http://localhost:5000/api/auth/avatar', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setAvatarError(data.message)
        setAvatarUploading(false)
        return
      }

      fetchProfileData()
      setAvatarUploading(false)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setAvatarError('Something went wrong. Please try again.')
      setAvatarUploading(false)
    }
  }

  if (loading) {
    return <p className="p-8 text-gray-600 dark:text-gray-300">Loading profile...</p>
  }

  if (!profileUser) {
    return <p className="p-8 text-gray-600 dark:text-gray-300">User not found.</p>
  }

  const isOwnProfile = user && user.id === profileUser.id

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded shadow-md p-6 mb-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {profileUser.avatar_url ? (
              <img
                src={`http://localhost:5000${profileUser.avatar_url}`}
                alt={profileUser.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileUser.username.charAt(0).toUpperCase()}
              </div>
            )}

            {isOwnProfile && (
              <>
                <button
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  title="Change profile picture"
                  className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 border-2 border-white dark:border-gray-800 cursor-pointer transition"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.username}</h1>
            {profileUser.bio && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">{profileUser.bio}</p>
            )}
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {myBuilds.length} build(s) · {likedBuilds.length} liked
            </p>
            {avatarUploading && (
              <p className="text-blue-500 text-sm mt-1">Uploading...</p>
            )}
            {avatarError && (
              <p className="text-red-500 text-sm mt-1">{avatarError}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('builds')}
            className={`px-4 py-2 rounded font-bold transition cursor-pointer ${
              activeTab === 'builds'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'
            }`}
          >
            My Builds ({myBuilds.length})
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-4 py-2 rounded font-bold transition cursor-pointer ${
              activeTab === 'liked'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'
            }`}
          >
            Liked Builds ({likedBuilds.length})
          </button>
        </div>

        {activeTab === 'builds' && (
          <div>
            {myBuilds.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No builds yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {myBuilds.map((build) => (
                  <BuildCard key={build.id} build={build} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            {likedBuilds.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No liked builds yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {likedBuilds.map((build) => (
                  <BuildCard key={build.id} build={build} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile