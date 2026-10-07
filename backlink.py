# -*- coding: utf-8 -*-
"""Rai tham chieu nguoc tu 100 khung cau sang 50 bai ngu phap.

Doc data/grammar/*.json, dung ban do nguoc  khung -> bai ngu phap,
roi ghi truong "grammar": [id, ...] vao tung file data/frames/NNN.json.

Thu tu uu tien khi chon bai cho mot khung:
  1. Bai co khoi "link" tro thang toi khung do  (lien ket da bien tap)
  2. Bai co khung do trong mang "frames"        (lien ket nen)
  3. Ban do tay MANUAL ben duoi                 (cho khung chua ai tro toi)

Chay lai bat cu luc nao sau khi sua cac bai ngu phap:
    python backlink.py
"""

import glob
import io
import json
import os
import re
import sys

FRAMES = os.path.join("data", "frames")
GRAMMAR = os.path.join("data", "grammar")
MAX_PER_FRAME = 4

# Khung chua duoc bai nao tro toi -> gan bang tay, theo noi dung tung khung.
MANUAL = {
    1:  [24, 29], 2:  [24, 1],  3:  [24, 31], 5:  [25, 24], 6:  [24, 2],
    7:  [24, 47], 8:  [32, 29], 9:  [15, 29], 10: [45, 24], 11: [29, 44],
    12: [29, 44], 13: [24, 44], 14: [14, 44], 15: [29, 43], 16: [44, 47],
    18: [24, 29], 19: [29, 22], 20: [27, 29], 21: [29, 30], 22: [14, 29],
    24: [29, 30], 25: [24, 25], 26: [31, 29], 29: [43, 27], 30: [24, 29],
    31: [27, 44], 32: [44, 32], 33: [25, 24], 34: [44, 29], 35: [24, 44],
    36: [29, 30], 38: [32, 29], 39: [30, 32], 40: [44, 43], 47: [50, 43],
    48: [45, 43], 49: [14, 50], 56: [49, 44], 58: [42, 35],
    64: [41, 44], 71: [1, 23],  78: [25, 42], 83: [27, 34], 90: [47, 34],
}


def read_json(path):
    with io.open(path, encoding="utf-8") as fh:
        return json.load(fh)


MEANING = re.compile(r'^(\s*)"meaning":\s.*,\s*$')
GRAMMAR_LINE = re.compile(r'^(\s*)"grammar":\s*\[[^\]]*\],?\s*$')


def set_grammar(path, ids):
    """Chen/thay dong "grammar" ngay sau dong "meaning", giu nguyen moi dong khac.

    Khong dung json.dump de ghi lai vi cac file khung cau duoc dinh dang bang tay —
    ghi lai bang json.dump se lam xao tron toan bo 100 file.
    """
    text = io.open(path, encoding="utf-8").read()
    lines = text.split("\n")
    new = '"grammar": [%s],' % ", ".join(str(i) for i in ids)

    for i, line in enumerate(lines):
        if GRAMMAR_LINE.match(line):
            if line.strip().rstrip(",") == new.rstrip(","):
                return False
            lines[i] = GRAMMAR_LINE.match(line).group(1) + new
            break
    else:
        for i, line in enumerate(lines):
            m = MEANING.match(line)
            if m:
                lines.insert(i + 1, m.group(1) + new)
                break
        else:
            raise ValueError("%s: khong tim thay dong \"meaning\"" % path)

    with io.open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write("\n".join(lines))
    return True


def build_reverse():
    """Tra ve (tu_link, tu_frames, tieu_de) — hai ban do khung -> [bai]."""
    from_link, from_frames, titles = {}, {}, {}
    for path in sorted(glob.glob(os.path.join(GRAMMAR, "*.json"))):
        d = read_json(path)
        gid = d["id"]
        titles[gid] = d.get("title", "")
        for fid in d.get("frames", []):
            from_frames.setdefault(fid, []).append(gid)
        for sec in d.get("sections", []):
            for b in sec.get("blocks", []):
                if b.get("t") == "link":
                    for it in b.get("items", []):
                        from_link.setdefault(it["id"], []).append(gid)
    return from_link, from_frames, titles


def pick(fid, from_link, from_frames):
    out = []
    for source in (from_link.get(fid, []), from_frames.get(fid, []), MANUAL.get(fid, [])):
        for gid in source:
            if gid not in out:
                out.append(gid)
            if len(out) >= MAX_PER_FRAME:
                return out
    return out


def main():
    from_link, from_frames, titles = build_reverse()
    changed = empty = 0

    for path in sorted(glob.glob(os.path.join(FRAMES, "*.json"))):
        d = read_json(path)
        ids = pick(d["id"], from_link, from_frames)
        bad = [g for g in ids if g not in titles]
        if bad:
            print("  LOI %s -> bai khong ton tai: %s" % (os.path.basename(path), bad))
            return 1
        if not ids:
            empty += 1
            print("  TRONG %s khong co bai ngu phap nao" % os.path.basename(path))
        if set_grammar(path, ids):
            changed += 1

    total = len(glob.glob(os.path.join(FRAMES, "*.json")))
    print("OK  ->  %d/%d khung co back-link (%d file duoc ghi lai)"
          % (total - empty, total, changed))
    return 1 if empty else 0


if __name__ == "__main__":
    sys.exit(main())
