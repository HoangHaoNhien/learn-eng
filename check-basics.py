# -*- coding: utf-8 -*-
"""
Soat cac bai NHAP MON trong data/basics/ theo chuan muc 15 cua PLAN-NGU-PHAP.md.

Chuan nay KHAC han chuan bai ngu phap (muc 6) — bai nhap mon day QUY TAC truoc,
bay de cuoi va chi 2-3 cai, vi du phai nhieu va phai dung tu de.

Chay:  python check-basics.py
"""
import io, json, os, re, sys

ROOT   = os.path.dirname(os.path.abspath(__file__))
DIR    = os.path.join(ROOT, "data", "basics")
BINDEX = os.path.join(ROOT, "data", "basics.json")
VOCAB  = os.path.join(ROOT, "data", "vocab.json")

# (so vi du toi thieu, so cau quiz, so cap bay TOI DA)
MIN_EX, N_QUIZ, MAX_PAIRS = 20, 12, 3
N_SECTIONS = 6
SECTION_TITLES = ["Bài này dạy gì", "Cần biết trước", "Quy tắc",
                  "Ví dụ", "Tự kiểm tra", "Nhớ ba điều này"]

CJK = re.compile(u"[　-鿿＀-￯]")
TAG = re.compile(r"<[^>]*>")
WORD = re.compile(r"[A-Za-z][a-z']*")
IPA  = re.compile(r"/[^/]*/")   # doan phien am giua hai gach cheo

# Tu chuc nang qua co ban, khong tinh la "tu la" du chua day o chu de A1 nao
STOP = set("""a an the i you he she it we they me him her us them my your his its our their
is am are was were be been being do does did done have has had having
not no yes and or but so if then than that this these those there here
to of in on at by for from with without about into over under up down out off
can could will would shall should may might must
what where when who why how which whose
one two three four five six seven eight nine ten
mr mrs ms ok
very just also only too so very please sorry thanks
don't doesn't didn't isn't aren't wasn't weren't can't won't
i'm you're he's she's it's we're they're that's there's let's
i've you've we've they've i'll you'll he'll she'll we'll they'll
i'd you'd he'd she'd we'd they'd""".split())


def read(path):
    with io.open(path, encoding="utf-8") as f:
        return json.load(f)


def walk(blocks, kind):
    """Dem so MUC trong moi khoi thuoc mot kieu."""
    n = 0
    for b in blocks:
        if b.get("t") == kind:
            n += len(b.get("items", []) or b.get("rows", []) or [])
    return n


def all_blocks(doc):
    out = []
    for s in doc.get("sections", []):
        out.extend(s.get("blocks", []) or [])
    return out


# Danh tu so nhieu bat quy tac — CHINH BAI 10 day ca bang nay, nen neu dang so it
# da co trong A1 thi dang so nhieu cung coi nhu da day.
IRREGULAR = {
    "men": "man", "women": "woman", "children": "child", "people": "person",
    "teeth": "tooth", "feet": "foot", "knives": "knife", "wives": "wife",
    "leaves": "leaf", "lives": "life", "mice": "mouse", "geese": "goose",
}


def base_forms(w):
    """Tra ve cac dang goc co the co cua mot tu da chia duoi.
    Khong can dung ngu phap tuyet doi — chi can du de khong bao nham
    'comes' khi 'come' da duoc day."""
    out = {w}
    # Dang so huu: teacher's -> teacher · parents' -> parents -> parent
    if w.endswith("'s") and len(w) > 3:
        out |= base_forms(w[:-2])
    elif w.endswith("'") and len(w) > 2:
        out |= base_forms(w[:-1])
    if w in IRREGULAR:
        out.add(IRREGULAR[w])
    for suf, cuts in (("ies", ["y"]), ("es", ["", "e"]), ("s", [""]),
                      ("ed", ["", "e"]), ("ing", ["", "e"])):
        if w.endswith(suf) and len(w) > len(suf) + 1:
            stem = w[:-len(suf)]
            for c in cuts:
                out.add(stem + c)
            if len(stem) > 2 and stem[-1] == stem[-2]:   # stopped -> stop
                out.add(stem[:-1])
    return out


def english_words(doc):
    """Moi tu tieng Anh xuat hien trong PHAN TIENG ANH cua vi du va quiz.

    CHI doc truong "en" (cau vi du) va "blank" (de bai) — truong "a" la loi
    giai thich bang TIENG VIET, quet no se bao nham 'danh', 'ch', 'kh'...
    la tu tieng Anh chua day."""
    found = set()
    for b in all_blocks(doc):
        if b.get("t") not in ("ex", "quiz"):
            continue
        for it in b.get("items", []):
            for k in ("en", "blank", "sent"):
                v = it.get(k)
                if not isinstance(v, str):
                    continue
                txt = TAG.sub("", v)
                # Bo phan phien am /.../ — chu cai trong do la KY HIEU IPA, khong phai
                # tu tieng Anh. Khong bo thi 'fifty /ˈfɪfti/' se bao nham 'fti' la tu la.
                txt = IPA.sub(" ", txt)
                for m in WORD.finditer(txt):
                    w = m.group(0)
                    # Ten rieng (Nam, Hue, Monday...) viet hoa GIUA cau -> bo qua,
                    # vi chung khong phai tu vung can day.
                    if w[0].isupper() and m.start() > 0:
                        before = txt[:m.start()].rstrip()
                        if before and before[-1] not in ".!?":
                            continue
                    found.add(w.lower())
    return found


def a1_words():
    """Tap tu A1 da soan (chu de bat dau bang a1-). Rong = chua soan -> bo qua check."""
    if not os.path.isfile(VOCAB):
        return None
    d = read(VOCAB)
    out = set()
    for w in d.get("words", []):
        if str(w[3]).startswith("a1-"):
            for p in WORD.findall(w[0]):
                out.add(p.lower())
    return out or None


def main():
    if not os.path.isdir(DIR):
        print("Chua co thu muc data/basics/")
        return 1

    index = read(BINDEX) if os.path.isfile(BINDEX) else {"groups": []}
    listed = {}
    for g in index.get("groups", []):
        for it in g.get("items", []):
            listed[int(it["id"])] = it

    a1 = a1_words()
    if a1 is None:
        print("  (chua co tu vung A1 -> bo qua buoc soat tu la)")

    files = sorted(n for n in os.listdir(DIR) if n.lower().endswith(".json"))
    if not files:
        print("Chua soan bai nhap mon nao.")
        return 0

    bad = 0
    skipped = []
    for name in files:
        path = os.path.join(DIR, name)
        errs = []
        try:
            doc = read(path)
        except ValueError as e:
            print("%s  ->  LOI JSON: %s" % (name, e))
            bad += 1
            continue

        secs = doc.get("sections", [])
        if len(secs) != N_SECTIONS:
            errs.append("co %d muc, phai dung %d" % (len(secs), N_SECTIONS))
        for i, want in enumerate(SECTION_TITLES):
            if i < len(secs):
                got = secs[i].get("title", "")
                if want.lower() not in got.lower():
                    errs.append("muc %d ten la %r, cho doi %r" % (i + 1, got, want))

        blocks = all_blocks(doc)
        nex = walk(blocks, "ex")
        nq  = walk(blocks, "quiz")
        npr = walk(blocks, "pairs")
        if nex < MIN_EX:
            errs.append("chi %d vi du, toi thieu %d" % (nex, MIN_EX))
        if nq != N_QUIZ:
            errs.append("%d cau quiz, phai dung %d" % (nq, N_QUIZ))
        if npr > MAX_PAIRS:
            errs.append("%d cap bay, toi da %d (bai nhap mon khong lay bay lam trung tam)"
                        % (npr, MAX_PAIRS))

        raw = io.open(path, encoding="utf-8").read()
        if CJK.search(raw):
            errs.append("co ky tu CJK")

        fid = doc.get("id")
        if fid is None:
            m = re.match(r"^(\d+)", name)
            fid = int(m.group(1)) if m else None
        if fid is not None and fid not in listed:
            errs.append("khong co trong data/basics.json")

        # Hai loi thoat HOP LE, deu phai khai bao trong chinh file bai:
        #   "skipWordCheck": true  -> bai day TEN CHU CAI / KY HIEU, khong phai cau
        #   "teaches": [...]       -> nhung tu chinh bai nay dinh nghia tai cho
        if a1 and not doc.get("skipWordCheck"):
            teach = set(w.lower() for w in doc.get("teaches", []))
            known = a1 | STOP | teach
            unknown = sorted(w for w in english_words(doc)
                             if not (base_forms(w) & known))
            if unknown:
                errs.append("tu chua day o A1 va chua khai bao trong \"teaches\": " +
                            ", ".join(unknown[:12]) +
                            (" …(%d tu)" % len(unknown) if len(unknown) > 12 else ""))
        elif a1 and doc.get("skipWordCheck"):
            skipped.append(name)

        if errs:
            bad += 1
            print("%s" % name)
            for e in errs:
                print("   - " + e)

    total = len(files)
    if skipped:
        print("  (bo qua soat tu cho bai day ky hieu: " + ", ".join(skipped) + ")")
    if bad:
        print("\n%d/%d bai co van de." % (bad, total))
        return 1
    print("Sach — %d/%d bai nhap mon dat chuan muc 15." % (total, total))
    return 0


if __name__ == "__main__":
    sys.exit(main())
