// API fetch utilities for VSM CMS

class APIClient {
  constructor() {
    this.baseURL = "http://localhost:3000/api" // Backend URL
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  getAuthHeaders() {
    const token = Storage.get("vsm_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Posts API
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/posts${queryString ? `?${queryString}` : ""}`

    // Mock data for development
    return this.mockGetPosts(params)
  }

  async getPost(id) {
    // Mock data for development
    return this.mockGetPost(id)
  }

  async createPost(postData) {
    // Mock data for development
    return this.mockCreatePost(postData)
  }

  async updatePost(id, postData) {
    // Mock data for development
    return this.mockUpdatePost(id, postData)
  }

  async deletePost(id) {
    // Mock data for development
    return this.mockDeletePost(id)
  }

  // Mock data methods (remove when backend is ready)
  async mockGetPosts(params = {}) {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate delay

    const mockPosts = [
      {
        id: 1,
        title: "VSM Marathon 2025 - Sự kiện chạy bộ lớn nhất năm",
        shortDescription: "Tham gia cùng hàng nghìn runner trong sự kiện marathon lớn nhất của VSM năm 2025",
        content: "Nội dung chi tiết về sự kiện marathon...",
        thumbnail: "/placeholder.svg?height=200&width=350",
        category: "events",
        tags: ["marathon", "running", "2025"],
        authorId: 1,
        authorName: "Admin VSM",
        publishedAt: new Date("2024-12-20"),
        isPublished: true,
        createdAt: new Date("2024-12-15"),
        updatedAt: new Date("2024-12-20"),
      },
      {
        id: 2,
        title: "Hướng dẫn tập luyện cho người mới bắt đầu",
        shortDescription: "Những bài tập cơ bản và lộ trình tập luyện dành cho runner mới",
        content: "Nội dung hướng dẫn tập luyện...",
        thumbnail: "/placeholder.svg?height=200&width=350",
        category: "training",
        tags: ["training", "beginner", "tips"],
        authorId: 2,
        authorName: "Cộng tác viên",
        publishedAt: null,
        isPublished: false,
        createdAt: new Date("2024-12-18"),
        updatedAt: new Date("2024-12-18"),
      },
      {
        id: 3,
        title: "Cộng đồng VSM - Kết nối những người yêu chạy bộ",
        shortDescription: "Tìm hiểu về cộng đồng VSM và cách tham gia các hoạt động",
        content: "Nội dung về cộng đồng VSM...",
        thumbnail: "/placeholder.svg?height=200&width=350",
        category: "community",
        tags: ["community", "connection", "vsm"],
        authorId: 1,
        authorName: "Admin VSM",
        publishedAt: new Date("2024-12-22"),
        isPublished: true,
        createdAt: new Date("2024-12-20"),
        updatedAt: new Date("2024-12-22"),
      },
    ]

    // Apply filters
    let filteredPosts = [...mockPosts]

    if (params.category) {
      filteredPosts = filteredPosts.filter((post) => post.category === params.category)
    }

    if (params.status) {
      const isPublished = params.status === "published"
      filteredPosts = filteredPosts.filter((post) => post.isPublished === isPublished)
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) || post.shortDescription.toLowerCase().includes(searchTerm),
      )
    }

    // Apply sorting
    if (params.sort === "oldest") {
      filteredPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (params.sort === "title") {
      filteredPosts.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // Default: newest first
      filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return {
      success: true,
      data: filteredPosts,
      total: filteredPosts.length,
      page: Number.parseInt(params.page) || 1,
      limit: Number.parseInt(params.limit) || 10,
    }
  }

  async mockGetPost(id) {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const posts = await this.mockGetPosts()
    const post = posts.data.find((p) => p.id === Number.parseInt(id))

    if (post) {
      return { success: true, data: post }
    } else {
      throw new Error("Post not found")
    }
  }

  async mockCreatePost(postData) {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newPost = {
      id: Date.now(),
      ...postData,
      authorId: window.auth.currentUser?.id || 1,
      authorName: window.auth.currentUser?.name || "Unknown",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return { success: true, data: newPost }
  }

  async mockUpdatePost(id, postData) {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const updatedPost = {
      id: Number.parseInt(id),
      ...postData,
      updatedAt: new Date(),
    }

    return { success: true, data: updatedPost }
  }

  async mockDeletePost(id) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return { success: true, message: "Post deleted successfully" }
  }

  // Statistics API
  async getStatistics() {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      success: true,
      data: {
        totalPosts: 25,
        publishedPosts: 18,
        draftPosts: 7,
        todayPosts: 2,
        monthlyStats: [
          { month: "T1", posts: 5 },
          { month: "T2", posts: 8 },
          { month: "T3", posts: 12 },
          { month: "T4", posts: 15 },
          { month: "T5", posts: 10 },
          { month: "T6", posts: 18 },
        ],
      },
    }
  }
}

// Create global API client
const api = new APIClient()

// Export API client
window.API = api
