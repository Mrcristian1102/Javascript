const API = 'http://localhost:3001'

export const reservationService = {
  async getAll() {
    const res = await fetch(`${API}/reservations`)
    if (!res.ok) throw new Error('No se pudieron cargar las reservas')
    return res.json()
  },

  async getByUser(userId) {
    const res = await fetch(`${API}/reservations?userId=${userId}`)
    if (!res.ok) throw new Error('No se pudieron cargar las reservas')
    return res.json()
  },

  async create(data) {
    // Check for duplicate
    const existing = await this.getAll()
    const conflict = existing.find(
      r =>
        r.spaceId === data.spaceId &&
        r.date === data.date &&
        r.status !== 'cancelled' &&
        r.status !== 'rejected' &&
        this._timesOverlap(r.startTime, r.endTime, data.startTime, data.endTime)
    )
    if (conflict) throw new Error('Ya existe una reserva para ese espacio en ese horario')

    const res = await fetch(`${API}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: 'pending' })
    })
    if (!res.ok) throw new Error('No se pudo crear la reserva')
    return res.json()
  },

  async update(id, data) {
    const res = await fetch(`${API}/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('No se pudo actualizar la reserva')
    return res.json()
  },

  async delete(id) {
    const res = await fetch(`${API}/reservations/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('No se pudo eliminar la reserva')
  },

  _timesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && end1 > start2
  }
}
