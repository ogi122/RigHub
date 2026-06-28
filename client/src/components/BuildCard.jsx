import { Link } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'

function BuildCard({ build }) {
  return (
    <Link
      to={`/builds/${build.id}`}
      className="block w-74 h-90 flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md overflow-hidden hover:shadow-lg transition"
    >
      {/* Cover image - fixed height, doesn't shrink */}
      {build.cover_image_url ? (
        <img
          src={`http://localhost:5000${build.cover_image_url}`}
          alt={build.title}
          className="w-full h-40 object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
        </div>
      )}

      {/* Text content - fills remaining space, column layout */}
      <div className="flex-1 flex flex-col p-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {build.title}
        </h2>

        {/* min-h reserves space for 2 lines even if description is short,
            line-clamp-2 cuts off with "..." if description is too long */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {build.description}
        </p>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded capitalize">
            {build.purpose || 'N/A'}
          </span>
        </div>

        {/* Upvotes and reviews count */}
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            {build.like_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {build.review_count || 0}
          </span>
        </div>

        {/* Footer (price + date) - pushed to bottom via mt-auto, always
            below everything above it, can never overlap */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-gray-900 dark:text-white">
            ${build.total_price}
          </span>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            {formatDate(build.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default BuildCard