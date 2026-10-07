# -*- coding: utf-8 -*-
"""Dong bo truong "group" cua tung bai ngu phap theo data/grammar.json.

Muc luc la nguon su that duy nhat ve nhom va thu tu hoc. Khi sap xep lai menu,
chay script nay de truong "group" trong tung file data/grammar/NNN.json khop lai
(no hien o dong eyebrow phia tren tieu de bai).

    python regroup.py            # mac dinh: ngu phap
    python regroup.py skills     # tab ky nang

So ID cua bai KHONG bao gio doi — moi tham chieu [Ngu phap NN] / [Ky nang NN],
khoi "link" va truong "grammar" cua 100 khung cau deu bam vao ID.
"""

import io
import json
import os
import re
import sys

GROUP_LINE = re.compile(r'^(\s*)"group":\s*".*?",\s*$')


def main():
    what = sys.argv[1] if len(sys.argv) > 1 else "grammar"
    GINDEX = os.path.join("data", what + ".json")
    GRAMMAR = os.path.join("data", what)
    if not os.path.isfile(GINDEX):
        print("LOI: khong tim thay " + GINDEX)
        return 1

    with io.open(GINDEX, encoding="utf-8") as fh:
        index = json.load(fh)

    want, seen = {}, []
    for g in index["groups"]:
        for it in g["items"]:
            if it["id"] in want:
                print("  LOI id %s xuat hien hai lan trong muc luc" % it["id"])
                return 1
            want[it["id"]] = g["name"]
            seen.append(it["id"])

    changed = missing = 0
    for gid in seen:
        path = os.path.join(GRAMMAR, "%03d.json" % gid)
        if not os.path.exists(path):
            missing += 1
            continue

        text = io.open(path, encoding="utf-8").read()
        lines = text.split("\n")
        new = '"group": %s,' % json.dumps(want[gid], ensure_ascii=False)

        for i, line in enumerate(lines):
            m = GROUP_LINE.match(line)
            if m:
                if line.strip() == new:
                    break
                lines[i] = m.group(1) + new
                with io.open(path, "w", encoding="utf-8", newline="") as fh:
                    fh.write("\n".join(lines))
                changed += 1
                break
        else:
            print("  LOI %s: khong tim thay dong \"group\"" % os.path.basename(path))
            return 1

    print("OK  ->  %d bai trong muc luc, %d bai da soan, %d file duoc sua nhom"
          % (len(seen), len(seen) - missing, changed))
    if missing:
        print("    %d bai chua co file (binh thuong neu dang soan do)" % missing)
    return 0


if __name__ == "__main__":
    sys.exit(main())
