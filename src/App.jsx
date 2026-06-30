import React, { useEffect, useState, useRef } from 'react'

export default function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [pingOk, setPingOk] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const mountedRef = useRef(true)

  const apiUrl = '/api'

  useEffect(() => {
    mountedRef.current = true
    loadItems()
    ping()
    const t = setInterval(ping, 20000)
    return () => { mountedRef.current = false; clearInterval(t) }
  }, [apiUrl])

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/items`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      if (mountedRef.current) setItems(data)
    } catch (err) {
      console.error('Load items failed', err)
      if (mountedRef.current) setError(err.message || String(err))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  async function ping() {
    try {
      const res = await fetch(`${apiUrl}/ping`)
      setPingOk(res.ok)
    } catch (err) {
      setPingOk(false)
    }
  }

  async function add(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!name) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Status ${res.status}`)
      }
      setName('')
      await loadItems()
    } catch (err) {
      console.error('Add item failed', err)
      setError(err.message || String(err))
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar item?')) return
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/items/${id}`, { method: 'DELETE' })
      if (res.status !== 204 && !res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Status ${res.status}`)
      }
      await loadItems()
    } catch (err) {
      console.error('Delete failed', err)
      setError(err.message || String(err))
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <div className="logo">IT</div>
          <div>
            <div className="title">Innovatech Inventory</div>
            <div className="subtitle">Microservices demo — Frontend</div>
          </div>
        </div>

        <div className="controls">
          <div className="status">
            <span className={`dot ${pingOk ? 'ok' : 'warn'}`}></span>
            <span>{pingOk ? 'Backend reachable' : 'Backend offline'}</span>
          </div>
        </div>
      </div>

      <div className="pane">
        <form className="toolbar" onSubmit={add}>
          <div className="input">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Add new item (e.g. Keyboard)" />
            <button className="btn" disabled={!name || adding} type="submit">
              {adding ? <span className="spinner"/> : 'Add'}
            </button>
          </div>

          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input className="search" placeholder="Search items" value={search} onChange={e => setSearch(e.target.value)} />
            <button type="button" className="refresh" onClick={loadItems}>{loading ? <span className="spinner"/> : 'Refresh'}</button>
          </div>
        </form>

        {error && <div style={{color:'#ffb4b4',marginBottom:12}}>Error: {error}</div>}

        {loading && <div className="empty">Loading items…</div>}

        {!loading && filtered.length === 0 && <div className="empty">No items yet — add one to get started.</div>}

        <div className="grid">
          {filtered.map(item => (
            <div className="card" key={item.id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                <div>
                  <h4 style={{margin:0}}>{item.name}</h4>
                  <div className="muted">ID: {item.id}</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="delete-btn" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}>
                    {deletingId === item.id ? <span className="spinner"/> : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
