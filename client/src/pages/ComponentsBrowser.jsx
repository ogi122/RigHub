import { useState, useEffect } from 'react'

const CATEGORIES = ['All', 'CPU', 'GPU', 'RAM', 'Storage', 'PSU', 'Case', 'Cooler', 'Motherboard']

function ComponentsBrowser() {
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [brandFilter, setBrandFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/components')
      .then((res) => res.json())
      .then((data) => {
        setComponents(data)
        setLoading(false)
      })
  }, [])

  const brands = [...new Set(components.map((c) => c.brand))].sort()

  const filtered = components.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter
    const matchesBrand = brandFilter === '' || c.brand === brandFilter
    const matchesMinPrice = minPrice === '' || Number(c.price) >= Number(minPrice)
    const matchesMaxPrice = maxPrice === '' || Number(c.price) <= Number(maxPrice)
    return matchesSearch && matchesCategory && matchesBrand && matchesMinPrice && matchesMaxPrice
  })

  function handleReset() {
    setSearch('')
    setCategoryFilter('All')
    setBrandFilter('')
    setMinPrice('')
    setMaxPrice('')
  }

  if (loading) {
    return <p className="p-8 text-gray-600 dark:text-gray-300">Loading components...</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Components Browser</h1>

        <div className="relative mb-6">
          <div className="absolute left-0 top-0 h-full flex items-center pl-3 pr-3 border-r dark:border-gray-600">
            <svg
              className="w-5 h-5 text-gray-400"
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
          </div>
          <input
            type="text"
            placeholder="Quick search by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 border dark:border-gray-600 p-2 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded shadow-md p-4 mb-6">
          <h2 className="font-bold mb-3 text-gray-700 dark:text-gray-200">Advanced Filters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Min Price ($)</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Max Price ($)</label>
              <input
                type="number"
                placeholder="9999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reset filters
          </button>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{filtered.length} component(s) found</p>

        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No components match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((component) => (
              <div key={component.id} className="bg-white dark:bg-gray-800 rounded shadow-md p-4">
                {component.image_url && (
                  <img
                    src={`http://localhost:5000${component.image_url}`}
                    alt={component.name}
                    className="w-full h-32 object-contain mb-3"
                  />
                )}
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  {component.category}
                </span>
                <h3 className="font-bold mt-2 text-gray-900 dark:text-white">{component.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{component.brand}</p>
                <p className="font-bold text-lg mt-1 text-gray-900 dark:text-white">${component.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComponentsBrowser