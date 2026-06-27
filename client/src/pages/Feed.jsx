import { useState, useEffect } from 'react'
import BuildCard from '../components/BuildCard'

function Feed() {
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/builds')
      .then((response) => response.json())
      .then((data) => {
        setBuilds(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching builds:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="p-8">Loading builds...</p>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>

      {builds.length === 0 ? (
        <p>No builds yet. Be the first to create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Feed