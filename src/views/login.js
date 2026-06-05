import { authService } from '../services/auth.js'
import { navigate } from '../router/index.js'

export function renderLogin(container) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4" style="margin-top:-24px">
      <div class="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-indigo-700">SpaceBook</h1>
          <p class="text-gray-500 mt-1 text-sm">Sistema de Reserva de Espacios</p>
        </div>

        <form id="login-form" novalidate>
          <div class="mb-4">
            <label class="form-label">Correo electrónico</label>
            <input type="email" id="email" class="form-input" placeholder="correo@ejemplo.com" />
            <p id="email-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>
          <div class="mb-6">
            <label class="form-label">Contraseña</label>
            <input type="password" id="password" class="form-input" placeholder="••••••••" />
            <p id="pass-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>
          <p id="login-error" class="text-red-600 text-sm mb-4 text-center hidden"></p>
          <button type="submit" id="submit-btn" class="btn-primary w-full py-2.5 text-base">
            Iniciar sesión
          </button>
        </form>

        <div class="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p class="font-medium mb-1">Usuarios de prueba:</p>
          <p>Admin: admin@test.com / Admin123*</p>
          <p>Usuario: user1@test.com / User123*</p>
        </div>
      </div>
    </div>
  `

  const form = container.querySelector('#login-form')
  const emailInput = container.querySelector('#email')
  const passwordInput = container.querySelector('#password')
  const loginError = container.querySelector('#login-error')
  const submitBtn = container.querySelector('#submit-btn')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    loginError.classList.add('hidden')

    const email = emailInput.value.trim()
    const password = passwordInput.value

    if (!email) {
      showFieldError(container, 'email-error', 'El correo es requerido')
      return
    }
    if (!password) {
      showFieldError(container, 'pass-error', 'La contraseña es requerida')
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'Ingresando...'

    try {
      const user = await authService.login(email, password)
      authService.saveSession(user)
      navigate('#/dashboard')
    } catch (err) {
      loginError.textContent = err.message
      loginError.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = 'Iniciar sesión'
    }
  })
}

function showFieldError(container, id, msg) {
  const el = container.querySelector(`#${id}`)
  if (el) {
    el.textContent = msg
    el.classList.remove('hidden')
    setTimeout(() => el.classList.add('hidden'), 3000)
  }
}
