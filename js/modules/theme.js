// Theme management module

class ThemeManager {
  constructor() {
    this.currentTheme = "light"
    this.init()
  }

  init() {
    // Get saved theme or default to light
    this.currentTheme = Storage.get("vsm_theme", "light")
    this.applyTheme(this.currentTheme)
    this.setupToggle()
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme)
    this.currentTheme = theme
    Storage.set("vsm_theme", theme)
    this.updateToggleIcon()
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light"
    this.applyTheme(newTheme)
  }

  setupToggle() {
    const toggleBtn = document.getElementById("themeToggle")
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleTheme())
    }
  }

  updateToggleIcon() {
    const toggleBtn = document.getElementById("themeToggle")
    if (toggleBtn) {
      const icon = toggleBtn.querySelector("i")
      if (icon) {
        icon.setAttribute("data-feather", this.currentTheme === "light" ? "moon" : "sun")
        // Declare feather variable before using it
        const feather = window.feather
        if (typeof feather !== "undefined") {
          feather.replace()
        }
      }
    }
  }

  isDark() {
    return this.currentTheme === "dark"
  }

  isLight() {
    return this.currentTheme === "light"
  }
}

// Create global theme instance
const theme = new ThemeManager()

// Export theme
window.Theme = theme
