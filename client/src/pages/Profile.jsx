import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BuildCard from '../components/BuildCard'

function Profile() {
  const { id } = useParams()
  const { user } = useAuth()

  const [profileUser, setProfileUser] = useState(null)
  const [myBuilds, setMyBuilds] = useState([])
  const [likedBuilds, setLikedBuilds] = useState([])
  const [activeTab, setActiveTab] = useState('builds')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [id])

  function fetchProfileData() {
    fetch(`http://localhost:5000/api/auth/user/${id}`)
      .then((res) => res.json())
      .then((data) => setProfileUser(data))

    fetch(`http://localhost:5000/api/builds/user/${id}`)
      .then((res) => res.json())
      .then((data) => setMyBuilds(data))

    fetch(`http://localhost:5000/api/likes/user/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLikedBuilds(data)
        setLoading(false)
      })
  }

  if (loading) {
    return <p className="p-8">Loading profile...</p>
  }

  if (!profileUser) {
    return <p className="p-8">User not found.</p>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profil info */}
      <div className="bg-white rounded shadow-md p-6 mb-6 flex items-center gap-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {profileUser.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profileUser.username}</h1>
          {profileUser.bio && (
            <p className="text-gray-600 mt-1">{profileUser.bio}</p>
          )}
          <p className="text-gray-400 text-sm mt-1">
            {myBuilds.length} build(s) · {likedBuilds.length} liked
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('builds')}
          className={`px-4 py-2 rounded font-bold ${
            activeTab === 'builds'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border'
          }`}
        >
          My Builds ({myBuilds.length})
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`px-4 py-2 rounded font-bold ${
            activeTab === 'liked'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border'
          }`}
        >
          Liked Builds ({likedBuilds.length})
        </button>
      </div>

      {/* Tab sadržaj */}
      {activeTab === 'builds' && (
        <div>
          {myBuilds.length === 0 ? (
            <p className="text-gray-500">No builds yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p className="text-gray-500">No liked builds yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {likedBuilds.map((build) => (
                <BuildCard key={build.id} build={build} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile