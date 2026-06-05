// This view reuses admin dashboard reservation table but as its own page
import { renderAdminDashboard } from './adminDashboard.js'

export function renderAdminReservations(container) {
  return renderAdminDashboard(container)
}
