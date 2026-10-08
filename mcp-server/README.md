# JIZURA MCP Server (Model Context Protocol)

Máy chủ MCP cho **JIZURA** — Công cụ tạo video lyric chuyển động kinetic typography hàng đầu chạy trực tiếp trên web và After Effects.

Máy chủ MCP này cho phép các trợ lý AI (như Antigravity, Claude Desktop, Cursor, Cline...) trực tiếp điều khiển, tự động hóa quy trình sản xuất video lyric từ văn bản, căn nhịp, tạo bố cục nghệ thuật, và xuất sang Adobe After Effects.

---

## 🛠️ Danh sách công cụ (Tools)

| Tên công cụ | Mô tả |
| :--- | :--- |
| `jizura_create_project` | Tạo dự án lyric motion video hoàn chỉnh từ lời bài hát (hỗ trợ LRC tag, nhịp BPM, style, mood, theme, tỷ lệ khung hình). |
| `jizura_generate_variation` | Sinh biến thể nghệ thuật mới bằng thuật toán *Omakase* (ngẫu nhiên hóa layout, animation, màu sắc, camera mà vẫn giữ trọn vẹn lời bài hát). |
| `jizura_plan_timeline` | Tính toán và phân tích toàn bộ timeline từng cut (thời gian bắt đầu, kết thúc, hiệu ứng chữ, hiệu ứng camera, trang trí, chuyển cảnh). |
| `jizura_parse_lyrics` | Phân tích cú pháp lời bài hát: tách dòng, nhận diện mốc thời gian LRC (`[01:23.45]`), điểm cắt nhanh (`/`), từ nhấn mạnh (`*từ*`), chú thích (`chữ|note`) và đoạn nhạc dạo (`[interlude 8]`). |
| `jizura_export_ae` | Xuất dữ liệu cấu trúc sang file JSON định dạng chuẩn After Effects v2 để import vào panel ScriptUI (`JIZURA_AE_en.jsx`) hoặc extension CEP của Adobe After Effects. |
| `jizura_list_presets` | Liệt kê chi tiết 27 phong cách hình ảnh (style), 8 tâm trạng (mood), 6 chủ đề (theme), font chữ và các danh mục kỹ thuật. |
| `jizura_preview_in_browser` | Tự động lưu project và mở ngay trên trình duyệt web tại `http://localhost:8000/vi/` để người dùng xem và tinh chỉnh trực tiếp. |
| `jizura_batch_variations` | Tạo hàng loạt (batch) nhiều phiên bản với các chủ đề khác nhau cho cùng một bài hát để so sánh trực quan. |

---

## 📚 Tài nguyên (Resources)

* `jizura://styles`: Bảng màu và thông số chi tiết của toàn bộ 27 visual styles (noir, crimson, caution, magenta, paper, hud, mint, transit, blueprint...).
* `jizura://syntax`: Hướng dẫn cú pháp viết lời nâng cao (LRC, manual cuts, ruby, emphasis, interludes).

---

## ⚙️ Cấu hình MCP Client

### 1. Antigravity / Gemini CLI
Đã được cấu hình tự động trong file `C:\Users\Trung\.gemini\config\mcp_config.json`:
```json
{
  "mcpServers": {
    "jizura": {
      "command": "node",
      "args": [
        "E:/JIZURA/mcp-server/index.js"
      ]
    }
  }
}
```

### 2. Claude Desktop (`claude_desktop_config.json`)
Thêm đoạn sau vào mục `"mcpServers"`:
```json
"jizura": {
  "command": "node",
  "args": [
    "E:/JIZURA/mcp-server/index.js"
  ]
}
```

### 3. Cursor / Cline
Chọn cấu hình stdio:
* **Command:** `node`
* **Args:** `["E:/JIZURA/mcp-server/index.js"]`

---

## 🧪 Kiểm thử nhanh

Chạy lệnh kiểm thử độc lập:
```powershell
cd E:\JIZURA\mcp-server
node test.js
```
