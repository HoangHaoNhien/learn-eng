# -*- coding: utf-8 -*-
"""
Kiem tra do day cua cac bai ngu phap trong data/grammar/.
Chuan: xem PLAN-NGU-PHAP.md muc 6.

Chay:  python check-grammar.py
"""
import glob, io, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
WHAT = sys.argv[1] if len(sys.argv) > 1 else "grammar"
DIR    = os.path.join(ROOT, "data", WHAT)
GINDEX = os.path.join(ROOT, "data", WHAT + ".json")
LABEL  = "bai ky nang" if WHAT == "skills" else "bai ngu phap"


def total_in_index():
    """So bai co trong muc luc — nguon su that, khong viet cung vao day."""
    try:
        with io.open(GINDEX, encoding="utf-8") as fh:
            idx = json.load(fh)
        return sum(len(g.get("items", [])) for g in idx.get("groups", []))
    except Exception:
        return None

TARGET = (24, 12, 10, 16)          # words, ex, pairs, quiz
SECTIONS = 9
OK_BLOCKS = set("p h3 callout list table cards ex words bank "
                "dialog pairs scale quiz tree link".split())


def main():
    files = sorted(glob.glob(os.path.join(DIR, "*.json")))
    short, cjk, badblk, secbad, notree, nolink, badref, broken = [], [], [], [], [], [], [], []

    for path in files:
        name = os.path.basename(path)
        raw = io.open(path, encoding="utf-8").read()
        try:
            d = json.loads(raw)
        except ValueError as e:
            broken.append("%s -> %s" % (name, e))
            continue

        n = d.get("id")
        w = e = pr = q = tr = lk = 0

        secs = d.get("sections", [])
        if len(secs) != SECTIONS:
            secbad.append((n, len(secs)))

        for s in secs:
            for b in s.get("blocks", []):
                t = b.get("t")
                if t not in OK_BLOCKS:
                    badblk.append((n, t))
                if t == "words":
                    for g in b.get("groups", []):
                        w += len(g.get("items", []))
                elif t == "ex":
                    e += len(b.get("items", []))
                elif t == "pairs":
                    pr += len(b.get("items", []))
                elif t == "quiz":
                    q += len(b.get("items", []))
                elif t == "tree":
                    tr += 1
                elif t == "link":
                    lk += 1
                    for it in b.get("items", []):
                        if not (1 <= it.get("id", 0) <= 100):
                            badref.append((n, it.get("id")))

        if (w, e, pr, q) != TARGET:
            short.append((n, w, e, pr, q))
        if not tr:
            notree.append(n)
        if not lk:
            nolink.append(n)
        if re.search(r"[一-鿿぀-ヿ]", raw):
            cjk.append(n)

    total = total_in_index()
    print("so %s: %d / %s" % (LABEL, len(files), total if total else "?"))
    problems = 0
    checks = [
        ("JSON loi",                     broken),
        ("thieu chuan (id,words,ex,pairs,quiz)", short),
        ("so muc != %d" % SECTIONS,      secbad),
        ("thieu khoi tree",              notree),
        ("thieu khoi link",              nolink),
        ("link tro sai khung",           badref),
        ("ky tu CJK",                    cjk),
        ("kieu khoi la",                 badblk),
    ]
    for label, items in checks:
        if items:
            problems += len(items)
            print("  X %-40s %s" % (label + ":", items))
    if not problems:
        print("  OK - tat ca dat chuan (%s)" % ", ".join(map(str, TARGET)))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
