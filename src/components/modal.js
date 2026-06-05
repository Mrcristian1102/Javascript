export function openModal(title, bodyHTML, onConfirm, confirmText = 'Confirmar', confirmClass = 'btn-primary') {
  // Remove existing modal
  document.getElementById('modal-overlay')?.remove()

  const overlay = document.createElement('div')
  overlay.id = 'modal-overlay'
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4'

  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">${title}</h3>
      <div class="mb-6">${bodyHTML}</div>
      <div class="flex gap-3 justify-end">
        <button id="modal-cancel" class="btn-secondary">Cancelar</button>
        <button id="modal-confirm" class="${confirmClass}">${confirmText}</button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  overlay.querySelector('#modal-cancel').addEventListener('click', closeModal)
  overlay.querySelector('#modal-confirm').addEventListener('click', () => {
    onConfirm()
  })
}

export function closeModal() {
  document.getElementById('modal-overlay')?.remove()
}

export function showAlert(message, type = 'error') {
  document.getElementById('toast-alert')?.remove()

  const colors = {
    error: 'bg-red-100 border-red-400 text-red-800',
    success: 'bg-green-100 border-green-400 text-green-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800'
  }

  const toast = document.createElement('div')
  toast.id = 'toast-alert'
  toast.className = `fixed top-4 right-4 z-50 border px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm ${colors[type] || colors.error}`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 4000)
}
