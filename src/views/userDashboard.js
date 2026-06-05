import { authService } from '../services/auth.js'
import { reservationService } from '../services/reservations.js'
import { openModal, closeModal, showAlert } from '../components/modal.js'
import { statusBadge, formatDate } from '../utils/helpers.js'
import { navigate } from '../router/index.js'

export async function renderUserDashboard(container) {
  const user = authService.getSession()

  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Mis Reservas</h2>
        <p class="text-gray-500 text-sm mt-0.5">Bienvenido, ${user.name}</p>
      </div>
      <a href="#/reservations/new" class="btn-primary">+ Nueva Reserva</a>
    </div>
    <div id="reservations-list">
      <div class="text-center py-10 text-gray-400">Cargando...</div>
    </div>
  `

  await loadUserReservations(container, user)
}

async function loadUserReservations(container, user) {
  const listEl = container.querySelector('#reservations-list')
  try {
    const reservations = await reservationService.getByUser(user.id)

    if (reservations.length === 0) {
      listEl.innerHTML = `
        <div class="card text-center py-12">
          <p class="text-gray-400 text-lg mb-3">No tienes reservas aún</p>
          <a href="#/reservations/new" class="btn-primary">Crear mi primera reserva</a>
        </div>
      `
      return
    }

    listEl.innerHTML = `
      <div class="grid gap-4">
        ${reservations.map(r => buildReservationCard(r, false)).join('')}
      </div>
    `

    attachUserCardEvents(container, reservations, user)
  } catch (err) {
    listEl.innerHTML = `<div class="card text-red-500 text-center">${err.message}</div>`
  }
}

function buildReservationCard(r, isAdmin) {
  const canEdit = r.status === 'pending'
  const canCancel = r.status === 'pending' || r.status === 'approved'

  return `
    <div class="card" data-id="${r.id}">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-gray-800">${r.spaceName}</h3>
            ${statusBadge(r.status)}
          </div>
          <p class="text-sm text-gray-600">${r.reason}</p>
          <p class="text-sm text-gray-500 mt-1">${formatDate(r.date)} · ${r.startTime} – ${r.endTime}</p>
          ${isAdmin ? `<p class="text-xs text-gray-400 mt-1">Solicitante: ${r.userName}</p>` : ''}
        </div>
        <div class="flex gap-2 flex-wrap">
          ${canEdit && !isAdmin ? `<button class="btn-secondary text-sm edit-btn" data-id="${r.id}">Editar</button>` : ''}
          ${canCancel ? `<button class="btn-warning text-sm cancel-btn" data-id="${r.id}">Cancelar</button>` : ''}
          ${isAdmin ? `
            <button class="btn-secondary text-sm edit-btn" data-id="${r.id}">Editar</button>
            ${r.status === 'pending' ? `
              <button class="btn-success text-sm approve-btn" data-id="${r.id}">Aprobar</button>
              <button class="btn-danger text-sm reject-btn" data-id="${r.id}">Rechazar</button>
            ` : ''}
            <button class="btn-danger text-sm delete-btn" data-id="${r.id}">Eliminar</button>
          ` : ''}
        </div>
      </div>
    </div>
  `
}

function attachUserCardEvents(container, reservations, user) {
  container.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id)
      openModal(
        'Cancelar reserva',
        '<p class="text-gray-600">¿Estás seguro de que deseas cancelar esta reserva?</p>',
        async () => {
          try {
            await reservationService.update(id, { status: 'cancelled' })
            closeModal()
            showAlert('Reserva cancelada', 'success')
            await loadUserReservations(container, user)
          } catch (err) {
            showAlert(err.message)
          }
        },
        'Sí, cancelar',
        'btn-warning'
      )
    })
  })

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id)
      const r = reservations.find(x => x.id === id)
      if (!r) return
      showEditModal(r, async (data) => {
        try {
          await reservationService.update(id, data)
          closeModal()
          showAlert('Reserva actualizada', 'success')
          await loadUserReservations(container, user)
        } catch (err) {
          showAlert(err.message)
        }
      })
    })
  })
}

function showEditModal(r, onSave) {
  openModal(
    'Editar Reserva',
    `
    <div class="space-y-3">
      <div>
        <label class="form-label">Fecha</label>
        <input type="date" id="edit-date" class="form-input" value="${r.date}" />
      </div>
      <div class="flex gap-3">
        <div class="flex-1">
          <label class="form-label">Hora inicio</label>
          <input type="time" id="edit-start" class="form-input" value="${r.startTime}" />
        </div>
        <div class="flex-1">
          <label class="form-label">Hora fin</label>
          <input type="time" id="edit-end" class="form-input" value="${r.endTime}" />
        </div>
      </div>
      <div>
        <label class="form-label">Motivo</label>
        <input type="text" id="edit-reason" class="form-input" value="${r.reason}" />
      </div>
      <p id="edit-error" class="text-red-500 text-sm hidden"></p>
    </div>
    `,
    () => {
      const date = document.getElementById('edit-date').value
      const startTime = document.getElementById('edit-start').value
      const endTime = document.getElementById('edit-end').value
      const reason = document.getElementById('edit-reason').value.trim()
      const errEl = document.getElementById('edit-error')

      if (!date || !startTime || !endTime || !reason) {
        errEl.textContent = 'Completa todos los campos'
        errEl.classList.remove('hidden')
        return
      }
      if (startTime >= endTime) {
        errEl.textContent = 'La hora de fin debe ser mayor a la de inicio'
        errEl.classList.remove('hidden')
        return
      }

      onSave({ date, startTime, endTime, reason })
    },
    'Guardar cambios'
  )
}

export { buildReservationCard, attachUserCardEvents, showEditModal }
