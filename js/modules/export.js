// Export management module for VSM CMS

// Declare variables before using them
const api = window.api // Assuming api is available globally
const toast = window.toast // Assuming toast is available globally
const debounce = window.debounce // Assuming debounce is available globally
const auth = window.auth // Assuming auth is available globally
const StringUtils = window.StringUtils // Assuming StringUtils is available globally
const DateUtils = window.DateUtils // Assuming DateUtils is available globally
const feather = window.feather // Assuming feather is available globally

class ExportManager {
  constructor() {
    this.selectedPosts = new Set()
    this.allPosts = []
    this.filteredPosts = []
    this.currentFilters = {}
  }

  async init() {
    await this.loadPosts()
    this.setupEventListeners()
    this.renderTable()
  }

  async loadPosts() {
    const loading = document.getElementById("loading")
    const tableContainer = document.getElementById("tableContainer")

    try {
      if (loading) loading.style.display = "flex"
      if (tableContainer) tableContainer.style.display = "none"

      const result = await api.getPosts({ limit: 1000 }) // Get all posts

      if (result.success) {
        this.allPosts = result.data
        this.filteredPosts = [...this.allPosts]
        this.updateCounts()
      }
    } catch (error) {
      console.error("Error loading posts:", error)
      toast.error("Không thể tải danh sách bài viết")
    } finally {
      if (loading) loading.style.display = "none"
      if (tableContainer) tableContainer.style.display = "block"
    }
  }

  setupEventListeners() {
    // Export controls
    document.getElementById("exportBtn")?.addEventListener("click", () => this.exportData())
    document.getElementById("selectAllBtn")?.addEventListener("click", () => this.toggleSelectAll())

    // Filter controls
    document.getElementById("applyFilters")?.addEventListener("click", () => this.applyFilters())
    document.getElementById("resetFilters")?.addEventListener("click", () => this.resetFilters())

    // Search
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
      const debouncedSearch = debounce(() => this.handleSearch(), 300)
      searchInput.addEventListener("input", debouncedSearch)
    }

    // Select all checkbox
    document.getElementById("selectAllCheckbox")?.addEventListener("change", (e) => {
      this.handleSelectAllChange(e.target.checked)
    })

    // Date inputs
    const today = new Date().toISOString().split("T")[0]
    const startDate = document.getElementById("startDate")
    const endDate = document.getElementById("endDate")

    if (endDate) endDate.value = today
    if (startDate) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      startDate.value = thirtyDaysAgo.toISOString().split("T")[0]
    }
  }

  renderTable() {
    const tableBody = document.getElementById("postsTableBody")
    const emptyState = document.getElementById("emptyState")
    const tableContainer = document.getElementById("tableContainer")

    if (!tableBody) return

    if (this.filteredPosts.length === 0) {
      if (tableContainer) tableContainer.style.display = "none"
      if (emptyState) emptyState.style.display = "flex"
      return
    }

    if (tableContainer) tableContainer.style.display = "block"
    if (emptyState) emptyState.style.display = "none"

    const rows = this.filteredPosts
      .map((post) => {
        const isSelected = this.selectedPosts.has(post.id)
        const canEdit = auth.canEditPost(post)

        return `
        <tr>
          <td>
            <label class="checkbox">
              <input type="checkbox" 
                     value="${post.id}" 
                     ${isSelected ? "checked" : ""}
                     onchange="exportManager.handlePostSelection(${post.id}, this.checked)">
              <span class="checkmark"></span>
            </label>
          </td>
          <td>
            <div class="post-title-cell">
              <strong>${StringUtils.truncate(post.title, 50)}</strong>
              ${post.shortDescription ? `<br><small class="text-muted">${StringUtils.truncate(post.shortDescription, 80)}</small>` : ""}
            </div>
          </td>
          <td>${post.authorName}</td>
          <td>
            <span class="category-badge category-${post.category}">
              ${this.getCategoryLabel(post.category)}
            </span>
          </td>
          <td>
            <span class="post-status ${post.isPublished ? "status-published" : "status-draft"}">
              ${post.isPublished ? "Đã xuất bản" : "Bản nháp"}
            </span>
          </td>
          <td>${DateUtils.formatDate(post.publishedAt || post.createdAt, "dd/mm/yyyy")}</td>
          <td>
            <div class="table-actions">
              <a href="detail.html?id=${post.id}" class="btn btn-sm btn-secondary" title="Xem chi tiết">
                <i data-feather="eye"></i>
              </a>
              ${
                canEdit
                  ? `
                <a href="edit.html?id=${post.id}" class="btn btn-sm btn-primary" title="Chỉnh sửa">
                  <i data-feather="edit"></i>
                </a>
              `
                  : ""
              }
            </div>
          </td>
        </tr>
      `
      })
      .join("")

    tableBody.innerHTML = rows
    this.updateSelectAllCheckbox()

    // Re-initialize feather icons
    if (typeof feather !== "undefined") {
      feather.replace()
    }
  }

  handlePostSelection(postId, isSelected) {
    if (isSelected) {
      this.selectedPosts.add(postId)
    } else {
      this.selectedPosts.delete(postId)
    }

    this.updateCounts()
    this.updateSelectAllCheckbox()
    this.updateExportButton()
  }

  handleSelectAllChange(isChecked) {
    if (isChecked) {
      this.filteredPosts.forEach((post) => this.selectedPosts.add(post.id))
    } else {
      this.selectedPosts.clear()
    }

    this.renderTable()
    this.updateCounts()
    this.updateExportButton()
  }

  toggleSelectAll() {
    const allSelected = this.filteredPosts.every((post) => this.selectedPosts.has(post.id))
    this.handleSelectAllChange(!allSelected)
  }

  updateSelectAllCheckbox() {
    const checkbox = document.getElementById("selectAllCheckbox")
    if (!checkbox) return

    const selectedInFiltered = this.filteredPosts.filter((post) => this.selectedPosts.has(post.id)).length
    const totalFiltered = this.filteredPosts.length

    if (selectedInFiltered === 0) {
      checkbox.checked = false
      checkbox.indeterminate = false
    } else if (selectedInFiltered === totalFiltered) {
      checkbox.checked = true
      checkbox.indeterminate = false
    } else {
      checkbox.checked = false
      checkbox.indeterminate = true
    }
  }

  updateCounts() {
    const selectedCount = document.getElementById("selectedCount")
    const totalCount = document.getElementById("totalCount")

    if (selectedCount) selectedCount.textContent = this.selectedPosts.size
    if (totalCount) totalCount.textContent = this.filteredPosts.length
  }

  updateExportButton() {
    const exportBtn = document.getElementById("exportBtn")
    if (exportBtn) {
      exportBtn.disabled = this.selectedPosts.size === 0
    }
  }

  applyFilters() {
    const filters = {
      status: document.getElementById("statusFilter")?.value || "",
      category: document.getElementById("categoryFilter")?.value || "",
      startDate: document.getElementById("startDate")?.value || "",
      endDate: document.getElementById("endDate")?.value || "",
      search: document.getElementById("searchInput")?.value.trim() || "",
    }

    this.currentFilters = filters
    this.filteredPosts = this.allPosts.filter((post) => {
      // Status filter
      if (filters.status) {
        const isPublished = filters.status === "published"
        if (post.isPublished !== isPublished) return false
      }

      // Category filter
      if (filters.category && post.category !== filters.category) {
        return false
      }

      // Date range filter
      const postDate = new Date(post.publishedAt || post.createdAt)
      if (filters.startDate) {
        const startDate = new Date(filters.startDate)
        if (postDate < startDate) return false
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // End of day
        if (postDate > endDate) return false
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = [post.title, post.shortDescription, post.authorName, post.content]
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(searchTerm)) return false
      }

      return true
    })

    // Clear selections that are no longer visible
    const visiblePostIds = new Set(this.filteredPosts.map((post) => post.id))
    this.selectedPosts = new Set([...this.selectedPosts].filter((id) => visiblePostIds.has(id)))

    this.renderTable()
    this.updateCounts()
    this.updateExportButton()

    toast.success(`Đã lọc ${this.filteredPosts.length} bài viết`)
  }

  resetFilters() {
    // Reset form values
    document.getElementById("statusFilter").value = ""
    document.getElementById("categoryFilter").value = ""
    document.getElementById("startDate").value = ""
    document.getElementById("endDate").value = ""
    document.getElementById("searchInput").value = ""

    // Reset data
    this.currentFilters = {}
    this.filteredPosts = [...this.allPosts]
    this.selectedPosts.clear()

    this.renderTable()
    this.updateCounts()
    this.updateExportButton()

    toast.info("Đã đặt lại bộ lọc")
  }

  handleSearch() {
    this.applyFilters()
  }

  async exportData() {
    if (this.selectedPosts.size === 0) {
      toast.error("Vui lòng chọn ít nhất một bài viết để xuất")
      return
    }

    const format = document.getElementById("exportFormat")?.value || "csv"
    const selectedColumns = Array.from(document.querySelectorAll('input[name="columns"]:checked')).map(
      (input) => input.value,
    )

    if (selectedColumns.length === 0) {
      toast.error("Vui lòng chọn ít nhất một cột dữ liệu")
      return
    }

    try {
      this.showExportProgress()

      // Get selected posts data
      const selectedPostsData = this.allPosts.filter((post) => this.selectedPosts.has(post.id))

      // Update progress
      this.updateProgress(30, "Đang chuẩn bị dữ liệu...")

      // Prepare export data
      const exportData = this.prepareExportData(selectedPostsData, selectedColumns)

      this.updateProgress(60, "Đang tạo file...")

      // Export based on format
      switch (format) {
        case "csv":
          this.exportCSV(exportData, selectedColumns)
          break
        case "json":
          this.exportJSON(exportData)
          break
        case "xlsx":
          this.exportExcel(exportData, selectedColumns)
          break
        default:
          throw new Error("Định dạng không được hỗ trợ")
      }

      this.updateProgress(100, "Hoàn thành!")

      setTimeout(() => {
        this.hideExportProgress()
        toast.success(`Đã xuất ${selectedPostsData.length} bài viết thành công`)
      }, 1000)
    } catch (error) {
      console.error("Export error:", error)
      this.hideExportProgress()
      toast.error("Không thể xuất dữ liệu: " + error.message)
    }
  }

  prepareExportData(posts, columns) {
    return posts.map((post) => {
      const row = {}

      columns.forEach((column) => {
        switch (column) {
          case "id":
            row["ID"] = post.id
            break
          case "title":
            row["Tiêu đề"] = post.title
            break
          case "author":
            row["Tác giả"] = post.authorName
            break
          case "category":
            row["Danh mục"] = this.getCategoryLabel(post.category)
            break
          case "status":
            row["Trạng thái"] = post.isPublished ? "Đã xuất bản" : "Bản nháp"
            break
          case "publishedAt":
            row["Ngày đăng"] = DateUtils.formatDate(post.publishedAt || post.createdAt, "dd/mm/yyyy hh:mm")
            break
          case "tags":
            row["Tags"] = Array.isArray(post.tags) ? post.tags.join(", ") : ""
            break
          case "content":
            row["Nội dung"] = StringUtils.stripHtml(post.content || "")
            break
        }
      })

      return row
    })
  }

  exportCSV(data, columns) {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || ""
            // Escape quotes and wrap in quotes if contains comma or quote
            const escaped = value.toString().replace(/"/g, '""')
            return escaped.includes(",") || escaped.includes('"') || escaped.includes("\n") ? `"${escaped}"` : escaped
          })
          .join(","),
      ),
    ].join("\n")

    this.downloadFile(csvContent, "vsm-posts-export.csv", "text/csv;charset=utf-8;")
  }

  exportJSON(data) {
    const jsonContent = JSON.stringify(data, null, 2)
    this.downloadFile(jsonContent, "vsm-posts-export.json", "application/json")
  }

  exportExcel(data, columns) {
    // For Excel export, we'll create a simple HTML table that Excel can import
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const htmlContent = `
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${data.map((row) => `<tr>${headers.map((header) => `<td>${row[header] || ""}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    `

    this.downloadFile(htmlContent, "vsm-posts-export.xlsx", "application/vnd.ms-excel")
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  }

  showExportProgress() {
    const progress = document.getElementById("exportProgress")
    if (progress) {
      progress.style.display = "block"
      this.updateProgress(0, "Bắt đầu xuất dữ liệu...")
    }
  }

  hideExportProgress() {
    const progress = document.getElementById("exportProgress")
    if (progress) {
      progress.style.display = "none"
    }
  }

  updateProgress(percent, message) {
    const progressFill = document.getElementById("progressFill")
    const progressText = document.getElementById("progressText")
    const progressInfo = document.getElementById("progressInfo")

    if (progressFill) progressFill.style.width = `${percent}%`
    if (progressText) progressText.textContent = `${percent}%`
    if (progressInfo) progressInfo.textContent = message
  }

  getCategoryLabel(category) {
    const labels = {
      news: "Tin tức",
      events: "Sự kiện",
      training: "Huấn luyện",
      community: "Cộng đồng",
    }
    return labels[category] || "Khác"
  }
}

// Make ExportManager globally available
window.ExportManager = ExportManager

// Global instance
window.exportManager = new ExportManager()
