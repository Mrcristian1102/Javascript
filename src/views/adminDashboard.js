import { authService } from '../services/auth.js'
import { reservationService } from '../services/reservations.js'
import { openModal, closeModal, showAlert } from '../components/modal.js'
import { statusBadge, formatDate } from '../utils/helpers.js'

export async function renderAdminDashboard(container) {
  const user = authService.getSession()

  container.innerHTML = `
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Panel de Administración</h2>
      <p class="text-gray-500 text-sm mt-0.5">Bienvenido, ${user.name}</p>
    </div>

    <div id="stats-row" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="card text-center"><div class="text-2xl font-bold text-indigo-600" id="stat-total">-</div><div class="text-xs text-gray-500 mt-1">Total</div></div>
      <div class="card text-center"><div class="text-2xl font-bold text-yellow-500" id="stat-pending">-</div><div class="text-xs text-gray-500 mt-1">Pendientes</div></div>
      <div class="card text-center"><div class="text-2xl font-bold text-green-600" id="stat-approved">-</div><div class="text-xs text-gray-500 mt-1">Aprobadas</div></div>
      <div class="card text-center"><div class="text-2xl font-bold text-red-500" id="stat-rejected">-</div><div class="text-xs text-gray-500 mt-1">Rechazadas</div></div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-700">Todas las Reservas</h3>
      <a href="#/reservations/new" class="btn-primary text-sm">+ Nueva Reserva</a>
    </div>
    <div id="admin-list">
      <div class="text-center py-10 text-gray-400">Cargando...</div>
    </div>
  `

  await loadAdminReservations(container)
}

async function loadAdminReservations(container) {
  const listEl = container.querySelector('#admin-list')
  try {
    const all = await reservationService.getAll()

    container.querySelector('#stat-total').textContent = all.length
    container.querySelector('#stat-pending').textContent = all.filter(r => r.status === 'pending').length
    container.querySelector('#stat-approved').textContent = all.filter(r => r.status === 'approved').length
    container.querySelector('#stat-rejected').textContent = all.filter(r => r.status === 'rejected').length

    if (all.length === 0) {
      listEl.innerHTML = '<div class="card text-center py-8 text-gray-400">No hay reservas registradas</div>'
      return
    }

    listEl.innerHTML = `
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Espacio</th>
              <th class="px-4 py-3 text-left">Solicitante</th>
              <th class="px-4 py-3 text-left">Fecha</th>
              <th class="px-4 py-3 text-left">Horario</th>
              <th class="px-4 py-3 text-left">Motivo</th>
              <th class="px-4 py-3 text-left">Estado</th>
              <th class="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${all.map(r => buildTableRow(r)).join('')}
          </tbody>
        </table>
      </div>
    `

    attachAdminEvents(container, all)
  } catch (err) {
    listEl.innerHTML = `<div class="card text-red-500 text-center">${err.message}</div>`
  }
}

function buildTableRow(r) {
  return `
    <tr class="hover:bg-gray-50" data-id="${r.id}">
      <td class="px-4 py-3 font-medium text-gray-800">${r.spaceName}</td>
      <td class="px-4 py-3 text-gray-600">${r.userName}</td>
      <td class="px-4 py-3 text-gray-600">${formatDate(r.date)}</td>
      <td class="px-4 py-3 text-gray-600">${r.startTime}–${r.endTime}</td>
      <td class="px-4 py-3 text-gray-500 max-w-[150px] truncate">${r.reason}</td>
      <td class="px-4 py-3">${statusBadge(r.status)}</td>
      <td class="px-4 py-3">
        <div class="flex gap-1 flex-wrap">
          ${r.status === 'pending' ? `
            <button class="approve-btn text-xs btn-success py-1 px-2" data-id="${r.id}">✓</button>
            <button class="reject-btn text-xs btn-danger py-1 px-2" data-id="${r.id}">✗</button>
          ` : ''}
          <button class="edit-btn text-xs btn-secondary py-1 px-2" data-id="${r.id}">Editar</button>
          <button class="delete-btn text-xs btn-danger py-1 px-2" data-id="${r.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `
}

function attachAdminEvents(container, reservations) {
  container.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id)
      try {
        await reservationService.update(id, { status: 'approved' })
        showAlert('Reserva aprobada', 'success')
        await loadAdminReservations(container)
      } catch (err) {
        showAlert(err.message)
      }
    })
  })

  container.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id)
      openModal(
        'Rechazar reserva',
        '<p class="text-gray-600">¿Confirmas que deseas rechazar esta reserva?</p>',
        async () => {
          try {
            await reservationService.update(id, { status: 'rejected' })
            closeModal()
            showAlert('Reserva rechazada', 'info')
            await loadAdminReservations(container)
          } catch (err) {
            showAlert(err.message)
          }
        },
        'Rechazar',
        'btn-danger'
      )
    })
  })

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id)
      openModal(
        'Eliminar reserva',
        '<p class="text-gray-600">Esta acción no se puede deshacer. ¿Deseas continuar?</p>',
        async () => {
          try {
            await reservationService.delete(id)
            closeModal()
            showAlert('Reserva eliminada', 'success')
            await loadAdminReservations(container)
          } catch (err) {
            showAlert(err.message)
          }
        },
        'Eliminar',
        'btn-danger'
      )
    })
  })

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id)
      const r = reservations.find(x => x.id === id)
      if (!r) return
      openEditModal(r, async (data) => {
        try {
          await reservationService.update(id, data)
          closeModal()
          showAlert('Reserva actualizada', 'success')
          await loadAdminReservations(container)
        } catch (err) {
          showAlert(err.message)
        }
      })
    })
  })
}

function openEditModal(r, onSave) {
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
      <div>
        <label class="form-label">Estado</label>
        <select id="edit-status" class="form-input">
          <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pendiente</option>
          <option value="approved" ${r.status === 'approved' ? 'selected' : ''}>Aprobada</option>
          <option value="rejected" ${r.status === 'rejected' ? 'selected' : ''}>Rechazada</option>
          <option value="cancelled" ${r.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
        </select>
      </div>
      <p id="edit-error" class="text-red-500 text-sm hidden"></p>
    </div>
    `,
    () => {
      const date = document.getElementById('edit-date').value
      const startTime = document.getElementById('edit-start').value
      const endTime = document.getElementById('edit-end').value
      const reason = document.getElementById('edit-reason').value.trim()
      const status = document.getElementById('edit-status').value
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
      onSave({ date, startTime, endTime, reason, status })
    },
    'Guardar cambios'
  )
}
