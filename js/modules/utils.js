// Utility functions for VSM CMS

// Toast notification system
class Toast {
  constructor() {
    this.container = this.createContainer()
  }

  createContainer() {
    let container = document.getElementById("toast-container")
    if (!container) {
      container = document.createElement("div")
      container.id = "toast-container"
      container.className = "toast-container"
      document.body.appendChild(container)
    }
    return container
  }

  show(message, type = "info", duration = 3000) {
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
            <div class="toast-content">
                <i data-feather="${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i data-feather="x"></i>
            </button>
        `

    this.container.appendChild(toast)

    // Initialize feather icons
    const feather = window.feather // Declare feather variable
    if (typeof feather !== "undefined") {
      feather.replace()
    }

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove()
      }
    }, duration)

    return toast
  }

  getIcon(type) {
    const icons = {
      success: "check-circle",
      error: "alert-circle",
      warning: "alert-triangle",
      info: "info",
    }
    return icons[type] || "info"
  }

  success(message, duration) {
    return this.show(message, "success", duration)
  }

  error(message, duration) {
    return this.show(message, "error", duration)
  }

  warning(message, duration) {
    return this.show(message, "warning", duration)
  }

  info(message, duration) {
    return this.show(message, "info", duration)
  }
}

// Create global toast instance
const toast = new Toast()

// Date formatting utilities
const DateUtils = {
  formatDate(date, format = "dd/mm/yyyy") {
    if (!date) return ""

    const d = new Date(date)
    if (isNaN(d.getTime())) return ""

    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")

    switch (format) {
      case "dd/mm/yyyy":
        return `${day}/${month}/${year}`
      case "dd/mm/yyyy hh:mm":
        return `${day}/${month}/${year} ${hours}:${minutes}`
      case "yyyy-mm-dd":
        return `${year}-${month}-${day}`
      case "relative":
        return this.getRelativeTime(d)
      default:
        return d.toLocaleDateString("vi-VN")
    }
  },

  getRelativeTime(date) {
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} ngày trước`
    } else if (hours > 0) {
      return `${hours} giờ trước`
    } else if (minutes > 0) {
      return `${minutes} phút trước`
    } else {
      return "Vừa xong"
    }
  },

  isToday(date) {
    const today = new Date()
    const d = new Date(date)
    return d.toDateString() === today.toDateString()
  },
}

// String utilities
const StringUtils = {
  truncate(str, length = 100, suffix = "...") {
    if (!str || str.length <= length) return str
    return str.substring(0, length) + suffix
  },

  slugify(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-")
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  stripHtml(html) {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  },
}

// Validation utilities
const Validator = {
  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },

  required(value) {
    return value !== null && value !== undefined && value.toString().trim() !== ""
  },

  minLength(value, min) {
    return value && value.length >= min
  },

  maxLength(value, max) {
    return !value || value.length <= max
  },

  url(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
}

// Local storage utilities
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Storage set error:", error)
      return false
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Storage get error:", error)
      return defaultValue
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error("Storage remove error:", error)
      return false
    }
  },

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error("Storage clear error:", error)
      return false
    }
  },
}

// DOM utilities
const DOMUtils = {
  createElement(tag, className, innerHTML) {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (innerHTML) element.innerHTML = innerHTML
    return element
  },

  show(element) {
    if (element) element.style.display = ""
  },

  hide(element) {
    if (element) element.style.display = "none"
  },

  toggle(element) {
    if (element) {
      element.style.display = element.style.display === "none" ? "" : "none"
    }
  },

  addClass(element, className) {
    if (element) element.classList.add(className)
  },

  removeClass(element, className) {
    if (element) element.classList.remove(className)
  },

  toggleClass(element, className) {
    if (element) element.classList.toggle(className)
  },
}

// Debounce function
function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// Throttle function
function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Export utilities
window.Utils = {
  Toast,
  toast,
  DateUtils,
  StringUtils,
  Validator,
  Storage,
  DOMUtils,
  debounce,
  throttle,
}
