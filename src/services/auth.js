const API = 'http://localhost:3001'

export const authService = {
  async login(email, password) {
    const res = await fetch(`${API}/users?email=${encodeURIComponent(email)}`)
    if (!res.ok) throw new Error('Error de conexión con el servidor')
    const users = await res.json()
    const user = users[0]
    if (!user || user.password !== password) {
      throw new Error('Correo o contraseña incorrectos')
    }
    const { password: _, ...safeUser } = user
    return safeUser
  },

  saveSession(user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  },

  getSession() {
    const data = localStorage.getItem('currentUser')
    return data ? JSON.parse(data) : null
  },

  clearSession() {
    localStorage.removeItem('currentUser')
  },

  isAuthenticated() {
    return !!this.getSession()
  },

  isAdmin() {
    const user = this.getSession()
    return user?.role === 'admin'
  }
}
