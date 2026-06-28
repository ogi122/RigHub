import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatDate'

function BuildDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()

  const [build, setBuild] = useState(null)
  const [reviews, setReviews] = useState([])
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0, votes: [] })
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
        setVotes(data)
        setLoading(false)
      })
  }

  const myVote = votes.votes.find((vote) => vote.user_id === user?.id)
  const userHasReviewed = reviews.some((review) => review.user_id === user?.id)

  async function handleVote(voteType) {
    await fetch('http://localhost:5000/api/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ build_id: id, vote_type: voteType })
    })
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
    return <p className="p-8 text-gray-600 dark:text-gray-300">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto flex gap-6 items-start">

        {/* Left column - image, vote buttons, part list, total price */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md overflow-hidden">
            {build.cover_image_url ? (
              <img
                src={`http://localhost:5000${build.cover_image_url}`}
                alt={build.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
              </div>
            )}

            {/* Upvote / downvote buttons */}
            <div className="flex items-center justify-center gap-4 p-3 border-b dark:border-gray-700">
              <button
                onClick={() => handleVote('up')}
                disabled={!user}
                className={`flex items-center gap-1 px-3 py-1 rounded font-bold transition ${myVote?.vote_type === 'up'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  } ${user ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                {votes.upvotes}
              </button>

              <button
                onClick={() => handleVote('down')}
                disabled={!user}
                className={`flex items-center gap-1 px-3 py-1 rounded font-bold transition ${myVote?.vote_type === 'down'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  } ${user ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
                {votes.downvotes}
              </button>
            </div>

            {/* Part list */}
            <div className="p-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Part List</h3>
              <div className="divide-y dark:divide-gray-700">
                {build.components.map((component) => (
                  <div key={component.id} className="py-2 text-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{component.category}</p>
                    <p className="text-gray-900 dark:text-white">
                      {component.name} ({component.brand})
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      ${component.price} x{component.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total price */}
            <div className="flex justify-between items-center p-3 border-t dark:border-gray-700 font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>${build.total_price}</span>
            </div>
          </div>
        </div>

        {/* Right column - title, description, reviews */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{build.title}</h1>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm capitalize">
                {build.purpose || 'N/A'}
              </span>
            </div>

            <Link
              to={`/profile/${build.user_id}`}
              className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-300 hover:underline w-fit"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-sm">{build.author_username}</span>
            </Link>

            <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">{formatDate(build.created_at)}</p>

            <h2 className="font-bold text-gray-900 dark:text-white mb-1">Description</h2>
            <p className="text-gray-600 dark:text-gray-300">{build.description}</p>
          </div>

          <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Reviews</h2>

          {!user && (
            <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded p-4 mb-4 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Want to leave a review?</p>
              <div className="flex gap-2 justify-center">
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">Login</Link>
                <Link to="/register" className="border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 px-4 py-2 rounded">Register</Link>
              </div>
            </div>
          )}

          {user && !userHasReviewed && (
            <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md p-4 mb-4">
              {reviewError && <p className="text-red-500 mb-2">{reviewError}</p>}

              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border dark:border-gray-600 p-2 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full border dark:border-gray-600 p-2 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />

              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Submit Review
              </button>
            </form>
          )}

          {user && userHasReviewed && (
            <p className="text-gray-500 dark:text-gray-400 mb-4">You've already reviewed this build.</p>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{review.username}</span>
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
                  <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  <div className="flex justify-end">
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{formatDate(review.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuildDetail