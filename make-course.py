# -*- coding: utf-8 -*-
"""Sinh data/course.json — khoa hoc A0 -> B2 dung tren 13 chang cua roadmap.json.

Chia moi chang thanh cac BAI, moi bai la mot chuoi BUOC tro vao noi dung san co
(bai nhap mon, bai ngu phap, lat tu vung, khung cau, bai ky nang, bai doc, de noi,
de viet, TOEIC, kiem tra chang). Trang khoa hoc ve tat ca cac buoc NGAY TRONG BAI.

    python make-course.py           # xem truoc: in bang phu kin, khong ghi file
    python make-course.py --write   # ghi data/course.json

Luat xep (muc 26 cua PLAN-NGU-PHAP.md):
  * Chang 0 = 26 bai Nhap mon (A0). Chang 1-12 = nhom ngu phap cung so. Chang 13 =
    cung co tu vung (colloc / wfam / phrasal).
  * Trong chang, bai chinh xep tu DE den KHO theo nhan "Trinh do"; bai co C1 la
    "Nang cao, tuy chon" — khong tinh vao dieu kien qua chang, khong mang tu vung.
  * Moi bai nhap mon / ngu phap / ky nang / bai doc / de timed / de prompt dung
    DUNG MOT LAN; moi khung cau co DUNG MOT nha (FRAME_HOME); moi tu vung nam
    trong DUNG MOT lat.
"""
import json, os, sys, glob, re

ROOT = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(ROOT, "data")
OUT = os.path.join(D, "course.json")

def rj(name):
    with open(os.path.join(D, name), encoding="utf-8") as f:
        return json.load(f)

ROADMAP = rj("roadmap.json")
GRAM    = rj("grammar.json")
BASICS  = rj("basics.json")
SKILLS  = rj("skills.json")
VOCAB   = rj("vocab.json")
READING = rj("reading.json")
PRODUCE = rj("produce.json")
TOEIC   = rj("toeic.json")
CANDO   = rj("cando.json")
VERBS   = rj("verbs.json")

LEVELS = [
    {"id": "A0",    "name": "Nhập môn",        "stages": [0]},
    {"id": "A1–A2", "name": "Sơ cấp",          "stages": [1, 2, 3]},
    {"id": "A2–B1", "name": "Tiền trung cấp",  "stages": [4, 5, 6, 7]},
    {"id": "B1",    "name": "Trung cấp",       "stages": [8, 9, 10]},
    {"id": "B2",    "name": "Trung cao cấp",   "stages": [11, 12, 13]},
]

STAGE0 = {"n": 0, "g": 0, "topics": [],
          "goal": "Đọc được phiên âm, dựng câu đầu tiên với to be và động từ thường, "
                  "nói số, ngày giờ và nơi chốn — đủ nền để vào chặng 1."}

# Ky nang -> chang. Phat am truoc, nghe o giua, viet ve cuoi.
SKILL_STAGE = {1: 0, 6: 0, 5: 1, 2: 2, 3: 3, 12: 3, 4: 4, 21: 4, 11: 5, 10: 5,
               14: 6, 7: 7, 17: 7, 9: 8, 15: 8, 16: 9, 20: 9, 13: 10, 19: 10,
               8: 11, 18: 11, 22: 12}

# Khung cau -> bai chu nha ("n7" = Nhap mon 7, "g53" = Ngu phap 53). Gan tay theo
# NGHIA: lien ket khung<->ngu phap san co lech nhau o 140 cap va khung 71-100 bi
# dien so lien tiep, nen khong suy tu dong duoc.
FRAME_HOME = {
    1: "g24", 2: "n15", 3: "g31", 4: "g2", 5: "g54", 6: "g2", 7: "g24", 8: "g32",
    9: "g59", 10: "g45", 11: "g29", 12: "n18", 13: "g24", 14: "g14", 15: "n5",
    16: "g66", 17: "g44", 18: "g15", 19: "g22", 20: "g53", 21: "g29", 22: "g14",
    23: "g46", 24: "g30", 25: "g31", 26: "g31", 27: "g46", 28: "g46", 29: "g55",
    30: "g53", 31: "g27", 32: "g32", 33: "g25", 34: "g10", 35: "n16", 36: "g10",
    37: "g18", 38: "g32", 39: "g30", 40: "g25", 41: "g1", 42: "g43", 43: "g65",
    44: "g52", 45: "g43", 46: "g15", 47: "g65", 48: "g62", 49: "g17", 50: "g30",
    51: "g57", 52: "g48", 53: "g48", 54: "g48", 55: "n15", 56: "g44", 57: "g1",
    58: "g40", 59: "g38", 60: "g56", 61: "n21", 62: "n22", 63: "n17", 64: "g58",
    65: "n19", 66: "g37", 67: "g66", 68: "g44", 69: "g29", 70: "g35", 71: "n7",
    72: "n6", 73: "n13", 74: "n14", 75: "g20", 76: "n9", 77: "g7", 78: "g25",
    79: "g42", 80: "n20", 81: "g34", 82: "g42", 83: "g27", 84: "g49", 85: "g35",
    86: "g25", 87: "g47", 88: "g42", 89: "g19", 90: "g47", 91: "g11", 92: "g12",
    93: "g26", 94: "g8", 95: "g6", 96: "g3", 97: "g14", 98: "g15", 99: "g52",
    100: "g51",
}

# TOEIC -> chang. Part 5 theo nhan ngu phap; Part 2/3/7 o chang B1-B2.
TOEIC_STAGE = [
    (2,  {"part": 5, "tag": "pron"}),
    (5,  {"part": 5, "tag": "verb"}),
    (6,  {"part": 5, "tag": "compare"}),
    (7,  {"part": 5, "tag": "prep"}),
    (8,  {"part": 2, "from": 0, "to": 20}),
    (9,  {"part": 2, "from": 20, "to": 40}),
    (9,  {"part": 5, "tag": "vocab"}),
    (10, {"part": 3, "from": 0, "to": 6}),
    (11, {"part": 3, "from": 6, "to": 12}),
    (11, {"part": 5, "tag": "clause"}),
    (12, {"part": 5, "tag": "conj"}),
    (12, {"part": 7, "from": 0, "to": 4}),
    (13, {"part": 7, "from": 4, "to": 8}),
    (13, {"part": 5, "tag": "form"}),
]
# Dong tu bat quy tac: 8 nhom rai vao bai chinh cua chang 3 (qua khu) va 4 (V3)
VERB_STAGES = [3, 4]
S13_CHUNK = 30          # so tu moi bai o chang 13

LV_RANK = {"A1": 1, "A1–A2": 1.5, "A2": 2, "A2–B1": 2.5, "B1": 3, "A2–B2": 3,
           "B1–B2": 3.5, "B2": 4, "B2–C1": 4.5}

def level_of(doc):
    for t in doc.get("tags", []):
        if "Trình độ" in t.get("text", ""):
            return t["text"].split(":")[-1].strip()
    return "B1"

GLEV = {}
for f in glob.glob(os.path.join(D, "grammar", "*.json")):
    with open(f, encoding="utf-8") as fh:
        d = json.load(fh)
    GLEV[d["id"]] = level_of(d)

def items(idx):
    return [(gi + 1, it) for gi, g in enumerate(idx["groups"]) for it in g["items"]]

GITEM = {it["id"]: (gi, it) for gi, it in items(GRAM)}
BITEM = {it["id"]: (gi, it) for gi, it in items(BASICS)}
SITEM = {it["id"]: (gi, it) for gi, it in items(SKILLS)}
TOPIC = {t["id"]: t for t in VOCAB["topics"]}
WORDS = {}
for w in VOCAB["words"]:
    WORDS.setdefault(w[3], []).append(w)

frames_of = {}
for f, host in FRAME_HOME.items():
    frames_of.setdefault(host, []).append(f)

def frame_steps(host):
    return [{"t": "frame", "id": f, "rp": True} for f in sorted(frames_of.get(host, []))]

def split_even(n, parts):
    """Chia n phan tu thanh `parts` doan lien tiep, chenh nhau toi da 1."""
    if parts <= 0:
        return []
    base, extra = divmod(n, parts)
    out, at = [], 0
    for i in range(parts):
        k = base + (1 if i < extra else 0)
        out.append((at, at + k))
        at += k
    return out

def vocab_slices(topics, parts):
    """Noi tu cua cac chu de thanh mot day, chia deu cho `parts` bai; moi bai nhan
    mot danh sach buoc vocab (cat theo ranh gioi chu de)."""
    seq = []
    for t in topics:
        seq += [(t, i) for i in range(len(WORDS.get(t, [])))]
    res = []
    for a, b in split_even(len(seq), parts):
        steps, cur = [], None
        for t, i in seq[a:b]:
            if cur and cur["topic"] == t and cur["to"] == i:
                cur["to"] = i + 1
            else:
                cur = {"t": "vocab", "topic": t, "from": i, "to": i + 1}
                steps.append(cur)
        res.append(steps)
    return res

def reading_for(topics):
    return [r for r in READING["items"] if r["topic"] in topics]

def timed_for(n, g):
    out = []
    for i, x in enumerate(PRODUCE["timed"]):
        if ("st" in x and x["st"] == n) or ("st" not in x and g and x.get("g") == g):
            out.append(i)
    return out

def prompts_for_skill(s):
    return [i for i, x in enumerate(PRODUCE["prompt"]) if x.get("s") == s]

def prompts_for_stage(n):
    return [i for i, x in enumerate(PRODUCE["prompt"]) if x.get("st") == n]

# ---- can-do -> chang: chang muon nhat trong cac bai no tro toi ----
def host_stage(host):
    k, num = host[0], int(host[1:])
    if k == "n":
        return 0
    if k == "g":
        return GITEM[num][0]
    if k == "s":
        return SKILL_STAGE[num]
    return None

def cando_stage(it):
    st = []
    st += [0 for _ in it.get("n", [])]
    st += [GITEM[g][0] for g in it.get("g", []) if g in GITEM]
    st += [SKILL_STAGE[s] for s in it.get("s", []) if s in SKILL_STAGE]
    st += [host_stage(FRAME_HOME[f]) for f in it.get("f", []) if f in FRAME_HOME]
    if "st" in it:
        return it["st"]
    return max(st) if st else None

CANDO_AT = {}
for lv in CANDO["levels"]:
    for i, it in enumerate(lv["items"]):
        s = cando_stage(it)
        if s is not None:
            CANDO_AT.setdefault(s, []).append(lv["lv"] + "|" + str(i))

# ---- dung tung chang ----
def main_title(kind, it):
    return it.get("vi") or it.get("pat") or ""

def build_stage(x):
    n, g = x["n"], x["g"]
    lessons = []

    def add(kind, title, steps, opt=False, sub=""):
        lessons.append({"id": "s%d-%02d" % (n, len(lessons) + 1), "kind": kind,
                        "title": title, "sub": sub, "opt": opt, "steps": steps})

    # 1. bai chinh
    if n == 0:
        mains = [("n", it) for _, it in items(BASICS)]
    elif g:
        gi = GRAM["groups"][g - 1]["items"]
        order = sorted(range(len(gi)), key=lambda k: (LV_RANK.get(GLEV[gi[k]["id"]], 3), k))
        mains = [("g", gi[k]) for k in order]
    else:
        mains = []

    real = [m for m in mains if not (m[0] == "g" and "C1" in GLEV[m[1]["id"]])]
    vs = vocab_slices(x["topics"], len(real)) if (n and real) else []

    ri = 0
    for kind, it in mains:
        host = kind + str(it["id"])
        opt = kind == "g" and "C1" in GLEV[it["id"]]
        steps = [{"t": "basic" if kind == "n" else "grammar", "id": it["id"]}]
        if not opt and vs:
            steps += vs[ri]; ri += 1
        steps += frame_steps(host)
        sub = (GLEV.get(it["id"], "") if kind == "g" else "A0")
        add("main", main_title(kind, it), steps, opt, sub)

    # 2. bai ky nang (kem de noi / viet cua chinh bai do)
    for s in sorted(k for k, v in SKILL_STAGE.items() if v == n):
        _, it = SITEM[s]
        steps = [{"t": "skill", "id": s}] + [{"t": "prompt", "i": i} for i in prompts_for_skill(s)]
        add("skill", it.get("vi") or it.get("pat"), steps, sub="Kỹ năng")

    # 3. chang 13: bai tu vung theo cum + bai doc cua chu de
    if n == 13:
        for t in x["topics"]:
            ws = WORDS.get(t, [])
            parts = max(1, round(len(ws) / S13_CHUNK))
            for k, (a, b) in enumerate(split_even(len(ws), parts)):
                add("vocab", "%s · phần %d/%d" % (TOPIC[t]["name"], k + 1, parts),
                    [{"t": "vocab", "topic": t, "from": a, "to": b}], sub="Từ vựng")

    # 4. bai doc
    for r in reading_for(x["topics"]):
        add("read", r["title"] + " · " + r["vi"], [{"t": "read", "id": r["id"]}], sub="Đọc · " + r["lv"])

    # 5. noi & viet
    pst = [{"t": "timed", "i": i} for i in timed_for(n, g)] + \
          [{"t": "prompt", "i": i} for i in prompts_for_stage(n)]
    if pst:
        add("produce", "Nói & viết chặng %d" % n, pst, sub="Sản sinh")

    # 6. TOEIC
    tst = [dict({"t": "toeic"}, **q) for s, q in TOEIC_STAGE if s == n]
    if tst:
        add("toeic", "Luyện TOEIC chặng %d" % n, tst, sub="TOEIC")

    # 7. on & kiem tra
    cst = [{"t": "check", "g": ("s0" if n == 0 else "s13" if n == 13 else g)}]
    if CANDO_AT.get(n):
        cst.append({"t": "cando", "items": CANDO_AT[n]})
    add("check", "Ôn & kiểm tra chặng %d" % n, cst, sub="Kiểm tra")
    return lessons



def place_verbs(stages):
    """8 nhom dong tu BQT rai vao cac bai chinh (khong tuy chon) cua chang 3 va 4."""
    slots = []
    for st in stages:
        if st["n"] in VERB_STAGES:
            slots += [l for l in st["lessons"] if l["kind"] == "main" and not l["opt"]]
    pats = [p["id"] for p in VERBS["patterns"]]
    for k, (a, b) in enumerate(split_even(len(pats), len(slots))):
        for p in pats[a:b]:
            slots[k]["steps"].insert(1, {"t": "verbs", "pat": p})

def main():
    src = [STAGE0] + ROADMAP["stages"]
    stages = []
    for x in src:
        st = {"n": x["n"], "g": x["g"], "topics": x["topics"], "goal": x["goal"],
              "lessons": build_stage(x)}
        stages.append(st)
    place_verbs(stages)

    for lv in LEVELS:
        for n in lv["stages"]:
            stages[n]["lv"] = lv["id"]

    out = {"title": "Khóa học A0 → B2",
           "tagline": "14 chặng, học tuần tự — mỗi bài gom đủ ngữ pháp, từ vựng, khung câu, đọc, nói và viết ngay trong một trang",
           "levels": LEVELS, "stages": stages}

    # ---- bang phu kin ----
    used = {k: [] for k in ("basic", "grammar", "skill", "read", "timed", "prompt", "frame", "verbs")}
    vocab_cov = {}
    total = 0
    for st in stages:
        for l in st["lessons"]:
            total += 1
            for s in l["steps"]:
                t = s["t"]
                if t in ("basic", "grammar", "skill", "read", "frame"):
                    used[t].append(s["id"])
                elif t in ("timed", "prompt"):
                    used[t].append(s["i"])
                elif t == "verbs":
                    used[t].append(s["pat"])
                elif t == "vocab":
                    for i in range(s["from"], s["to"]):
                        vocab_cov[(s["topic"], i)] = vocab_cov.get((s["topic"], i), 0) + 1
    def cov(name, have, want):
        miss = sorted(set(want) - set(have), key=str)
        dup = sorted({h for h in have if have.count(h) > 1}, key=str)
        print("  %-8s %3d/%-3d%s%s" % (name, len(set(have)), len(set(want)),
              ("  THIEU " + str(miss[:12])) if miss else "",
              ("  LAP " + str(dup[:12])) if dup else ""))
        return not miss and not dup
    ok = True
    print("Khoa hoc: %d chang, %d bai" % (len(stages), total))
    ok &= cov("nhapmon", used["basic"], BITEM.keys())
    ok &= cov("nguphap", used["grammar"], GITEM.keys())
    ok &= cov("kynang", used["skill"], SITEM.keys())
    ok &= cov("baidoc", used["read"], [r["id"] for r in READING["items"]])
    ok &= cov("timed", used["timed"], range(len(PRODUCE["timed"])))
    ok &= cov("prompt", used["prompt"], range(len(PRODUCE["prompt"])))
    ok &= cov("khung", used["frame"], range(1, 101))
    ok &= cov("dongtu", used["verbs"], [p["id"] for p in VERBS["patterns"]])
    allw = [(t, i) for t, ws in WORDS.items() for i in range(len(ws))]
    vmiss = [k for k in allw if k not in vocab_cov]
    vdup = [k for k, c in vocab_cov.items() if c > 1]
    print("  tuvung   %d/%d%s%s" % (len(allw) - len(vmiss), len(allw),
          "  THIEU %d" % len(vmiss) if vmiss else "", "  LAP %d" % len(vdup) if vdup else ""))
    ok &= not vmiss and not vdup
    for st in stages:
        kinds = {}
        for l in st["lessons"]:
            kinds[l["kind"]] = kinds.get(l["kind"], 0) + 1
        print("  chang %2d [%s] %3d bai  %s" % (st["n"], st["lv"], len(st["lessons"]),
              " ".join("%s:%d" % kv for kv in kinds.items())))

    if "--write" in sys.argv:
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
        print("Da ghi", OUT)
    else:
        print("(xem truoc — them --write de ghi file)")
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
