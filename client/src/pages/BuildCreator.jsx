import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'PSU', 'Case', 'Cooler', 'Motherboard']

function BuildCreator() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [purpose, setPurpose] = useState('')
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [components, setComponents] = useState([])
  const [selectedComponents, setSelectedComponents] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/components')
      .then((res) => res.json())
      .then((data) => setComponents(data))
  }, [])

  function handleSelectComponent(category, component) {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: component
    }))
  }

  function getComponentsByCategory(category) {
    return components.filter((c) => c.category === category)
  }

  function handleCoverImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  function handleRemoveCoverImage() {
    setCoverImage(null)
    setCoverImagePreview(null)
  }

  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, c) => sum + Number(c.price),
    0
  )

  const selectedIds = Object.values(selectedComponents).map((c) => c.id)

  async function handleSubmit() {
    setError('')

    if (!title || !description) {
      setError('Title and description are required')
      return
    }

    if (selectedIds.length === 0) {
      setError('Select at least one component')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('purpose', purpose)
    formData.append('componentIds', JSON.stringify(selectedIds))
    if (coverImage) {
      formData.append('cover_image', coverImage)
    }

    const response = await fetch('http://localhost:5000/api/builds', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.message)
      return
    }

    navigate(`/builds/${data.buildId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Create a Build</h1>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded ${step >= s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded shadow-md p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Step 1: Basic Info</h2>

            <input
              type="text"
              placeholder="Build title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border dark:border-gray-600 p-2 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />

            <textarea
              placeholder="Describe your build..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border dark:border-gray-600 p-2 rounded mb-4 h-28 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />

            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border dark:border-gray-600 p-2 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select purpose (optional)</option>
              <option value="gaming">Gaming</option>
              <option value="workstation">Workstation</option>
              <option value="streaming">Streaming</option>
              <option value="budget">Budget</option>
              <option value="office">Office</option>
            </select>

            {/* Cover image upload - optional */}
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Cover image (optional)
            </label>

            {coverImagePreview ? (
              <div className="relative mb-4">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-40 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="cover-image-upload"
                className="flex items-center justify-center gap-2 w-full h-24 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-blue-600 dark:text-blue-400 font-semibold"
              >
                <span className="text-2xl leading-none">+</span>
                <span>Add cover image</span>
                <input
                  id="cover-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </label>
            )}

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <button
              onClick={() => {
                if (!title || !description) {
                  setError('Title and description are required')
                  return
                }
                setError('')
                setStep(2)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded shadow-md p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Step 2: Pick Components</h2>

            {CATEGORIES.map((category) => (
              <div key={category} className="mb-4">
                <h3 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-1">{category}</h3>
                <select
                  value={selectedComponents[category]?.id || ''}
                  onChange={(e) => {
                    const found = components.find((c) => c.id === Number(e.target.value))
                    if (found) handleSelectComponent(category, found)
                  }}
                  className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Select {category} --</option>
                  {getComponentsByCategory(category).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.brand}) — ${c.price}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 p-2 rounded cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (selectedIds.length === 0) {
                    setError('Select at least one component')
                    return
                  }
                  setError('')
                  setStep(3)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition cursor-pointer"
              >
                Next →
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Step 3: Review & Publish</h2>

            <div className="bg-white dark:bg-gray-800 rounded shadow-md overflow-hidden mb-4">
              {coverImagePreview && (
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{description}</p>
                {purpose && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm">
                    {purpose}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded shadow-md divide-y dark:divide-gray-700 mb-4">
              {Object.values(selectedComponents).map((c) => (
                <div key={c.id} className="flex justify-between p-3 text-sm text-gray-800 dark:text-gray-200">
                  <span>{c.category}: {c.name} ({c.brand})</span>
                  <span>${c.price}</span>
                </div>
              ))}
              <div className="flex justify-between p-3 font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 p-2 rounded cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded transition cursor-pointer flex items-center justify-center gap-2"
              >
                Publish Build
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuildCreator