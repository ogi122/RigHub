import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatDate'

function BuildDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()

  const [build, setBuild] = useState(null)
  const [reviews, setReviews] = useState([])
  const [likes, setLikes] = useState({ count: 0, likes: [] })
  const [loading, setLoading] = useState(true)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [id])

  function fetchAllData() {
    fetch(`http://localhost:5000/api/builds/${id}`)
      .then((res) => res.json())
      .then((data) => setBuild(data))

    fetch(`http://localhost:5000/api/reviews/build/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data))

    fetch(`http://localhost:5000/api/likes/build/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLikes(data)
        setLoading(false)
      })
  }

  const userHasLiked = likes.likes.some((like) => like.user_id === user?.id)
  const userHasReviewed = reviews.some((review) => review.user_id === user?.id)

  async function handleLikeToggle() {
    if (userHasLiked) {
      await fetch(`http://localhost:5000/api/likes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      await fetch('http://localhost:5000/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ build_id: id })
      })
    }
    fetchAllData()
  }

  async function handleReviewSubmit(e) {
    e.preventDefault()
    setReviewError('')

    const response = await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ build_id: id, rating, comment })
    })

    const data = await response.json()

    if (!response.ok) {
      setReviewError(data.message)
      return
    }

    setComment('')
    setRating(5)
    fetchAllData()
  }

  async function handleDeleteReview(reviewId) {
    await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchAllData()
  }

  if (loading || !build) {
    return <p className="p-8">Loading...</p>
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{build.title}</h1>
      <p className="text-gray-600 mt-2">{build.description}</p>
      <p className="text-gray-400 text-sm mt-1">{formatDate(build.created_at)}</p>

      <div className="flex items-center gap-4 mt-4">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
          {build.purpose || 'N/A'}
        </span>
        <span className="font-bold text-xl">${build.total_price}</span>

        {user && (
          <button
            onClick={handleLikeToggle}
            className={`px-3 py-1 rounded ${
              userHasLiked ? 'bg-red-500 text-white' : 'bg-gray-200'
            }`}
          >
            ❤️ {likes.count} {userHasLiked ? 'Likes' : 'Likes'}
          </button>
        )}
      </div>

      <h2 className="text-xl font-bold mt-8 mb-3">Components</h2>
      <div className="bg-white rounded shadow-md divide-y">
        {build.components.map((component) => (
          <div key={component.id} className="flex justify-between p-3">
            <span>{component.category}: {component.name} ({component.brand})</span>
            <span>${component.price} x{component.quantity}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-8 mb-3">Reviews</h2>

      {user && !userHasReviewed && (
        <form onSubmit={handleReviewSubmit} className="bg-white rounded shadow-md p-4 mb-4">
          {reviewError && <p className="text-red-500 mb-2">{reviewError}</p>}

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border p-2 rounded mb-2"
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Average</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Terrible</option>
          </select>

          <textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Submit Review
          </button>
        </form>
      )}

      {user && userHasReviewed && (
        <p className="text-gray-500 mb-4">You've already reviewed this build.</p>
      )}

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded shadow-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold">{review.username}</span>
                  <span className="ml-2">{'⭐'.repeat(review.rating)}</span>
                </div>
                {user && user.id === review.user_id && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-400 text-sm hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-600">{review.comment}</p>
              <div className="flex justify-end">
                <p className="text-gray-400 text-xs mt-1">{formatDate(review.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BuildDetail