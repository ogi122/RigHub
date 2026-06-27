import { Link } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'

function BuildCard({ build }) {
  return (
    <Link
      to={`/builds/${build.id}`}
      className="block bg-white rounded shadow-md p-4 hover:shadow-lg transition"
    >
      <h2 className="text-lg font-bold">{build.title}</h2>
      <p className="text-gray-600 text-sm mb-2">{build.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
          {build.purpose || 'N/A'}
        </span>
        <span className="font-bold">${build.total_price}</span>
      </div>
      <p className="text-gray-400 text-xs mt-2">{formatDate(build.created_at)}</p>
    </Link>
  )
}

export default BuildCard