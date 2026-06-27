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

    const response = await fetch('http://localhost:5000/api/builds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        purpose,
        componentIds: selectedIds
      })
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.message)
      return
    }

    navigate(`/builds/${data.buildId}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Create a Build</h1>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Step 1: Basic Info</h2>

          <input
            type="text"
            placeholder="Build title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <textarea
            placeholder="Describe your build..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded mb-4 h-28"
          />

          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="">Select purpose (optional)</option>
            <option value="gaming">Gaming</option>
            <option value="workstation">Workstation</option>
            <option value="streaming">Streaming</option>
            <option value="budget">Budget</option>
            <option value="office">Office</option>
          </select>

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
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Step 2: Pick Components</h2>

          {CATEGORIES.map((category) => (
            <div key={category} className="mb-4">
              <h3 className="font-bold text-sm text-gray-600 mb-1">{category}</h3>
              <select
                value={selectedComponents[category]?.id || ''}
                onChange={(e) => {
                  const found = components.find((c) => c.id === Number(e.target.value))
                  if (found) handleSelectComponent(category, found)
                }}
                className="w-full border p-2 rounded"
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
              className="flex-1 border border-blue-600 text-blue-600 p-2 rounded"
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
              className="flex-1 bg-blue-600 text-white p-2 rounded"
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
          <h2 className="text-lg font-bold mb-4">Step 3: Review & Publish</h2>

          <div className="bg-white rounded shadow-md p-4 mb-4">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-gray-600 text-sm mb-2">{description}</p>
            {purpose && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                {purpose}
              </span>
            )}
          </div>

          <div className="bg-white rounded shadow-md divide-y mb-4">
            {Object.values(selectedComponents).map((c) => (
              <div key={c.id} className="flex justify-between p-3 text-sm">
                <span>{c.category}: {c.name} ({c.brand})</span>
                <span>${c.price}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-red-500 mb-2">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 border border-blue-600 text-blue-600 p-2 rounded"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 text-white p-2 rounded"
            >
              Publish Build 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuildCreator