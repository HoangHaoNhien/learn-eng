# -*- coding: utf-8 -*-
"""
Them truong thu 8 (phien am IPA) vao tung dong trong data/vocab.json.

Chay:  python addipa.py <file_map.tsv>

File map la TSV hai cot, moi dong mot tu:

    deadline<TAB>/ˈdedlaɪn/
    colleague<TAB>/ˈkɒliːɡ/

Khong dung json.dump de ghi lai: data/vocab.json duoc dinh dang bang tay
(moi tu dung GON MOT DONG) nen ghi lai bang json se lam xo toan bo file.
Thay vao do sua tung dong bang regex — giong cach backlink.py lam.

An toan:
  - chi sua dong co dung tu do o cot 1
  - tu da co phien am thi GHI DE (de sua loi), va bao lai o cuoi
  - tu trong map ma khong tim thay trong vocab.json thi bao loi, khong im lang
"""
import io, os, re, sys

ROOT  = os.path.dirname(os.path.abspath(__file__))
VOCAB = os.path.join(ROOT, "data", "vocab.json")

# ["tu", "loai", "nghia", "chude", "vi du", "nghia cau", 1]        -> 7 truong
# ["tu", "loai", "nghia", "chude", "vi du", "nghia cau", 1, "/ipa/"] -> 8 truong
ROW = re.compile(r'^(\s*\["((?:[^"\\]|\\.)*)",.*?,\s*)([01])(\s*,\s*"(?:[^"\\]|\\.)*")?(\],?)\s*$')


def read_map(path):
    out, bad = [], []
    with io.open(path, encoding="utf-8") as f:
        for ln, line in enumerate(f, 1):
            line = line.rstrip("\n").rstrip("\r")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) != 2 or not parts[1].strip():
                bad.append("dong %d: khong phai 2 cot ngan bang TAB -> %r" % (ln, line[:60]))
                continue
            out.append((parts[0].strip(), parts[1].strip()))
    return out, bad


def main():
    if len(sys.argv) < 2:
        print("Dung: python addipa.py <file_map.tsv>")
        return 1
    pairs, bad = read_map(sys.argv[1])
    if bad:
        print("File map co dong hong:")
        for b in bad:
            print("   - " + b)
        return 1
    if not pairs:
        print("File map rong.")
        return 1

    want = {}
    dup = []
    for w, ipa in pairs:
        if w in want:
            dup.append(w)
        want[w] = ipa
    if dup:
        print("Canh bao: tu lap trong file map (lay dong cuoi): " + ", ".join(sorted(set(dup))))

    with io.open(VOCAB, encoding="utf-8") as f:
        lines = f.read().split("\n")

    hit, over = [], []
    for i, line in enumerate(lines):
        m = ROW.match(line)
        if not m:
            continue
        word = m.group(2)
        if word not in want:
            continue
        if m.group(4):
            over.append(word)
        lines[i] = m.group(1) + m.group(3) + ', "' + want[word] + '"' + m.group(5)
        hit.append(word)

    miss = [w for w in want if w not in hit]
    if miss:
        print("LOI: khong tim thay %d tu trong data/vocab.json:" % len(miss))
        for w in sorted(miss):
            print("   - " + w)
        print("Khong ghi gi ca. Sua lai file map roi chay lai.")
        return 1

    with io.open(VOCAB, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines))

    print("OK  da them phien am cho %d tu" % len(hit))
    if over:
        print("    (%d tu da co phien am tu truoc, da ghi de: %s)"
              % (len(over), ", ".join(sorted(set(over))[:8])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
