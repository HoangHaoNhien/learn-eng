# Cấu trúc dữ liệu

```
C:\Eng\
├─ khung-cau-giao-tiep.html   ← trang học (chỉ hiển thị, không chứa nội dung)
├─ start.bat                  ← chạy web server (đọc thẳng .json)
├─ build.bat / build.py       ← gom .json → data/bundle.js (để mở bằng file://)
├─ check-grammar.py           ← soát độ dày 66 bài ngữ pháp
├─ check-basics.py            ← soát 26 bài nhập môn A0 (gồm cả rà từ ngoài vốn A1);
│                                 `check-basics.py reading` soát 7 bài đọc A1
├─ make-course.py             ← sinh data/course.json: chia 14 chặng thành bài học (mục 26)
├─ smoke.js                   ← kiểm thử toàn trang bằng jsdom (`node smoke.js`)
├─ linkterms.py               ← chèn dòng nhắc thuật ngữ vào đầu mỗi bài ngữ pháp
├─ addipa.py                  ← nạp phiên âm IPA vào vocab.json từ bảng TSV
├─ backlink.py                ← rải tham chiếu ngược khung câu → ngữ pháp
├─ PLAN-NGU-PHAP.md           ← chuẩn soạn bài (mục 6: ngữ pháp · mục 15: nhập môn A0)
└─ data\
   ├─ basics.json             ← mục lục 26 bài nhập môn A0
   ├─ vocab-detail.json       ← đồng nghĩa / trái nghĩa / câu thêm cho từng từ
   ├─ index.json              ← mục lục 100 khung câu
   ├─ grammar.json            ← mục lục 66 bài ngữ pháp
   ├─ placement.json          ← 30 câu kiểm tra đầu vào (mục 21a)
   ├─ cando.json              ← 24 việc làm được theo bậc CEFR (mục 21c)
   ├─ produce.json            ← đề nói / viết có thang tự soát (mục 20)
   ├─ reading.json            ← bài đọc: 24 bài 400–600 từ (mục 22) + 7 bài A1 150–250 từ (mục 26)
   ├─ roadmap.json            ← 13 chặng ghép ngữ pháp với từ vựng (mục 24)
   ├─ course.json             ← TỰ SINH bằng make-course.py — khóa học 14 chặng, 194 bài (mục 26)
   ├─ toeic.json              ← bài tập theo định dạng đề TOEIC (mục 25)
   ├─ skills.json             ← mục lục 22 bài kỹ năng B2
   ├─ verbs.json              ← động từ bất quy tắc (mục lục + nội dung chung một file)
   ├─ bundle.js               ← TỰ SINH, đừng sửa tay
   ├─ basics\
   │  └─ 001.json             ← nội dung chi tiết bài nhập môn 01
   ├─ frames\
   │  └─ 001.json             ← nội dung chi tiết khung 01
   ├─ grammar\
   │  └─ 001.json             ← nội dung chi tiết bài ngữ pháp 01
   └─ skills\
      └─ 001.json             ← nội dung chi tiết bài kỹ năng 01
```

Trang có **bảy tab** ở góc trái, xếp theo thứ tự nên học:

| Tab | Nguồn | Nội dung |
|---|---|---|
| **Khóa học** | `course.json` + `roadmap.json` | 14 chặng A0 → B2, 194 bài, mọi nội dung học hiện **ngay trong bài** — **tab đầu tiên, mở app là thấy** |
| **TOEIC** | `toeic.json` | luyện theo từng part — **tab cuối cùng** |
| **Nhập môn** | `basics.json` + `basics/` | 26 bài A0 cho người bắt đầu từ con số 0 |
| **Ngữ pháp** | `grammar.json` + `grammar/` | 66 bài, xếp theo thứ tự nên học |
| **Kỹ năng** | `skills.json` + `skills/` | 22 bài B2: phát âm · nghe · nói · viết |
| **Từ vựng** | `vocab.json` + `vocab-detail.json` | 1.940 mục / 31 chủ đề (400 A1 + 1.540 B2), hai panel tra cứu |
| **Động từ BQT** | `verbs.json` | 201 động từ bất quy tắc, một bảng A→Z |
| **Khung câu** | `index.json` + `frames/` | 100 khung câu giao tiếp |
| **Ôn tập** | *không có file riêng* | lặp ngắt quãng, thẻ rút từ mọi tab tài liệu |

> Thứ tự tab là **đường học**, không phải thứ tự dựng: nền móng trước (Nhập môn → Ngữ
> pháp → Kỹ năng), rồi hai bảng tra cứu (Từ vựng → Động từ BQT), Khung câu để áp dụng,
> Ôn tập chốt lại. Smoke test khoá đúng thứ tự này nên sửa nhầm là test kêu ngay.

Các nhánh dùng chung toàn bộ bộ dựng trang (sidebar, tìm kiếm, nút Trước/Sau, phím mũi tên,
đánh dấu đã học). Tiến độ "đã học" lưu riêng cho từng tab. Tab nào thiếu file dữ liệu thì
nút tab đó tự ẩn.

## Hai cách chạy

| | Mở thẳng file HTML (double-click) | Chạy `start.bat` |
|---|---|---|
| Nguồn dữ liệu | `data/bundle.js` | các file `.json` |
| Sau khi sửa JSON | chạy `build.bat` rồi F5 | chỉ cần F5 |
| Cần cài gì | Python (chỉ để build) | Python |

Góc phải trên trang luôn hiện đang dùng nguồn nào.

## Thêm một bài nhập môn (tab A0)

1. Tạo `data/basics/NNN.json` + đánh dấu `"detail": true` trong `data/basics.json`.
2. Chạy `python check-basics.py` — bài **phải** đạt bộ số của mục 15 trong `PLAN-NGU-PHAP.md`:

| Yêu cầu | Con số |
|---|---|
| Số mục, đúng tên và đúng thứ tự | 6 — *Bài này dạy gì · Cần biết trước · Quy tắc · Ví dụ · Tự kiểm tra · Nhớ ba điều này* |
| Ví dụ (`ex`) | **ít nhất 20** |
| Câu tự kiểm tra (`quiz`) | **đúng 12** |
| Cặp bẫy (`pairs`) | **nhiều nhất 3** — bài A0 dạy luật trước, bẫy để dành cho tab Ngữ pháp |

Khác hẳn chuẩn bài ngữ pháp (mục 6): ở đó bẫy là trung tâm, ở đây bẫy bị **giới hạn**.

### Soát từ ngoài vốn A1

`check-basics.py` quét mọi chữ tiếng Anh trong `en` và `blank`, lột đuôi (`-s`, `-es`,
`-ed`, `-ing`, `-ies`), xử lý số nhiều bất quy tắc (`children`, `feet`…), dạng sở hữu
(`teacher's`) và bỏ đoạn phiên âm `/…/`, rồi đối chiếu với 400 từ A1 trong `vocab.json`.
Từ nào lọt ra ngoài sẽ bị liệt kê kèm số bài. Đây là cái chặn bài A0 trôi ngược về
kiểu cô đọng.

**Ba lối thoát,** khai ngay trong file bài:

| Khai báo | Dùng khi | Bắt buộc kèm |
|---|---|---|
| `"skipWordCheck": true` | bài dạy tên chữ cái hoặc ký hiệu IPA — phần tiếng Anh là `N, A, M` chứ không phải câu (bài 01–03) | `"_whySkip": "…"` giải thích lý do |
| `"teaches": ["word", …]` | bài tự định nghĩa từ đó tại chỗ | — |
| `"noRecap": true` | bài phát âm / chữ cái **bỏ mục 6** *Nhớ ba điều này* — còn 5 mục (bài 01–03, người dùng chốt) | `"_whyNoRecap": "…"` |

Mỗi lần chạy, script **in ra** bài nào đã dùng lối thoát, nên không ai giấu được việc
tắt kiểm tra.

### Nối ngược về tab Ngữ pháp

Bài ngữ pháp **không** chèn sẵn dòng nhắc thuật ngữ nào — đã thử rồi và đã gỡ, vì nó
lặp lại ở đầu cả 66 bài. Người mới vào tab Nhập môn học trước; ai đã quen thì đọc thẳng
bài ngữ pháp, không bị một khối dẫn nhập chắn ngang.

Khi cần liên kết, viết tay `[Nhập môn 04]` ngay trong nội dung — trang tự biến nó thành
link bấm được, giống `[Khung 07]` và `[Ngữ pháp 12]`.

`linkterms.py` vẫn còn, dùng để chèn / gỡ hàng loạt dòng nhắc đó nếu sau này đổi ý:

```
python linkterms.py                  # xem trước việc chèn
python linkterms.py --write          # chèn thật
python linkterms.py --undo           # xem trước việc gỡ
python linkterms.py --undo --write   # gỡ thật
```

Script sửa theo **dòng** (không `json.dump`) nên giữ nguyên định dạng tay của file, và
idempotent cả hai chiều: nhận dạng bằng dấu `data-terms-note`, chạy lại không chèn trùng
cũng không xoá nhầm.

## Tab Từ vựng — hai panel

Tab này không dùng bảng nữa mà chia **trái / phải**:

| Panel | Có gì | Cuộn thế nào |
|---|---|---|
| **Trái** | ô tìm · lọc A1/B2 · che nghĩa/che từ · danh sách từ (40 dòng một trang) | danh sách cuộn **bên trong** panel; thanh phân trang nằm cố định ở **đáy** panel nên không trôi mất |
| **Phải** | chi tiết từ đang chọn | cuộn riêng, độc lập với panel trái |

Cả khu vực cao đúng bằng phần còn lại của màn hình (`main.vcmode`), nên **trang không
cuộn** — chỉ hai panel cuộn. Màn hình hẹp hơn 860px thì xếp dọc và trả lại cho trang tự
cuộn, vì hai panel cạnh nhau sẽ quá chật.

Bấm một từ ở panel trái → panel phải hiện: **từ · loại từ · phiên âm · nghĩa · chủ đề ·
câu ngữ cảnh · từ đồng nghĩa · thay thế · từ trái nghĩa · các từ cùng chủ đề**. Từ đồng
nghĩa và từ cùng chủ đề đều bấm được — nếu từ đó đang bị bộ lọc che hoặc nằm ở trang
khác, trang sẽ tự gỡ lọc và lật đến đúng trang chứa nó.

### `vocab.json` — bảng từ

Giữ cả A1 lẫn B2 trong một mảng `words`. Mỗi chủ đề khai thêm trường `"lv"` (`"a1"` hoặc
`"b2"`) để hiện nút lọc **A1 / B2 / Tất cả**, cho người mới khỏi bị 1.540 từ B2 làm ngợp.

Một dòng từ có **8 trường**:

```json
["salary", "n", "lương (theo tháng)", "work", "Her salary is paid at the end of the month.", "Lương của cô ấy trả vào cuối tháng.", 1, "/ˈsæləri/"]
```

> **Luật trùng từ:** tiêu chí là **từ + loại từ**. `book` (n, "quyển sách", A1) và
> `book` (v, "đặt vé", B2) là hai mục hợp lệ; `menu` (n) ở cả hai trình độ thì không.

Phiên âm nạp hàng loạt bằng `addipa.py` từ một bảng TSV `từ<TAB>/ipa/`; script từ chối
ghi nếu có từ trong bảng không tìm thấy trong `vocab.json`. `build.py` in tỉ lệ phủ IPA
sau mỗi lần dựng.

### `vocab-detail.json` — phần chi tiết

File **tuỳ chọn**, soạn dần theo chủ đề. Thiếu mục nào thì panel phải vẫn chạy, chỉ là
phần đồng nghĩa ghi *"Chưa soạn…"*. Khoá là **`TỪ|LOẠI TỪ`** — đúng luật trùng từ ở trên.

```json
{
  "items": {
    "deadline|n": {
      "syn": [["due date", "ngày đến hạn, trung tính"]],
      "alt": [["time limit", "nhấn vào khoảng thời gian cho phép"]],
      "ant": [["extension", "việc gia hạn thêm"]],
      "ex":  [["We missed the deadline by one day.", "Chúng tôi trễ hạn mất một ngày."]]
    }
  }
}
```

| Trường | Nghĩa |
|---|---|
| `syn` | từ đồng nghĩa — thay vào câu thường vẫn đúng |
| `alt` | cách nói thay thế — trang trọng hơn, thông tục hơn, hoặc đổi cấu trúc |
| `ant` | từ trái nghĩa |
| `ex` | câu ngữ cảnh soạn thêm; câu gốc trong `vocab.json` **luôn** hiện trước, không cần chép lại |

Mỗi phần tử là `["từ", "ghi chú phân biệt"]`. Ghi chú là chỗ nói cho người học biết **khi
nào dùng từ nào** — bỏ trống nếu không có gì đáng lưu ý. Mảng rỗng `[]` cũng là một câu
trả lời: panel ghi *"Mục này không có … rõ rệt"*, khác hẳn với *"Chưa soạn…"*.

`build.py` in tỉ lệ đã soạn sau mỗi lần dựng, và **cảnh báo** nếu có khoá không khớp từ
nào trong `vocab.json` (gõ sai loại từ là lộ ra ngay).

## Thêm một khung câu chi tiết

1. Tạo `data/frames/NNN.json` (NNN = số khung, 3 chữ số: `002.json`, `047.json`…).
2. Sửa mục tương ứng trong `data/index.json`, thêm `"detail": true` (chỉ để hiện dấu ★).
3. Chạy `build.bat` nếu bạn mở trang bằng file://.

## Thêm một bài ngữ pháp

Y hệt như trên, chỉ đổi thư mục: `data/grammar/NNN.json` + `data/grammar.json`.
Khác hai chỗ so với file khung câu:

- dùng `"rule"` thay cho `"pattern"`;
- có thêm `"frames": [94, 95]` — các khung câu mà bài này bám vào.

Mỗi bài phải đạt **chuẩn độ dày 9 mục** mô tả trong `PLAN-NGU-PHAP.md` (mục 6).
Soát bằng:

```
python build.py
python check-grammar.py
```

`check-grammar.py` kiểm tra bộ số `(words, ex, pairs, quiz) = (24, 12, 10, 16)`,
đúng 9 mục, có ít nhất một khối `tree` và một khối `link`, id trong `link` nằm trong
khoảng 1–100, không lọt ký tự CJK, và mọi khối đều thuộc danh sách kiểu hợp lệ.

> **Bài 63–66 là bốn bài vá lỗ hổng B2** (mục 23 của `PLAN-NGU-PHAP.md`): `have / get
> something done` (63), `the more … the more` (64), nhấn mạnh và `It is said that…`
> (65), tường thuật câu hỏi và mệnh lệnh (66). Chúng không đứng cuối mục lục mà **chèn
> vào đúng nhóm** — bài 63 nằm ngay sau bài 27 trong Nhóm 8, vì thứ tự mục lục là
> **thứ tự nên học**, không phải thứ tự thêm vào — bài 64 nằm ngay sau bài 37 trong Nhóm 6.
> `smoke.js` có hẳn một kiểm tra `bài NN nằm trong Nhóm N` cho mỗi bài để chốt việc này.
>
> **Hệ quả cần nhớ:** chèn bài vào giữa làm **đổi hàng xóm** của các bài kề bên, nên hai
> nút *Trước / Sau* cuối bài cũng đổi theo. Mọi kiểm tra về điều hướng trong `smoke.js`
> phải suy ra từ mục lục, không được viết chết số bài.
>
> **Đã đủ cả bốn:** 63 → Nhóm 8 (sau bài 27), 64 → Nhóm 6 (sau bài 37),
> 65 → Nhóm 12 (sau bài 62), 66 → Nhóm 11 (sau bài 47). Bài 66 nối thẳng vào bài 47:
> bài 47 lo câu kể, bài 66 lo câu hỏi và câu mệnh lệnh.

## Thêm / sửa động từ bất quy tắc

Tất cả nằm trong **một file** `data/verbs.json` — không có thư mục con, vì nội dung là
**một bảng duy nhất**, không phải bài đọc. Khác hai mục lục kia: không có `groups`, chỉ
có một mảng `verbs` phẳng.

```jsonc
{
  "title": "Động Từ Bất Quy Tắc",
  "tagline": "…",
  "intro": "Đoạn mở đầu trong khung cam (HTML).",
  "patterns": [                       // chỉ để hiện chip nhóm ở cột Nghĩa
    { "id": "bought", "name": "A-B-B · đuôi -ought / -aught", "hint": "buy — bought — bought" }
  ],
  "verbs": [
    // [ V1, V2, V3, nghĩa tiếng Việt, id nhóm, 1 nếu là từ hay gặp ]
    ["buy",  "bought", "bought", "mua",      "bought", 1],
    ["seek", "sought", "sought", "tìm kiếm", "bought", 0]
  ],
  "traps": [                          // bảng Sai/Đúng ở cuối trang, dùng khối "pairs"
    { "wrong": "…", "right": "…", "why": "…" }
  ]
}
```

**Thứ tự trong file không quan trọng** — trang tự sắp xếp theo A→Z của cột V1. Cứ thêm
dòng mới vào cuối mảng.

Cột cuối (`1`/`0`) tô nền cam cho động từ hay gặp và quyết định bộ lọc **Chỉ … từ hay gặp**.
Một động từ có **hai dạng khác nghĩa** thì viết thành **hai dòng** (`hang/hung` treo đồ vật
và `hang/hanged` treo cổ).

Trang có bốn cách thu hẹp, **chồng được lên nhau**:

| Ở đâu | Làm gì |
|---|---|
| Ô tìm bên trái | Tra bất kỳ cột nào, kể cả nghĩa tiếng Việt. Gõ tìm sẽ **tự bỏ** chữ cái đang chọn |
| Dải A–Z bên trái | Nhảy tới chữ cái; chữ không có động từ nào thì mờ đi |
| **Chỉ … từ hay gặp** | Rút xuống còn các dòng nền cam |
| **Che V2 · V3** / **Che V1** | Tự kiểm tra — rê chuột lên ô bị che là hiện lại |

Bảng **phân trang 50 dòng** mỗi trang (đổi hằng `VB_PER` trong HTML nếu muốn khác).
Nút **Bỏ lọc** trả mọi thứ về mặc định.

## Thêm một bài kỹ năng

Giống hệt bài ngữ pháp, đổi thư mục thành `data/skills/` và mục lục thành
`data/skills.json`. Dùng **cùng chuẩn độ dày 9 mục** và cùng bộ số kiểm tra.
Hai script nhận tham số:

```
python regroup.py skills
python check-grammar.py skills
```

Mục 7 của bài kỹ năng đổi tên thành **“Kỹ năng này dùng ở đâu”** nhưng vẫn là khối
`link` trỏ sang khung câu.

## Liên kết hai chiều

| Chiều | Cách khai báo | Hiện ra ở đâu |
|---|---|---|
| Ngữ pháp → khung câu | khối `link` trong bài ngữ pháp | mục "Ngữ pháp này trong khung câu nào" |
| Khung câu → ngữ pháp | trường `"grammar": [24, 29]` trong file khung | dải thẻ ngay dưới khung mẫu |
| Bất kỳ → bất kỳ | viết `[Khung 07]`, `[Ngữ pháp 12]`, `[Kỹ năng 03]` hoặc `[Nhập môn 04]` thẳng trong nội dung | tự thành link bấm được |

Trường `"grammar"` **không viết tay** — chạy `python backlink.py` để sinh lại.
Script đọc toàn bộ `data/grammar/*.json`, dựng bản đồ ngược rồi ghi tối đa 4 bài
cho mỗi khung, ưu tiên bài có khối `link` trỏ thẳng tới khung đó. Chạy lại mỗi khi
sửa khối `link` hoặc mảng `frames` của các bài ngữ pháp.

## Khung sườn một file frame

```json
{
  "id": 2,
  "group": "Nhóm 1 · Mong muốn & Nhu cầu",
  "title": "I want to… — Nói thẳng điều mình muốn",
  "subtitle": "Một câu mô tả ngắn hiện dưới tiêu đề.",
  "pattern": ["I want <em>+ to V</em>", "I want <em>+ danh từ</em>"],
  "meaning": "Tôi muốn… (thẳng, thân mật)",
  "grammar": [24, 1],
  "tags": [{ "text": "Tần suất: rất cao", "hot": true }, { "text": "Độ lịch sự: 2/5" }],
  "sections": [
    { "title": "Nghĩa & sắc thái", "blocks": [ ... ] },
    { "title": "Luyện tập",        "blocks": [ ... ] }
  ]
}
```

Các mục `sections` được tự đánh số 1, 2, 3… trên trang.

## 15 kiểu khối dùng trong `blocks`

Hai khối `words` và `bank` dùng chung một giao diện **2 panel**: cột trái là danh sách
gập được theo nhóm (accordion, có đếm số mục), cột phải là nội dung chi tiết của mục đang chọn.


Các trường có chữ **(HTML)** cho phép viết thẻ `<b> <i> <code> <br>` và `<span class="k">…</span>`
(chữ kiểu code màu xanh). Các trường còn lại là chữ thuần.

```jsonc
// Đoạn văn (HTML)
{ "t": "p", "html": "Chữ <b>đậm</b> và <span class=\"k\">code</span>." }

// Tiêu đề nhỏ
{ "t": "h3", "text": "Ba tầng nghĩa" }

// Khung nhấn mạnh màu cam (HTML)
{ "t": "callout", "html": "<b>Lưu ý:</b> …" }

// Danh sách gạch đầu dòng (HTML)
{ "t": "list", "items": ["Ý một", "Ý <b>hai</b>"] }

// Bảng (ô là HTML)
{ "t": "table",
  "head": ["Cột 1", "Cột 2"],
  "rows": [["a", "b"], ["c", "d"]] }

// Thẻ bối cảnh (text là HTML)
{ "t": "cards", "items": [
  { "icon": "🍽", "title": "Gọi món", "text": "Nhà hàng, quán cà phê…" }
] }

// Ví dụ song ngữ — tự có nút loa đọc câu tiếng Anh
{ "t": "ex", "items": [
  { "en": "I'd like a coffee.", "vi": "Cho tôi một ly cà phê.", "note": "ghi chú (HTML, không bắt buộc)" }
] }

// Từ hay đi kèm — giao diện 2 panel giống khối "bank" bên dưới.
// Chỉ "w" là bắt buộc; "vi", "ex", "exvi", "note" đều tùy chọn.
{ "t": "words", "groups": [
  { "title": "Động từ thường theo sau “I'd like to…”", "items": [
    { "w": "book", "vi": "đặt chỗ",
      "ex":   "I'd like to book a room for two nights.",
      "exvi": "Tôi muốn đặt một phòng cho hai đêm.",
      "note": "ghi chú thêm (HTML, không bắt buộc)" }
  ] }
] }

// Hội thoại — "me": true là lượt của người học (nền cam)
{ "t": "dialog", "who": "Tại quán cà phê", "lines": [
  { "speaker": "Barista", "en": "What can I get you?", "vi": "Bạn dùng gì ạ?" },
  { "speaker": "You", "me": true, "en": "I'd like a latte.", "vi": "Cho mình một ly latte." }
] }

// Cặp Sai / Đúng (đều là HTML)
{ "t": "pairs", "items": [
  { "wrong": "I'd like to a coffee.", "right": "I'd like a coffee.", "why": "Có <b>to</b> thì phải có động từ." }
] }

// Thang mức độ (lịch sự, trang trọng…)
{ "t": "scale", "items": [ { "en": "I want a receipt.", "vi": "Thẳng — bạn bè" } ] }

// Bài tập — có nút Xem đáp án; "blank" không bắt buộc (bỏ đi là bài dịch)
// Các item này cũng tự chảy vào trang "Ôn tập trộn".
{ "t": "quiz", "items": [
  { "vi": "Tôi muốn đặt bàn cho bốn người.", "blank": "Hello, ______ a table for four.", "a": "I'd like to book" }
] }

// Ngân hàng câu — giao diện 2 panel: trái danh sách câu, phải nội dung chi tiết.
// Các item cũng tự chảy vào trang "Tra theo tình huống".
// "sit" phải khớp một id trong "situations" của index.json.
// Chỉ "en" và "vi" là bắt buộc; 5 trường còn lại đều tùy chọn.
{ "t": "bank", "groups": [
  { "sit": "food", "items": [
    {
      "en":   "I'd like a cappuccino, please.",
      "vi":   "Cho tôi một ly cappuccino ạ.",
      "note": "ghi chú (HTML)",
      "open":  { "en": "Hi there!",  "vi": "Chào bạn!" },
      "close": { "en": "Thank you!", "vi": "Cảm ơn bạn!" },
      "reply": [
        { "them": "For here or to go?", "themvi": "Dùng tại chỗ hay mang đi ạ?",
          "you":  "To go, please.",     "youvi":  "Mang đi ạ." }
      ],
      "vars": [
        { "en": "I'd like a black coffee, please.", "vi": "Cho tôi một ly cà phê đen ạ." }
      ]
    }
  ] }
] }

// Sơ đồ chọn dạng đúng — "if" và "then" là HTML, "ex" là chữ thuần.
// Dùng ở mục 6 của mỗi bài ngữ pháp.
{ "t": "tree", "q": "Việc này đã xong hẳn chưa?", "nodes": [
  { "if": "Đã xong, có mốc quá khứ rõ", "then": "Quá khứ đơn",
    "ex": "I saw him yesterday." }
] }

// Cầu nối sang khung câu — bấm là nhảy thẳng tới khung đó.
// "id" phải nằm trong 1–100; "why" là một dòng giải thích vì sao liên quan.
{ "t": "link", "items": [
  { "id": 94, "why": "for/since khi nói thâm niên công việc" }
] }
```

## Danh sách tình huống

Khai báo một lần trong `data/index.json` → dùng chung cho cả 100 khung:

```json
"situations": [
  { "id": "food",   "icon": "🍽", "name": "Quán ăn / quán cà phê" },
  { "id": "shop",   "icon": "🛍", "name": "Mua sắm & dịch vụ" },
  { "id": "travel", "icon": "🏨", "name": "Khách sạn, sân bay, đặt lịch" },
  { "id": "work",   "icon": "💼", "name": "Công việc: họp, email, điện thoại" },
  { "id": "life",   "icon": "💬", "name": "Đời sống & xã giao" }
]
```

Thêm tình huống mới thì thêm một dòng ở đây rồi dùng `id` đó trong khối `bank`.

## Mười một trang đứng riêng

Nằm ở đầu thanh bên trái. Ba trang **không cần viết nội dung riêng** — chúng tự gom dữ liệu từ các file đã có; hai trang còn lại đọc file riêng.

> **Ba trang đánh giá đều đặt trong tab Ngữ pháp** dù *Bạn đang ở đâu* còn chạm cả kỹ năng
> và khung câu — gồn chúng lại một chỗ thì người học biết đi đâu để **đo mình**, thay vì
> đi tìm trong năm tab khác nhau.

| Trang | Gom từ | Hiện ở tab |
|---|---|---|
| **Tra theo tình huống** | mọi khối `bank`, xếp lại theo `sit` | Khung câu |
| **Từ điển lỗi** | mọi khối `pairs` của **cả bốn** nguồn: nhập môn, khung câu, ngữ pháp, kỹ năng | mọi tab |
| **Kiểm tra đầu vào** | `placement.json` — file riêng, xem dưới | Ngữ pháp |
| **Kiểm tra chặng** | khối `pairs` và `quiz` của chính các bài trong một nhóm | Ngữ pháp |
| **Bạn đang ở đâu** | `cando.json` — file riêng, xem dưới | Ngữ pháp |
| **Nghe chép chính tả** | khối `ex` · `bank` · `dialog` của **toàn bộ** tài liệu | Kỹ năng |
| **Nghe chọn đáp án** | cùng kho câu với Nghe chép | Kỹ năng |
| **Nói bấm giờ** | `produce.json` — file riêng, xem dưới | Kỹ năng |
| **Đề nói & viết** | `produce.json` — cùng file | Kỹ năng |
| **Đóng vai** | `produce.json` + khối `dialog` của chính khung câu | Khung câu |
| **Đọc đoạn dài** | `reading.json` — file riêng, xem dưới | Từ vựng |

### `placement.json` — bài kiểm tra đầu vào (mục 21a)

30 câu trắc nghiệm rải đều **12 nhóm ngữ pháp**, tăng dần từ A1 đến B2. Mục đích
không phải xếp hạng người học mà trả lời đúng một câu: **nên bắt đầu từ nhóm nào.**

```json
{ "g": 3, "lv": "A2", "vi": "Hôm qua tôi không đi làm.",
  "q": "I ____ to work yesterday.",
  "opts": ["didn't went", "don't go", "didn't go"], "a": 2,
  "why": "Sau <b>didn't</b> động từ về nguyên thể.", "lesson": 3 }
```

* `g` — số nhóm 1–12 · `lv` — bậc A1/A2/B1/B2 · `a` — chỉ số đáp án đúng trong `opts`
* `lesson` — id bài ngữ pháp dạy điểm đó, dùng cho nút “Mở bài” sau khi chấm

**Cách chấm:** trình độ = bậc cao nhất mà **mọi bậc từ A1 đến đó** đều đạt ≥70%;
thêm dấu `+` khi bậc kế tiếp cũng quá nửa. Nhóm nên bắt đầu = nhóm **thấp nhất** chưa
đạt 70% — giỏi khuúc trên mà hổng khuúc dưới thì vẫn phải vá khuúc dưới trước.

> **Hai rào chắn đã dựng sẵn, đừng phá:**
> 1. Đáp án đúng phải **rải đều ba vị trí** (hiện là 10 · 10 · 10). Viết tay thì ai cũng
>    để đáp án ở cột đầu, và người bấm bừa sẽ được 30/30. `build.py` và `smoke.js`
>    đều cảnh báo nếu quá nửa số câu dồn đáp án vào một cột.
> 2. Kết quả giữ trong **biến `PT.res`** trước, `localStorage` chỉ là chỗ lưu lại giữa
>    các phiên. Trình duyệt ẩn danh chặn storage — nếu đọc thắng từ đó thì người học
>    làm xong 30 câu sẽ nhận một trang trắng.

Kết quả còn hiện thành một **dải gợi ý đầu thanh bên tab Ngữ pháp** (`.pt-hint`):
*“Bạn đang ở khoảng B1 · nên bắt đầu từ Nhóm 8”*.

### Kiểm tra chặng (mục 21b) — không có file dữ liệu

Học xong một nhóm thì kiểm lại: **15 câu rút thẳng từ chính các bài trong nhóm đó**.
Không soạn đề riêng — thêm một bài vào nhóm là đề tự dày lên.

| Điều kiện của mục 21b | Cách làm |
|---|---|
| **Đảo thứ tự** | `cpShuffle()` trộn lại cả danh sách câu lẫn các lựa chọn, mỗi lần làm một đề khác |
| **Giấu bài gốc** | trong lúc làm không hiện bài nào cả; chấm xong mới lộ ra |
| **Dưới 70% thì chỉ bài cần học lại** | trang kết quả xếp bài theo số câu sai, nhiều nhất lên đầu |

**Chỉ lấy hai loại câu chấm được chắc:**

1. khối `pairs` → câu hai lựa chọn *“Câu nào đúng?”* (dữ liệu đã ghi rõ câu nào đúng)
2. khối `quiz` có **lựa chọn sẵn trong ngoặc**, ví dụ `(cut my hair / had my hair cut)`

> **Cố ý KHÔNG bịa đáp án nhiễu.** Lấy đáp án của câu khác làm nhiễu thì rất dễ ra
> một phương án **cũng đúng**, và chấm sai còn hại hơn không chấm. Hai loại trên đã cho
> **ít nhất 85 câu mỗi nhóm** (nhóm mỏng nhất là Nhóm 4 với 85), dư xa so với 15.

Kết quả từng nhóm lưu ở `cp_res` dạng `{ "3": { pc, ok, n, at } }` và hiện lại trên thẻ nhóm.

### `cando.json` — trang “Bạn đang ở đâu” (mục 21c)

4 bậc (A1 · A2 · B1 · B2), mỗi bậc 6 **việc làm được**. Trang này cố ý **không cho điểm**:
“biết ngữ pháp” và “làm được” là hai chuyện khác nhau, và cái thứ hai mới là đích.

```json
{ "do": "Kể một ngày thường của mình bằng chuỗi câu nối tiếp.",
  "task": "Nói 60 giây về một ngày thường…",
  "ok":   "Nói liền 60 giây, không dừng quá 3 giây một lần.",
  "g": [1, 38], "s": [12], "n": [], "f": [] }
```

* `do` — việc làm được · `task` — đề tự kiểm chứng · `ok` — **mốc đạt, đo được**
* `g` ngữ pháp · `s` kỹ năng · `n` nhập môn · `f` khung câu — mỗi id thành một nút dẫn

> **Ba ràng buộc `build.py` và `smoke.js` cùng canh:** mỗi mục phải có **cả `task` lẫn `ok`**
> (thiếu một trong hai thì người học không tự xác nhận được, trang thành danh sách
> ước muốn), phải **gắn ít nhất một bài**, và **mọi id phải có thật**.

Ô tích lưu ở `cd_done` dạng `["B2|0", "B1|3"]` — khoá là `bậc|số thứ tự`, không phải chỉ số
phẳng, để chèn thêm một việc vào giữa bậc không làm lệch những ô đã tích.

### Nghe chép chính tả (mục 19a) — không có file dữ liệu

TTS đọc câu, người học gõ lại, chấm **theo từng từ**. Câu không soạn mới mà **rút thẳng
từ tài liệu đã có**: khối `ex` (mọi nguồn), `bank` kể cả `vars`, và `dialog` —
**5.284 câu**, gấp năm chỉ tiêu 1.000 của mục 19a.

| Nguồn | Số câu |
|---|---|
| Nhập môn | 520 |
| Khung câu | 3.709 |
| Ngữ pháp | 792 |
| Kỹ năng | 263 |

> **Việc cố ý KHÔNG làm:** kế hoạch nói *“viết ~1.000 câu nghe chép”*. Viết mới chỉ tạo
> ra một **bản sao thứ hai** của câu ví dụ đã có, rồi phải bảo trì song song: sửa câu
> trong bài mà quên sửa bản sao là hai chỗ lệch nhau. Rút từ tài liệu thì thêm một bài
> là kho câu tự dày lên.

**Cách chấm — LCS chứ không so theo vị trí.** Sót một từ đầu câu mà so theo vị trí thì
mọi từ phía sau đều bị báo sai — báo như thế thì không còn dùng được. Ví dụ thật trong
`smoke.js`: gõ *“had my hair cut yesterday”* cho câu *“I had my hair cut yesterday”* → **5/6**,
không phải 0/6. Từ gõ thừa được tách riêng thay vì trừ vào điểm.

Chuẩn hoá trước khi so: bỏ hoa/thường, bỏ dấu câu, và **bỏ luôn dấu nháy** — `dont` và
`don't` đều tính là đúng, vì đây là bài **nghe**, không phải bài chính tả dấu nháy.

### Nghe chọn đáp án (mục 19a) — dùng chung kho câu

Hai kiểu hỏi, cả hai đều chấm được **chắc** vì đáp án đúng chính là câu vừa đọc:

| Kiểu | Phương án | Đo gì |
|---|---|---|
| **Nghe → chọn nghĩa** | 4 nghĩa tiếng Việt | hiểu ý cả câu |
| **Nghe → chọn câu** | 4 câu tiếng Anh **giống nhau nhất** | nghe rõ từng từ |

> **Nhiễu của kiểu *chọn câu* không lấy ngẫu nhiên.** `lqTop3()` chọn ba câu **trùng từ
> nhiều nhất** với câu vừa đọc. `smoke.js` đo thật: nhiễu đã chọn có độ giống **0,56**
> so với **0,06** của câu ngẫu nhiên — nghĩa là nghe loáng thoáng một từ rồi đoán sẽ trượt.

> **Hai rào đã dựng, đừng phá:**
> 1. **Loại phương án trùng chữ.** Kho câu gom từ nhiều bài nên có câu lặp lại; để lọt
>    hai phương án giống hệt là câu hỏi mất đáp án đúng duy nhất. 120 đề thử, 0 trùng.
> 2. **`lqTop3()` duyệt một lượt, không `sort` cả kho.** Bản đầu sort 5.284 câu mỗi lần ra
>    đề (gọi `lqSim` 2·n·log n lần) — treo máy vài giây giữa hai câu hỏi, thấy rõ trên
>    điện thoại. Nay **43 ms/câu**, và `smoke.js` có hẳn một kiểm tra chặn dưới 150 ms.

### `produce.json` — nói bấm giờ (mục 20)

**36 đề nói, 12 nhóm ngữ pháp × 3 đề**, dài dần 45 → 60 → 90 giây. Đây là **chỗ duy nhất
trong cả tài liệu tạo ra áp lực thời gian** — thứ phân biệt người *biết* ngữ pháp với
người *dùng được* ngữ pháp.

```json
{ "g": 3, "seconds": 90,
  "task": "Kể một lần bạn đi muộn: lúc đó bạn đang làm gì, rồi chuyện gì xảy ra.",
  "start": "I was still…",
  "must": ["quá khứ tiếp diễn cho bối cảnh", "quá khứ đơn cho việc xảy đến",
            "ít nhất 1 câu quá khứ hoàn thành"] }
```

* `g` — nhóm ngữ pháp 1–12 · `seconds` — thời lượng · `task` — đề bài
* `st` — **thay cho `g`** ở đề không gắn nhóm ngữ pháp: số chặng khóa học (mục 26).
  6 đề `st: 0` cho người mới A0 (30–45 giây) và 3 đề `st: 13` dùng collocation / phrasal verb
* `start` — **câu mở lời**, thêm so với bản kế hoạch: 60 giây trống không có chỗ bám là
  chỗ người mới đứng hình, và họ bỏ bài chứ không phải vì không biết ngữ pháp
* `must` — **thang tự soát**, hiện **sau khi hết giờ**, tích được từng ý

> **Thang `must` hiện SAU, không hiện trước.** Đọc trước thì người học bám vào danh sách
> thay vì nói tự nhiên, và bài mất đúng cái nó muốn đo. `smoke.js` có kiểm tra riêng
> cho việc này.

> **Đồng hồ chỉ vẽ lại SỐ và THANH mỗi giây, không vẽ lại cả trang** — vẽ lại cả trang
> thì nút đang bấm bị thay mỗi giây, bấm không ăn. Và `show()` gọi `tmStop()` khi rời
> trang: không thì đồng hồ chạy ngầm rồi vài phút sau bất ngờ đọc *“Time is up”* giữa
> một bài khác.

### `produce.json` — đề nói & viết (mục 20)

**44 đề, 22 bài Kỹ năng × 2** — 30 đề nói, 14 đề viết. Bài phát âm và bài nghe nhận
đề `speak`, bài viết nhận đề `write`.

```json
{ "s": 20, "mode": "write",
  "task": "Viết email trang trọng 120 từ xin nghỉ ba ngày vì việc gia đình.",
  "must":  ["lý do", "ngày cụ thể", "ai làm thay", "lời cảm ơn"],
  "model": "Dear Ms Hoa, I am writing to request…",
  "check": ["Có đủ cả bốn ý bắt buộc không?", …] }
```

* `s` — id bài Kỹ năng · `mode` — `speak` hoặc `write`
* `st` — **thay cho `s`** ở đề gắn thẳng vào chặng khóa học: 6 đề viết A1–A2 cho chặng 1–3
  (mục 26), vì trước chặng 4 khóa học không có đề viết nào
* `must` — ý bắt buộc, hiện **trước** khi làm · `model` — bài mẫu · `check` — thang tự chấm

> **Thứ tự trên trang là cố ý:** đề → ý bắt buộc → chỗ tự làm → **rồi mới** bài mẫu và
> thang tự chấm. Hiện bài mẫu trước thì người học chép lại ý của nó và đề mất sạch giá
> trị. `smoke.js` có kiểm tra riêng: chưa bấm thì `.pr-model` phải bằng 0.

> **`check` là phần quan trọng nhất của mục 20**, không phải `model`. Bài mẫu chỉ là một
> cách làm; thang tự chấm dạy người học **tự soát**, thứ theo họ suốt đời và thay cho một
> người chấm bài lúc nào cũng sẵn. `build.py` cảnh báo nếu một đề có dưới 3 câu `check`.

### `produce.json` — đóng vai (mục 20)

**100 màn, mỗi khung câu một màn.** File dữ liệu chỉ giữ **ba dòng** cho mỗi khung:

```json
{ "f": 28,
  "you":  "Nhân viên nhà hàng, tối nay đã kín chỗ.",
  "them": "Khách vừa đến, không đặt trước và đang đói.",
  "goal": "Từ chối đủ ba phần: xin lỗi, nêu lý do, đưa phương án." }
```

> **Hội thoại mẫu và cụm hữu dụng KHÔNG chép vào đây.** Chúng lấy thẳng từ khối `dialog`
> và `bank` của chính khung đó lúc vẽ trang. 100 khung đã có sẵn **200 khối `dialog`** —
> chép sang file khác là tạo ra bản sao thứ hai phải bảo trì song song. `smoke.js` có
> kiểm tra chặn: màn nào có sẵn `sample` hay `useful` trong dữ liệu là báo đỏ.

> **Cái mới duy nhất so với một khối `dialog` thường: lượt của NGƯỜI HỌC bị giấu đi**
> (các dòng có `me: true`) cho đến khi bấm hiện. Đọc sẵn thì chỉ là đọc hội thoại, không
> phải đóng vai. `build.py` cảnh báo nếu một khung được gắn màn mà **không có** khối
> `dialog` để làm hội thoại mẫu.

### `reading.json` — đọc đoạn dài (mục 22)

Mỗi bài: **400–600 từ** (bậc A1: **150–300 từ**) + **5 câu hỏi** (2 ý chính · 2 chi tiết · 1 đoán nghĩa qua ngữ cảnh)
+ danh sách từ trỏ về tab Từ vựng. Đặt ở **tab Từ vựng**, không phải Kỹ năng — vì mỗi bài
là một **chủ đề từ vựng đã soạn**, nhồi 15–25 từ của chủ đề đó vào ngữ cảnh thật.

> **`gloss` KHÔNG viết tay.** Nó được **dò thẳng từ bài đọc** đối chiếu với `vocab.json`
> (chịu được dạng biến đổi: *symptoms* → `symptom`). Nhờ vậy danh sách từ **không bao giờ
> lệch** với tab Từ vựng, và chỉ tiêu *“15–20 từ mỗi bài”* **đo được** thay vì ước lượng.
> `smoke.js` kiểm cả hai chiều: từ trong `gloss` phải có trong `vocab.json` đúng chủ đề đó,
> **và** phải thực sự xuất hiện trong bài.

> **Thứ tự trên trang:** đọc hết một lượt → trả lời → **rồi mới** hiện danh sách từ.
> Hiện danh sách trước thì người học tra từng từ và không bao giờ đọc liền mạch — đúng cái
> mà mục 22 muốn chữa. Có kiểm tra riêng chốt việc này.

> **Thêm ngoài kế hoạch:** nút **cỡ chữ to hơn**. Một bài 500 từ trên điện thoại ở cỡ chữ
> mặc định là thứ người ta bỏ giữa chừng.

> **Một bài — một chủ đề, không lặp.** `smoke.js` chốt cả việc này lẫn việc `id` phải
> liên tục từ 1. Hai bài cùng một chủ đề là phí một ô phủ sóng từ vựng.

**Đủ 31 bài, 31/31 chủ đề:** 20 chủ đề B2 + `colloc` · `phrasal` · `wfam` + 1 bài A2 (`a1-place`)
+ **7 bài A1** (id 25–31) cho bảy chủ đề `a1-*` còn lại — thêm ở mục 26 để chặng 1–3 của
khóa học có bài đọc. Bậc: **A1 ×7 · A2 ×1 · B1 ×10 · B2 ×13**.

> **Bài A1 chỉ dùng vốn 400 từ A1.** `python check-basics.py reading` quét bài, câu hỏi và
> phương án, lột đuôi, hiểu động từ bất quy tắc (lấy từ `verbs.json`). Hai lối thoát khai
> ngay trong bài: `"teaches"` cho vài từ của câu hỏi (*text, writer, mean…*) và `"names"`
> cho tên riêng — tên đứng đầu câu không phân biệt được với từ thường bằng chữ hoa.
> `build.py` nới chuẩn theo `lv`: A1 dài 150–300 từ và cần ≥10 từ chủ đề (bài khác ≥15).

> **Bộ dò phải biết động từ bất quy tắc.** Cụm động từ chia ở **từ đầu**: *made a decision*,
> *took over*. Bản đầu chỉ cho biến đổi ở từ cuối nên hai chủ đề `colloc` và `phrasal` bị
> báo thiếu oan (4/15). Đã sửa để lấy dạng bất quy tắc **từ chính `data/verbs.json`** của dự
> án — không viết tay một danh sách thứ hai. `smoke.js` dùng đúng luật đó.

## `toeic.json` — bài tập định dạng TOEIC (mục 25)

```json
{ "tags": { "form": "Từ loại", "prep": "Giới từ", … },
  "parts": [ { "p": 5, "name": "Điền câu", "en": "Incomplete Sentences",
               "real": 30, "desc": "…", "tip": "…" } ],
  "p5": [ { "tag": "form",
            "q": "All employees must ____ the new safety guidelines.",
            "opts": ["observance","observe","observant","observation"], "a": 1,
            "why": "Sau <b>must</b> phải là động từ nguyên thể…" } ] }
```

Mỗi part một mảng `p<số>`. Thêm part mới = thêm một mục vào `parts` và một mảng `p6`…
— trang tự hiểu, không phải sửa mã.

### Ba hình dạng mục — trang tự nhận ra

| Hình dạng | Nhận ra bằng | Dùng cho |
|---|---|---|
| **Một câu** | không có `qs` | Part 5 |
| **Văn bản + nhiều câu** | có `qs` + `kind`/`title`/`text` | Part 7 |
| **Nghe + nhiều câu** | có `qs` + `who`/`lines`, part có `audio` | Part 3 |

Mỗi mục **tự khai báo hình dạng của nó** thay vì trang phải biết mình đang ở part nào.
Nhờ vậy thêm Part 4 (bài nói một chiều) sau này là **không phải sửa bộ dựng**.

### Metadata quyết định cách vẽ

| Trường | Ý nghĩa |
|---|---|
| `nopt` | số lựa chọn — **3** cho Part 2, **4** cho các part còn lại |
| `audio` | phần nghe: hiện nút phát tiếng, giấu lời thoại |
| `real` | số câu của part đó trong đề thật |

> **Đừng viết chết số 4.** Part 2 chỉ có ba lựa chọn; cả trang lẫn `build.py` đều đọc
> `nopt` từ metadata. Đây là lỗi đã mắc một lần rồi.

### Phần nghe — giấu cái gì, hiện cái gì

| | Part 2 | Part 3 |
|---|---|---|
| Câu hỏi | **giấu** (chỉ có tiếng) | **in ra** |
| Lựa chọn | **giấu** — chỉ (A)(B)(C) | **in ra** |
| Lời thoại | hiện sau khi trả lời | hiện sau khi trả lời |

Đúng như đề thật: Part 2 không in gì, Part 3 in câu hỏi và lựa chọn. **In chữ trước là
bài nghe biến thành bài đọc**, mất sạch cái nó muốn đo. `smoke.js` chốt cả hai chiều.

> **`trap` chỉ bắt buộc ở Part 2.** Ba câu đáp gần giống nhau nên phải nói rõ **mình bị lừa
> kiểu gì** — bẫy âm, bẫy lặp từ, bẫy Yes/No cho câu hỏi `or`. Part 3 là nghe hiểu, không
> có bẫy kiểu đó. `build.py` phân biệt hai trường hợp này.

> **BÀI TẬP Ở ĐÂY PHẢI KHÁC BÀI TẬP CÁC TAB KHÁC** — yêu cầu của người dùng, và cũng là
> đòi hỏi của định dạng:
> * đề bài **hoàn toàn bằng tiếng Anh**, không có câu tiếng Việt dẫn đường
> * **bốn** lựa chọn (khối `quiz` cũ thường hai, hoặc tự luận)
> * bối cảnh **công sở**, không phải đời thường
>
> Nên câu hỏi được **viết mới**, không rút từ `quiz`/`pairs` sẵn có. `smoke.js` có hẳn một
> kiểm tra đối chiếu toàn bộ câu TOEIC với kho `blank` cũ để chặn việc tái chế, và một
> kiểm tra nữa bắt đề bài không được lẫn chữ tiếng Việt.

> **`tag` là thứ làm kết quả có ích.** Một con số *“đúng 24/30”* không nói được gì; nhãn loại
> cho phép trang kết quả xếp **yếu nhất lên đầu**: *Giới từ 2/7 · Từ loại 11/13*.
> `build.py` cảnh báo nếu một câu mang nhãn chưa khai báo trong `tags`.

> **Đáp án phải rải đều bốn cột.** Viết tay thì đáp án luôn nằm ở A — đúng bài học từ mục
> 21a. Script sinh file **xoay vòng** vị trí, hiện là 15/15/15/15; `build.py` và `smoke.js`
> đều cảnh báo nếu một cột chiếm quá 35%.

> **Part 1 (Photographs) không làm được** — nó cần ảnh, mà app là một file HTML không có
> ảnh. Đừng dựng Part 1 giả bằng mô tả chữ: nó không đo được thứ Part 1 đo.

## `roadmap.json` — lộ trình học (mục 24)

Tab **Từ vựng** vốn chỉ là **công cụ tra cứu**: 1.940 từ trong một danh sách có lọc, không
thứ tự, không đích đến, không biết đã xong tới đâu. `ctx("vc").done` trả `[]` **viết chết**
— khoá `vc_done` có tên nhưng không chỗ nào ghi vào. Tab **Lộ trình** vá đúng chỗ đó.

**13 chặng**, mỗi chặng ghép *một nhóm ngữ pháp* + *các chủ đề từ vựng hợp nghĩa*:

```json
{ "pass": { "vocab": 0.8, "check": 70 },
  "stages": [
    { "n": 5, "g": 5, "topics": ["travel", "transport"],
      "goal": "Nói kế hoạch đi lại: định đi đâu, đi thế nào, mất bao lâu." } ] }
```

* `g` — số nhóm ngữ pháp 1–12, hoặc **`0`** cho chặng 13 (củng cố, không gắn nhóm)
* `topics` — id chủ đề trong `vocab.json` · `goal` — học xong chặng thì **làm được gì**

> **KHÔNG THÊM TRẠNG THÁI MỚI.** Mọi con số đều suy từ dữ liệu đã có:
>
> | Cần gì | Lấy từ |
> |---|---|
> | từ đã thuộc | `otSrs["v:" + hash36(từ + "\|" + chủđề)][0] >= 3` |
> | bài ngữ pháp đã học | `ngDone` |
> | kết quả kiểm tra chặng | `cp_res` (mục 21b) |
> | chặng nên bắt đầu | `pt_res.start` (mục 21a) |
> | bài đọc của chủ đề | `reading.json`, khoá theo `topic` |
>
> Nhờ vậy người học **không phải tích tay 1.940 ô** — tiến độ tự nhích mỗi lần họ ôn tập
> thật sự. **Đạt chặng** = xong hết bài ngữ pháp **và** kiểm tra chặng ≥70% **và** ≥80%
> từ đã thuộc.

> **Mỗi chủ đề phải nằm ĐÚNG MỘT chặng.** Một chủ đề bị bỏ quên là chủ đề người học
> **không có đường nào đi tới**, và lỗi đó im lặng hoàn toàn. `build.py` và `smoke.js`
> soát **cả hai chiều**: phủ kín 31/31 và không chủ đề nào lặp.

> **Lưu ý khi thêm tab:** Khóa học là **tab mặc định**, nên nó phải **tự nạp** `reading.json`,
> `produce.json`, `toeic.json` (`coEnsure()`). Chúng vốn chỉ được nạp khi mở trang riêng —
> không tự nạp thì bước Đọc / Nói / TOEIC của bài hiện *“Không tìm thấy”*.

> Từ mục 26, `roadmap.json` chỉ còn giữ **mục tiêu, chủ đề và ngưỡng đạt** của 13 chặng;
> phần chia bài nằm ở `course.json` bên dưới.

## `course.json` — khóa học A0 → B2 (mục 26)

Tab **Khóa học** (trước là *Lộ trình*) biến 13 chặng thành **194 bài học**, thêm **chặng 0**
cho 26 bài Nhập môn. Mở một bài là **toàn bộ nội dung học hiện ngay trong bài** — không bước
nào chuyển sang tab khác.

| Cấp | Chặng | Nguồn chính |
|---|---|---|
| A0 | 0 | 26 bài Nhập môn |
| A1–A2 | 1 · 2 · 3 | ngữ pháp nhóm 1–3 + chủ đề `a1-*` |
| A2–B1 | 4 · 5 · 6 · 7 | nhóm 4–7 |
| B1 | 8 · 9 · 10 | nhóm 8–10 |
| B2 | 11 · 12 · 13 | nhóm 11–12 + chặng củng cố colloc / wfam / phrasal |

**File này TỰ SINH** — đừng sửa tay, sửa luật trong `make-course.py` rồi chạy:

```
python make-course.py            # xem trước bảng phủ kín
python make-course.py --write    # ghi data/course.json
python build.py
```

```json
{ "levels": [{ "id": "A0", "name": "Nhập môn", "stages": [0] }, …],
  "stages": [{ "n": 4, "g": 4, "lv": "A2–B1", "topics": ["work", "edu"], "goal": "…",
    "lessons": [{ "id": "s4-01", "kind": "main", "title": "Hiện tại hoàn thành",
                  "sub": "A2–B1", "opt": false,
                  "steps": [{ "t": "grammar", "id": 6 }, { "t": "verbs", "pat": "ciau" },
                            { "t": "vocab", "topic": "work", "from": 0, "to": 35 },
                            { "t": "frame", "id": 95, "rp": true }] }] }] }
```

**Mỗi chặng xếp bài theo thứ tự:** bài chính → bài Kỹ năng → bài Đọc → Nói & viết →
Luyện TOEIC → Ôn & kiểm tra.

| Bước `t` | Trỏ tới | Hiện trong bài |
|---|---|---|
| `basic` / `grammar` / `skill` | `id` bài | toàn văn bài (tiêu đề hạ một bậc) |
| `vocab` | `topic` + lát `from`–`to` | thẻ từ có IPA, câu ví dụ, nút **Che nghĩa** và **Nhớ / Chưa nhớ** |
| `frame` | `id` khung, `rp` | toàn văn khung + màn đóng vai của khung đó |
| `verbs` | `pat` nhóm biến đổi | bảng V1–V3 có nút che, chỉ ở chặng 3–4 |
| `read` | `id` bài đọc | đọc → trả lời → **rồi mới** hiện danh sách từ |
| `timed` / `prompt` | chỉ số `i` trong `produce.json` | đồng hồ / chỗ viết; thang tự soát và bài mẫu hiện **sau** |
| `toeic` | `part` + `tag` hoặc `from`–`to` | câu TOEIC chấm ngay; Part 2 không in chữ trước khi trả lời |
| `check` | `g` (1–12), `"s0"`, `"s13"` | đề 15 câu, ghi `cp_res` |
| `cando` | `items` dạng `"bậc|số"` | ô tự xác nhận, ghi `cd_done` |

**Luật xếp trong `make-course.py`:**

* bài chính trong chặng xếp **dễ → khó theo nhãn "Trình độ"** — chặng 1 không còn mở đầu
  bằng bài A2–B1;
* 4 bài **B2–C1** (18, 28, 49, 62) là **"Nâng cao, tuỳ chọn"**: không mang lát từ vựng,
  không tính vào điều kiện qua chặng;
* 22 bài Kỹ năng rải theo bảng `SKILL_STAGE` (phát âm trước, nghe ở giữa, viết về cuối), mỗi
  bài kèm 2 đề nói / viết của nó;
* **100 khung câu gán tay** trong `FRAME_HOME`, mỗi khung đúng một bài chủ nhà. Không suy
  tự động được: liên kết khung ↔ ngữ pháp sẵn có lệch nhau ở 140 cặp và khung 71–100 bị điền
  số liên tiếp (khung 100 *There is* không trỏ tới bài 51 *There is / are*);
* từ vựng của chặng chia **đều** cho các bài chính bắt buộc; chặng 13 chia thành bài
  ~30 từ;
* can-do vào chặng **muộn nhất** trong các bài nó trỏ tới; trường `"st"` trong `cando.json`
  ép chặng khi mục chỉ trỏ tới bài Kỹ năng.

> **Phủ kín, đúng một lần.** `make-course.py`, `build.py` và `smoke.js` cùng soát: 26/26 bài
> nhập môn, 66/66 ngữ pháp, 22/22 kỹ năng, 31/31 bài đọc, 45/45 đề nói, 50/50 đề nói-viết,
> 100/100 khung, 2.002/2.002 từ — và không bước nào trỏ tới nội dung không có thật.

**Menu bên trái là cây ba tầng Cấp → Chặng → Bài.** Mỗi Cấp và Chặng có nút ▸ / ▾ riêng
để ẩn / hiện tầng con; các nhánh độc lập — mở bao nhiêu nhánh cùng lúc cũng được. Bấm vào
**tên** Cấp / Chặng thì mở trang tổng quan của nó (`LT.open` = `"L:A2–B1"` / `"S:5"`), không
đóng mở gì. Mở một bài thì cấp và chặng chứa nó tự hiện ra (không đóng nhánh nào khác).
Trạng thái mở nhớ ở `co_tree` — chỉ là tiện nghi, mất đi thì quay về mở sẵn chặng đang học.

**Tiến độ** vẫn suy từ dữ liệu sẵn có, cộng đúng **một khoá mới**:

| Cần gì | Lấy từ |
|---|---|
| bài khóa học đã xong | **`co_done`** — mới; bài Đọc / Nói không có cờ "xong" nào khác để suy ra |
| bài đang mở | `co_last` (chỉ để mở lại đúng chỗ) |
| từ đã thuộc | `otSrs` hộp ≥3 — nút **Nhớ / Chưa nhớ** trong bước từ vựng ghi thẳng vào đây |
| bài gốc đã học | `ngDone` / `nm_done` / `sk_done` — **Hoàn thành bài** ghi luôn vào đây |
| kiểm tra chặng | `cp_res`, thêm khoá `"s0"` và `"s13"` |

**Đạt chặng** = xong mọi bài chính bắt buộc **và** kiểm tra chặng ≥70% **và** ≥80% từ đã thuộc
(chặng 0 không có từ vựng riêng nên chỉ xét hai điều đầu).

> **Kiểm tra chặng 0 và 13 không soạn đề riêng.** Chặng 0 rút `pairs` / `quiz` của 26 bài
> Nhập môn bằng đúng `cpHarvest()`. Chặng 13 đục lỗ câu ví dụ của từ vựng, ba phương án nhiễu
> **cùng chủ đề**, và chỉ lấy câu mà từ cần điền xuất hiện **nguyên dạng** — không thì đáp
> án đúng có thể không duy nhất.

> **Mỗi bước giữ trạng thái riêng** trong closure của nó, id phần tử mang tiền tố của bước —
> hai bài đọc hay hai đồng hồ cùng một trang không giẫm lên nhau. Chỉ **một** đồng hồ chạy
> mỗi lúc (`CO_TIMERS`), và rời bài / rời tab là dừng hết.

> **`decorate(root)` chạy lại được.** Nó gắn nút 🔊 và *Xem đáp án* vào đúng vùng `root`
> và đánh dấu `data-dec`, nên vẽ từng bước xong gọi lại cũng không nhân đôi nút.

## Khối `pairs` — BẪY người Việt hay mắc

```json
{ "t": "pairs", "items": [
  { "wrong": "I <b>cut my hair</b> yesterday.",
    "right": "I <b>had my hair cut</b> yesterday.",
    "why":   "BẪY SỐ MỘT. <i>I cut my hair</i> nghĩa là…" } ] }
```

> **`<b>` trong `wrong`/`right` là ĐÚNG PHẦN ĐƯỢC SỬA** — không phải để in đậm cho đẹp.
> Trang tô nó thành highlight: nền đỏ + gạch ngang ở câu sai, nền xanh ở câu đúng. Viết
> `<b>` ở chỗ khác là chỉ sai chỗ cho người học.

**Một cặp = MỘT khối `.pair`**, câu sai trên, câu đúng ngay dưới, lời giải thích ở chân.
Trước đây hai câu nằm **hai cột cạnh nhau**: mắt phải nhảy ngang để so, và chỗ khác
nhau không thẳng hàng nên rất khó thấy đã sửa cái gì. Xếp dọc thì hai câu thẳng cột chữ.

**Cách tô phần được sửa:** câu sai — chữ đỏ + **gạch ngang**; câu đúng — chữ xanh +
**gạch chân**. **Không dùng khung nền.** Khung nền có padding làm câu trông như bị chặt
thành từng mảnh; bỏ đi thì câu đọc liền một mạch và xuống dòng ở đâu cũng tự nhiên.

> **⚠ TÊN LỚP PHẢI RIÊNG — bài học đắt giá.** Dòng Sai/Đúng dùng `.pp-row`, **không phải**
> `.pr-row`. `.pr-row` đã thuộc về danh sách **Đề nói & viết** / **Đóng vai** / **Đọc đoạn**
> **dài** (mục 20, 22), và luật của nó là:
>
> ```css
> .pr-row .tx b{display:block; font-size:14.5px; font-weight:500}
> ```
>
> Dùng chung tên là luật này biến phần highlight thành **khối** — và một câu bị chặt thành
> nhiều dòng. Nó còn kéo theo `border-radius:12px`, `padding:13px 15px`,
> `align-items:flex-start` sang dòng Sai/Đúng.
>
> Vì vậy `.pp-row b` **ghi hẳn `display:inline`** để chặn mọi luật tương lai, và `smoke.js`
> đo thẳng bằng `getComputedStyle` chứ không đoán qua markup.

> **Một bộ dựng duy nhất:** `pairHTML()` dùng chung cho khối `pairs` trong bài **và** trang
> **Từ điển lỗi**. Trước đây hai chỗ giữ hai bản sao markup giống hệt — sửa một bên là
> hai bên lệch nhau.

## Khối `listen` — nghe giọng người thật (mục 19b)

TTS đọc chuẩn ở **cấp từ**, nhưng không nối âm, không nuốt âm, không làm dạng yếu.
Bốn bài **Kỹ năng 07–10 dạy đúng những thứ đó**, nên chúng bắt buộc phải có tiếng người
thật — 8 mục mỗi bài, **32 mục** tất cả.

```json
{ "t": "listen",
  "intro": "TTS đọc từng từ rất chuẩn, nhưng nối âm là thứ nó không làm được…",
  "items": [{ "en": "an apple", "vi": "một quả táo",
               "focus": "phụ âm /n/ dính sang nguyên âm…",
               "yg": "an apple", "src": "youglish" }],
  "more": [{ "label": "BBC Learning English…", "url": "https://…" }] }
```

* `yg` — chuỗi tìm trên YouGlish. Trang tự dựng URL
  `https://youglish.com/pronounce/<yg>/english` (có `encodeURIComponent`)
* `url` — chỉ dùng khi muốn trỏ tới một địa chỉ cụ thể thay cho YouGlish

> **ĐÃ CHỐT: nhúng link ngoài, KHÔNG thu âm.** Ưu điểm quyết định là người học nghe
> được **nhiều giọng thật khác nhau** thay vì một giọng duy nhất. Nhược điểm đã biết là
> **link có thể chết**, nên có ba rào chắn:
> 1. **Mỗi mục vẫn giữ đủ `en` + `vi` + `focus`.** Mất mạng hay link hỏng thì bài học chỉ
>    mất phần nghe, không mất nội dung. `build.py` và `smoke.js` đều chặn nếu thiếu.
> 2. **Link mở tab mới, có `rel="noopener noreferrer"`.**
> 3. **Chỉ chấp nhận `https://` thuộc `youglish.com` hoặc `bbc.co.uk`.** `build.py` cảnh
>    báo nếu lọt một miền khác.

> **Bốn bài này dùng LINK NGOÀI, không có audio nội bộ.** Mọi phần nghe khác trong tài
> liệu (trang **Nghe chép chính tả** và **Nghe chọn đáp án**) đều là **TTS của trình duyệt**.
> Phải nói rõ để người học không tưởng mình đang luyện nghe giọng thật ở những trang đó.

> **Chọn link thế nào:** YouGlish có dạng URL **xác định** nên dựng được mà không phải
> đoán địa chỉ. Với BBC thì **chỉ trỏ tới trang gốc** — trỏ thẳng vào một tập cụ thể là
> đoán, và một link hỏng làm người học mất lòng tin vào cả bài.

> Trang **Ôn tập trộn** từng nằm ở đây đã được gỡ: tab **Ôn tập** làm cùng việc đó
> nhưng rút thẻ từ cả bốn nguồn chứ không riêng `quiz` của khung câu, và có lặp
> ngắt quãng thay vì trộn ngẫu nhiên.

**Từ điển lỗi** hiện gom **1.547 cặp Sai/Đúng**: 67 từ 26 bài nhập môn, 600 từ 100 khung
câu, 660 từ 66 bài ngữ pháp và 220 từ 22 bài kỹ năng. Có ô tìm riêng và năm nút lọc nguồn
(Tất cả · Nhập môn · Khung câu · Ngữ pháp · Kỹ năng). Mỗi lỗi kèm một link về đúng bài đã
dạy nó. Trang hiện 60 lỗi mỗi lần, bấm nút cuối để xem thêm.

> **Khi thêm một tab tài liệu mới, phải nối nó vào HAI chỗ gom:** `collectErrors()` cho
> Từ điển lỗi và `collectCards()` cho tab Ôn tập. Tab Nhập môn từng bị bỏ sót ở cả hai —
> 26 bài A0 có đủ `quiz` và `pairs` nhưng không xuất hiện ở đâu, đúng tầng mà người mới
> cần ôn nhất. Smoke test nay có kiểm tra riêng cho việc này.

Nghĩa là mỗi khi bạn soạn thêm một khung hoặc một bài có `bank`, `quiz`, `pairs`,
hai trang này tự dày lên — không phải sửa gì trong HTML.

## Tab Ôn tập — lặp ngắt quãng

Tab này **không có file dữ liệu riêng**. Thẻ được rút thẳng từ dữ liệu đã có,
nên soạn thêm một bài là tự có thêm thẻ:

| Bộ thẻ | Rút từ | Hỏi gì |
|---|---|---|
| **Từ vựng** | `vocab.json` | nghĩa tiếng Việt → từ tiếng Anh (đảo chiều được) |
| **Bài tập** | mọi khối `quiz` của **nhập môn, khung câu, ngữ pháp, kỹ năng** | câu tiếng Việt → câu tiếng Anh |
| **Sửa lỗi** | mọi khối `pairs` của **nhập môn, khung câu, ngữ pháp, kỹ năng** | câu SAI → câu ĐÚNG |
| **Động từ** | `verbs.json` | V1 → V2 / V3 |

Hiện có **6.604 thẻ**, trong đó **379 thẻ đến từ 26 bài nhập môn**. Bộ lọc nguồn có
năm lựa chọn: Tất cả · Nhập môn · Khung câu · Ngữ pháp · Kỹ năng.

Thuật toán **Leitner năm hộp**: nhớ được thì thẻ lên một hộp, quên thì rơi thẳng về
hộp 1. Khoảng cách ôn lại theo hộp là **1 · 2 · 4 · 8 · 16 ngày**.

### Hai khoá trong localStorage

```jsonc
// "ot_srs" — tiến độ từng thẻ: [hộp 1..5, mốc đến hạn tính bằng ms]
{ "v:1a2b3c": [3, 1764547200000],
  "q:ng:41:xyz": [1, 1764460800000] }

// "ot_log" — nhật ký theo ngày, để tính chuỗi ngày ôn và tỉ lệ nhớ
// "d" tách theo bộ thẻ: [số nhớ được, số đã ôn]
{ "2026-10-02": { "n": 42, "ok": 35, "d": { "vc": [20, 24], "qz": [15, 18] } } }
```

**Id thẻ dựng từ nội dung, không từ chỉ số mảng** — nếu dùng chỉ số thì chèn một từ
mới vào giữa là toàn bộ tiến độ cũ lệch sang thẻ khác. Với khối `quiz` phải băm cả
đáp án chứ không chỉ câu tiếng Việt, vì một câu thường có nhiều chỗ trống.

Tiến độ chỉ nằm trong trình duyệt đang dùng. Trang có nút **Xuất / Nhập** để chép
sang máy khác; khi nhập thì **gộp** chứ không ghi đè — thẻ trùng giữ bản đã học xa hơn.

## Lưu ý khi viết JSON

- Lưu file bằng **UTF-8**.
- Trong chuỗi JSON, dấu nháy kép phải viết `\"`. Dễ nhất là dùng nháy cong `“ ”` và `’` cho nội dung tiếng Việt/Anh.
- Sai cú pháp JSON (thừa dấu phẩy, thiếu ngoặc) sẽ khiến `build.py` báo đúng tên file và vị trí lỗi.
