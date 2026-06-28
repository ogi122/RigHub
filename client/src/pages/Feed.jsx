import { useState, useEffect } from 'react'
import BuildCard from '../components/BuildCard'

const PURPOSES = ['Gaming', 'Workstation', 'Streaming', 'Budget', 'Office']

function Feed() {
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [purposeFilter, setPurposeFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')

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

  function handleResetFilters() {
    setPurposeFilter('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
  }

  const filteredBuilds = builds
    .filter((build) => build.title.toLowerCase().includes(search.toLowerCase()))
    .filter((build) => purposeFilter === '' || build.purpose === purposeFilter)
    .filter((build) => minPrice === '' || Number(build.total_price) >= Number(minPrice))
    .filter((build) => maxPrice === '' || Number(build.total_price) <= Number(maxPrice))
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at)
      }
      if (sortBy === 'cheapest') {
        return Number(a.total_price) - Number(b.total_price)
      }
      if (sortBy === 'priciest') {
        return Number(b.total_price) - Number(a.total_price)
      }
      if (sortBy === 'most_upvoted') {
        return (b.like_count || 0) - (a.like_count || 0)
      }
      if (sortBy === 'most_reviewed') {
        return (b.review_count || 0) - (a.review_count || 0)
      }
      return 0
    })

  if (loading) {
    return <p className="p-8 text-gray-600 dark:text-gray-300">Loading builds...</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Feed title block - full width, lighter shade of navbar blue */}
      <div className="bg-blue-950 py-8 text-center border-b dark:border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Discover Builds
          </h1>
        </div>
      </div>

      {/* Search bar - centered on top */}
      <div className="flex justify-center px-8 pt-8">
        <div className="relative w-full max-w-2xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search builds by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg rounded-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filters (left, always visible) + builds grid (right, fills remaining space) */}
      <div className="flex gap-6 p-8 items-start">
        <div className="w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md p-4 flex-shrink-0">
          <h3 className="font-bold mb-3 text-gray-900 dark:text-white">Filters</h3>

          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Purpose</label>
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="w-full border dark:border-gray-600 p-2 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="">All purposes</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Min Price ($)</label>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border dark:border-gray-600 p-2 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />

          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Max Price ($)</label>
          <input
            type="number"
            placeholder="9999"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border dark:border-gray-600 p-2 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />

          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border dark:border-gray-600 p-2 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="cheapest">Cheapest first</option>
            <option value="priciest">Priciest first</option>
            <option value="most_upvoted">Most upvoted</option>
            <option value="most_reviewed">Most reviewed</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>

        {/* Builds grid - fills remaining space, columns shrink on smaller screens, card size stays fixed */}
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            {filteredBuilds.length} build(s) found
          </p>

          {filteredBuilds.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No builds match your search.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {filteredBuilds.map((build) => (
                <BuildCard key={build.id} build={build} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Feed