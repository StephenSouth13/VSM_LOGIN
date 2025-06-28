// Login page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Check if already logged in, redirect to dashboard
  if (window.Auth && window.Auth.isAuthenticated) {
    window.location.href = "index.html"
    return
  }

  const loginForm = document.getElementById("loginForm")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const rememberCheckbox = document.getElementById("remember")

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Auto-fill demo accounts for testing
  addDemoAccountButtons()

  // Remember login state
  const rememberedEmail = window.Utils.Storage.get("vsm_remembered_email")
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail
    if (rememberCheckbox) rememberCheckbox.checked = true
  }

  // Save email when remember is checked
  if (rememberCheckbox) {
    rememberCheckbox.addEventListener("change", function () {
      if (this.checked && emailInput.value) {
        window.Utils.Storage.set("vsm_remembered_email", emailInput.value)
      } else {
        window.Utils.Storage.remove("vsm_remembered_email")
      }
    })
  }

  // Initialize theme
  if (window.Theme) {
    window.Theme.init()
  }
})

function addDemoAccountButtons() {
  const loginForm = document.getElementById("loginForm")
  if (!loginForm) return

  const demoSection = document.createElement("div")
  demoSection.className = "demo-accounts"
  demoSection.innerHTML = `
    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;">
      <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">🔐 Tài khoản demo:</h4>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button type="button" class="demo-btn" data-email="admin@vsm.org.vn" data-password="admin123" 
                style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
          Admin (admin123)
        </button>
        <button type="button" class="demo-btn" data-email="editor@vsm.org.vn" data-password="editor123"
                style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
          Editor (editor123)
        </button>
      </div>
    </div>
  `

  loginForm.appendChild(demoSection)

  // Add click handlers for demo buttons
  demoSection.querySelectorAll(".demo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const emailInput = document.getElementById("email")
      const passwordInput = document.getElementById("password")
      if (emailInput) emailInput.value = btn.dataset.email
      if (passwordInput) passwordInput.value = btn.dataset.password
    })
  })
}

async function handleLogin(e) {
  e.preventDefault()

  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const rememberCheckbox = document.getElementById("remember")

  if (!emailInput || !passwordInput) {
    showError("Không tìm thấy form đăng nhập")
    return
  }

  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()
  const remember = rememberCheckbox ? rememberCheckbox.checked : false

  if (!email || !password) {
    showError("Vui lòng nhập đầy đủ email và mật khẩu")
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showError("Email không hợp lệ")
    return
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]')
  if (submitBtn) {
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Đang đăng nhập..."
    submitBtn.disabled = true

    try {
      const result = await window.Auth.login(email, password, remember)

      if (result.success) {
        showSuccess("Đăng nhập thành công!")

        // Redirect to dashboard after short delay
        setTimeout(() => {
          window.location.href = "index.html"
        }, 1000)
      } else {
        showError(result.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      console.error("Login error:", error)
      showError("Đã xảy ra lỗi khi đăng nhập")
    } finally {
      // Reset button state
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }
  }
}

function showError(message) {
  removeExistingMessages()

  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.style.cssText = `
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #f5c6cb;
    font-size: 14px;
  `
  errorDiv.textContent = message

  const form = document.getElementById("loginForm")
  if (form) {
    form.insertBefore(errorDiv, form.firstChild)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove()
      }
    }, 5000)
  }
}

function showSuccess(message) {
  removeExistingMessages()

  const successDiv = document.createElement("div")
  successDiv.className = "success-message"
  successDiv.style.cssText = `
    background: #d4edda;
    color: #155724;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    border: 1px solid #c3e6cb;
    font-size: 14px;
  `
  successDiv.textContent = message

  const form = document.getElementById("loginForm")
  if (form) {
    form.insertBefore(successDiv, form.firstChild)
  }
}

function removeExistingMessages() {
  const existingMessages = document.querySelectorAll(".error-message, .success-message")
  existingMessages.forEach((msg) => msg.remove())
}
