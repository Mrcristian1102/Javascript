import { authService } from '../services/auth.js'
import { navigate } from '../router/index.js'

export function renderNavbar(user) {
  const nav = document.createElement('nav')
  nav.className = 'bg-indigo-700 text-white shadow-md'
  nav.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold tracking-tight">SpaceBook</span>
        <span class="text-indigo-300 text-sm hidden sm:inline">| Reserva de Espacios</span>
      </div>
      <div class="flex items-center gap-4">
        <div class="hidden sm:flex gap-3 text-sm">
          <a href="#/dashboard" class="hover:text-indigo-200 transition-colors">Inicio</a>
          ${user.role === 'admin' ? `
            <a href="#/admin/reservations" class="hover:text-indigo-200 transition-colors">Todas las Reservas</a>
            <a href="#/admin/spaces" class="hover:text-indigo-200 transition-colors">Espacios</a>
          ` : `
            <a href="#/reservations/new" class="hover:text-indigo-200 transition-colors">Nueva Reserva</a>
          `}
        </div>
        <div class="flex items-center gap-2 border-l border-indigo-500 pl-4">
          <span class="text-sm hidden sm:block">${user.name}</span>
          <span class="text-xs bg-indigo-500 px-2 py-0.5 rounded-full">${user.role}</span>
          <button id="logout-btn" class="text-sm bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 px-3 py-1 rounded-lg transition-colors">
            Salir
          </button>
        </div>
      </div>
    </div>
  `

  nav.querySelector('#logout-btn').addEventListener('click', () => {
    authService.clearSession()
    navigate('#/login')
  })

  return nav
}
