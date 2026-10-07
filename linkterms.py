# -*- coding: utf-8 -*-
"""
Noi tang Nhap mon voi tab Ngu phap.

Van de goc: bai ngu phap dung thuat ngu (chu ngu, tan ngu, trang tu, mao tu...)
ma khong cho nao dinh nghia. Nguoi moi doc den dong dau tien la tac.

Script nay quet 62 bai trong data/grammar/, xem bai nao THAT SU dung thuat ngu,
roi chen MOT dong nhac kem link ve bai Nhap mon 04 vao ngay dau muc 1.

Chay:  python linkterms.py                 -> xem truoc, khong ghi gi
       python linkterms.py --write         -> chen that
       python linkterms.py --undo          -> xem truoc viec go bo
       python linkterms.py --undo --write  -> go bo that

An toan:
  - Chen/xoa bang regex theo DONG, khong json.dump — giu nguyen dinh dang tay cua file.
  - Idempotent ca hai chieu: chay lai khong chen trung, khong xoa nham (nhan dang
    bang chuoi MARK — dong nao mang dau nhan nay deu do script nay sinh ra).
"""
import io, json, os, re, sys

ROOT    = os.path.dirname(os.path.abspath(__file__))
GRAMMAR = os.path.join(ROOT, "data", "grammar")

# Dau nhan de biet da chen roi — tim chuoi nay thi bo qua file
MARK = "data-terms-note"

# Thuat ngu -> bai Nhap mon day no
TERMS = {
    "chủ ngữ":   4, "tân ngữ":  4, "danh từ":  4, "động từ": 4,
    "tính từ":   4, "trạng từ": 4, "giới từ":  4, "mạo từ":  4,
}
# Ky hieu viet tat: chi tinh khi dung dang "S + V" chu khong phai chu S bat ky
ABBR = re.compile(r"\bS\s*\+\s*V\b|\bV\s*\+\s*O\b|\bS\s*\+\s*be\b")

NOTE = ('{ "t": "callout", "' + MARK + '": true, "html": '
        '"<b>Chưa quen mấy chữ in đậm bên dưới?</b> '
        '<i>chủ ngữ · động từ · tân ngữ · tính từ · trạng từ · giới từ · mạo từ</i> '
        '— và ký hiệu <code>S + V + O</code> — đều được giải thích bằng ví dụ tiếng Việt '
        'ở [Nhập môn 04]. Mở bài đó trước rồi quay lại đây thì bài này đọc trôi hơn nhiều." },')

# Dong mo khoi "blocks" cua MUC DAU TIEN
FIRST_BLOCKS = re.compile(r'^(\s*)"blocks"\s*:\s*\[\s*$')


def terms_used(path):
    """Thuat ngu nao that su xuat hien trong bai."""
    raw = io.open(path, encoding="utf-8").read()
    found = set(t for t in TERMS if t in raw)
    if ABBR.search(raw):
        found.add("S + V + O")
    return found


def unprocess(path, write):
    """Go dong nhac ra khoi bai. Dong nhac luon nam gon tren MOT dong."""
    raw = io.open(path, encoding="utf-8").read()
    if MARK not in raw:
        return "khong co gi de go"
    lines = [l for l in raw.split("\n") if MARK not in l]
    if write:
        with io.open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write("\n".join(lines))
    return "da go"


def process(path, write):
    raw = io.open(path, encoding="utf-8").read()
    if MARK in raw:
        return "da co"
    used = terms_used(path)
    if not used:
        return "khong dung thuat ngu"

    lines = raw.split("\n")
    for i, line in enumerate(lines):
        m = FIRST_BLOCKS.match(line)
        if not m:
            continue
        indent = m.group(1) + "  "
        lines.insert(i + 1, indent + NOTE)
        if write:
            with io.open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write("\n".join(lines))
        return "da chen (%d thuat ngu)" % len(used)
    return "KHONG TIM THAY cho chen"


def main():
    write = "--write" in sys.argv
    undo  = "--undo" in sys.argv
    if not os.path.isdir(GRAMMAR):
        print("Khong thay data/grammar/")
        return 1

    run = unprocess if undo else process
    files = sorted(n for n in os.listdir(GRAMMAR) if n.lower().endswith(".json"))
    stat = {}
    for name in files:
        r = run(os.path.join(GRAMMAR, name), write)
        stat[r] = stat.get(r, 0) + 1
        if r.startswith("KHONG"):
            print("   %s  ->  %s" % (name, r))

    print(("DA GHI" if write else "XEM TRUOC (them --write de ghi that)") + ":")
    for k in sorted(stat):
        print("   %-28s %d bai" % (k, stat[k]))

    if write:
        bad = 0
        for name in files:
            try:
                json.load(io.open(os.path.join(GRAMMAR, name), encoding="utf-8"))
            except ValueError as e:
                print("   LOI JSON sau khi sua: %s -> %s" % (name, e))
                bad += 1
        print("   Kiem tra JSON: %s" % ("CO LOI" if bad else "ca %d file deu hop le" % len(files)))
        return 1 if bad else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
