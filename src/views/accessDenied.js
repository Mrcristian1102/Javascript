import { authService } from '../services/auth.js'

export function renderAccessDenied(container) {
  const user = authService.getSession()

  container.innerHTML = `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="card text-center max-w-sm">
        <div class="text-5xl mb-4">🔒</div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
        <p class="text-gray-500 text-sm mb-6">No tienes permiso para acceder a esta sección.</p>
        ${user
          ? `<a href="#/dashboard" class="btn-primary">Volver al inicio</a>`
          : `<a href="#/login" class="btn-primary">Ir al login</a>`
        }
      </div>
    </div>
  `
}
