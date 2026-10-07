# PLAN — Phần Học Ngữ Pháp (50 bài)

> File này là CHUẨN cho mọi đợt viết bài ngữ pháp. Mỗi đợt mở file này đọc lại
> mục **6. Chuẩn độ dày** và **7. Danh sách 50 bài** trước khi viết.

Trạng thái: **HOÀN THÀNH** — 62/62 bài ngữ pháp, 100/100 khung câu, 134 động từ
bất quy tắc, Từ điển lỗi (1.220 lỗi) và liên kết hai chiều đã xong (xem mục 9).

---

## 1. Kiến trúc dữ liệu

Giữ nguyên mọi thứ đang có, thêm một nhánh song song:

```
data/
  index.json             100 khung câu (giữ nguyên)
  frames/001..100.json
  grammar.json           MỚI: mục lục 50 bài ngữ pháp
  grammar/001..050.json  MỚI: nội dung từng bài
  bundle.js              build.py gom cả 4 nguồn
```

`data/grammar.json` dùng đúng cấu trúc của `index.json` để tái sử dụng code dựng sidebar:

```json
{
  "title": "50 Bài Ngữ Pháp",
  "tagline": "Từ A1 đến C1, bám vào bẫy người Việt hay mắc",
  "groups": [
    {
      "name": "Nhóm 1 · Thì hiện tại & quá khứ",
      "items": [
        { "id": 1, "pat": "S + V(s/es)", "vi": "Hiện tại đơn", "detail": true }
      ]
    }
  ]
}
```

---

## 2. build.py

Đã thêm `GINDEX` (`data/grammar.json`) và `LESSONS` (`data/grammar/*.json`).
Payload của `bundle.js`:

```js
window.KC_DATA = { index, frames, gindex, lessons };
```

Phần in kết quả báo thêm số bài ngữ pháp. Logic frames giữ nguyên.

---

## 3. khung-cau-giao-tiep.html

| Vị trí | Thay đổi |
|---|---|
| CSS | `.tabs`, `.tree`, `.lnk`, `.errbox` |
| Header | 2 nút tab **Khung câu / Ngữ pháp** |
| Trạng thái | `MODE` (`'kc'`/`'ng'`), `GINDEX`, `GFLAT`, `ngDone` — tiến độ tách riêng mỗi chế độ |
| `BLOCK` | +2 kiểu khối: `tree`, `link` |
| `renderLesson()` | Song song `renderFrame()` — dùng `rule` thay `pattern` |
| `buildList()` | Rẽ nhánh theo `MODE` |
| `show()` | Nhận id `"g12"` (bài ngữ pháp), `"err"` (Từ điển lỗi) |
| `SPECIAL` | Thêm `["err","⚠","Từ điển lỗi"]` |
| Regex | `[Ngữ pháp NN]` → link sang bài ngữ pháp (song song `[Khung NN]`) |

`speak()`, `decorate()`, theme, localStorage, tìm kiếm dùng lại nguyên vẹn.

---

## 4. Hai khối mới

### `tree` — sơ đồ quyết định "chọn dạng nào"

```json
{
  "t": "tree",
  "q": "Việc này đã xong hẳn chưa?",
  "nodes": [
    { "if": "Đã xong, có mốc quá khứ rõ", "then": "Quá khứ đơn",
      "ex": "I saw him yesterday." },
    { "if": "Kéo dài đến bây giờ", "then": "Hiện tại hoàn thành",
      "ex": "I've known him for years." }
  ]
}
```

### `link` — cầu nối sang khung câu, bấm là nhảy thẳng

```json
{
  "t": "link",
  "items": [
    { "id": 94, "why": "for/since khi nói thâm niên công việc" },
    { "id": 95, "why": "just/already/yet và dạng V3" }
  ]
}
```

---

## 5. Schema một bài ngữ pháp

```json
{
  "id": 7,
  "group": "Nhóm 2 · Thì hoàn thành",
  "title": "Hiện tại hoàn thành — have + V3",
  "subtitle": "…",
  "meaning": "…",
  "rule": ["S + have/has + <em>V3</em>", "S + haven't/hasn't + <em>V3</em>"],
  "tags": [{ "text": "Trình độ: B1", "hot": true }],
  "frames": [94, 95, 96],
  "sections": [ … 9 mục … ]
}
```

---

## 6. CHUẨN ĐỘ DÀY BẮT BUỘC — 9 mục

| # | Mục | Khối | Số lượng |
|---|---|---|---|
| 1 | Quy tắc cốt lõi | `p` + `callout`×2 + `table` | 4 dòng |
| 2 | Bảng chia đầy đủ | `table` + `ex` | 12 dòng + **12** ví dụ song ngữ |
| 3 | Khi nào dùng — khi nào không | `cards` | **6** thẻ |
| 4 | Dấu hiệu nhận biết & từ đi kèm | `words` | **24** (2 nhóm × 12) |
| 5 | **BẪY người Việt hay mắc** | `pairs` | **10** cặp Sai/Đúng kèm `why` |
| 6 | Phân biệt với cấu trúc gần giống | `table` + `tree` + `scale` | 7 dòng + sơ đồ + 5 mức |
| 7 | Ngữ pháp này trong khung câu nào | `link` | 3–6 khung |
| 8 | Luyện tập | `quiz` | **16** (8 chia dạng + 4 chọn đúng + 4 dịch) |
| 9 | Mẹo nhớ | `list` | **6** ý |

**Bộ số kiểm tra: `(words, ex, pairs, quiz) = (24, 12, 10, 16)`**
cộng: đúng **9 mục**, có **1 `tree`**, có **1 `link`**, **không ký tự CJK**.

Quy ước nội dung:
- Toàn bộ giải thích bằng **tiếng Việt**, ví dụ **song ngữ**.
- Mỗi bài xoay quanh **một bẫy cụ thể người Việt hay mắc** — đó là linh hồn của bài.
- `words` có `w/vi/ex/exvi`, thêm `note` khi có bẫy.
- Dùng `[Khung NN]` để trỏ sang khung câu, `[Ngữ pháp NN]` để trỏ sang bài ngữ pháp khác.
- Kiểu khối hợp lệ: `p h3 callout list table cards ex words bank dialog pairs scale quiz tree link`.

---

## 6b. THỨ TỰ MENU ≠ SỐ ID

Từ bản mở rộng 62 bài, `data/grammar.json` xếp theo **thứ tự nên học**, không theo số ID.
Ví dụ Nhóm 1 bắt đầu bằng bài **43**, bài **01** nằm ở Nhóm 3.

- **Số ID không bao giờ đổi.** Mọi `[Ngữ pháp NN]`, khối `link` và trường `grammar`
  của 100 khung câu đều bám vào ID.
- Muốn đổi nhóm hay thứ tự → sửa `data/grammar.json`, rồi chạy **`python regroup.py`**
  để đồng bộ trường `"group"` trong từng file bài.
- Nút Trước/Sau và phím mũi tên đi theo **thứ tự trong menu**, không theo số ID.

### Danh sách 12 bài bổ sung (51–62)

| ID | Nhóm trong menu | Bài | Bẫy chính | Khung câu |
|---|---|---|---|---|
| 51 | 1 · Nền móng | There is / There are & cách nói "có" | *In my house **has** three rooms* ✗ | 100 |
| 52 | 1 · Nền móng | Chủ ngữ giả `It` | *Is very hot today* ✗ — không được thiếu chủ ngữ | 99, 44 |
| 53 | 1 · Nền móng | Đại từ I / me / my / mine / myself | *Me and him went* ✗ · *This is **my*** ✗ | 71, 73 |
| 54 | 1 · Nền móng | Chính tả khi thêm `-s`, `-ed`, `-ing` | *studys, stoped, makeing* ✗ | — |
| 55 | 8 · Dạng theo sau động từ | Phrasal verb — tách được hay không | *turn on **it*** ✗ → `turn it on` | 4, 20 |
| 56 | 6 · Tính từ & Trạng từ | too / very / enough / so / such | *I'm **too** happy* ✗ — `too` luôn nghĩa xấu | 81, 85 |
| 57 | 2 · Danh từ & lượng từ | both / either / neither / all / none | `neither … nor` + động từ số ít | 22, 65 |
| 58 | 2 · Danh từ & lượng từ | Danh từ ghép & tính từ ghép | *a five-**years**-old boy* ✗ | 64, 99 |
| 59 | 10 · Điều kiện & Giả định | I wish / If only | *I wish I **am** rich* ✗ | 9, 98 |
| 60 | 11 · Mệnh đề & Dạng câu | Mệnh đề quan hệ rút gọn | `the man sitting there` | 4, 70 |
| 61 | 7 · Giới từ | Giới từ chỉ chuyển động | *go **to** home* ✗ · `into / onto / through` | 62, 63 |
| 62 | 12 · Nhấn mạnh | Câu chẻ nhấn mạnh | `It was John who…` · `What I need is…` | 10, 42 |

---

## 7. DANH SÁCH 50 BÀI ĐẦU

### Nhóm 1 · Thì hiện tại & quá khứ (1–5)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 01 | Hiện tại đơn | Quên `-s` ngôi thứ ba; lịch trình tàu xe | 92 |
| 02 | Hiện tại tiếp diễn | Động từ trạng thái không tiếp diễn | 92 |
| 03 | Quá khứ đơn | Sau `did/didn't` về dạng trần | 96 |
| 04 | Quá khứ tiếp diễn | Nền tiếp diễn vs việc xen vào | 96 |
| 05 | Quá khứ hoàn thành | `had + V3` cho việc xảy ra trước | 96 |

### Nhóm 2 · Thì hoàn thành (6–9)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 06 | Hiện tại hoàn thành | Sau `have` là V3 không phải V2 | 95 |
| 07 | for / since / yet / already / just | `since three years` ✗; `yet` cuối câu | 94, 95 |
| 08 | HTHT tiếp diễn & QKHT tiếp diễn | `I am working here for 3 years` ✗ | 94 |
| 09 | Hoàn thành vs Quá khứ đơn | Có mốc quá khứ thì bỏ thì hoàn thành | 94, 95, 96 |

### Nhóm 3 · Tương lai (10–13)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 10 | will | Quyết định ngay lúc nói | 91 |
| 11 | be going to | Kế hoạch đã quyết & dự đoán có bằng chứng | 91 |
| 12 | HT tiếp diễn / HT đơn chỉ tương lai | Lịch đã chốt vs lịch trình cố định | 92 |
| 13 | Tương lai hoàn thành & tiếp diễn | `will have + V3` | — |

### Nhóm 4 · Điều kiện & Giả định (14–18)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 14 | Điều kiện loại 1 | Sau `if` KHÔNG có `will` | 97 |
| 15 | Điều kiện loại 2 | `If I were you` — `were` mọi chủ ngữ | 98 |
| 16 | Điều kiện loại 3 & hỗn hợp | `would have + V3` | 98 |
| 17 | unless / as long as / in case / provided | `unless` đã là phủ định | 97 |
| 18 | Thức giả định | `I suggest he go` — động từ trần | — |

### Nhóm 5 · Danh từ & Mạo từ (19–23)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 19 | Đếm được & không đếm được | weather, news, advice, information | 89 |
| 20 | a / an — và khi nào không dùng | `an hour` (h câm), `a university` | 89 |
| 21 | the — ba luật quyết định | Thừa/thiếu `the` với tên riêng | — |
| 22 | some / any / much / many / a few / a little | `any` trong phủ định & câu hỏi | 100 |
| 23 | Số nhiều bất quy tắc & sở hữu cách | `people` số nhiều; `'s` vs `of` | 100 |

### Nhóm 6 · Dạng theo sau động từ (24–28)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 24 | to V hay V-ing sau động từ | `enjoy to do` ✗; `stop to` vs `stop V-ing` | — |
| 25 | Giới từ + V-ing | `look forward to seeing` — `to` là giới từ | 86 |
| 26 | used to / be used to / get used to / would | Cặp dễ nhầm nhất tiếng Anh | 86, 93 |
| 27 | make / let / have somebody do | Sau `make/let` là động từ trần | — |
| 28 | Danh động từ hoàn thành & bị động | `having done`, `being done` | — |

### Nhóm 7 · Động từ khuyết thiếu (29–33)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 29 | can / could / be able to | Sau modal là động từ trần | 15 |
| 30 | may / might / could | Mức độ chắc chắn | — |
| 31 | must / have to / need to | `mustn't` ≠ `don't have to` | — |
| 32 | should / ought to / had better | `had better` + động từ trần | 98 |
| 33 | must have / should have / could have | Sau `have` là V3; `I'd of` ✗ | 88 |

### Nhóm 8 · Tính từ & Trạng từ (34–38)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 34 | -ed và -ing | `I'm boring` ✗ | 81, 87 |
| 35 | Tính từ sau linking verb | `sound/feel/look` + TÍNH TỪ | 85, 88 |
| 36 | Trật tự nhiều tính từ | opinion-size-age-shape-colour-origin | — |
| 37 | So sánh hơn & nhất | `more better` ✗; `as … as` | — |
| 38 | Trạng từ: vị trí & tần suất | `always` đứng trước động từ thường | — |

### Nhóm 9 · Giới từ (39–42)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 39 | in / on / at — thời gian | `on Friday`, `at six`, `in May` | 92 |
| 40 | in / on / at — nơi chốn & phương tiện | `on the bus` vs `in the car` | — |
| 41 | for / since / during / while / by / until | `during` + danh từ, `while` + mệnh đề | 94 |
| 42 | Giới từ cố định sau tính từ & động từ | `worried about`, `good at`, `depend on` | 82, 87, 88 |

### Nhóm 10 · Câu & Mệnh đề (43–50)
| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 43 | Trật tự từ cơ bản & vị trí trạng ngữ | S-V-O; không chen trạng từ giữa V và O | — |
| 44 | Câu hỏi: trợ động từ & câu hỏi đuôi | `Did you saw` ✗; câu hỏi gián tiếp không đảo | 67, 68 |
| 45 | Mệnh đề quan hệ | `who/which/that/where`; khi nào bỏ được | — |
| 46 | Câu bị động | Khi nào dùng, `by` ai | — |
| 47 | Câu tường thuật | Lùi thì & đổi đại từ | — |
| 48 | Liên từ & mệnh đề nhượng bộ | `although` + mệnh đề, `despite` + danh từ | — |
| 49 | Đảo ngữ | `Never have I seen…` | — |
| 50 | Dấu câu tiếng Anh | Dấu phẩy mệnh đề `if`/`when`; không dấu cách trước `?` | 96, 97 |

---

## 8. Hai tính năng kết nối

**Từ điển lỗi** (view `err`): gom **600 cặp Sai/Đúng** từ 100 khung câu +
**500 cặp** từ 50 bài ngữ pháp = **1.100 lỗi** tra được bằng ô tìm kiếm.
Hàm `eachBlock()` đã làm sẵn việc gom.

**Link hai chiều**: bài ngữ pháp → khung câu qua khối `link`;
khung câu → bài ngữ pháp qua `[Ngữ pháp NN]`. Rải tham chiếu ngược vào
100 khung cũ ở đợt cuối, theo cột "Khung câu" trong bảng mục 7.

---

## 9. CÁC ĐỢT TRIỂN KHAI

| Đợt | Việc | Trạng thái |
|---|---|---|
| **0** | Hạ tầng: `build.py`, HTML (tab + 2 khối + view), CSS, **bài 01** làm chuẩn | ✅ xong |
| **1–17** | Nội dung: **3 bài/đợt** (bài 02→50) | ✅ xong — 50/50 |
| **18** | Từ điển lỗi + rải tham chiếu ngược vào 100 khung + cập nhật `data/README.md` | ✅ xong |

**Kết quả đợt 18**

- Trang **Từ điển lỗi** (`err`): gom 600 cặp `pairs` của khung câu + 500 cặp của
  bài ngữ pháp = **1.100 lỗi**, có ô tìm riêng, lọc theo nguồn, phân trang 60 lỗi,
  mỗi lỗi kèm link về đúng bài đã dạy nó. Hiện ở **cả hai tab**.
- **Liên kết hai chiều** đã khép kín: thêm trường `"grammar": [id, …]` vào cả
  100 file khung câu, sinh tự động bằng `backlink.py` (ưu tiên bài có khối `link`
  trỏ tới khung đó, tối đa 4 bài/khung). Dải thẻ hiện ngay dưới khung mẫu.
  100/100 khung đều có ít nhất một bài ngữ pháp trỏ tới.
- `data/README.md` cập nhật: cây thư mục mới, cách thêm bài ngữ pháp, bảng liên kết
  hai chiều, 2 kiểu khối mới (`tree`, `link`), ba trang tổng hợp.

### Mở rộng lên 62 bài

| Đợt | Việc | Trạng thái |
|---|---|---|
| **19** | Sắp lại menu theo thứ tự học (12 nhóm) + `regroup.py` + sửa nút Trước/Sau | ✅ xong |
| **20** | Bài **51, 52, 53** — nền móng: there is/are · chủ ngữ giả It · đại từ | ✅ xong |
| **21** | Bài **54, 55, 56** — chính tả đuôi · phrasal verb · too/enough | ✅ xong |
| **22** | Bài **57, 58, 59** — both/either · danh từ ghép · wish | ✅ xong |
| **23** | Bài **60, 61, 62** — mệnh đề rút gọn · giới từ chuyển động · câu chẻ | ✅ xong |
| **24** | Tab thứ ba: **Động từ bất quy tắc** — một bảng A→Z, **201 từ**, lọc theo từ / chữ cái / độ thông dụng, phân trang 50 dòng | ✅ xong |

Mỗi đợt vẫn theo đúng quy trình ở dưới, thêm **một bước**: sau khi đánh dấu
`"detail": true` thì chạy `python regroup.py` để trường `"group"` của bài mới khớp
với nhóm trong menu. Lấy bẫy chính và khung câu móc nối từ bảng ở **mục 6b**.

---

## 11. MỞ RỘNG LÊN B2 — 22 BÀI KỸ NĂNG

### Vì sao không phải thêm ngữ pháp

Đo thực tế trên toàn bộ 162 file nội dung:

| Hạng mục | Hiện có | B2 cần | Kết luận |
|---|---|---|---|
| Ngữ pháp | 62 bài, A1→C1 | ~45 điểm | **dư** |
| Từ vựng | ~1.625 từ riêng lẻ (≈1.100 word family) | 4.000–5.000 | **thiếu 3×** |
| Phát âm · Nghe · Nói · Viết | **0 bài** | bắt buộc | **trống** |

Dò máy 9 mảng kỹ năng: *collocation, essay, email, nghe, nói kéo dài, thành ngữ,
từ vựng chủ đề* — **không có dấu vết nào**. Nên phần bổ sung là **kỹ năng**, không
phải ngữ pháp.

### Hạ tầng (Đợt 25 — ✅ xong)

```
data/skills.json         muc luc 22 bai ky nang
data/skills/NNN.json     noi dung tung bai
```

- `build.py` gom thêm `sindex` + `skills` vào `bundle.js`
- Tab thứ tư **Kỹ năng** (`MODE = "sk"`, id dạng `"sN"`)
- `renderDoc` dùng chung khuôn với ngữ pháp (nhãn "Bài", trường `rule`)
- Tham chiếu chéo mới: **`[Kỹ năng NN]`** → nhảy sang bài kỹ năng
- `regroup.py` và `check-grammar.py` nhận tham số: `python check-grammar.py skills`

### Danh sách 22 bài

**Nhóm 1 · Phát âm** — gỡ chặn cả nghe lẫn nói, làm trước tiên

| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 01 | Phụ âm cuối | Người Việt **nuốt** phụ âm cuối: `like`/`lie`, `cat`/`cap` | 71, 72 |
| 02 | Đuôi `-s` / `-es` | /s/ · /z/ · /ɪz/ — mất đuôi là mất số nhiều & ngôi thứ ba | 65, 100 |
| 03 | Đuôi `-ed` | /t/ · /d/ · /ɪd/ — `worked` không đọc thành "work-ed" | 96 |
| 04 | Cụm phụ âm | `desks`, `asked`, `strengths` — tiếng Việt không có cụm | 64 |
| 05 | Trọng âm từ & câu | `REcord` (danh từ) ≠ `reCORD` (động từ) | 68, 70 |
| 06 | Âm tiếng Việt không có | /θ/ /ð/, /ʃ/ /tʃ/ /dʒ/, /iː/ vs /ɪ/, /l/ vs /n/ cuối | 72, 77 |

**Nhóm 2 · Nghe** — vì sao nghe không ra

| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 07 | Nối âm | `an apple` → "anapple" · `pick it up` → "pickitup" | 76, 80 |
| 08 | Nuốt âm & biến âm | `did you` → "didja" · `next day` → "nexday" | 61, 67 |
| 09 | Dạng yếu | `to, of, for, and, can, was` biến thành /ə/ khi nói nhanh | 63, 91 |
| 10 | Rút gọn trong văn nói | `gonna, wanna, I'd've, shoulda` | 91, 98 |
| 11 | Nghe số, ngày, đánh vần | `15` ≠ `50` · B/V/P trên điện thoại | 61, 65 |

**Nhóm 3 · Nói** — từ câu lẻ lên đoạn dài

| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 12 | Nói kéo dài 60 giây | Người Việt nói xong một câu là hết — thiếu bộ khung triển khai | 70, 96 |
| 13 | Lập luận có nhượng bộ | Quan điểm + vì sao + ví dụ + "tuy nhiên" | 41, 52 |
| 14 | So sánh hai lựa chọn | `A hơn B ở chỗ…` · cân nhắc được mất | 8, 66 |
| 15 | Câu câu giờ & sửa lời | Im lặng khi bí; không biết cách nói lại cho đúng | 50, 70 |
| 16 | Giữ lượt & chuyển lượt | Bị cắt lời, hoặc nói đè lên người khác | 53, 59 |

**Nhóm 4 · Viết** — cấu trúc trước, chữ sau

| ID | Bài | Bẫy chính | Khung câu |
|---|---|---|---|
| 17 | Cấu trúc một đoạn văn | Viết một mạch không câu chủ đề | 41, 42 |
| 18 | Bài luận nêu quan điểm | Mở — thân — kết; mỗi đoạn một ý | 42, 47 |
| 19 | Bài luận hai chiều | Một bên — bên kia — chốt, không lẫn lộn | 52, 53 |
| 20 | Email trang trọng | `Dear Sir` ↔ `Yours faithfully` phải khớp cặp | 11, 16 |
| 21 | Email thân mật & tin nhắn | Dùng nhầm giọng trang trọng với bạn bè | 78, 80 |
| 22 | Từ nối & tránh lặp từ | Lặp danh từ thay vì dùng `it / this / such` | 48, 50 |

### Các đợt

| Đợt | Việc | Trạng thái |
|---|---|---|
| **25** | Hạ tầng tab Kỹ năng + mục lục 22 bài + bài 01–03 | ✅ xong |
| **26** | Bài **04, 05, 06** — cụm phụ âm · trọng âm · âm khó | ✅ xong |
| **27** | Bài **07, 08, 09** — nối âm · nuốt âm · dạng yếu | ✅ xong |
| **28** | Bài **10, 11, 12** — rút gọn · nghe số · nói 60 giây | ✅ xong |
| **29** | Bài **13, 14, 15** — lập luận · so sánh · câu giờ | ✅ xong |
| **30** | Bài **16, 17, 18** — giữ lượt · đoạn văn · luận quan điểm | ✅ xong |
| **31** | Bài **19, 20, 21** — luận hai chiều · email trang trọng · email thân mật | ✅ xong |
| **32** | Bài **22** + Từ điển lỗi gom thêm nguồn Kỹ năng | ✅ xong |

**Kết quả phần kỹ năng B2**

- **22/22 bài**, đạt chuẩn `(24, 12, 10, 16)`, 9 mục như phần ngữ pháp.
- **Từ điển lỗi** gom thêm 220 cặp của tab Kỹ năng → **1.440 lỗi**, lọc được theo
  bốn nguồn: Tất cả · Khung câu · Ngữ pháp · Kỹ năng.
- Tham chiếu chéo giờ **ba chiều**: `[Khung NN]` ↔ `[Ngữ pháp NN]` ↔ `[Kỹ năng NN]`.
- Bộ khung lập luận dùng chung cho nói và viết: P-R-E-P [Kỹ năng 13] → đoạn văn
  [Kỹ năng 17] → bài luận [Kỹ năng 18].

---

## 12. TỪ VỰNG B2 — tab thứ năm

### Vì sao đây là khoảng cách lớn nhất còn lại

| Hạng mục | Hiện có | B2 cần |
|---|---|---|
| Ngữ pháp | 62 bài, tới C1 | ✅ dư |
| Kỹ năng | 22 bài | ✅ đủ |
| **Từ vựng** | ~1.600 từ riêng lẻ | **4.000–5.000 word family** |

### Hạ tầng (Đợt 33 — ✅ xong)

```
data/vocab.json     mot file duy nhat: topics + words
```

- Tab thứ năm **Từ vựng** (`MODE = "vc"`, id trang đơn `"vc"`)
- Một bảng, lọc theo **chủ đề**, ô tìm chung, **phân trang 40 dòng**
- Ba nút **Xem đủ / Che nghĩa / Che từ** để tự kiểm tra
- `pagerHTML()` tách ra dùng chung với tab Động từ
- Chủ đề chưa soạn hiện mờ trong sidebar, không bấm được

### Cấu trúc một dòng từ

```jsonc
// [ từ, loại từ, nghĩa, id chủ đề, câu ví dụ, nghĩa câu, 1 nếu hay gặp ]
["deadline", "n", "hạn chót", "work",
 "We missed the deadline by two days.", "Bọn tôi trễ hạn hai ngày.", 1]
```

**Mỗi từ bắt buộc có một câu ví dụ song ngữ hoàn chỉnh** — học từ trong câu thì
nhớ lâu hơn và biết cách dùng.

> Quyết định "không làm phiên âm" ở đây **đã bị đảo lại** — xem mục 14.

### 23 chủ đề

| Nhóm | Chủ đề |
|---|---|
| Đời sống | `work` `edu` `health` `family` `person` `food` `home` `money` |
| Xã hội | `env` `tech` `media` `law` `society` `science` |
| Hoạt động | `travel` `sport` `art` `transport` `nature` `service` |
| Xuyên suốt | `colloc` (collocation) · `wfam` (họ từ) · `phrasal` (phrasal verb) |

### Các đợt

| Đợt | Việc | Trạng thái |
|---|---|---|
| **33** | Hạ tầng tab Từ vựng + chủ đề **work** (60 từ) | ✅ xong |
| **34-42** | **2 chủ đề mỗi đợt** (~120 từ) cho 18 chủ đề đời sống & xã hội | ✅ xong |
| **43** | `service` (60) + `colloc` — 120 collocation thông dụng | ✅ xong |
| **44** | `wfam` — 100 họ từ (decide / decision / decisive) | ✅ xong |
| **45** | `phrasal` — 120 phrasal verb thông dụng | ✅ xong |

**Kết quả: 1.540 mục / 23 chủ đề — đã đạt mục tiêu ~1.500.** Mỗi chủ đề đời sống &
xã hội tròn 60 từ; `colloc` và `phrasal` mỗi mục 120; `wfam` 100 họ từ.

### Quy trình mỗi đợt từ vựng

1. Mở `data/vocab.json`, xem `words` đã có chủ đề nào.
2. Lấy **2 chủ đề tiếp theo** từ bảng trên, thêm **~60 từ mỗi chủ đề** vào cuối mảng
   `words` — dùng Edit tool chèn trước dấu `]` cuối.
3. Mỗi dòng đủ 7 trường, `topic` phải khớp một `id` trong `topics`.
4. Chạy `python build.py` — nó tự đếm số từ, số chủ đề đã soạn và cảnh báo nếu có
   chủ đề không khai báo.
5. Báo tiến độ (x/23 chủ đề, y từ).

### Quy trình mỗi đợt kỹ năng

Giống hệt quy trình ngữ pháp, đổi đúng ba chỗ:

1. Viết `data/skills/NNN.json`, đánh dấu `"detail": true` trong `data/skills.json`.
2. Chạy `python regroup.py skills` (không phải `regroup.py`).
3. Chạy `python check-grammar.py skills` — **cùng bộ số `(24, 12, 10, 16)`, 9 mục**.

Mục 7 của bài kỹ năng đổi tên thành **"Kỹ năng này dùng ở đâu"** nhưng vẫn là khối `link`
trỏ sang khung câu.

---

### Quy trình mỗi đợt

1. Liệt kê `data/grammar/*.json` để biết bài nào xong, lấy **3 bài tiếp theo** từ bảng mục 7.
2. Viết 3 bài mới (`NNN.json`, 3 chữ số) — dùng **Write tool**, KHÔNG dùng heredoc trong Bash
   (lỗi `ENAMETOOLONG` trên Windows). TUYỆT ĐỐI không để lọt ký tự CJK.
3. Đánh dấu `"detail": true` cho các bài đó trong `data/grammar.json`.
4. Chạy `python build.py`, rồi `python check-grammar.py` (xem mục 10).
5. Báo tiến độ (x/50) và bẫy đáng chú ý của 3 bài vừa viết.
6. Đủ 50 bài thì dừng loop bằng `ScheduleWakeup stop:true`.

---

## 10. Script kiểm tra mỗi đợt

Đã có sẵn ở `check-grammar.py` tại gốc dự án:

```
cd C:\Eng
python build.py
python check-grammar.py
```

Nó kiểm tra từng bài trong `data/grammar/`:

| Kiểm tra | Chuẩn |
|---|---|
| `words, ex, pairs, quiz` | `(24, 12, 10, 16)` |
| Số mục | đúng **9** |
| Khối `tree` | ít nhất 1 |
| Khối `link` | ít nhất 1, id trỏ trong khoảng 1–100 |
| Ký tự CJK | không có |
| Kiểu khối | thuộc danh sách hợp lệ |

Thoát với mã `1` nếu có lỗi, `0` nếu sạch — in ra đúng bài nào lệch và lệch ở đâu.

**Lưu ý Windows:** luôn đặt `PYTHONIOENCODING=utf-8` trước khi chạy, và
dùng **PowerShell** nếu Bash báo `command not found` (PATH của Bash hay bị rỗng
trong phiên này).

---

## 13. ÔN TẬP LẶP NGẮT QUÃNG — tab thứ sáu

### Vì sao đây là lỗ hổng còn lại

Tài liệu đã đủ dày, nhưng **không có gì giúp nhớ lại**. Người học đọc xong một bài
rồi quên, và không có cách nào biết từ nào mình sắp quên.

| Đã có | Thiếu |
|---|---|
| 1.540 từ vựng, 1.440 cặp lỗi, 201 động từ, 84 bài | cơ chế ôn lại đúng lúc |
| "Ôn tập trộn" (chỉ `quiz` của khung câu, trộn ngẫu nhiên) | lặp ngắt quãng, tự chấm, lịch ôn |

**Nguyên tắc: không tạo file dữ liệu mới.** Thẻ ôn tập được rút ra từ dữ liệu đã có,
y như cách Từ điển lỗi gom khối `pairs`. Thêm một bài học là tự động thêm thẻ.

### Bốn bộ thẻ

| Bộ | Nguồn | Số thẻ | Mặt trước → mặt sau |
|---|---|---|---|
| `vc` Từ vựng | `data/vocab.json` | 1.540 | nghĩa tiếng Việt → từ tiếng Anh + câu ví dụ |
| `qz` Bài tập | khối `quiz` của 100 khung + 62 ngữ pháp + 22 kỹ năng | ~2.900 | câu tiếng Việt → câu tiếng Anh |
| `er` Sửa lỗi | khối `pairs` của cả ba nguồn | 1.440 | câu SAI → câu ĐÚNG + vì sao |
| `vb` Động từ | `data/verbs.json` | 201 | V1 → V2 / V3 |

### Thuật toán — Leitner 5 hộp

| Hộp | Ôn lại sau | Ý nghĩa |
|---|---|---|
| 1 | 1 ngày | vừa sai, hoặc thẻ mới |
| 2 | 2 ngày | nhớ được 1 lần |
| 3 | 4 ngày | đang vào trí nhớ dài hạn |
| 4 | 8 ngày | khá chắc |
| 5 | 16 ngày | gần như thuộc |

- Tự chấm **Nhớ rồi** → lên một hộp (tối đa 5)
- Tự chấm **Chưa nhớ** → rơi thẳng về hộp 1
- Thẻ chưa từng gặp được coi là đến hạn ngay

### Trạng thái lưu trong localStorage

```jsonc
// khóa "ot_srs"
{ "v:deadline":   [3, 1764547200000],   // [hộp, mốc đến hạn]
  "q:kc:12:3":    [1, 1764460800000],
  "p:ng:41:2":    [5, 1765929600000],
  "b:buy":        [2, 1764633600000] }

// khóa "ot_log"  — nhật ký để tính chuỗi ngày và tỉ lệ nhớ
{ "2026-10-02": { n: 42, ok: 35 } }
```

Id thẻ phải **ổn định qua các lần build** — dựng từ nội dung chứ không từ chỉ số
mảng, nếu không thì thêm một bài mới sẽ làm lệch toàn bộ tiến độ cũ.

### Các đợt

| Đợt | Việc | Trạng thái |
|---|---|---|
| **46** | Hạ tầng: tab `ot`, `ctx()` mở rộng, `collectCards()` gom 4 bộ, lưu SRS, màn hình tổng quan | ✅ xong — 5.825 thẻ |
| **47** | Phiên ôn: thẻ lật, hai nút tự chấm, Leitner 5 hộp, thanh tiến độ phiên | ✅ xong |
| **48** | Phạm vi: chọn bộ, chọn chủ đề/nhóm, "chỉ bài đã học", đổi chiều hỏi Việt↔Anh | ✅ xong |
| **49** | Lịch & thống kê: 7 ngày tới, chuỗi ngày ôn, tỉ lệ nhớ từng bộ, xuất/nhập tiến độ | ✅ xong |
| **50** | Nối vào bài học: link ngược thẻ → bài gốc, gộp "Ôn tập trộn" cũ vào, `data/README.md`, smoke test | ✅ xong |

**Kết quả: tab Ôn tập hoàn chỉnh — 5.825 thẻ rút từ bốn nguồn, Leitner 5 hộp,
chọn phạm vi, lịch 7 ngày, thống kê, sao lưu. Smoke test 147 kiểm tra, sạch.**

### Quy trình mỗi đợt

1. Sửa `khung-cau-giao-tiep.html` — dùng **Edit tool**, không dùng heredoc trong Bash.
2. Chạy `cd C:\Eng; $env:PYTHONIOENCODING='utf-8'; python build.py` bằng **PowerShell**.
3. Chạy smoke test jsdom trong thư mục scratchpad, bổ sung kiểm tra cho phần vừa làm.
4. Phân biệt rõ **test lỗi thời** với **app hỏng** — sửa assertion nếu hành vi mới mới là đúng.
5. Báo tiến độ (đợt x/5) và điều đáng chú ý.
6. Xong Đợt 50 thì dừng loop bằng `ScheduleWakeup stop:true`.

### Ràng buộc

- **Không thêm phụ thuộc runtime** — vẫn là HTML/CSS/JS thuần, chạy được bằng `file://`.
- Mọi thao tác `localStorage` bọc trong `try/catch` (đã có sẵn `load`/`save`).
- Tiến độ SRS là dữ liệu người dùng: **không bao giờ xoá âm thầm**; đổi cấu trúc thì
  phải chuyển đổi dữ liệu cũ hoặc giữ nguyên khóa cũ.
- Tab mới phải dùng lại `ctx()`, `pagerHTML()`, `speak()` — không viết trùng.

---

## 14. PHIÊN ÂM IPA CHO BẢNG TỪ VỰNG

### Vì sao đảo lại quyết định cũ

Mục 12 từng chốt **không làm phiên âm** vì trang đã có nút loa. Lý do đó sai ở hai chỗ:

1. Nút loa cũ chỉ đọc **câu ví dụ**, không đọc riêng từ — nghe cả câu thì không bắt
   được âm cuối và trọng âm của từ cần học. (Đã sửa: mỗi dòng giờ có **hai nút loa**.)
2. Giọng đọc máy không cho biết **trọng âm rơi vào đâu** — thứ người Việt sai nhiều
   nhất (`ˈprɒdʒekt` danh từ vs `prəˈdʒekt` động từ), và không dùng được khi tắt tiếng.

### Trường thứ 8

```jsonc
// [ từ, loại từ, nghĩa, id chủ đề, câu ví dụ, nghĩa câu, hot, IPA ]
["deadline", "n", "hạn chót", "work",
 "We missed the deadline by two days.", "Bọn tôi trễ hạn hai ngày.", 1, "/ˈdedlaɪn/"]
```

- Trường thứ 8 **không bắt buộc** — dòng 7 trường vẫn chạy bình thường, chỉ là không
  hiện phiên âm. Nhờ vậy thêm dần theo từng đợt mà không làm hỏng bảng.
- **Giọng Anh-Anh (RP)**, bọc trong `/ /`, có dấu trọng âm chính `ˈ` và phụ `ˌ`.
- Cụm nhiều từ vẫn ghi cả cụm: `in charge of` → `/ɪn ˈtʃɑːdʒ əv/`.
- Chỗ Anh–Mỹ khác nhau rõ thì ghi kèm trong nghĩa, không nhồi vào ô phiên âm.

### Công cụ: `addipa.py`

```
python addipa.py <file_map.tsv>
```

File map là TSV hai cột `từ<TAB>/ipa/`. Script sửa **từng dòng bằng regex**, không
`json.dump` — vì `data/vocab.json` được định dạng tay, mỗi từ gọn một dòng.

An toàn có sẵn: từ nào trong map mà không tìm thấy trong `vocab.json` thì script
**báo lỗi và không ghi gì cả**, nên không bao giờ âm thầm bỏ sót.

`build.py` in ra độ phủ sau mỗi lần chạy và cảnh báo nếu phiên âm không bọc trong `/ /`.

### Các đợt — 2 chủ đề mỗi đợt

| Đợt | Chủ đề | Số từ | Trạng thái |
|---|---|---|---|
| **51** | `work` (mẫu) + sửa `addipa.py`, `build.py`, giao diện | 60 | ✅ xong |
| **52** | `edu` · `health` | 120 | ✅ xong |
| **53** | `env` · `tech` | 120 | ✅ xong |
| **54** | `media` · `travel` | 120 | ✅ xong |
| **55** | `home` · `money` | 120 | ✅ xong |
| **56** | `food` · `family` | 120 | ✅ xong |
| **57** | `person` · `sport` | 120 | ✅ xong |
| **58** | `art` · `law` | 120 | ✅ xong |
| **59** | `society` · `science` | 120 | ✅ xong |
| **60** | `transport` · `nature` | 120 | ✅ xong |
| **61** | `service` + `colloc` | 180 | ✅ xong |
| **62** | `wfam` + `phrasal` | 220 | ✅ xong |

**Kết quả: 1.540/1.540 từ có phiên âm (100%).** Kiểm tra tự động: không dòng nào
thiếu trường, mọi phiên âm đều bọc trong `/ /`, không lọt ký tự CJK.

### Quy trình mỗi đợt

1. Lấy danh sách từ của 2 chủ đề tiếp theo bằng một lệnh Python ngắn.
2. Viết file TSV vào **thư mục scratchpad** (không để rác trong dự án) — dùng **Write tool**.
3. `python addipa.py <tsv>` rồi `python build.py`, cả hai chạy bằng **PowerShell**.
4. Đọc dòng độ phủ trong output để xác nhận đúng số từ vừa thêm.
5. Báo tiến độ (x/1540 từ có phiên âm) và vài từ có trọng âm dễ sai.
6. Hết chủ đề thì chạy smoke test rồi dừng loop bằng `ScheduleWakeup stop:true`.

### Chuẩn chất lượng

- Trọng âm phải đúng — đây là lý do chính làm phiên âm, sai thì tệ hơn không có.
- Âm cuối `/s/ /z/ /ɪz/`, `/t/ /d/ /ɪd/` phải ghi đủ, đừng nuốt.
- `/ə/` ở âm không nhấn phải ghi là `/ə/`, không ghi theo mặt chữ.
- Từ Anh-Anh khác Anh-Mỹ nhiều (`schedule`, `either`) thì theo Anh-Anh cho nhất quán.

---

## 15. NHẬP MÔN A0 — tầng móng còn thiếu

### Chẩn đoán

Người học phản hồi: *"tôi là người mới bắt đầu nhưng các bài tập rất cô đọng,
không hiểu được, thiếu những điều cơ bản cần nắm cho người bắt đầu từ con số 0."*

Kiểm tra lại thì đúng. Bài **đầu tiên** trong thứ tự học (bài 43) mở đầu bằng:

> "Tiếng Anh dựa vào trật tự từ… Tiếng Việt cũng **S-V-O**… cái khó nằm ở chỗ đặt
> **trạng từ** vào đâu. **BẪY SỐ MỘT** — đừng chen gì vào giữa **V** và **O**…"

Câu đầu tiên đã dùng `S`, `V`, `O`, "trạng từ", "tân ngữ" — **không chỗ nào trong
toàn bộ tài liệu định nghĩa chúng** — và dạy *bẫy* trước khi dạy *quy tắc*.

| Thứ người bắt đầu từ 0 cần | Trước Đợt 63 |
|---|---|
| Bảng chữ cái, đánh vần tên | không có |
| Thuật ngữ: danh từ, động từ, chủ ngữ, tân ngữ… | không có |
| Cách đọc ký hiệu phiên âm `/ə/ /ʃ/ /θ/` | không có — dù đã có 1.540 phiên âm |
| Từ vựng A1 (số, thứ, màu, gia đình, động từ thường ngày) | không có — `book` chỉ có nghĩa B2 "đặt vé" |

**Nguyên nhân gốc:** chuẩn §6 bắt mỗi bài xoay quanh *một bẫy người Việt hay mắc*.
Chuẩn đó tạo ra tài liệu sửa lỗi tốt cho người đã học vài năm, nhưng muốn sửa lỗi
thì phải biết cái đúng trước đã. Tài liệu hiện có là **B1 → B2**, không phải A0 → B2.

### Để riêng một tab, không trộn vào Ngữ pháp

Bài nhập môn có **cấu trúc khác hẳn** bài ngữ pháp (không lấy bẫy làm trung tâm),
nên `check-grammar.py` với chuẩn 9 mục sẽ đánh trượt chúng. Tách ra thư mục riêng
để mỗi loại giữ chuẩn của mình:

```
data/basics.json     mục lục ~26 bài nhập môn
data/basics/001.json nội dung từng bài
```

Tab **Nhập môn** đứng **ĐẦU TIÊN** trong thanh tab — người mới mở trang ra là thấy
ngay chỗ bắt đầu, không phải đoán.

### CHUẨN SOẠN BÀI NHẬP MÔN — khác hẳn mục 6

| Mục 6 (B1→B2) | Mục 15 (A0) |
|---|---|
| Bẫy là trung tâm, nằm ở mục 5/9 | **Quy tắc trước**, bẫy để cuối và chỉ 2–3 cái |
| Dùng thuật ngữ tự do | **Mọi thuật ngữ định nghĩa ngay lần đầu dùng**, kèm ví dụ tiếng Việt |
| 24 từ, 12 ví dụ, 10 cặp lỗi, 16 câu quiz | 12 từ, **20 ví dụ**, 3 cặp lỗi, 12 câu quiz |
| Ví dụ dùng từ vựng B2 | Ví dụ **chỉ được dùng từ A1** đã dạy hoặc dạy ngay trong bài |
| 9 mục | **6 mục** (xem dưới) |

**Sáu mục bắt buộc của một bài nhập môn:**

1. **Bài này dạy gì** — 2–3 câu, nói thẳng sau bài này bạn làm được gì
2. **Cần biết trước** — nhắc lại thuật ngữ/bài trước, có link; nếu không cần gì thì ghi rõ "không cần gì cả"
3. **Quy tắc** — bảng hoặc `tree`, **tối đa 3 luật**, mỗi luật một dòng
4. **Ví dụ** — ít nhất **20 câu**, ngắn, song ngữ, từ dễ dần
5. **Tự kiểm tra** — 12 câu `quiz`, câu đầu dễ đến mức không thể sai
6. **Nhớ ba điều này** — `list` 3 gạch đầu dòng, cộng tối đa 3 cặp `pairs` nếu thật sự cần

**Luật sắt về từ vựng trong ví dụ:** chỉ dùng từ nằm trong 400 từ A1 (chủ đề `a1-*`
trong `vocab.json`) hoặc từ được định nghĩa ngay tại chỗ. Soạn xong chạy
`check-basics.py` để soát — script liệt kê mọi từ lạ.

### 26 bài, 6 nhóm

| Nhóm | Bài |
|---|---|
| **1 · Trước khi học ngữ pháp** | bảng chữ cái & đánh vần · đọc phiên âm nguyên âm · đọc phiên âm phụ âm & trọng âm · thuật ngữ (danh/động/tính/trạng từ) |
| **2 · Câu đầu tiên** | chủ ngữ & vị ngữ · đại từ I/you/he/she/it/we/they · to be am/is/are · phủ định với be · câu hỏi với be + Yes/No |
| **3 · Danh từ & mạo từ** | số ít/số nhiều -s · a / an · the · this/that/these/those |
| **4 · Động từ thường** | hiện tại I work / He works · phủ định don't/doesn't · câu hỏi Do/Does · từ để hỏi what/where/when/who/why/how · can / can't |
| **5 · Dùng hằng ngày** | số đếm 0–100 · thứ, tháng, ngày tháng · giờ giấc · giới từ nơi chốn in/on/at · sở hữu my/your + 's |
| **6 · Nối sang phần sau** | was / were · there is / there are · đọc một đoạn ngắn & bạn đã sẵn sàng học gì tiếp |

### 400 từ vựng A1

> **Luật trùng từ:** tiêu chí là **từ + loại từ**, không phải chỉ từ. `book` (danh từ,
> "quyển sách", A1) và `book` (động từ, "đặt vé", B2) là hai mục khác nhau và
> được phép cùng tồn tại; `menu` (n) ở cả hai trình độ thì không.

Thêm 8 chủ đề mới vào `vocab.json`, mỗi chủ đề 50 từ, id bắt đầu bằng `a1-`:
`a1-num` · `a1-time` · `a1-people` · `a1-body` · `a1-home` · `a1-food` ·
`a1-verb` · `a1-place`.

**Hai lối thoát hợp lệ cho `check-basics.py`,** khai báo ngay trong file bài:
`"skipWordCheck": true` cho bài dạy tên chữ cái hoặc ký hiệu phiên âm (phần tiếng
Anh là `N, A, M` chứ không phải câu), và `"teaches": [...]` liệt kê từ mà chính bài
đó định nghĩa tại chỗ. Script in ra bài nào đã dùng lối thoát, nên không giấu được.

Thêm trường `lv` cho mỗi chủ đề (`"a1"` hoặc `"b2"`) và một nút lọc ở tab Từ vựng,
để người mới không bị 1.540 từ B2 làm ngợp.

### Các đợt

| Đợt | Việc | Trạng thái |
|---|---|---|
| **63** | Hạ tầng: tab Nhập môn, `basics.json`, `check-basics.py`, 8 chủ đề A1 rỗng, nút lọc A1/B2 | ✅ xong |
| **64** | `a1-num` · `a1-time` · `a1-people` + nút lọc A1/B2 | ✅ xong — 150 từ |
| **65** | `a1-body` · `a1-home` · `a1-food` | ✅ xong — 300/400 |
| **66** | `a1-verb` · `a1-place` | ✅ xong — đủ 400/400 |
| **67–74** | 26 bài nhập môn — **mỗi đợt 3 bài** theo đúng thứ tự nhóm | ✅ xong — 26/26 |
| **75** | Rà 62 bài ngữ pháp: mọi thuật ngữ có link về bài nhập môn đã dạy nó | ↩️ **đã gỡ theo yêu cầu** — `linkterms.py` từng chèn callout vào 61/62 bài, nhưng dòng nhắc lặp ở đầu mọi bài gây vướng nên đã gỡ sạch bằng `--undo --write`. Cú pháp `[Nhập môn 04]` vẫn dùng được khi muốn dẫn link tại chỗ. |
| **76** | Cập nhật `data/README.md`, smoke test | ✅ xong — **mục 15 hoàn tất** |

### Quy trình mỗi đợt soạn bài

1. Viết `data/basics/NNN.json` bằng **Write tool** (không heredoc trong Bash).
2. Đánh dấu `"detail": true` trong `data/basics.json`.
3. `cd /c/Eng && PYTHONIOENCODING=utf-8 python build.py` rồi `python check-basics.py`.
4. Sửa ngay mọi từ lạ mà `check-basics.py` liệt kê — đừng để sang đợt sau.
5. Báo tiến độ (x/26 bài) và cái bẫy nào đã cố ý **bỏ bớt** để bài dễ thở.

---

## 16. TỪ VỰNG HAI PANEL — chi tiết từng từ

Bảng từ vựng cũ cho xem 1.940 dòng nhưng không cho **đào sâu một từ**. Người học thấy
`deadline — hạn chót` rồi hết; không biết nói thay bằng gì, không biết trái nghĩa,
chỉ có đúng một câu ví dụ.

### Bố cục mới

Tab Từ vựng chia **trái / phải**. Panel trái: tìm · lọc A1/B2 · che nghĩa · danh sách
40 dòng một trang, **cuộn trong panel**, thanh phân trang cố định ở đáy panel. Panel
phải: chi tiết từ đang chọn, cuộn riêng. Cả khu vực cao đúng phần còn lại của màn hình
nên trang không cuộn; dưới 860px thì xếp dọc.

### Dữ liệu

`data/vocab-detail.json`, khoá `TỪ|LOẠI TỪ`, bốn trường `syn` · `alt` · `ant` · `ex`.
Mỗi phần tử là `["từ", "ghi chú phân biệt"]` — ghi chú mới là phần đáng giá, nó trả lời
*khi nào dùng từ nào*. Chi tiết của `vocab.json` đã đủ: câu gốc luôn hiện trước, `ex`
chỉ là câu soạn thêm.

Mảng rỗng `[]` và **không có mục** là hai chuyện khác nhau: rỗng → *"Mục này không có
từ trái nghĩa rõ rệt"*, không có mục → *"Chưa soạn…"*. Đừng gộp, người học sẽ tưởng
tiếng Anh không có từ đó.

### Các đợt

| Đợt | Việc | Trạng thái |
|---|---|---|
| **77** | Hạ tầng: hai panel, `vocab-detail.json`, `build.py` đếm + cảnh báo khoá sai, smoke test | ✅ xong — 181 kiểm tra |
| **78** | `work` — 28 mục còn lại | ✅ xong — **60/60, chủ đề đầu tiên đủ** |
| **79** | `a1-num` — số đếm & lượng (A1) | ✅ xong — 50/50 |
| **80** | `a1-time` — thời gian, thứ & tháng (A1) | ✅ xong — 50/50 |
| **81** | `a1-people` — người & gia đình (A1) | ✅ xong — 50/50 |
| **82** | `a1-body` — cơ thể & sức khoẻ (A1) | ✅ xong — 50/50 |
| **83** | `a1-home` — nhà cửa & đồ vật (A1) | ✅ xong — 50/50 |
| **84** | `a1-food` — ăn uống (A1) | ✅ xong — 50/50 |
| **85** | `a1-verb` — động từ thường ngày (A1) | ✅ xong — 50/50 |
| **86** | `a1-place` — nơi chốn & đi lại (A1) | ✅ xong — 50/50 · **đủ cả 8 chủ đề A1** |
| **87** | `edu` — học hành & giáo dục (B2) | ✅ xong — 60/60 |
| **88** | `health` — sức khoẻ & y tế (B2) | ✅ xong — 60/60 |
| **89** | `env` — môi trường & khí hậu (B2) | ✅ xong — 60/60 |
| **90** | `tech` — công nghệ & internet (B2) | ✅ xong — 60/60 |
| **91** | `media` — truyền thông & tin tức (B2) | ✅ xong — 60/60 |
| **92** | `travel` — du lịch & kỳ nghỉ (B2) | ✅ xong — 60/60 |
| **93** | `home` — nhà ở & đô thị (B2) | ✅ xong — 60/60 |
| **94** | `money` — tiền bạc & mua sắm (B2) | ✅ xong — 60/60 |
| **95** | `food` — ăn uống & nhà hàng (B2) | ✅ xong — 60/60 · **vượt mốc 1.000 mục** |
| **96** | `family` — gia đình & quan hệ (B2) | ✅ xong — 60/60 |
| **97** | `person` — tính cách & cảm xúc (B2) | ✅ xong — 60/60 |
| **98** | `sport` — thể thao & vận động (B2) | ✅ xong — 60/60 |
| **99** | `art` — nghệ thuật & giải trí (B2) | ✅ xong — 60/60 |
| **100** | `law` — tội phạm & pháp luật (B2) | ✅ xong — 60/60 |
| **101** | `society` — xã hội & chính trị (B2) | ✅ xong — 60/60 · **vượt mốc 70%** |
| **102** | `science` — khoa học & nghiên cứu (B2) | ✅ xong — 60/60 |
| **103** | `transport` — giao thông & đi lại (B2) | ✅ xong — 60/60 |
| **104** | `nature` — thiên nhiên & thời tiết (B2) | ✅ xong — 60/60 |
| **105** | `service` — dịch vụ & mua hàng (B2) | ✅ xong — 60/60 |
| **106** | `colloc` — collocation thông dụng (B2) | ✅ xong — **120/120, chủ đề lớn nhất** |
| **107** | `wfam` — họ từ, word family (B2) | ✅ xong — 100/100 |
| **108** | `phrasal` — phrasal verb thông dụng (B2) | ✅ xong — 120/120 |

**MỤC 16 HOÀN TẤT:** 31/31 chủ đề · **1.940/1.940 mục (100%)** · smoke test 181/181 · build sạch, không khoá nào lệch, không ký tự CJK, mọi mục đủ 2 câu ngữ cảnh.

### Quy trình mỗi đợt soạn chi tiết

1. Lấy chủ đề tiếp theo; ưu tiên **từ đánh dấu hay gặp** trước, rồi mới đến phần còn lại.
2. Thêm mục vào `data/vocab-detail.json` bằng **Write tool** (không heredoc trong Bash —
   heredoc đã hai lần nuốt dấu `\` trong phiên này).
3. `PYTHONIOENCODING=utf-8 python build.py` — build **cảnh báo** mọi khoá không khớp từ
   nào trong `vocab.json`, sai loại từ là lộ ra ngay. Phải sạch cảnh báo mới xong đợt.
4. Ghi chú phân biệt viết bằng tiếng Việt, ngắn, nói đúng chỗ khác nhau. Không có gì
   đáng nói thì để chuỗi rỗng, đừng bịa.
5. Không có từ trái nghĩa thật thì để `[]` — đừng ghép đại một từ cho đủ mục.

---

## 17. VÁ CHỖ HỞ: tab Nhập môn bị bỏ khỏi hai trang gom

Rà soát sau khi mục 16 xong thì lộ ra: **cả `collectErrors()` lẫn `collectCards()` đều
chỉ đọc `frames + lessons + skills`.** Tab Nhập môn dựng ở mục 15 chưa bao giờ được nối
vào, dù 26 bài A0 có **78 khối `quiz`** và **26 khối `pairs`**.

Hậu quả: tầng A0 — dựng riêng cho người bắt đầu từ số 0 — đóng góp **0 thẻ** vào tab Ôn
tập và **0 cặp** vào Từ điển lỗi. Đúng tầng mà người mới cần ôn nhất lại vắng mặt ở cả
hai công cụ ôn tập.

### Đã sửa

| Chỗ | Trước | Sau |
|---|---|---|
| Từ điển lỗi | 1.440 cặp, 4 nút lọc | **1.516 cặp**, 5 nút lọc (thêm Nhập môn) |
| Tab Ôn tập | 6.225 thẻ | **6.613 thẻ** (+388 từ bài nhập môn) |
| `isLearned()` | không biết `nmDone` | đọc đúng tiến độ tab Nhập môn |
| Nhãn nguồn trên thẻ | thiếu "Nhập môn" | đủ bốn nguồn |

Thêm `loadAllBasics()` cho khớp với ba hàm `loadAll*` đã có.

### Bài học ghi lại trong `data/README.md`

Thêm một tab tài liệu mới thì phải nối vào **hai chỗ gom**, không chỉ dựng tab. Smoke
test nay có hai kiểm tra riêng cho đúng việc này, và bỏ công thức đếm cứng
(`600 + 10 × số bài`) để đếm thẳng số khối `pairs` trong dữ liệu — bài nhập môn không cố
định 10 cặp mỗi bài nên công thức cũ sẽ sai ngay khi nối thêm nguồn.

---

# PHẦN II — PHẢN BIỆN & LỘ TRÌNH LÊN B2

Viết sau khi mục 17 xong. Mục tiêu người học đặt ra: **nắm toàn bộ ngữ pháp và giao
tiếp được cơ bản, tới trình độ B2.** Phần này soát xem tài liệu hiện có đưa người học
đi được bao xa, và cái gì còn chặn lại.

## 18. PHẢN BIỆN TÀI LIỆU HIỆN CÓ

### Đã làm được (ghi nhận trước khi chê)

| | |
|---|---|
| Phủ ngữ pháp | 62 bài / 12 nhóm — **gần đủ cho B2**, xếp theo thứ tự học hợp lý |
| Chống lỗi L1 | **1.516 cặp Sai/Đúng** nhắm đúng lỗi người Việt — phần này hiếm tài liệu nào có |
| Ghi nhớ dài hạn | Leitner 5 hộp, 6.613 thẻ, rút thẳng từ tài liệu |
| Tầng móng | 26 bài A0 cho người bắt đầu từ số 0 |
| Chuẩn độ dày | Có script ép, không trôi theo thời gian |

Về **kiến thức**, tài liệu này đã đủ dày. Vấn đề nằm ở chỗ khác.

### Năm lỗ hổng, xếp theo mức độ chặn đường lên B2

#### 18.1 — Năm bài nghe đang dạy thứ mà ứng dụng không phát ra được

Bài Kỹ năng 07–11 (nối âm · nuốt âm · dạng yếu · rút gọn · nghe số) gồm toàn **bảng,
thẻ, cặp lỗi và quiz chữ**. Soát toàn bộ dự án: **không có một file âm thanh nào.**
Chỉ có `speechSynthesis` của trình duyệt.

Vấn đề không phải thiếu audio cho đẹp. Mà là: TTS đọc **rõ, chậm, tách rời từng từ** —
đúng cái **ngược lại** với hiện tượng đang dạy. Không ai học được *an apple* nghe thành
*anapple* bằng cách đọc bảng mô tả nó.

Hệ quả: kỹ năng nghe — thứ chặn người Việt nhiều nhất ở ngưỡng B2 — thực chất **bằng
không**, dù trên mục lục có hẳn một nhóm năm bài.

#### 18.2 — 2.956 bài tập, gần như chỉ một kiểu

Đếm thực tế: `quiz` xuất hiện 2.956 lần, dạng nào cũng quy về **nhìn câu tiếng Việt →
viết ra tiếng Anh**, có thời gian nghĩ, có đáp án ngay bên dưới.

Đây là *controlled practice*. Nó luyện **độ chính xác khi được nghĩ kỹ** — và luyện rất
tốt. Nhưng nó **không** luyện:

- tạo câu **dưới áp lực thời gian**
- nói **vì một mục đích giao tiếp** chứ không phải vì đề bài
- xoay xở khi **thiếu từ** (vòng vo, diễn giải, hỏi lại)

Đây chính là cơ chế tạo ra hiện tượng quen thuộc ở Việt Nam: **điểm ngữ pháp cao, mở
miệng không nói được.** Tài liệu đang vô tình đi đúng vào vết xe đó.

#### 18.3 — Không có đầu ra nào được chấm

Sáu bài kỹ năng viết (đoạn văn · luận quan điểm · luận hai chiều · email trang trọng ·
email thân mật · từ nối) dạy **cấu trúc**, nhưng không kèm một đề bài + bài mẫu + thang
tự chấm nào. Người học viết xong không có cách nào biết mình sai ở đâu.

Tương tự với nói: năm bài Nhóm 3 dạy *cách* nói kéo dài, lập luận, giữ lượt — nhưng
không có một đề nào để thật sự mở miệng.

#### 18.4 — Không có đánh giá, người học không biết mình ở đâu

- Không có **bài kiểm tra đầu vào** → người học không biết nên bắt đầu từ bài nào.
- Không có **kiểm tra chặng** → học xong một nhóm không biết đã chắc chưa.
- Không có **mô tả B2 nghĩa là làm được gì** → không có đích cụ thể để đối chiếu.

210 bài học và 5,3 triệu ký tự mà không có một cái thước nào. Đây là lý do người học
bỏ giữa chừng: không thấy mình tiến.

#### 18.5 — Bốn điểm ngữ pháp B2 còn thiếu

Soát bằng grep trên toàn bộ `data/grammar/` và `data/skills/`:

| Điểm | Số lần xuất hiện | Ghi chú |
|---|---|---|
| `have something done` (nhờ ai làm) | **0** | B2 bắt buộc; bài 27 chỉ dạy causative chủ động |
| `the more … the more` | **0** | Cấu trúc so sánh kép, rất hay gặp |
| Emphatic `do` (*I **do** like it*) | **0** | Nhấn mạnh bằng trợ động từ |
| `It is said that… / He is said to…` | thoáng qua | Bị động với động từ tường thuật, chưa thành bài |

Bốn điểm này nhỏ, vá nhanh — nhưng thiếu thì không thể nói là "nắm toàn bộ ngữ pháp".

### Kết luận phản biện

Tài liệu hiện tại là một **giáo trình ngữ pháp và từ vựng xuất sắc**, kèm hệ thống ghi
nhớ tốt. Nhưng xét theo mục tiêu *"giao tiếp được, tới B2"*, nó mới phủ được **hai trên
bốn kỹ năng**, và cả hai đều ở dạng **tiếp nhận + luyện có kiểm soát**:

| Kỹ năng | Hiện trạng |
|---|---|
| Đọc | có, nhưng chỉ ở cấp **câu lẻ** — chưa có đoạn dài |
| Viết | dạy cấu trúc, **không có bài để viết và đối chiếu** |
| Nghe | **gần như không có** — dạy bằng chữ về thứ phải nghe mới hiểu |
| Nói | dạy chiến thuật, **không có chỗ để mở miệng** |

Mục 19–23 dưới đây vá đúng bốn chỗ đó, xếp theo thứ tự chặn đường.

---

## 19. NGHE THẬT — vá lỗ hổng lớn nhất

Chia theo đúng cái TTS **làm được** và **không làm được**, không gộp chung rồi làm nửa vời.

### 19a. Phần TTS làm được — triển khai ngay

TTS đọc chuẩn ở cấp câu. Ba dạng bài sau dùng được luôn, không cần thu âm:

| Dạng bài mới | Khối JSON | Luyện gì |
|---|---|---|
| **Nghe chép chính tả** | `dictation` | nghe câu → gõ lại → so từng từ, tô đỏ chỗ sai |
| **Nghe số, ngày, đánh vần** | `dictation` + `drill` | đúng nội dung bài Kỹ năng 11, nay nghe thật |
| **Nghe chọn đáp án** | `listenquiz` | nghe câu → chọn nghĩa đúng, không đọc chữ trước |

Khối `dictation`: `{ "t": "dictation", "items": [{ "en": "...", "vi": "...", "hint": "..." }] }`
Trang đọc `en` bằng TTS, giấu chữ, chấm theo từng từ.

**Chỉ tiêu:** mỗi bài Nhập môn 5 câu · mỗi bài Ngữ pháp 8 câu · mỗi khung câu 5 câu
→ khoảng **1.000 câu nghe chép**, phủ toàn bộ tài liệu.

> **✅ ĐỢT 8 — XONG 05/10/2026 (nghe chép chính tả).** Trang `dt` trong tab Kỹ năng.
> smoke 250/250.
>
> *Làm khác kế hoạch, có chủ đích:* kế hoạch định **viết mới** ~1.000 câu vào khối
> `dictation` của từng bài. Đo trước khi viết thì thấy tài liệu **đã có sẵn 5.284 câu**
> song ngữ trong `ex` + `bank` + `dialog` — gấp năm chỉ tiêu. Viết thêm chỉ tạo ra bản sao
> thứ hai phải bảo trì song song. Nên làm trang **rút từ tài liệu**, giống Từ điển lỗi
> và Kiểm tra chặng: thêm một bài là kho câu tự dày lên.
>
> *Điểm kỹ thuật đáng giữ:* chấm bằng **LCS** chứ không so theo vị trí. Sót một từ đầu
> câu mà so theo vị trí là báo sai toàn bộ phần còn lại — vô dụng với người học.
>
> **✅ ĐỢT 9 — XONG 05/10/2026 (nghe chọn đáp án).** Trang `lq`, dùng chung kho câu
> với trang nghe chép. Hai kiểu: chọn nghĩa tiếng Việt, và chọn câu tiếng Anh với
> **nhiễu là những câu giống nhau nhất trong kho** (độ giống 0,56 vs 0,06 nếu lấy ngẫu
> nhiên). smoke 260/260.
>
> *Lỗi hiệu năng tự bắt được trong lúc viết test:* bản đầu `sort` cả kho 5.284 câu mỗi
> lần ra đề — smoke chạy quá 2 phút mới lộ ra. Đã thay bằng duyệt một lượt giữ top 3:
> **43 ms/câu**, kèm một kiểm tra chặn hồi quy dưới 150 ms.
>
> **MỤC 19a HOÀN TẤT** — nghe chép chính tả + nghe chọn đáp án.

### 19b. Phần TTS KHÔNG làm được — phải có tiếng người thật

Nối âm · nuốt âm · dạng yếu · rút gọn (Kỹ năng 07–10) **bắt buộc** có audio người bản
ngữ nói tốc độ thường. Ba lựa chọn, ghi rõ để chọn có ý thức:

| Cách | Chi phí | Nhược điểm |
|---|---|---|
| **Tự thu** 200–300 câu mẫu | cao, cần người bản ngữ | nhưng khớp 100% nội dung bài |
| **Nhúng link ngoài có mốc thời gian** (YouGlish, BBC Learning English) | thấp | phụ thuộc mạng và bên thứ ba, link có thể chết |
| **Cặp đôi chậm–nhanh**: TTS đọc chậm + 1 file thật đọc nhanh | trung bình | chỉ cần thu đúng những câu minh hoạ |

> **ĐÃ CHỐT (05/10/2026): cách 2 — nhúng link YouGlish / BBC Learning English.**
> Người dùng chọn không thu âm. Ưu điểm quyết định: không tốn chi phí thu, và người học
> nghe được **nhiều giọng thật khác nhau** thay vì một giọng duy nhất.

Cách làm cụ thể: thêm khối `listen` vào 4 bài Kỹ năng 07–10.

```json
{ "t": "listen",
  "intro": "Nghe người bản ngữ nói cụm này ở tốc độ thường.",
  "items": [
    { "en": "What are you going to do?",
      "vi": "Bạn định làm gì?",
      "focus": "going to → /ˈɡɒnə/ — nuốt hẳn chữ t",
      "yg": "going to do",
      "src": "youglish" }
  ] }
```

* `yg` — chuỗi tìm trên YouGlish, mở bằng `https://youglish.com/pronounce/<yg>/english`
* `src` — `youglish` hoặc `bbc` (kèm `url` đầy đủ khi là `bbc`)
* Mỗi mục vẫn giữ `en` + `vi` + `focus` để **bài vẫn dùng được khi mất mạng hoặc link chết**

**Rào chắn bắt buộc** (vì đây là nhược điểm đã biết của cách 2):

1. Link mở ở tab mới, có `rel="noopener"`.
2. Dưới mỗi khối `listen` có dòng: *"Link mở trang ngoài. Nếu không mở được, phần
   phiên âm và giải thích bên trên vẫn đủ để tự luyện."*
3. `data/README.md` ghi rõ: 4 bài này dùng **link ngoài**, không có audio nội bộ.

> **✅ ĐỢT 16 — XONG 05/10/2026. MỤC 19b HOÀN TẤT.** Khối `listen` trong 4 bài Kỹ năng
> 07–10, **8 mục mỗi bài = 32 mục**. smoke 326/326.
>
> Cả ba rào chắn ở trên đều đã dựng, và **mỗi cái có một kiểm tra tự động**: giữ
> `en`+`vi`+`focus`, `target=_blank` kèm `rel=noopener`, và chỉ chấp nhận `https://`
> thuộc `youglish.com` / `bbc.co.uk`.
>
> *Một quyết định đáng ghi:* **không trỏ thẳng vào một tập BBC cụ thể.** Dạng URL của
> YouGlish là xác định nên dựng được chắc chắn; một địa chỉ tập BBC thì phải đoán, và 32
> link đoán là 32 cơ hội làm người học mất lòng tin. BBC chỉ xuất hiện **một lần mỗi bài**,
> trỏ tới trang gốc.

> Dù chọn cách nào cũng phải ghi rõ trong `data/README.md`: **bài nghe nào có audio
> thật, bài nào chỉ TTS.** Không được để người học tưởng mình đang luyện nghe thật.

---

## 20. SẢN SINH CÓ PHẢN HỒI — biến kiến thức thành lời nói

Thêm ba khối, dùng chung cho mọi tab tài liệu.

### `prompt` — đề nói hoặc viết, kèm bài mẫu và thang tự chấm

```json
{ "t": "prompt", "mode": "write",
  "task": "Viết email 80 từ xin nghỉ ba ngày vì việc gia đình.",
  "must": ["lý do", "ngày cụ thể", "ai làm thay", "lời cảm ơn"],
  "model": "Dear Ms Hoa, I am writing to request …",
  "check": ["Có đủ 4 ý bắt buộc không?",
            "Có dùng I am writing to… không?",
            "Có câu kết lịch sự không?"] }
```

Người học viết xong mới bấm hiện `model`. **Thang `check` là phần quan trọng nhất** —
nó dạy người học tự soát, thứ sẽ theo họ suốt đời, thay cho một người chấm bài.

### `roleplay` — hai vai, có mục tiêu giao tiếp

```json
{ "t": "roleplay",
  "you": "Bạn là khách, món ăn mang ra nguội.",
  "them": "Nhân viên phục vụ, đang rất bận.",
  "goal": "Đổi được món mới mà không to tiếng.",
  "useful": ["Excuse me, I'm afraid…", "Would it be possible to…"],
  "sample": [["Khách", "Excuse me, I'm afraid this is cold."], …] }
```

Gắn vào **100 khung câu** — chúng đã có sẵn 200 khối `dialog`, chỉ thiếu bước *bạn
đóng một vai*.

### `timed` — nói 60 giây, bấm giờ

```json
{ "t": "timed", "seconds": 60,
  "task": "Kể về một lần bạn đi muộn. Dùng ít nhất hai thì quá khứ.",
  "must": ["quá khứ đơn", "quá khứ tiếp diễn", "từ nối thời gian"] }
```

Trang đếm ngược, hết giờ hiện `must` để tự soát. **Đây là chỗ duy nhất trong cả tài
liệu tạo ra áp lực thời gian** — thứ phân biệt người *biết* ngữ pháp với người *dùng
được* ngữ pháp.

**Chỉ tiêu:** 22 bài Kỹ năng mỗi bài 2 `prompt` · 100 khung câu mỗi khung 1 `roleplay`
· 12 nhóm ngữ pháp mỗi nhóm 3 `timed` → **144 prompt + 100 roleplay + 36 timed**.

### Bảng đợt của mục 20

| Đợt | Khối | Số lượng | Trạng thái |
|---|---|---|---|
| 10 | `timed` | 36 | ✅ `data/produce.json` · trang `tm` · smoke 273/273 |
| 11 | `prompt` | 44 | ✅ 44 đề (22 bài Kỹ năng × 2) · trang `pr` · smoke 286/286 |
| 12 | `roleplay` | 100 | ✅ 100 màn (1/khung câu) · trang `rp` · smoke 298/298 |

> **MỤC 20 HOÀN TẤT** — 36 `timed` + 44 `prompt` + 100 `roleplay`.
>
> *Điểm thiết kế đáng giữ ở `roleplay`:* kế hoạch đã nói đúng — *“100 khung câu đã có sẵn
> 200 khối dialog, chỉ thiếu bước bạn đóng một vai”*. Nên file dữ liệu **chỉ giữ ba dòng mỗi
> khung** (vai của bạn, vai đối diện, mục tiêu); hội thoại mẫu và cụm hữu dụng lấy thẳng
> từ khung đó lúc vẽ trang. Có kiểm tra chặn việc chép lại hội thoại sang file dữ liệu.

> **Thêm so với bản kế hoạch: trường `start` — câu mở lời.** 60 giây trống không có
> chỗ bám là chỗ người mới đứng hình — và họ bỏ bài vì không biết bắt đầu thế nào,
> chứ không phải vì không biết ngữ pháp.
>
> **⚠ CHỖ VÊNH TRONG CHỈ TIÊU ĐÃ SỬA.** Mục 20 ghi *“22 bài Kỹ năng mỗi bài 2 `prompt`”*
> rồi cộng thành **144**. 22 × 2 = **44**, không phải 144. Đã làm theo **luật tính trên
> từng bài** (2 đề/bài, đủ 22/22 bài) chứ không theo con số tổng, vì đẩy lên 144 nghĩa là
> ~6,5 đề mỗi bài kỹ năng — chỉ còn cách độn thêm đề trùng ý. **Nếu muốn đủ 144 thì
> phải mở sang nguồn khác** (ví dụ thêm đề cho 12 nhóm ngữ pháp hoặc 100 khung câu) —
> đó là quyết định của người dùng, không phải thứ nên tự độn.
>
> *Lỗi cũ trong smoke tự lộ ra đợt này:* kiểm tra `link tro dung bai` tự suy tiền tố bằng
> `cq.src[0].replace("n","g")`, nên **"nm" (nhập môn) cũng ra "g"**. Nó chỉ xanh chừng nào
> thẻ đầu tiên tình cờ không phải từ tab Nhập môn. Đã sửa để dùng chính `keyOf()` của
> trang — đừng viết lại công thức của app trong test.

---

## 21. ĐÁNH GIÁ & LỘ TRÌNH — cho người học biết mình ở đâu

### 21a. Bài kiểm tra đầu vào (30 câu, 15 phút)

Rải đều 12 nhóm ngữ pháp, tăng dần độ khó. Chấm xong trả về:

> *Bạn đang ở khoảng **A2+**. Nên bắt đầu từ **Nhóm 3 — Thì hiện tại & quá khứ**.
> Nhóm 1, 2 chỉ cần lướt. Bỏ qua Nhóm 10–12 cho đến khi xong Nhóm 7.*

Lưu vào `localStorage`, hiện thành một dải gợi ý ở đầu tab Ngữ pháp.

> **✅ ĐỢT 5 — XONG 05/10/2026.** `data/placement.json` (30 câu · 12/12 nhóm · A1 3,
> A2 10, B1 11, B2 6) + trang `pt` trong tab Ngữ pháp + dải gợi ý `.pt-hint`.
> `build.py` soát: đáp án có thật, bài học có thật, vị trí đáp án rải đều.
> smoke 209/209 — gồm hai ca biên **đúng hết → B2 / start 0** và **sai hết → A1 / start 1**.
>
> *Phát hiện khi viết smoke:* đọc kết quả thắng từ `localStorage` làm trang kết quả
> **trắng trơn** ở nơi storage bị chặn (trình duyệt ẩn danh, và cả `file://` trong jsdom).
> Đã chuyển sang giữ ở `PT.res` trước, storage chỉ để lưu lại giữa các phiên.

**MỤC 21 HOÀN TẤT** — 21a · 21b · 21c đều xong.

### 21b. Kiểm tra chặng — sau mỗi nhóm

15 câu rút từ chính các khối `quiz` và `pairs` của nhóm đó, **đảo thứ tự và giấu bài
gốc**. Dưới 70% thì chỉ thẳng những bài cần học lại.

> **✅ ĐỢT 6 — XONG 05/10/2026.** Trang `cp` trong tab Ngữ pháp, **không có file dữ
> liệu riêng** — đề rút thẳng từ `pairs` + `quiz` của chính các bài trong nhóm, nên
> thêm bài là đề tự dày lên. smoke 220/220.
>
> *Quyết định đáng ghi:* ban đầu định bịa đáp án nhiễu cho câu điền chỗ, nhưng đáp án
> bịa từ câu khác rất dễ vô tình **cũng đúng**. Đã bỏ hẳn, chỉ dùng hai loại câu chấm
> được chắc: cặp Sai/Đúng, và câu điền đã có lựa chọn sẵn trong ngoặc. Đo trước khi
> viết: nguồn câu thấp nhất là 85 ở Nhóm 4, dư xa so với 15 câu mỗi đề.

### 21c. Trang "Bạn đang ở đâu" — can-do B2

Không phải điểm số, mà là **việc làm được**, theo chuẩn CEFR, viết bằng tiếng Việt:

| Mốc | Làm được gì |
|---|---|
| A2 | Nói về bản thân, gia đình, việc hằng ngày bằng câu đơn |
| B1 | Kể một chuyện đã xảy ra, giải thích lý do, xoay xở khi đi du lịch |
| **B2** | **Tranh luận có nhượng bộ · viết email trang trọng · hiểu phim có phụ đề · nói liền 2 phút không khựng** |

Mỗi dòng gắn link tới đúng bài dạy nó, và một `prompt` để tự kiểm chứng.

> **✅ ĐỢT 7 — XONG 05/10/2026.** `data/cando.json` + trang `cd` trong tab Ngữ pháp.
> 4 bậc (thêm A1 so với bảng gốc, để nối với tab Nhập môn) × 6 việc = **24 mục**,
> 80 nút dẫn sang bài. smoke 232/232.
>
> *Thêm so với bản kế hoạch:* ngoài `task` (đề tự kiểm chứng) mỗi mục còn có **`ok` —
> mốc đạt đo được** (*“không dừng quá 3 giây một lần”*, *“ít nhất 8/10 câu chia đúng”*).
> Chỉ có đề mà không có mốc thì người học tự chấm theo cảm tính, và ô tích mất nghĩa.
> Cả `build.py` lẫn `smoke.js` đều cảnh báo nếu một mục thiếu `ok`.

---

## 22. ĐỌC ĐOẠN DÀI — kỹ năng còn lại

Hiện toàn bộ tài liệu chỉ có câu lẻ. B2 đòi hỏi đọc hiểu bài 400–600 từ.

Thêm khối `reading`: một bài đọc + 5 câu hỏi (2 ý chính, 2 chi tiết, 1 đoán nghĩa từ
qua ngữ cảnh) + danh sách từ mới trỏ về tab Từ vựng.

**Chỉ tiêu:** 24 bài đọc, dùng lại đúng 31 chủ đề từ vựng đã soạn — mỗi bài nhồi
15–20 từ của chủ đề đó vào ngữ cảnh thật. Vừa luyện đọc vừa củng cố từ vựng, không
phải soạn từ mới.

### Bảng đợt của mục 22

24 bài × ~500 từ là quá lớn cho một đợt — chia ba đợt 8 bài.

| Đợt | Bài | Chủ đề | Trạng thái |
|---|---|---|---|
| 13 | 1–8 | work · edu · health · env · tech · media · travel · home | ✅ trang `rd` · smoke 313/313 |
| 14 | 9–16 | money · food · family · person · sport · art · law · society | ✅ 16/24 bài · smoke 315/315 |
| 15 | 17–24 | science · transport · nature · service · colloc · phrasal · wfam · a1-place | ✅ 24/24 bài · smoke 317/317 |

> **MỤC 22 HOÀN TẤT: 24/24 bài**, 24 chủ đề khác nhau, 15–26 từ chủ đề mỗi bài.
>
> *Đổi so với bảng dự kiến:* bốn bài cuối không “ôn lại chủ đề cũ” mà lấy **ba chủ đề chưa
> dùng** (`colloc`, `phrasal`, `wfam`) cộng **một bài A2**. Lặp chủ đề là phí một ô phủ sóng;
> và cả bộ 24 bài đều B1/B2 thì người chưa tới B2 không có chỗ bắt đầu.
>
> *Lỗi bo do lần hai:* cụm động từ chia ở **từ đầu** (*made a decision*, *took over*) nên
> `colloc` và `phrasal` chỉ dò ra 4/15 từ. Đã nối bộ dò vào **bảng 201 động từ bất quy tắc
> sẵn có** của dự án. Tổng cộng **7/24 bài** phải viết lại sau khi đo — không bài nào
> được hạ ngưỡng.

> **`gloss` sinh tự động, không viết tay.** Dò thẳng từ bài đọc đối chiếu `vocab.json`,
> chịu được dạng biến đổi. Nhờ vậy chỉ tiêu *“15–20 từ mỗi bài”* **đo được** chứ không
> ước lượng — bài 4 (env) lúc đầu chỉ đạt 11 từ, đã **viết lại bài** cho đủ chứ không hạ
> ngưỡng. Bộ dò cũng từng bỏ sót *symptoms* → `symptom`; đã sửa cho chịu biến đổi.
>
> *Đợt 14 lặp lại đúng chuyện đó:* **5 trong 8 bài** (money, family, person, law, society)
> lần viết đầu chỉ đạt 5–12 từ chủ đề. Đây không phải tai nạn mà là quy luật: viết một
> bài hay thì từ ngữ tự nhiên trôi theo mạch chuyện, không theo danh sách từ vựng. **Phải
> đo rồi viết lại**, không thể trông chờ lần đầu đã đủ.

---

## 23. VÁ BỐN ĐIỂM NGỮ PHÁP CÒN THIẾU

Bốn bài mới, theo đúng chuẩn độ dày mục 6, chèn vào nhóm hợp lý:

| Bài | Vào nhóm | Nội dung |
|---|---|---|
| **63** | 8 · Dạng theo sau động từ | `have / get something done` — nhờ người khác làm |
| **64** | 6 · Tính từ & Trạng từ | `the more … the more` — so sánh kép |
| **65** | 12 · Nhấn mạnh | Emphatic `do` · `It is said that…` · `He is said to…` |
| **66** | 11 · Mệnh đề & Dạng câu | Câu tường thuật nâng cao: tường thuật câu hỏi và mệnh lệnh |

Sau khi thêm, chạy `check-grammar.py` — phải đạt đúng chuẩn (24 từ, 12 ví dụ,
10 cặp lỗi, 16 câu quiz, 9 mục) như 62 bài hiện có.

### Bảng đợt

| Đợt | Bài | Nội dung | Trạng thái |
|---|---|---|---|
| 1 | **63** | `have / get something done` | ✅ 63 bài · check-grammar OK · smoke 185/185 |
| 2 | **64** | `the more … the more` | ✅ 64 bài · check-grammar OK · smoke 188/188 |
| 3 | **65** | Emphatic `do` · `It is said that…` | ✅ 65 bài · check-grammar OK · smoke 191/191 |
| 4 | **66** | Tường thuật câu hỏi và mệnh lệnh | ✅ 66 bài · check-grammar OK · smoke 194/194 |

> **MỤC 23 HOÀN TẤT: 4/4 bài · 66 bài ngữ pháp · đủ chuẩn (24, 12, 10, 16).**
> Lời hứa "nắm được toàn bộ ngữ pháp" đến đây mới thực sự tròn.
> Tiếp theo: **mục 21** — bài kiểm tra đầu vào, kiểm tra chặng, trang can-do B2.

---

## THỨ TỰ LÀM — và vì sao

| Ưu tiên | Mục | Lý do |
|---|---|---|
| **1** | 23 · vá 4 bài ngữ pháp | Rẻ nhất, xong là tròn lời hứa "toàn bộ ngữ pháp" |
| **2** | 21 · đánh giá & lộ trình | Không đo được thì không biết các mục sau có tác dụng không |
| **3** | 19a · nghe chép bằng TTS | Mở được kỹ năng thứ ba mà không cần thu âm |
| **4** | 20 · sản sinh có phản hồi | Chỗ biến kiến thức thành lời nói — khâu quyết định |
| **5** | 22 · đọc đoạn dài | Dùng lại từ vựng đã có, chi phí thấp |
| **6** | 19b · nhúng link YouGlish/BBC | ✅ **XONG** — 32 mục nghe, 3 rào chắn có kiểm tra |

---

## 24. LỘ TRÌNH HỌC — ghép từ vựng với ngữ pháp

**Vấn đề:** tab Từ vựng là **công cụ tra cứu**, không phải lộ trình. 1.940 từ trong một
danh sách có lọc — không thứ tự, không đích đến, không theo dõi đã xong tới đâu, không
nối gì với ngữ pháp. `ctx("vc").done` trả `[]` **viết chết**: khoá `vc_done` có tên nhưng
**không chỗ nào ghi vào**. Trong khi đó ngữ pháp đã có đủ lộ trình (12 nhóm theo thứ tự học,
kiểm tra đầu vào, kiểm tra chặng, trang can-do).

**Cách làm: 13 chặng**, mỗi chặng ghép một nhóm ngữ pháp với các chủ đề từ vựng **hợp
nghĩa** — *Tương lai* ↔ travel/transport, *modal* ↔ money/service, *điều kiện* ↔ env/science.
Ba chủ đề colloc/wfam/phrasal để riêng chặng 13 vì là củng cố xuyên suốt.

| Quyết định | Chốt |
|---|---|
| Đo "đã thuộc" | **Tự suy từ SRS** — từ lên hộp ≥3 là thuộc. Không tích tay ô nào. |
| Nhịp học | **Theo chặng**, không theo khẩu phần ngày |
| Vị trí | **Tab riêng "Lộ trình", đứng đầu** — mở app là thấy |

> **✅ XONG 05/10/2026.** `data/roadmap.json` + tab `lt` + trang `viewRoadmap()`.
> build báo `13 chang lo trinh, 31/31 chu de tu vung duoc phu`. smoke 356/356.
>
> *Nguyên tắc đã giữ:* **không thêm trạng thái mới nào**. Mọi con số suy từ `otSrs`,
> `ngDone`, `cp_res`, `pt_res`, `reading.json`. Người học không phải tích 1.940 ô;
> tiến độ tự nhích mỗi lần họ ôn tập thật sự.
>
> *Hai lỗi tự bắt được khi dựng:*
> 1. `READING` chỉ được nạp khi mở trang Đọc, mà Lộ trình là **tab mặc định** → mục
>    *Bài đọc* của mọi chặng biến mất lúc mở app. Đã cho trang tự nạp.
> 2. Khối smoke của mục này ghi 61 thẻ giả vào `otSrs` rồi **không dọn**, làm hỏng hai
>    kiểm tra Ôn tập chạy sau. Nay tự trả lại nguyên trạng, có kiểm tra chốt việc đó.

---

## 25. BÀI TẬP ĐỊNH DẠNG ĐỀ TOEIC

**Cách làm đã chốt:** luyện **theo từng part**, chấm ngay từng câu (không phải đề đầy đủ
bấm giờ). Các part làm: **5 · 7 · 2 · 3**.

| Đợt | Part | Trạng thái |
|---|---|---|
| 1 | **Part 5** · Điền câu | ✅ 60 câu |
| 2 | **Part 7** · Đọc hiểu | ✅ 8 văn bản · 24 câu |
| 3 | **Part 2** · Hỏi – Đáp | ✅ 40 câu |
| 4 | **Part 3** · Hội thoại | ✅ 12 hội thoại · 36 câu |

> **✅ MỤC 25 HOÀN TẤT — 06/10/2026. 160 câu, bốn part.** smoke 412/412.
>
> *Thiết kế đáng giữ:* **mỗi mục tự khai báo hình dạng của nó** (một câu · văn bản +
> nhiều câu · nghe + nhiều câu) thay vì trang phải biết mình đang ở part nào. Thêm Part 4
> sau này sẽ **không phải sửa bộ dựng**.
>
> *Ba lần `build.py` giả định sai, đều do thêm một hình dạng mới:*
> 1. Part 7 — đếm mỗi văn bản là một câu
> 2. Part 2 — viết chết “phải có 4 lựa chọn”, nay đọc `nopt` từ metadata
> 3. Part 3 — ép khuôn `kind`/`title`/`text` lên hội thoại (dùng `who`/`lines`), và
>    đòi `trap` cho cả phần nghe hiểu
>
> *CJK lọt một lần:* hai chữ Hán trong `p3a.json`. Bộ quét bắt được trước khi ghép.

> **⚠ Part 1 (Photographs) KHÔNG làm.** Nó cần ảnh; app là một file HTML không có ảnh.
> Dựng Part 1 giả bằng mô tả chữ thì không đo được thứ Part 1 đo.

> **Bài tập phải KHÁC bài đã có** (yêu cầu của người dùng). Đo trước khi viết: 1.950 câu
> `blank` sẵn có đều là **đề tiếng Việt, đáp án tự luận** — sai định dạng TOEIC, nên dù
> muốn tái chế cũng không được. Tất cả câu TOEIC được **viết mới**, có kiểm tra chặn
> việc trùng với kho câu cũ.

> **Từ công sở bổ sung thẳng vào chủ đề sẵn có**, không tạo category riêng (người dùng chốt).
> **+62 từ** vào work/money/service/edu/media/transport/tech/travel → **2.002 từ**. Đã viết
> luôn 62 mục chi tiết để **không tụt khỏi mốc 100%** — cả phiên âm lẫn đồng/trái nghĩa.
> Từ mới tự vào SRS, vào Lộ trình, vào Nghe chép — không phải nối tay chỗ nào.

---

## ✅ PHẦN II HOÀN TẤT — 05/10/2026

| Mục | Nội dung | Kết quả |
|---|---|---|
| **23** | Vá 4 bài ngữ pháp | 66 bài, đủ chuẩn (24, 12, 10, 16) |
| **21** | Đánh giá & lộ trình | 30 câu đầu vào · kiểm tra chặng 12 nhóm · 24 việc can-do |
| **19a** | Nghe bằng TTS | 5.284 câu nghe chép + nghe chọn đáp án |
| **20** | Sản sinh có phản hồi | 36 `timed` + 44 `prompt` + 100 `roleplay` |
| **22** | Đọc đoạn dài | 24 bài 395–614 từ, 24 chủ đề |
| **19b** | Nghe giọng người thật | 32 mục link YouGlish/BBC |

**6 trang mới** trong app · **4 file dữ liệu mới** (`placement` · `cando` · `produce` ·
`reading`) · **smoke 185 → 326 kiểm tra**.

> **Ba thói quen đã trả công trong phần này, nên giữ cho những phần sau:**
> 1. **Rút từ tài liệu thay vì viết bản sao.** Nghe chép, kiểm tra chặng và đóng vai đều
>    không có file dữ liệu riêng — thêm một bài là chúng tự dày lên.
> 2. **Đo được thì mới đạt được.** Mục 22 có bộ dò tự động, và **7/24 bài phải viết lại**
>    dù bài nào cũng đọc trôi chảy. Không đo thì cả bảy đã lọt.
> 3. **Giấu đáp án cho đến khi người học tự làm xong.** Bài mẫu, thang tự soát, lượt đóng
>    vai, danh sách từ — tất cả đều hiện **sau**. Mỗi chỗ đều có một kiểm tra chốt lại.

> **Nguyên tắc xuyên suốt:** mỗi mục trên phải kèm **một kiểm tra trong smoke test** và
> **một dòng trong `data/README.md`**, đúng như mười bảy mục trước. Thêm tính năng mà
> không nối vào hai chỗ đó là lặp lại đúng lỗi của mục 17.
