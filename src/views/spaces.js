import { spaceService } from '../services/spaces.js'
import { openModal, closeModal, showAlert } from '../components/modal.js'

export async function renderSpaces(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Gestión de Espacios</h2>
      <button id="new-space-btn" class="btn-primary">+ Nuevo Espacio</button>
    </div>
    <div id="spaces-list">
      <div class="text-center py-10 text-gray-400">Cargando...</div>
    </div>
  `

  container.querySelector('#new-space-btn').addEventListener('click', () => {
    openSpaceModal(null, async (data) => {
      try {
        await spaceService.create(data)
        closeModal()
        showAlert('Espacio creado', 'success')
        await loadSpaces(container)
      } catch (err) {
        showAlert(err.message)
      }
    })
  })

  await loadSpaces(container)
}

async function loadSpaces(container) {
  const listEl = container.querySelector('#spaces-list')
  try {
    const spaces = await spaceService.getAll()

    if (spaces.length === 0) {
      listEl.innerHTML = '<div class="card text-center py-8 text-gray-400">No hay espacios registrados</div>'
      return
    }

    listEl.innerHTML = `
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${spaces.map(s => buildSpaceCard(s)).join('')}
      </div>
    `

    attachSpaceEvents(container, spaces)
  } catch (err) {
    listEl.innerHTML = `<div class="card text-red-500 text-center">${err.message}</div>`
  }
}

function buildSpaceCard(s) {
  const statusColor = s.status === 'available'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700'

  return `
    <div class="card" data-id="${s.id}">
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold text-gray-800">${s.name}</h3>
        <span class="text-xs px-2 py-0.5 rounded-full ${statusColor}">${s.status === 'available' ? 'Disponible' : 'No disponible'}</span>
      </div>
      <p class="text-sm text-gray-500">${s.type}</p>
      <p class="text-sm text-gray-500">Capacidad: ${s.capacity} personas</p>
      <p class="text-sm text-gray-500">Ubicación: ${s.location}</p>
      <div class="flex gap-2 mt-4">
        <button class="edit-space-btn btn-secondary text-sm" data-id="${s.id}">Editar</button>
        <button class="delete-space-btn btn-danger text-sm" data-id="${s.id}">Eliminar</button>
      </div>
    </div>
  `
}

function attachSpaceEvents(container, spaces) {
  container.querySelectorAll('.edit-space-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id)
      const space = spaces.find(s => s.id === id)
      if (!space) return
      openSpaceModal(space, async (data) => {
        try {
          await spaceService.update(id, data)
          closeModal()
          showAlert('Espacio actualizado', 'success')
          await loadSpaces(container)
        } catch (err) {
          showAlert(err.message)
        }
      })
    })
  })

  container.querySelectorAll('.delete-space-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id)
      openModal(
        'Eliminar espacio',
        '<p class="text-gray-600">¿Confirmas que deseas eliminar este espacio? Las reservas asociadas quedarán sin espacio asignado.</p>',
        async () => {
          try {
            await spaceService.delete(id)
            closeModal()
            showAlert('Espacio eliminado', 'success')
            await loadSpaces(container)
          } catch (err) {
            showAlert(err.message)
          }
        },
        'Eliminar',
        'btn-danger'
      )
    })
  })
}

function openSpaceModal(space, onSave) {
  openModal(
    space ? 'Editar Espacio' : 'Nuevo Espacio',
    `
    <div class="space-y-3">
      <div>
        <label class="form-label">Nombre</label>
        <input type="text" id="sp-name" class="form-input" value="${space?.name || ''}" placeholder="Ej: Sala Beta" />
      </div>
      <div>
        <label class="form-label">Tipo</label>
        <select id="sp-type" class="form-input">
          ${['Sala de reuniones', 'Oficina privada', 'Coworking', 'Auditorio'].map(
            t => `<option ${space?.type === t ? 'selected' : ''}>${t}</option>`
          ).join('')}
        </select>
      </div>
      <div>
        <label class="form-label">Capacidad (personas)</label>
        <input type="number" id="sp-capacity" class="form-input" value="${space?.capacity || ''}" min="1" />
      </div>
      <div>
        <label class="form-label">Ubicación</label>
        <input type="text" id="sp-location" class="form-input" value="${space?.location || ''}" placeholder="Ej: Piso 2" />
      </div>
      <div>
        <label class="form-label">Estado</label>
        <select id="sp-status" class="form-input">
          <option value="available" ${space?.status === 'available' ? 'selected' : ''}>Disponible</option>
          <option value="unavailable" ${space?.status === 'unavailable' ? 'selected' : ''}>No disponible</option>
        </select>
      </div>
      <p id="sp-error" class="text-red-500 text-sm hidden"></p>
    </div>
    `,
    () => {
      const name = document.getElementById('sp-name').value.trim()
      const type = document.getElementById('sp-type').value
      const capacity = parseInt(document.getElementById('sp-capacity').value)
      const location = document.getElementById('sp-location').value.trim()
      const status = document.getElementById('sp-status').value
      const errEl = document.getElementById('sp-error')

      if (!name || !capacity || !location) {
        errEl.textContent = 'Completa todos los campos'
        errEl.classList.remove('hidden')
        return
      }
      onSave({ name, type, capacity, location, status })
    },
    space ? 'Guardar cambios' : 'Crear espacio'
  )
}
