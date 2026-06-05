const API = 'http://localhost:3001'

export const spaceService = {
  async getAll() {
    const res = await fetch(`${API}/spaces`)
    if (!res.ok) throw new Error('No se pudieron cargar los espacios')
    return res.json()
  },

  async getById(id) {
    const res = await fetch(`${API}/spaces/${id}`)
    if (!res.ok) throw new Error('Espacio no encontrado')
    return res.json()
  },

  async create(data) {
    const res = await fetch(`${API}/spaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('No se pudo crear el espacio')
    return res.json()
  },

  async update(id, data) {
    const res = await fetch(`${API}/spaces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('No se pudo actualizar el espacio')
    return res.json()
  },

  async delete(id) {
    const res = await fetch(`${API}/spaces/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('No se pudo eliminar el espacio')
  }
}
