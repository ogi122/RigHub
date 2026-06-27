import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'PSU', 'Case', 'Cooler', 'Motherboard']

function AdminPanel() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('components')

  // Components state
  const [components, setComponents] = useState([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('CPU')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState(null)
  const [componentError, setComponentError] = useState('')
  const [componentSuccess, setComponentSuccess] = useState('')

  // Users state
  const [users, setUsers] = useState([])

  // Builds state
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

  async function handleChangeRole(userId, newRole) {
    await fetch(`http://localhost:5000/api/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    })
    fetchUsers()
  }

  async function handleDeleteBuild(buildId) {
    if (!window.confirm('Delete this build?')) return

    await fetch(`http://localhost:5000/api/builds/${buildId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchBuilds()
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['components', 'users', 'builds'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-bold capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Components tab */}
      {activeTab === 'components' && (
        <div>
          <h2 className="text-lg font-bold mb-4">Add New Component</h2>
          <form onSubmit={handleAddComponent} className="bg-white rounded shadow-md p-4 mb-6">
            {componentError && <p className="text-red-500 mb-2">{componentError}</p>}
            {componentSuccess && <p className="text-green-500 mb-2">{componentSuccess}</p>}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border p-2 rounded"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="mb-3"
            />

            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
              Add Component
            </button>
          </form>

          <h2 className="text-lg font-bold mb-3">All Components ({components.length})</h2>
          <div className="bg-white rounded shadow-md divide-y">
            {components.map((c) => (
              <div key={c.id} className="flex justify-between items-center p-3">
                <div>
                  <span className="font-bold">{c.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {c.brand} · {c.category} · ${c.price}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteComponent(c.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
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
          <h2 className="text-lg font-bold mb-3">All Users ({users.length})</h2>
          <div className="bg-white rounded shadow-md divide-y">
            {users.map((u) => (
              <div key={u.id} className="flex justify-between items-center p-3">
                <div>
                  <span className="font-bold">{u.username}</span>
                  <span className="text-gray-500 text-sm ml-2">{u.email}</span>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleChangeRole(u.id, e.target.value)}
                  className="border p-1 rounded text-sm"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Builds tab */}
      {activeTab === 'builds' && (
        <div>
          <h2 className="text-lg font-bold mb-3">All Builds ({builds.length})</h2>
          <div className="bg-white rounded shadow-md divide-y">
            {builds.map((b) => (
              <div key={b.id} className="flex justify-between items-center p-3">
                <div>
                  <span className="font-bold">{b.title}</span>
                  <span className="text-gray-500 text-sm ml-2">${b.total_price}</span>
                </div>
                <button
                  onClick={() => handleDeleteBuild(b.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel