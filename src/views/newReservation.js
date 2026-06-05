import { authService } from '../services/auth.js'
import { reservationService } from '../services/reservations.js'
import { spaceService } from '../services/spaces.js'
import { showAlert } from '../components/modal.js'
import { navigate } from '../router/index.js'

export async function renderNewReservation(container) {
  const user = authService.getSession()

  container.innerHTML = `
    <div class="mb-6 flex items-center gap-3">
      <a href="#/dashboard" class="text-gray-400 hover:text-gray-600 transition-colors text-xl">←</a>
      <h2 class="text-2xl font-bold text-gray-800">Nueva Reserva</h2>
    </div>
    <div class="max-w-lg">
      <div class="card" id="form-wrapper">
        <div class="text-center py-6 text-gray-400">Cargando espacios...</div>
      </div>
    </div>
  `

  try {
    const spaces = await spaceService.getAll()
    const available = spaces.filter(s => s.status === 'available')
    renderForm(container, user, available)
  } catch (err) {
    container.querySelector('#form-wrapper').innerHTML = `<p class="text-red-500">${err.message}</p>`
  }
}

function renderForm(container, user, spaces) {
  const wrapper = container.querySelector('#form-wrapper')

  wrapper.innerHTML = `
    <form id="new-res-form" novalidate class="space-y-4">
      <div>
        <label class="form-label">Espacio</label>
        <select id="res-space" class="form-input">
          <option value="">-- Selecciona un espacio --</option>
          ${spaces.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name} (${s.type} · Cap. ${s.capacity})</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="form-label">Fecha</label>
        <input type="date" id="res-date" class="form-input" min="${today()}" />
      </div>
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="form-label">Hora de inicio</label>
          <input type="time" id="res-start" class="form-input" />
        </div>
        <div class="flex-1">
          <label class="form-label">Hora de fin</label>
          <input type="time" id="res-end" class="form-input" />
        </div>
      </div>
      <div>
        <label class="form-label">Motivo de la reserva</label>
        <input type="text" id="res-reason" class="form-input" placeholder="Ej: Reunión de proyecto" maxlength="100" />
      </div>
      <p id="res-error" class="text-red-500 text-sm hidden"></p>
      <div class="flex gap-3 pt-2">
        <a href="#/dashboard" class="btn-secondary">Cancelar</a>
        <button type="submit" id="submit-btn" class="btn-primary flex-1">Crear reserva</button>
      </div>
    </form>
  `

  const form = wrapper.querySelector('#new-res-form')
  const errEl = wrapper.querySelector('#res-error')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    errEl.classList.add('hidden')

    const spaceSelect = form.querySelector('#res-space')
    const spaceId = parseInt(spaceSelect.value)
    const spaceName = spaceSelect.options[spaceSelect.selectedIndex]?.dataset.name || ''
    const date = form.querySelector('#res-date').value
    const startTime = form.querySelector('#res-start').value
    const endTime = form.querySelector('#res-end').value
    const reason = form.querySelector('#res-reason').value.trim()

    if (!spaceId) return showError(errEl, 'Selecciona un espacio')
    if (!date) return showError(errEl, 'Ingresa la fecha')
    if (!startTime || !endTime) return showError(errEl, 'Ingresa el horario')
    if (startTime >= endTime) return showError(errEl, 'La hora de fin debe ser posterior a la de inicio')
    if (!reason) return showError(errEl, 'Ingresa el motivo de la reserva')

    const submitBtn = form.querySelector('#submit-btn')
    submitBtn.disabled = true
    submitBtn.textContent = 'Guardando...'

    try {
      await reservationService.create({
        userId: user.id,
        userName: user.name,
        spaceId,
        spaceName,
        date,
        startTime,
        endTime,
        reason
      })
      showAlert('Reserva creada correctamente', 'success')
      navigate('#/dashboard')
    } catch (err) {
      showError(errEl, err.message)
      submitBtn.disabled = false
      submitBtn.textContent = 'Crear reserva'
    }
  })
}

function showError(el, msg) {
  el.textContent = msg
  el.classList.remove('hidden')
}

function today() {
  return new Date().toISOString().split('T')[0]
}
