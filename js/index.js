// Dashboard functionality

document.addEventListener("DOMContentLoaded", () => {
  // Check authentication first
  if (!window.Auth.requireAuth()) {
    return
  }

  // Initialize dashboard
  initDashboard()
  loadPosts()
  setupEventListeners()
  setupFilters()

  // Initialize theme
  if (window.Theme) {
    window.Theme.init()
  }
})

function initDashboard() {
  // Update statistics
  updateStatistics()

  // Setup user info
  if (window.Auth.isAuthenticated) {
    window.Auth.updateUI()
  }
}

function updateStatistics() {
  // Mock statistics data
  const stats = {
    total: 15,
    published: 12,
    draft: 3,
    today: 2,
  }

  // Update stat cards
  const totalElement = document.querySelector('[data-stat="total"]')
  const publishedElement = document.querySelector('[data-stat="published"]')
  const draftElement = document.querySelector('[data-stat="draft"]')
  const todayElement = document.querySelector('[data-stat="today"]')

  if (totalElement) totalElement.textContent = stats.total
  if (publishedElement) publishedElement.textContent = stats.published
  if (draftElement) draftElement.textContent = stats.draft
  if (todayElement) todayElement.textContent = stats.today
}

function loadPosts() {
  const postsContainer = document.getElementById("postsContainer")
  if (!postsContainer) return

  // Show loading state
  postsContainer.innerHTML = `
    <div class="loading-state" style="text-align: center; padding: 40px; color: #666;">
      <div class="spinner" style="margin-bottom: 10px;">⏳</div>
      <p>Đang tải bài viết...</p>
    </div>
  `

  // Simulate loading delay
  setTimeout(() => {
    const mockPosts = generateMockPosts()
    renderPosts(mockPosts)
  }, 1500)
}

function generateMockPosts() {
  const posts = [
    {
      id: 1,
      title: "Giải chạy marathon Việt Nam 2024 - Thông tin chi tiết",
      excerpt: "Thông tin đầy đủ về giải chạy marathon lớn nhất Việt Nam năm 2024...",
      status: "published",
      author: "Nguyễn Văn Admin",
      authorId: 1,
      date: "2024-01-15",
      category: "Sự kiện",
      views: 1250,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Hướng dẫn tập luyện cho người mới bắt đầu chạy bộ",
      excerpt: "Những lời khuyên hữu ích dành cho những người mới bắt đầu...",
      status: "draft",
      author: "Trần Thị Editor",
      authorId: 2,
      date: "2024-01-14",
      category: "Hướng dẫn",
      views: 0,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Kết quả giải chạy bộ từ thiện tháng 12",
      excerpt: "Tổng kết kết quả và số tiền quyên góp được từ giải chạy...",
      status: "published",
      author: "Nguyễn Văn Admin",
      authorId: 1,
      date: "2024-01-13",
      category: "Kết quả",
      views: 890,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return posts
}

function renderPosts(posts) {
  const postsContainer = document.getElementById("postsContainer")
  if (!postsContainer) return

  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 40px; color: #666;">
        <p>Chưa có bài viết nào</p>
        <a href="create.html" class="btn btn-primary" style="margin-top: 15px;">Tạo bài viết đầu tiên</a>
      </div>
    `
    return
  }

  const postsHTML = posts
    .map(
      (post) => `
    <div class="post-card" data-id="${post.id}" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: white;">
      <div class="post-header" style="display: flex; justify-content: between; align-items: start; margin-bottom: 15px;">
        <div class="post-info" style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px;">
            <a href="detail.html?id=${post.id}" style="color: #333; text-decoration: none;">${post.title}</a>
          </h3>
          <p style="color: #666; margin: 0 0 10px 0; line-height: 1.5;">${post.excerpt}</p>
          <div class="post-meta" style="display: flex; gap: 15px; font-size: 14px; color: #888;">
            <span>📝 ${post.author}</span>
            <span>📅 ${formatDate(post.date)}</span>
            <span>📂 ${post.category}</span>
            <span>👁️ ${post.views} lượt xem</span>
          </div>
        </div>
        <div class="post-status" style="margin-left: 15px;">
          <span class="status-badge ${post.status}" style="padding: 4px 8px; border-radius: 4px; font-size: 12px; ${getStatusStyle(post.status)}">
            ${getStatusText(post.status)}
          </span>
        </div>
      </div>
      <div class="post-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
        <a href="detail.html?id=${post.id}" class="btn btn-sm" style="padding: 6px 12px; text-decoration: none; color: #007bff; border: 1px solid #007bff; border-radius: 4px;">Xem</a>
        ${window.Auth.canEditPost(post) ? `<a href="edit.html?id=${post.id}" class="btn btn-sm" style="padding: 6px 12px; text-decoration: none; color: #28a745; border: 1px solid #28a745; border-radius: 4px;">Sửa</a>` : ""}
        ${window.Auth.canDeletePost(post) ? `<button onclick="deletePost(${post.id})" class="btn btn-sm btn-danger" style="padding: 6px 12px; background: #dc3545; color: white; border: 1px solid #dc3545; border-radius: 4px; cursor: pointer;">Xóa</button>` : ""}
      </div>
    </div>
  `,
    )
    .join("")

  postsContainer.innerHTML = postsHTML
}

function getStatusStyle(status) {
  switch (status) {
    case "published":
      return "background: #d4edda; color: #155724;"
    case "draft":
      return "background: #fff3cd; color: #856404;"
    default:
      return "background: #f8f9fa; color: #6c757d;"
  }
}

function getStatusText(status) {
  switch (status) {
    case "published":
      return "Đã xuất bản"
    case "draft":
      return "Bản nháp"
    default:
      return "Không xác định"
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN")
}

function setupEventListeners() {
  // Create new post button
  const createBtn = document.getElementById("createPostBtn")
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      window.location.href = "create.html"
    })
  }

  // Search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300))
  }
}

function setupFilters() {
  const categoryFilter = document.getElementById("categoryFilter")
  const statusFilter = document.getElementById("statusFilter")
  const sortFilter = document.getElementById("sortFilter")

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters)
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters)
  }
  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters)
  }
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase()
  // Implement search logic here
  console.log("Searching for:", query)
}

function applyFilters() {
  // Implement filter logic here
  console.log("Applying filters")
}

function deletePost(postId) {
  if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
    // Implement delete logic here
    console.log("Deleting post:", postId)
    if (window.Utils && window.Utils.toast) {
      window.Utils.toast.success("Đã xóa bài viết thành công")
    }
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
