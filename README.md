# 📝 Tài liệu Thiết kế Front-End CMS VSM (Viet Nam Student Marathon)
>LINK DEMO: https://stephensouth13.github.io/VSM_LOGIN/
>
## 🎯 Mục tiêu hệ thống

Xây dựng giao diện quản lý bài viết nội bộ (CMS) cho tổ chức Viet Nam Student Marathon, hoạt động như một hệ thống CRM nội bộ. Giao diện hiện đại, thân thiện người dùng, hỗ trợ đa quyền truy cập (Admin và Cộng tác viên).

---

## 🧱 Kiến trúc tổng quan thư mục

```
cms-project/
├── frontend/
│   ├── css/
│   │   ├── style.css           # Giao diện tổng thể
│   │   ├── login.css           # Giao diện trang login
│   │   ├── calendar.css        # Giao diện calendar
│   │   └── darkmode.css        # Giao diện dark mode
│   ├── js/
│   │   ├── modules/
│   │   │   ├── fetch.js        # Hàm fetch API chung
│   │   │   ├── auth.js         # Đăng nhập, phân quyền
│   │   │   ├── theme.js        # Dark mode
│   │   │   ├── calendar.js     # Ghi chú lịch, reminder
│   │   │   ├── chart.js        # Vẽ biểu đồ thống kê
│   │   │   ├── export.js       # Xuất CSV bài viết
│   │   │   └── utils.js        # Hàm phụ trợ (toast, định dạng ngày, v.v.)
│   │   ├── index.js
│   │   ├── create.js
│   │   ├── edit.js
│   │   ├── detail.js
│   │   └── login.js
│   ├── index.html
│   ├── create.html
│   ├── edit.html
│   ├── detail.html
│   ├── login.html
│   ├── calendar.html
│   ├── statistics.html
│   └── export.html
│
│   ├── partials/               # HTML tái sử dụng
│   │   ├── sidebar.html
│   │   └── topbar.html
│   └── assets/
│       ├── logo.png
│       ├── user-avatar.png
│       └── placeholder.png
```

---

## 💻 Ngôn ngữ sử dụng chính

### 🌐 Front-end

| Ngôn ngữ              | Vai trò            | Ghi chú                                                          |
| --------------------- | ------------------ | ---------------------------------------------------------------- |
| **HTML5**             | Cấu trúc giao diện | Tuân chuẩn SEO, semantic rõ ràng                                 |
| **CSS3**              | Thiết kế giao diện | Dùng biến màu, dark mode, responsive                             |
| **JavaScript (ES6+)** | Logic tương tác    | Tổ chức theo module: auth, fetch, theme, calendar, chart, export |

### 📊 Thư viện hỗ trợ

| Thư viện                      | Mục đích                  |
| ----------------------------- | ------------------------- |
| **Chart.js**                  | Hiển thị biểu đồ thống kê |
| **FileSaver.js** *(tùy chọn)* | Xuất CSV bài viết         |

### 🖼️ Giao diện

* Font: `Poppins`, `Inter` hoặc `Roboto`
* Icon: Feather Icons, Lucide, hoặc SVG nội bộ

### 🔒 Backend (do Dũng phụ trách)

| Ngôn ngữ               | Vai trò                                    |
| ---------------------- | ------------------------------------------ |
| **NodeJS + Express**   | Tạo API CRUD bài viết                      |
| **MongoDB (Mongoose)** | Lưu trữ dữ liệu bài viết                   |
| **dotenv**             | Quản lý biến môi trường (PORT, MONGO\_URI) |

---

## 🔐 Phân quyền người dùng

| Quyền         | Mô tả                                                              |
| ------------- | ------------------------------------------------------------------ |
| Admin         | Toàn quyền: tạo, sửa, xóa, thêm thành viên, xuất CSV, xem thống kê |
| Cộng tác viên | Chỉ được tạo và sửa bài viết do chính mình đăng                    |

* Role sẽ được lưu tại `localStorage` sau khi đăng nhập
* Giao diện điều chỉnh tùy theo vai trò người dùng

---

## 📄 Mô tả các trang chính

### 1. `login.html`

* Form đăng nhập: email, password
* Giao diện hiện đại, bên trái form, bên phải ảnh minh họa (thay sau)
* Ghi nhớ đăng nhập, lưu role vào localStorage
* Nếu là admin → truy cập dashboard đầy đủ

### 2. `index.html` (Dashboard bài viết)

* Hiển thị danh sách bài viết dạng card hoặc bảng
* Các thông tin: ảnh, tiêu đề, mô tả, ngày đăng, trạng thái (isPublished)
* Tìm kiếm, lọc theo `category`, `tags`, sort theo ngày
* Nút “Tạo bài viết” (nổi bật màu xanh)

### 3. `create.html`

* Form tạo bài viết gồm:

  * title, thumbnail (URL), shortDescription, content
  * category, tags, publishedAt, isPublished (checkbox)
* Validate input: không để trống tiêu đề, nội dung
* Nút “Đăng bài” và “Lưu nháp”

### 4. `edit.html`

* Tương tự `create.html` nhưng có dữ liệu bài viết từ `?id=`
* Có nút “Cập nhật” và “Xóa” (nếu admin)
* Hiển thị lỗi nếu ID không tồn tại

### 5. `detail.html`

* Hiển thị đầy đủ thông tin bài viết (title, content, tags, ngày đăng, tác giả…)
* Có nút quay lại, in bài viết, chia sẻ (nếu cần)

### 6. `calendar.html`

* Calendar dạng lưới (grid giống Google Calendar)
* Click vào ngày để tạo ghi chú, lưu vào `localStorage`
* Hiển thị list view hoặc grid
* Có hệ thống notification/reminder cơ bản

### 7. `statistics.html`

* Biểu đồ bài viết theo tháng (Chart.js)
* Phân loại theo trạng thái: đã đăng / nháp
* Lọc theo người đăng (admin)

### 8. `export.html`

* Danh sách bài viết dạng bảng với checkbox chọn bài
* Nút “Xuất CSV” chứa đầy đủ thông tin bài: title, author, date, content, tags, trạng thái

---

## 🎨 Giao diện & phối màu

| Thành phần         | Màu                                       |
| ------------------ | ----------------------------------------- |
| Xanh lá (chính)    | `#27ae60`                                 |
| Nút hover / accent | `#219150`                                 |
| Cảnh báo / xoá     | `#e74c3c`                                 |
| Nền dark mode      | `#1e1e1e`                                 |
| Text               | `#ffffff` (sáng), `#333` (sáng nền trắng) |

* Giao diện sidebar trái + topbar phải (kiểu CRM)
* Responsive đầy đủ
* Dark mode toggle, lưu trạng thái vào `localStorage`

---

## 📌 Footer CMS (mọi trang)

```html
<footer>
  © 2025 Viet Nam Student Marathon • vsm.org.vn@gmail.com • Tầng 15 - UEH, 279 Nguyễn Tri Phương, Q10, TP.HCM
</footer>
```

---

## 🚀 Ghi chú phát triển

* JS viết dạng module, chia rõ từng chức năng
* Ưu tiên tương thích trình duyệt, không dùng framework
* Mock dữ liệu `localStorage` khi chưa kết nối backend

---

## ✅ Lộ trình thực hiện gợi ý

| Giai đoạn | Công việc                                             |
| --------- | ----------------------------------------------------- |
| 1         | Xây layout `login.html`, `sidebar`, `topbar`          |
| 2         | Giao diện `index.html` với fetch API                  |
| 3         | Form `create.html` và `edit.html` + validate          |
| 4         | `detail.html` đẹp chuẩn blog                          |
| 5         | Module calendar (`calendar.js`)                       |
| 6         | Module thống kê (`statistics.html` + Chart.js)        |
| 7         | Xuất bài viết (`export.js`)                           |
| 8         | Phân quyền người dùng + kiểm soát giao diện theo role |

---

Kết thúc.
