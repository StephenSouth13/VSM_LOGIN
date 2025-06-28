// Edit post page functionality

// Declare necessary variables
const auth = {} // Placeholder for auth object
const api = {} // Placeholder for api object
const DateUtils = {} // Placeholder for DateUtils object
const Validator = {} // Placeholder for Validator object
const toast = {} // Placeholder for toast object
const feather = {} // Placeholder for feather object

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication - redirect to login if not authenticated
  if (!window.Auth.requireAuth()) return

  // Get post ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const postId = urlParams.get("id")

  if (!postId) {
    showError("errorState", "Không tìm thấy ID bài viết")
    return
  }

  await loadPost(postId)
  initializeForm()
  initializeThumbnailPreview()

  // Initialize feather icons
  if (typeof window.feather !== "undefined") {
    window.feather.replace()
  }
})

async function loadPost(postId) {
  const loading = document.getElementById("loading")
  const errorState = document.getElementById("errorState")
  const editForm = document.getElementById("editPostForm")

  try {
    if (loading) loading.style.display = "flex"
    if (errorState) errorState.style.display = "none"
    if (editForm) editForm.style.display = "none"

    const result = await api.getPost(postId)

    if (result.success) {
      const post = result.data

      // Check if user can edit this post
      if (!auth.canEditPost(post)) {
        showError("errorState", "Bạn không có quyền chỉnh sửa bài viết này")
        return
      }

      populateForm(post)

      if (loading) loading.style.display = "none"
      if (editForm) editForm.style.display = "block"
    }
  } catch (error) {
    console.error("Error loading post:", error)
    showError("errorState", "Không thể tải bài viết")
  }
}

function populateForm(post) {
  // Populate form fields
  const fields = {
    title: post.title,
    shortDescription: post.shortDescription || "",
    content: post.content || "",
    thumbnail: post.thumbnail || "",
    category: post.category || "",
    tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    isPublished: post.isPublished,
  }

  Object.entries(fields).forEach(([fieldName, value]) => {
    const field = document.getElementById(fieldName)
    if (field) {
      if (field.type === "checkbox") {
        field.checked = value
      } else {
        field.value = value
      }
    }
  })

  // Set publish date
  const publishedAtField = document.getElementById("publishedAt")
  if (publishedAtField && post.publishedAt) {
    const date = new Date(post.publishedAt)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    publishedAtField.value = date.toISOString().slice(0, 16)
  }

  // Update thumbnail preview
  const thumbnailImg = document.getElementById("thumbnailImg")
  if (thumbnailImg && post.thumbnail) {
    thumbnailImg.src = post.thumbnail
  }

  // Update post info
  updatePostInfo(post)
}

function updatePostInfo(post) {
  const authorName = document.getElementById("authorName")
  const createdAt = document.getElementById("createdAt")
  const updatedAt = document.getElementById("updatedAt")

  if (authorName) authorName.textContent = post.authorName || "-"
  if (createdAt) createdAt.textContent = DateUtils.formatDate(post.createdAt, "dd/mm/yyyy hh:mm")
  if (updatedAt) updatedAt.textContent = DateUtils.formatDate(post.updatedAt, "dd/mm/yyyy hh:mm")
}

function initializeForm() {
  const editForm = document.getElementById("editPostForm")
  const deleteBtn = document.getElementById("deleteBtn")

  if (editForm) {
    editForm.addEventListener("submit", handleFormSubmit)
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDelete)
  }
}

function initializeThumbnailPreview() {
  const thumbnailInput = document.getElementById("thumbnail")
  const thumbnailImg = document.getElementById("thumbnailImg")

  if (thumbnailInput && thumbnailImg) {
    thumbnailInput.addEventListener("input", function () {
      const url = this.value.trim()
      if (url && Validator.url(url)) {
        thumbnailImg.src = url
        thumbnailImg.onerror = function () {
          this.src = "/placeholder.svg?height=200&width=300"
        }
      } else if (!url) {
        thumbnailImg.src = "/placeholder.svg?height=200&width=300"
      }
    })
  }
}

async function handleFormSubmit(e) {
  e.preventDefault()

  const urlParams = new URLSearchParams(window.location.search)
  const postId = urlParams.get("id")

  const formData = getFormData()

  if (!validateForm(formData)) {
    return
  }

  await updatePost(postId, formData)
}

function getFormData() {
  const form = document.getElementById("editPostForm")
  const formData = new FormData(form)

  return {
    title: formData.get("title")?.trim() || "",
    shortDescription: formData.get("shortDescription")?.trim() || "",
    content: formData.get("content")?.trim() || "",
    thumbnail: formData.get("thumbnail")?.trim() || "",
    category: formData.get("category") || "",
    tags:
      formData
        .get("tags")
        ?.split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag) || [],
    publishedAt: formData.get("publishedAt") ? new Date(formData.get("publishedAt")) : new Date(),
    isPublished: formData.get("isPublished") === "on",
  }
}

function validateForm(data) {
  clearErrors()

  let isValid = true

  // Title is required
  if (!Validator.required(data.title)) {
    showError("titleError", "Tiêu đề là bắt buộc")
    isValid = false
  } else if (!Validator.maxLength(data.title, 200)) {
    showError("titleError", "Tiêu đề không được vượt quá 200 ký tự")
    isValid = false
  }

  // Content is required for published posts
  if (data.isPublished && !Validator.required(data.content)) {
    showError("contentError", "Nội dung là bắt buộc cho bài viết đã xuất bản")
    isValid = false
  }

  // Validate thumbnail URL if provided
  if (data.thumbnail && !Validator.url(data.thumbnail)) {
    toast.error("URL ảnh đại diện không hợp lệ")
    isValid = false
  }

  return isValid
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId)
  if (errorElement) {
    errorElement.textContent = message
    errorElement.classList.add("show")
  }
}

function clearErrors() {
  const errorElements = document.querySelectorAll(".form-error")
  errorElements.forEach((element) => {
    element.classList.remove("show")
    element.textContent = ""
  })
}

async function updatePost(postId, postData) {
  const submitBtn = document.querySelector('button[type="submit"]')

  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i data-feather="loader"></i> Đang cập nhật...'
  }

  try {
    const result = await api.updatePost(postId, postData)

    if (result.success) {
      toast.success("Cập nhật bài viết thành công!")

      // Update the post info section
      updatePostInfo({
        ...result.data,
        updatedAt: new Date(),
      })

      // Redirect to post detail after short delay
      setTimeout(() => {
        window.location.href = `detail.html?id=${postId}`
      }, 1500)
    }
  } catch (error) {
    console.error("Error updating post:", error)
    toast.error("Không thể cập nhật bài viết. Vui lòng thử lại.")
  } finally {
    // Restore button state
    if (submitBtn) {
      submitBtn.disabled = false
      submitBtn.innerHTML = '<i data-feather="save"></i> Cập nhật'
    }

    // Re-initialize feather icons
    if (typeof feather !== "undefined") {
      feather.replace()
    }
  }
}

async function handleDelete() {
  if (!confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
    return
  }

  const urlParams = new URLSearchParams(window.location.search)
  const postId = urlParams.get("id")

  const deleteBtn = document.getElementById("deleteBtn")

  // Show loading state
  if (deleteBtn) {
    deleteBtn.disabled = true
    deleteBtn.innerHTML = '<i data-feather="loader"></i> Đang xóa...'
  }

  try {
    const result = await api.deletePost(postId)

    if (result.success) {
      toast.success("Xóa bài viết thành công!")

      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1500)
    }
  } catch (error) {
    console.error("Error deleting post:", error)
    toast.error("Không thể xóa bài viết. Vui lòng thử lại.")
  } finally {
    // Restore button state
    if (deleteBtn) {
      deleteBtn.disabled = false
      deleteBtn.innerHTML = '<i data-feather="trash-2"></i> Xóa bài viết'
    }

    // Re-initialize feather icons
    if (typeof feather !== "undefined") {
      feather.replace()
    }
  }
}
