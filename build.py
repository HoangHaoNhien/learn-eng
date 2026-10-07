# -*- coding: utf-8 -*-
"""
Gom data/index.json + data/frames/*.json thành data/bundle.js
để trang HTML mở trực tiếp bằng file:// vẫn đọc được nội dung.

Chạy:  python build.py     (hoặc double-click build.bat)
"""
import io, json, os, re, sys

ROOT    = os.path.dirname(os.path.abspath(__file__))
DATA    = os.path.join(ROOT, "data")
FRAMES  = os.path.join(DATA, "frames")
INDEX   = os.path.join(DATA, "index.json")
GRAMMAR = os.path.join(DATA, "grammar")
GINDEX  = os.path.join(DATA, "grammar.json")
VERBS   = os.path.join(DATA, "verbs.json")
VOCAB   = os.path.join(DATA, "vocab.json")
VDETAIL = os.path.join(DATA, "vocab-detail.json")
SKILLS  = os.path.join(DATA, "skills")
SINDEX  = os.path.join(DATA, "skills.json")
PLACE   = os.path.join(DATA, "placement.json")
CANDO   = os.path.join(DATA, "cando.json")
PRODUCE = os.path.join(DATA, "produce.json")
READING = os.path.join(DATA, "reading.json")
ROADMAP = os.path.join(DATA, "roadmap.json")
TOEIC   = os.path.join(DATA, "toeic.json")
BASICS  = os.path.join(DATA, "basics")
BINDEX  = os.path.join(DATA, "basics.json")
BUNDLE  = os.path.join(DATA, "bundle.js")


def read_json(path):
    with io.open(path, encoding="utf-8") as f:
        return json.load(f)


def read_dir(folder, errors, label):
    """Doc tat ca *.json trong mot thu muc, tra ve dict {id: data}."""
    out = {}
    if not os.path.isdir(folder):
        return out
    for name in sorted(os.listdir(folder)):
        if not name.lower().endswith(".json"):
            continue
        path = os.path.join(folder, name)
        try:
            data = read_json(path)
        except ValueError as e:
            errors.append("%s/%s  ->  %s" % (label, name, e))
            continue
        fid = data.get("id")
        if fid is None:
            m = re.match(r"^(\d+)", name)
            if not m:
                errors.append("%s/%s  ->  thieu truong \"id\"" % (label, name))
                continue
            fid = int(m.group(1))
            data["id"] = fid
        out[str(int(fid))] = data
    return out


def sync_detail(index, items):
    """Dat lai co "detail" trong mot muc luc cho khop voi file thuc te."""
    ids, mismatch = set(), []
    for g in index.get("groups", []):
        for it in g.get("items", []):
            ids.add(int(it["id"]))
            has = str(int(it["id"])) in items
            if bool(it.get("detail")) != has:
                mismatch.append(it["id"])
            it["detail"] = has
    orphan = [k for k in items if int(k) not in ids]
    total = sum(len(g.get("items", [])) for g in index.get("groups", []))
    return total, mismatch, orphan


def main():
    if not os.path.isfile(INDEX):
        print("LOI: khong tim thay " + INDEX)
        return 1

    try:
        index = read_json(INDEX)
    except ValueError as e:
        print("LOI cu phap JSON trong data/index.json:")
        print("   " + str(e))
        return 1

    errors = []
    frames  = read_dir(FRAMES,  errors, "data/frames")
    lessons = read_dir(GRAMMAR, errors, "data/grammar")

    gindex = None
    if os.path.isfile(GINDEX):
        try:
            gindex = read_json(GINDEX)
        except ValueError as e:
            errors.append("data/grammar.json  ->  %s" % e)

    verbs = None
    if os.path.isfile(VERBS):
        try:
            verbs = read_json(VERBS)
        except ValueError as e:
            errors.append("data/verbs.json  ->  %s" % e)

    vocab = None
    if os.path.isfile(VOCAB):
        try:
            vocab = read_json(VOCAB)
        except ValueError as e:
            errors.append("data/vocab.json  ->  %s" % e)

    # Chi tiet tung tu (dong nghia / thay the / trai nghia / cau them). File nay
    # soan dan theo chu de nen thieu la binh thuong — panel phai van chay duoc.
    vdetail = None
    if os.path.isfile(VDETAIL):
        try:
            vdetail = read_json(VDETAIL)
        except ValueError as e:
            errors.append("data/vocab-detail.json  ->  %s" % e)

    # Bai kiem tra dau vao (muc 21a). Thieu file nay thi trang kiem tra bao
    # "chua co du lieu" chu khong lam vo ca app.
    place = None
    if os.path.isfile(PLACE):
        try:
            place = read_json(PLACE)
        except ValueError as e:
            errors.append("data/placement.json  ->  %s" % e)

    # Trang "Ban dang o dau" (muc 21c)
    cando = None
    if os.path.isfile(CANDO):
        try:
            cando = read_json(CANDO)
        except ValueError as e:
            errors.append("data/cando.json  ->  %s" % e)

    # San sinh co phan hoi (muc 20): timed / prompt / roleplay
    produce = None
    if os.path.isfile(PRODUCE):
        try:
            produce = read_json(PRODUCE)
        except ValueError as e:
            errors.append("data/produce.json  ->  %s" % e)

    # Bai doc dai (muc 22)
    reading = None
    if os.path.isfile(READING):
        try:
            reading = read_json(READING)
        except ValueError as e:
            errors.append("data/reading.json  ->  %s" % e)

    # Lo trinh hoc (muc 24)
    roadmap = None
    if os.path.isfile(ROADMAP):
        try:
            roadmap = read_json(ROADMAP)
        except ValueError as e:
            errors.append("data/roadmap.json  ->  %s" % e)

    # Bai tap theo dinh dang de TOEIC (muc 25)
    toeic = None
    if os.path.isfile(TOEIC):
        try:
            toeic = read_json(TOEIC)
        except ValueError as e:
            errors.append("data/toeic.json  ->  %s" % e)

    skills = read_dir(SKILLS, errors, "data/skills")
    sindex = None
    if os.path.isfile(SINDEX):
        try:
            sindex = read_json(SINDEX)
        except ValueError as e:
            errors.append("data/skills.json  ->  %s" % e)

    basics = read_dir(BASICS, errors, "data/basics")
    bindex = None
    if os.path.isfile(BINDEX):
        try:
            bindex = read_json(BINDEX)
        except ValueError as e:
            errors.append("data/basics.json  ->  %s" % e)

    if errors:
        print("Co file JSON loi, da bo qua:")
        for e in errors:
            print("   - " + e)

    # Danh dau muc nao co bai chi tiet (dung cho dau sao trong danh sach)
    total, mismatch, orphan = sync_detail(index, frames)
    gtotal, gmismatch, gorphan = (0, [], [])
    if gindex:
        gtotal, gmismatch, gorphan = sync_detail(gindex, lessons)
    stotal, smismatch, sorphan = (0, [], [])
    if sindex:
        stotal, smismatch, sorphan = sync_detail(sindex, skills)
    btotal, bmismatch, borphan = (0, [], [])
    if bindex:
        btotal, bmismatch, borphan = sync_detail(bindex, basics)

    payload = {"index": index, "frames": frames,
               "gindex": gindex, "lessons": lessons, "verbs": verbs,
               "sindex": sindex, "skills": skills, "vocab": vocab,
               "bindex": bindex, "basics": basics, "vdetail": vdetail,
               "place": place, "cando": cando, "produce": produce,
               "reading": reading, "roadmap": roadmap, "toeic": toeic}
    js = (u"/* TU DONG SINH RA TU data/index.json + data/frames/*.json\n"
          u"   + data/grammar.json + data/grammar/*.json + data/verbs.json\n"
          u"   - DUNG SUA TAY. Sua cac file .json roi chay lai build.bat */\n"
          u"window.KC_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + u";\n")

    with io.open(BUNDLE, "w", encoding="utf-8", newline="\n") as f:
        f.write(js)

    print("OK  ->  data/bundle.js  (%.1f KB)" % (len(js.encode("utf-8")) / 1024.0))
    if bindex is None:
        print("    (chua co data/basics.json - tab nhap mon bo trong)")
    else:
        print("    %d bai nhap mon trong muc luc, %d bai da soan" % (btotal, len(basics)))
    print("    %d khung trong index, %d bai chi tiet" % (total, len(frames)))
    if gindex is None:
        print("    (chua co data/grammar.json - phan ngu phap bo trong)")
    else:
        print("    %d bai ngu phap trong muc luc, %d bai da soan" % (gtotal, len(lessons)))

    if verbs is None:
        print("    (chua co data/verbs.json - tab dong tu bat quy tac bo trong)")
    else:
        rows = verbs.get("verbs", [])
        pats = set(p["id"] for p in verbs.get("patterns", []))
        bad = sorted(set(r[4] for r in rows if len(r) < 6 or r[4] not in pats))
        print("    %d dong tu bat quy tac, %d nhom bien doi, %d tu hay gap"
              % (len(rows), len(pats), sum(1 for r in rows if len(r) > 5 and r[5])))
        if bad:
            print("    Canh bao: co dong tu tro toi nhom khong khai bao: " + ", ".join(bad))

    if sindex is None:
        print("    (chua co data/skills.json - tab ky nang bo trong)")
    else:
        print("    %d bai ky nang trong muc luc, %d bai da soan" % (stotal, len(skills)))

    if vocab is None:
        print("    (chua co data/vocab.json - tab tu vung bo trong)")
    else:
        ws = vocab.get("words", [])
        tops = [t["id"] for t in vocab.get("topics", [])]
        done = sorted(set(w[3] for w in ws))
        bad = sorted(set(w[3] for w in ws if w[3] not in tops))
        print("    %d tu vung, %d/%d chu de da soan, %d tu hay gap"
              % (len(ws), len(done), len(tops), sum(1 for w in ws if len(w) > 6 and w[6])))
        # Truong thu 8 la phien am IPA, them dan theo tung dot nen chua chac du
        ipa = [w for w in ws if len(w) > 7 and str(w[7]).strip()]
        if ipa:
            byt = {}
            for w in ws:
                has = len(w) > 7 and str(w[7]).strip()
                a, b = byt.get(w[3], (0, 0))
                byt[w[3]] = (a + (1 if has else 0), b + 1)
            left = [t for t in tops if t in byt and byt[t][0] < byt[t][1]]
            print("    %d/%d tu co phien am (%d%%)%s"
                  % (len(ipa), len(ws), round(len(ipa) * 100.0 / max(1, len(ws))),
                     ("  — con thieu: " + ", ".join(left)) if left else "  — DU CA BANG"))
        else:
            print("    (chua tu nao co phien am IPA)")
        noslash = [w[0] for w in ipa if not (str(w[7]).startswith("/") and str(w[7]).endswith("/"))]
        if noslash:
            print("    Canh bao: phien am khong boc trong dau / /: " + ", ".join(noslash[:8]))

        items = (vdetail or {}).get("items", {})
        if not items:
            print("    (chua co data/vocab-detail.json - panel phai chi co nghia + cau goc)")
        else:
            keys = set(w[0] + "|" + w[1] for w in ws)
            orphan = sorted(k for k in items if k not in keys)
            print("    %d/%d muc co chi tiet (dong nghia/trai nghia) (%d%%)"
                  % (len(items), len(ws), round(len(items) * 100.0 / max(1, len(ws)))))
            if orphan:
                print("    Canh bao: chi tiet khong khop tu nao trong vocab.json: "
                      + ", ".join(orphan[:8]))
        if bad:
            print("    Canh bao: co tu tro toi chu de khong khai bao: " + ", ".join(bad))

    # Bai kiem tra dau vao: soat cho ky, vi mot cau sai o day dieu huong nguoi hoc
    # sang nhom sai han. Ba thu phai dung: dap an co that, bai hoc co that,
    # va vi tri dap an phai RAI DEU (viet tay thi ai cung de dap an o cot dau).
    if place is not None:
        its = place.get("items", [])
        gnames = place.get("groups", [])
        lids = set()
        for g in (gindex or {}).get("groups", []):
            for it in g.get("items", []):
                lids.add(int(it["id"]))
        pos = {}
        for it in its:
            pos[it.get("a")] = pos.get(it.get("a"), 0) + 1
        bad_a = [i + 1 for i, it in enumerate(its)
                 if not isinstance(it.get("a"), int)
                 or not (0 <= it["a"] < len(it.get("opts", [])))]
        bad_l = sorted(set(it.get("lesson") for it in its
                           if it.get("lesson") not in lids))
        bad_g = sorted(set(it.get("g") for it in its
                           if not (1 <= (it.get("g") or 0) <= len(gnames))))
        print("    %d cau kiem tra dau vao, %d/%d nhom ngu phap co cau"
              % (len(its), len(set(i.get("g") for i in its)), len(gnames)))
        if bad_a:
            print("    Canh bao: cau co chi so dap an sai: "
                  + ", ".join(str(i) for i in bad_a))
        if bad_l:
            print("    Canh bao: cau tro toi bai ngu phap khong ton tai: "
                  + ", ".join(str(i) for i in bad_l))
        if bad_g:
            print("    Canh bao: cau tro toi nhom khong ton tai: "
                  + ", ".join(str(i) for i in bad_g))
        if its and max(pos.values()) > len(its) * 0.5:
            print("    Canh bao: dap an don o mot cot (%s) — nguoi hoc bam bua van dung"
                  % ", ".join("vi tri %s: %d cau" % (k, v) for k, v in sorted(pos.items())))
    else:
        print("    (chua co data/placement.json - trang kiem tra dau vao bo trong)")

    # Trang can-do: moi muc tro toi bai nao thi bai do phai CO THAT, khong thi
    # nguoi hoc bam vao mot nut dan di dau khong biet.
    if cando is not None:
        pools = {"g": set(), "s": set(), "n": set(), "f": set()}
        for key, idx in (("g", gindex), ("s", sindex), ("n", bindex), ("f", index)):
            for gg in (idx or {}).get("groups", []):
                for it in gg.get("items", []):
                    pools[key].add(int(it["id"]))
        nlv = len(cando.get("levels", []))
        nit = sum(len(l.get("items", [])) for l in cando.get("levels", []))
        broken, nolink, nocheck = [], 0, 0
        for lv in cando.get("levels", []):
            for it in lv.get("items", []):
                if not any(it.get(k) for k in pools):
                    nolink += 1
                if not it.get("task") or not it.get("ok"):
                    nocheck += 1
                for k in pools:
                    for i in it.get(k, []):
                        if int(i) not in pools[k]:
                            broken.append("%s:%s" % (k, i))
        print("    %d bac can-do, %d muc viec lam duoc" % (nlv, nit))
        if broken:
            print("    Canh bao: muc can-do tro toi bai khong ton tai: "
                  + ", ".join(sorted(set(broken))[:10]))
        if nolink:
            print("    Canh bao: %d muc can-do khong gan bai nao" % nolink)
        if nocheck:
            print("    Canh bao: %d muc can-do thieu de tu kiem chung" % nocheck)
    else:
        print("    (chua co data/cando.json - trang Ban dang o dau bo trong)")

    # San sinh co phan hoi. Thang tu soat ("must") la phan quan trong nhat cua
    # muc 20 — de nao thieu no thi nguoi hoc noi xong khong biet dua vao dau ma soat.
    if produce is not None:
        tm = produce.get("timed", [])
        ngroup = len((gindex or {}).get("groups", []))
        bad_g = sorted(set(x.get("g") for x in tm
                           if not (1 <= (x.get("g") or 0) <= ngroup)))
        thin = [i + 1 for i, x in enumerate(tm)
                if len(x.get("must", [])) < 3 or not x.get("task")]
        bad_s = [i + 1 for i, x in enumerate(tm)
                 if not isinstance(x.get("seconds"), int) or x["seconds"] < 15]
        per = {}
        for x in tm:
            per[x.get("g")] = per.get(x.get("g"), 0) + 1
        miss = [g for g in range(1, ngroup + 1) if per.get(g, 0) < 3]
        print("    %d de noi bam gio, %d/%d nhom ngu phap co du 3 de"
              % (len(tm), ngroup - len(miss), ngroup))
        if bad_g:
            print("    Canh bao: de bam gio tro toi nhom khong ton tai: "
                  + ", ".join(str(g) for g in bad_g))
        if thin:
            print("    Canh bao: de bam gio thieu thang tu soat (can >=3 y): "
                  + ", ".join(str(i) for i in thin))
        if bad_s:
            print("    Canh bao: de bam gio co so giay khong hop le: "
                  + ", ".join(str(i) for i in bad_s))
        if miss:
            print("    Canh bao: nhom chua du 3 de bam gio: "
                  + ", ".join(str(g) for g in miss))

        # De noi/viet. "check" (thang tu cham) la phan quan trong nhat theo muc 20 —
        # no thay cho mot nguoi cham bai, nen de nao thieu la de do hong.
        pr = produce.get("prompt", [])
        sids = set()
        for gg in (sindex or {}).get("groups", []):
            for it in gg.get("items", []):
                sids.add(int(it["id"]))
        bad_s = sorted(set(x.get("s") for x in pr if x.get("s") not in sids))
        thin_p = [i + 1 for i, x in enumerate(pr)
                  if len(x.get("must", [])) < 3 or len(x.get("check", [])) < 3
                  or not x.get("model") or not x.get("task")]
        bad_m = [i + 1 for i, x in enumerate(pr)
                 if x.get("mode") not in ("speak", "write")]
        perS = {}
        for x in pr:
            perS[x.get("s")] = perS.get(x.get("s"), 0) + 1
        missS = sorted(i for i in sids if perS.get(i, 0) < 2)
        print("    %d de noi/viet, %d/%d bai ky nang co du 2 de"
              % (len(pr), len(sids) - len(missS), len(sids)))
        if bad_s:
            print("    Canh bao: de noi/viet tro toi bai ky nang khong ton tai: "
                  + ", ".join(str(i) for i in bad_s))
        if thin_p:
            print("    Canh bao: de noi/viet thieu bai mau hoac thang tu cham: "
                  + ", ".join(str(i) for i in thin_p))
        if bad_m:
            print("    Canh bao: de noi/viet co mode khong hop le: "
                  + ", ".join(str(i) for i in bad_m))
        if missS:
            print("    Canh bao: bai ky nang chua du 2 de: "
                  + ", ".join(str(i) for i in missS))

        # Dong vai. Phan hoi thoai mau KHONG chep lai o day — trang lay thang tu
        # khoi "dialog" cua chinh khung do. Nen o day chi soat hai dieu: khung co
        # that, va khung do thuc su CO dialog de dung lam hoi thoai mau.
        rp = produce.get("roleplay", [])
        kcids, kcdlg = set(), set()
        for gg in index.get("groups", []):
            for it in gg.get("items", []):
                kcids.add(int(it["id"]))
        for k, doc in frames.items():
            for sec in doc.get("sections", []):
                for b2 in sec.get("blocks", []):
                    if b2.get("t") == "dialog" and b2.get("lines"):
                        kcdlg.add(int(k))
        bad_f = sorted(set(x.get("f") for x in rp if x.get("f") not in kcids))
        nodlg = sorted(set(x.get("f") for x in rp if x.get("f") not in kcdlg))
        thin_r = [x.get("f") for x in rp
                  if not x.get("you") or not x.get("them") or not x.get("goal")]
        print("    %d man dong vai, %d/%d khung cau co man"
              % (len(rp), len(set(x.get("f") for x in rp)), len(kcids)))
        if bad_f:
            print("    Canh bao: man dong vai tro toi khung khong ton tai: "
                  + ", ".join(str(i) for i in bad_f))
        if nodlg:
            print("    Canh bao: khung khong co khoi dialog de lam hoi thoai mau: "
                  + ", ".join(str(i) for i in nodlg[:10]))
        if thin_r:
            print("    Canh bao: man dong vai thieu vai hoac muc tieu: "
                  + ", ".join(str(i) for i in thin_r))
    else:
        print("    (chua co data/produce.json - trang noi va viet bo trong)")

    # Bai doc dai. Hai thu de hong nhat: bai ngan hon chuan B2, va glossary tro
    # toi tu KHONG co trong vocab.json (luc do nut mo tab Tu vung se khong tim ra).
    if reading is not None:
        rd = reading.get("items", [])
        tops = set(t["id"] for t in (vocab or {}).get("topics", []))
        pairs = set()
        for w in (vocab or {}).get("words", []):
            pairs.add((w[0], w[3]))
        short = [x["id"] for x in rd
                 if not (380 <= len(" ".join(x.get("text", [])).split()) <= 620)]
        thin = [x["id"] for x in rd if len(x.get("gloss", [])) < 15]
        badt = sorted(set(x.get("topic") for x in rd if x.get("topic") not in tops))
        badq = [x["id"] for x in rd
                if len(x.get("q", [])) != 5
                or any(len(q.get("opts", [])) != 4 for q in x.get("q", []))]
        badg = [x["id"] for x in rd
                if any((g[0], x["topic"]) not in pairs for g in x.get("gloss", []))]
        kinds = [x["id"] for x in rd
                 if [q.get("kind") for q in x.get("q", [])].count("main") != 2
                 or [q.get("kind") for q in x.get("q", [])].count("detail") != 2
                 or [q.get("kind") for q in x.get("q", [])].count("guess") != 1]
        print("    %d bai doc dai, %d chu de tu vung duoc dung lai"
              % (len(rd), len(set(x.get("topic") for x in rd))))
        for lbl, lst in (("ngan/dai ngoai 380-620 tu", short),
                         ("duoi 15 tu chu de", thin),
                         ("cau hoi khong dung 5 cau x 4 phuong an", badq),
                         ("khong du 2 y chinh + 2 chi tiet + 1 doan nghia", kinds),
                         ("glossary tro toi tu khong co trong vocab.json", badg)):
            if lst:
                print("    Canh bao: bai " + ", ".join(str(i) for i in lst) + " - " + lbl)
        if badt:
            print("    Canh bao: bai doc tro toi chu de khong khai bao: " + ", ".join(badt))
    else:
        print("    (chua co data/reading.json - trang doc doan dai bo trong)")

    # Lo trinh. Thu de hong nhat la mot chu de tu vung BI BO QUEN: no se khong
    # bao gio xuat hien trong bat ky chang nao, va nguoi hoc khong co duong nao
    # di toi no. Nen soat ca hai chieu: phu kin, va khong lap.
    if roadmap is not None:
        st = roadmap.get("stages", [])
        gids = set()
        for gg in (gindex or {}).get("groups", []):
            for it in gg.get("items", []):
                gids.add(int(it["id"]))
        ngroup = len((gindex or {}).get("groups", []))
        tops = [t["id"] for t in (vocab or {}).get("topics", [])]
        used = []
        for x in st:
            used.extend(x.get("topics", []))
        miss = [t for t in tops if t not in used]
        dup = sorted(set(t for t in used if used.count(t) > 1))
        ghost = sorted(set(t for t in used if t not in tops))
        bad_g = sorted(set(x.get("g") for x in st
                           if x.get("g") and not (1 <= x["g"] <= ngroup)))
        no_goal = [x.get("n") for x in st if not x.get("goal")]
        print("    %d chang lo trinh, %d/%d chu de tu vung duoc phu"
              % (len(st), len(tops) - len(miss), len(tops)))
        if miss:
            print("    Canh bao: chu de khong nam trong chang nao: "
                  + ", ".join(miss))
        if dup:
            print("    Canh bao: chu de bi lap o nhieu chang: " + ", ".join(dup))
        if ghost:
            print("    Canh bao: chang tro toi chu de khong co that: "
                  + ", ".join(ghost))
        if bad_g:
            print("    Canh bao: chang tro toi nhom ngu phap khong co that: "
                  + ", ".join(str(g) for g in bad_g))
        if no_goal:
            print("    Canh bao: chang thieu muc tieu: "
                  + ", ".join(str(n) for n in no_goal))
    else:
        print("    (chua co data/roadmap.json - tab Lo trinh bo trong)")

    # TOEIC. Hai thu de hong nhat:
    #   1. dap an don het vao mot cot -> bam bua cung dung (bai hoc tu muc 21a)
    #   2. cau thieu dung MOT cho trong "____", hoac khong du 4 lua chon
    if toeic is not None:
        tags = toeic.get("tags", {})
        tot, bad_opt, bad_gap, bad_tag, no_why, thin = 0, [], [], [], [], []
        no_trap = []
        pos = {}
        count = {}

        def _qs(x):
            # Mot muc co the la MOT cau (Part 5) hoac mot van ban kem nhieu cau
            # (Part 7). Ham nay tra ve danh sach cau cho ca hai dang.
            return x["qs"] if isinstance(x.get("qs"), list) else [x]

        for part in toeic.get("parts", []):
            key = "p%d" % part.get("p", 0)
            bank = toeic.get(key, [])
            nopt = part.get("nopt", 4)      # Part 2 chi co 3 lua chon
            count[key] = 0
            for i, x in enumerate(bank, 1):
                if isinstance(x.get("qs"), list):
                    # Hai hinh dang khac nhau: HOI THOAI (who + lines) va VAN BAN
                    # DOC (kind + title + text). Soat theo hinh dang that.
                    if isinstance(x.get("lines"), list):
                        ok_shape = bool(x.get("who")) and len(x["lines"]) >= 4
                    else:
                        ok_shape = bool(x.get("kind") and x.get("title") and x.get("text"))
                    if not ok_shape:
                        thin.append("%s#%d" % (key, i))
                for j, q in enumerate(_qs(x), 1):
                    tot += 1
                    count[key] += 1
                    lab = "%s#%d" % (key, i) + (".%d" % j if isinstance(x.get("qs"), list) else "")
                    o = q.get("opts", [])
                    aa = q.get("a")
                    if len(o) != nopt or not isinstance(aa, int) or not (0 <= aa < nopt):
                        bad_opt.append(lab)
                    else:
                        pos[aa] = pos.get(aa, 0) + 1
                    if key == "p5" and (q.get("q") or "").count("____") != 1:
                        bad_gap.append(lab)
                    if q.get("tag") and q["tag"] not in tags:
                        bad_tag.append(q["tag"])
                    if not q.get("why"):
                        no_why.append(lab)
                    # "trap" chi bat buoc o dang nghe MOT CAU (Part 2): ba cau dap
                    # gan giong nhau nen phai noi ro minh bi lua kieu gi. Dang nghe
                    # NHIEU CAU (Part 3) la nghe hieu, khong co bay kieu do.
                    if (part.get("audio") and not isinstance(x.get("qs"), list)
                            and not q.get("trap")):
                        no_trap.append(lab)
        names = ", ".join("Part %d: %d cau" % (pp.get("p"), count.get("p%d" % pp.get("p"), 0))
                          for pp in toeic.get("parts", []))
        print("    TOEIC %d cau (%s)" % (tot, names))
        if bad_opt:
            print("    Canh bao: cau sai so lua chon hoac chi so dap an: "
                  + ", ".join(bad_opt[:8]))
        if bad_gap:
            print("    Canh bao: cau Part 5 khong co dung mot cho trong ____: "
                  + ", ".join(bad_gap[:8]))
        if bad_tag:
            print("    Canh bao: loai cau khong khai bao trong \"tags\": "
                  + ", ".join(sorted(set(bad_tag))))
        if no_why:
            print("    Canh bao: cau thieu giai thich: " + ", ".join(no_why[:8]))
        if thin:
            print("    Canh bao: muc thieu truong bat buoc (who+lines hoac "
                  "kind+title+text): " + ", ".join(thin[:8]))
        if no_trap:
            print("    Canh bao: cau phan nghe thieu giai thich bay: "
                  + ", ".join(no_trap[:8]))
        if tot and max(pos.values()) > tot * 0.35:
            print("    Canh bao: dap an don ve mot cot (%s) - bam bua van dung"
                  % ", ".join("%s:%d" % (k, v) for k, v in sorted(pos.items())))
    else:
        print("    (chua co data/toeic.json - tab TOEIC bo trong)")

    # Muc 19b: nghe giong nguoi that qua link ngoai. Hai dieu phai soat, vi ca hai
    # deu lam nguoi hoc mat long tin neu sai:
    #   1. moi muc PHAI con en + vi + focus  -> link chet thi bai van dung duoc
    #   2. link phai la https va thuoc mien da chot -> khong de lot mot dia chi doan
    OK_HOST = ("youglish.com", "www.bbc.co.uk", "bbc.co.uk")
    lsn_n, lsn_doc, lsn_bad, lsn_host = 0, [], [], []
    for key, doc in sorted(skills.items(), key=lambda kv: int(kv[0])):
        for sec in doc.get("sections", []):
            for blk in sec.get("blocks", []):
                if blk.get("t") != "listen":
                    continue
                lsn_doc.append(int(key))
                for it in blk.get("items", []):
                    lsn_n += 1
                    if not (it.get("en") and it.get("vi") and it.get("focus")):
                        lsn_bad.append("%s:%s" % (key, it.get("en", "?")))
                    u = it.get("url")
                    if u and not (u.startswith("https://")
                                  and any(("//" + h) in u or ("." + h) in u for h in OK_HOST)):
                        lsn_host.append(u)
                for m in blk.get("more", []):
                    u = m.get("url", "")
                    if not (u.startswith("https://")
                            and any(("//" + h) in u for h in OK_HOST)):
                        lsn_host.append(u)
    if lsn_doc:
        print("    %d muc nghe giong nguoi that, %d bai ky nang co khoi listen"
              % (lsn_n, len(set(lsn_doc))))
        if lsn_bad:
            print("    Canh bao: muc nghe thieu en/vi/focus (link chet la mat han): "
                  + ", ".join(lsn_bad[:8]))
        if lsn_host:
            print("    Canh bao: link ngoai khong thuoc mien da chot: "
                  + ", ".join(sorted(set(lsn_host))[:5]))
    else:
        print("    (chua bai ky nang nao co khoi listen - muc 19b)")

    if mismatch:
        print("    Da dong bo co \"detail\" cho khung: " + ", ".join(str(i) for i in mismatch) +
              "  (nen sua lai trong data/index.json de che do server cung khop)")
    if gmismatch:
        print("    Da dong bo co \"detail\" cho bai ngu phap: " + ", ".join(str(i) for i in gmismatch) +
              "  (nen sua lai trong data/grammar.json)")
    if smismatch:
        print("    Da dong bo co \"detail\" cho bai ky nang: " + ", ".join(str(i) for i in smismatch) +
              "  (nen sua lai trong data/skills.json)")
    if bmismatch:
        print("    Da dong bo co \"detail\" cho bai nhap mon: " + ", ".join(str(i) for i in bmismatch) +
              "  (nen sua lai trong data/basics.json)")
    if borphan:
        print("    Canh bao: co file basics khong co trong basics.json: " + ", ".join(sorted(borphan)))
    if sorphan:
        print("    Canh bao: co file skills khong co trong skills.json: " + ", ".join(sorted(sorphan)))
    if orphan:
        print("    Canh bao: co file frame khong co trong index.json: " + ", ".join(sorted(orphan)))
    if gorphan:
        print("    Canh bao: co file grammar khong co trong grammar.json: " + ", ".join(sorted(gorphan)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
