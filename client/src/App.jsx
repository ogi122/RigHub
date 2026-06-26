import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((response) => response.json())
      .then((data) => {
        setHealthStatus(data)
      })
      .catch((error) => {
        console.error('Error connecting to backend:', error)
      })
  }, [])

  return (
    <div>
      <h1>PC Build Showcase</h1>
      <h2>Backend connection test</h2>
      {healthStatus ? (
        <p>Status: {healthStatus.status} - {healthStatus.message}</p>
      ) : (
        <p>Connecting to backend...</p>
      )}
    </div>
  )
}

export default App
