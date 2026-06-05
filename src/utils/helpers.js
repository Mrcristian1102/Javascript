export function statusBadge(status) {
  const map = {
    pending: '<span class="badge-pending">Pendiente</span>',
    approved: '<span class="badge-approved">Aprobada</span>',
    rejected: '<span class="badge-rejected">Rechazada</span>',
    cancelled: '<span class="badge-cancelled">Cancelada</span>'
  }
  return map[status] || `<span class="badge-pending">${status}</span>`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}
