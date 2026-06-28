import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'PSU', 'Case', 'Cooler', 'Motherboard']

function AdminPanel() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('components')

  const [components, setComponents] = useState([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('CPU')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [componentError, setComponentError] = useState('')
  const [componentSuccess, setComponentSuccess] = useState('')

  const [users, setUsers] = useState([])
  const [builds, setBuilds] = useState([])

  useEffect(() => {
    fetchComponents()
    fetchUsers()
    fetchBuilds()
  }, [])

  function fetchComponents() {
    fetch('http://localhost:5000/api/components')
      .then((res) => res.json())
      .then((data) => setComponents(data))
  }

  function fetchUsers() {
    fetch('http://localhost:5000/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
  }

  function fetchBuilds() {
    fetch('http://localhost:5000/api/builds')
      .then((res) => res.json())
      .then((data) => setBuilds(data))
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  function handleRemoveImage() {
    setImage(null)
    setImagePreview(null)
  }

  async function handleAddComponent(e) {
    e.preventDefault()
    setComponentError('')
    setComponentSuccess('')

    const formData = new FormData()
    formData.append('name', name)
    formData.append('category', category)
    formData.append('brand', brand)
    formData.append('price', price)
    if (image) formData.append('image', image)

    const response = await fetch('http://localhost:5000/api/components', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      setComponentError(data.message)
      return
    }

    setComponentSuccess('Component added successfully!')
    setName('')
    setBrand('')
    setPrice('')
    setImage(null)
    setImagePreview(null)
    fetchComponents()
  }

  async function handleDeleteComponent(id) {
    if (!window.confirm('Delete this component?')) return

    await fetch(`http://localhost:5000/api/components/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchComponents()
  }

  async function handleBanToggle(userId, isBanned) {
    const action = isBanned ? 'unban' : 'ban'
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

    const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/ban`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.ok) {
      const data = await response.json()
      alert(data.message)
      return
    }

    fetchUsers()
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Permanently delete this user and all their builds, reviews, and votes? This cannot be undone.')) return

    const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.ok) {
      const data = await response.json()
      alert(data.message)
      return
    }

    fetchUsers()
  }

  async function handleDeleteBuild(buildId) {
    if (!window.confirm('Delete this build?')) return

    const response = await fetch(`http://localhost:5000/api/builds/${buildId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.ok) {
      const data = await response.json()
      alert(data.message)
      return
    }

    fetchBuilds()
  }

  // Admins se ne prikazuju u listi - admin nad admin nalozima ne radi nikakve akcije
  const visibleUsers = users.filter((u) => u.role !== 'admin')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admin Panel</h1>

        <div className="flex gap-2 mb-6">
          {['components', 'users', 'builds'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-bold capitalize transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Components tab */}
        {activeTab === 'components' && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Add New Component</h2>
            <form onSubmit={handleAddComponent} className="bg-white dark:bg-gray-800 rounded shadow-md p-4 mb-6">
              {componentError && <p className="text-red-500 mb-2">{componentError}</p>}
              {componentSuccess && <p className="text-green-500 mb-2">{componentSuccess}</p>}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {imagePreview ? (
                <div className="relative mb-3">
                  <img
                    src={imagePreview}
                    alt="Component preview"
                    className="w-full h-40 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="component-image-upload"
                  className="flex items-center justify-center gap-2 w-full h-24 mb-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-blue-600 dark:text-blue-400 font-semibold"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span>Add image</span>
                  <input
                    id="component-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition cursor-pointer"
              >
                Add Component
              </button>
            </form>

            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              All Components ({components.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded shadow-md divide-y dark:divide-gray-700">
              {components.map((c) => (
                <div key={c.id} className="flex justify-between items-center p-3">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{c.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      {c.brand} · {c.category} · ${c.price}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteComponent(c.id)}
                    className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              All Users ({visibleUsers.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded shadow-md divide-y dark:divide-gray-700">
              {visibleUsers.map((u) => (
                <div key={u.id} className="flex justify-between items-center p-3">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{u.username}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{u.email}</span>
                    {u.is_banned === 1 && (
                      <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded">
                        Banned
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBanToggle(u.id, u.is_banned === 1)}
                      className="text-sm cursor-pointer text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
                    >
                      {u.is_banned === 1 ? 'Unban' : 'Ban'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {visibleUsers.length === 0 && (
                <p className="p-3 text-gray-500 dark:text-gray-400 text-sm">No users to manage.</p>
              )}
            </div>
          </div>
        )}

        {/* Builds tab */}
        {activeTab === 'builds' && (
          <div>
            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              All Builds ({builds.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded shadow-md divide-y dark:divide-gray-700">
              {builds.map((b) => (
                <div key={b.id} className="flex justify-between items-center p-3">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{b.title}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">${b.total_price}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBuild(b.id)}
                    className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel