import { authService } from '../services/auth.js'
import { renderLogin } from '../views/login.js'
import { renderAdminDashboard } from '../views/adminDashboard.js'
import { renderUserDashboard } from '../views/userDashboard.js'
import { renderNewReservation } from '../views/newReservation.js'
import { renderAdminReservations } from '../views/adminReservations.js'
import { renderSpaces } from '../views/spaces.js'
import { renderAccessDenied } from '../views/accessDenied.js'
import { renderNavbar } from '../components/navbar.js'

const routes = {
  '#/login': { view: renderLogin, public: true },
  '#/dashboard': { view: renderDashboard, auth: true },
  '#/reservations/new': { view: renderNewReservation, auth: true },
  '#/admin/reservations': { view: renderAdminReservations, auth: true, role: 'admin' },
  '#/admin/spaces': { view: renderSpaces, auth: true, role: 'admin' },
  '#/access-denied': { view: renderAccessDenied, public: true }
}

function renderDashboard() {
  const user = authService.getSession()
  if (user?.role === 'admin') return renderAdminDashboard()
  return renderUserDashboard()
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute)
  handleRoute()
}

export function navigate(hash) {
  window.location.hash = hash
}

function handleRoute() {
  const hash = window.location.hash || '#/login'
  const user = authService.getSession()
  const app = document.getElementById('app')

  // Redirect to login if not authenticated and route requires it
  const route = routes[hash]

  if (!route) {
    // Unknown route
    if (!user) {
      window.location.hash = '#/login'
      return
    }
    window.location.hash = '#/dashboard'
    return
  }

  if (!route.public && !user) {
    window.location.hash = '#/login'
    return
  }

  if (route.public && user && hash === '#/login') {
    window.location.hash = '#/dashboard'
    return
  }

  if (route.role && user?.role !== route.role) {
    window.location.hash = '#/access-denied'
    return
  }

  app.innerHTML = ''

  if (user) {
    app.appendChild(renderNavbar(user))
  }

  const content = document.createElement('div')
  content.id = 'main-content'
  content.className = 'max-w-6xl mx-auto px-4 py-6'
  app.appendChild(content)

  route.view(content)
}
