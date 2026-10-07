/* Smoke test: nap trang bang jsdom theo duong file:// (nhanh bundle.js),
   roi lan luot mo khung cau, bai ngu phap va Tu dien loi. */
const { JSDOM } = require("jsdom");
const path = require("path");
const fs = require("fs");

const PAGE = path.join(__dirname, "khung-cau-giao-tiep.html");
const errors = [];

const dom = new JSDOM(fs.readFileSync(PAGE, "utf8"), {
  url: "file:///" + PAGE.replace(/\\/g, "/"),
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
});
const win = dom.window;
win.addEventListener("error", (e) => errors.push("window.error: " + (e.error && e.error.stack || e.message)));
win.onerror = (m, s, l, c, err) => errors.push("onerror: " + (err && err.stack || m));
const origErr = win.console.error;
win.console.error = (...a) => { errors.push("console.error: " + a.join(" ")); origErr(...a); };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const text = (sel) => { const e = win.document.querySelector(sel); return e ? e.textContent.trim() : "(khong co)"; };
const count = (sel) => win.document.querySelectorAll(sel).length;

function check(label, cond, detail) {
  console.log((cond ? "  OK   " : "  FAIL ") + label + (detail ? "  -> " + detail : ""));
  if (!cond) errors.push("CHECK FAIL: " + label + (detail ? " -> " + detail : ""));
}

(async () => {
  await wait(2500);
  const d = win.document;

  console.log("== Khoi dong ==");
  check("bundle.js nap duoc", !!win.KC_DATA, "KC_DATA keys: " + (win.KC_DATA ? Object.keys(win.KC_DATA).join(",") : "-"));
  check("tieu de trang", d.getElementById("appTitle").textContent.length > 0, text("#appTitle"));
  // Nguoi moi mo app vao thang tab Khoa hoc; cac kiem tra phia duoi bat dau tu tab Khung cau
  check("mo app vao tab Khoa hoc", win.MODE === "lt", win.MODE);
  win.setMode("kc");
  await wait(400);
  check("sidebar co muc", count("#list .item") > 10, count("#list .item") + " muc");
  const nSpecial = (m) => win.SPECIAL.filter(sp => sp[3] === "both" || sp[3] === m).length;
  check("trang phu o che do khung cau dung bang bang SPECIAL",
        count("#list > div:first-child .item") === nSpecial("kc"),
        [...d.querySelectorAll("#list > div:first-child .item b")].map(b => b.textContent).join(" | "));

  console.log("== Khung cau 001: back-link ngu phap ==");
  win.show(1);
  await wait(400);
  check("hien khung 01", text("main h1").indexOf("like") > -1, text("main h1"));
  check("co dai back-link .gback", count("main .gback") === 1);
  const gl = [...d.querySelectorAll("main .gback .lnk a")];
  check("back-link tro sang bai ngu phap", gl.length >= 1 && gl.every(a => /^g\d+$/.test(a.getAttribute("data-go"))),
        gl.map(a => a.getAttribute("data-go") + " " + a.querySelector("b").textContent).join(" | "));

  console.log("== Bam back-link -> nhay sang bai ngu phap ==");
  gl[0].dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
  await wait(400);
  check("da sang che do ngu phap", d.querySelector('#tabs button[data-m="ng"]').classList.contains("on"));
  check("hien mot bai ngu phap", text(".eyebrow").indexOf("Bài") > -1, text(".eyebrow"));
  check("bai ngu phap co 9 muc", count("main h2") === 9, count("main h2") + " muc");
  const spNames = [...d.querySelectorAll("#list > div:not(.pt-hint) .item b")]
                    .map(b => b.textContent);
  check("trang phu o che do ngu phap: 4 trang (dau vao, chang, ban o dau, tu dien loi)",
        spNames.length === 4 && spNames.join("|").includes("Ki\u1ec3m tra \u0111\u1ea7u v\u00e0o")
        && spNames.join("|").includes("Ki\u1ec3m tra ch\u1eb7ng")
        && spNames.join("|").includes("B\u1ea1n \u0111ang \u1edf \u0111\u00e2u")
        && spNames.join("|").includes("T\u1eeb \u0111i\u1ec3n l\u1ed7i"), spNames.join(" | "));
  check("dai goi y kiem tra dau vao dung dau thanh ben tab Ngu phap",
        !!d.querySelector("#list > .pt-hint"),
        d.querySelector("#list > .pt-hint") ? "co" : "khong co");

  console.log("== Muc 21a: bai kiem tra dau vao ==");
  const lessonBefore = win.current;   // tra lai bai dang mo khi xong khoi nay
  const PL = win.KC_DATA.place;
  check("co du lieu placement trong bundle", !!PL && Array.isArray(PL.items),
        PL ? PL.items.length + " cau" : "khong co");
  check("du 30 cau, phu kin 12 nhom",
        PL.items.length === 30 && new Set(PL.items.map(i => i.g)).size === 12,
        PL.items.length + " cau / " + new Set(PL.items.map(i => i.g)).size + " nhom");
  // Viet tay thi dap an dung hay nam o cot dau — ai bam bua van duoc diem toi da.
  const posCount = {};
  PL.items.forEach(i => { posCount[i.a] = (posCount[i.a] || 0) + 1; });
  check("vi tri dap an rai deu, khong don mot cot",
        Math.max(...Object.values(posCount)) <= PL.items.length * 0.5,
        JSON.stringify(posCount));
  // Moi cau tro toi mot bai ngu phap CO THAT, neu khong nut "Mo bai" se vo tac dung.
  const lessonIds = new Set();
  win.KC_DATA.gindex.groups.forEach(g => g.items.forEach(it => lessonIds.add(it.id)));
  const badLesson = PL.items.filter(i => !lessonIds.has(i.lesson)).map(i => i.lesson);
  check("moi cau tro toi mot bai ngu phap co that", badLesson.length === 0,
        badLesson.join(", ") || "deu ton tai");
  const badA = PL.items.filter(i => !(i.a >= 0 && i.a < i.opts.length));
  check("chi so dap an nam trong so lua chon", badA.length === 0, badA.length + " cau sai");

  win.show("pt");
  await wait(300);
  check("mo duoc trang kiem tra dau vao",
        text("main h1").includes("Ki\u1ec3m tra \u0111\u1ea7u v\u00e0o"), text("main h1"));
  check("ve du 30 cau hoi", count("main .pt-q") === 30, count("main .pt-q") + " cau");
  check("chua tra loi thi nut xem ket qua bi khoa",
        d.getElementById("ptDone") && d.getElementById("ptDone").disabled,
        d.getElementById("ptDone") ? d.getElementById("ptDone").textContent : "khong co nut");

  // Tra loi DUNG het -> phai ra B2 va khong nhom nao duoi nguong
  PL.items.forEach((it, i) => {
    const btns = d.querySelectorAll('.pt-opts button[data-q="' + i + '"]');
    btns[it.a].dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
  await wait(200);
  d.getElementById("ptDone").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  const resAll = win.PT.res;
  check("dung het -> xep B2", resAll.lv === "B2" && resAll.right === 30,
        resAll.lv + " / " + resAll.right + " cau dung");
  check("dung het -> khong chi nhom nao de bat dau", resAll.start === 0, "start=" + resAll.start);

  // Tra loi SAI het -> phai tut ve A1 va chi dung Nhom 1
  win.show("pt");
  await wait(300);
  PL.items.forEach((it, i) => {
    const btns = d.querySelectorAll('.pt-opts button[data-q="' + i + '"]');
    btns[(it.a + 1) % btns.length].dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
  await wait(200);
  d.getElementById("ptDone").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  const resNone = win.PT.res;
  check("sai het -> xep A1", resNone.lv === "A1" && resNone.right === 0,
        resNone.lv + " / " + resNone.right + " cau dung");
  check("sai het -> chi bat dau tu Nhom 1", resNone.start === 1, "start=" + resNone.start);
  check("dai goi y doc duoc ket qua vua luu",
        d.querySelector("#list > .pt-hint").textContent.includes("A1"),
        d.querySelector("#list > .pt-hint").textContent.trim().slice(0, 60));

  check("trang ket qua van hien khi khong co localStorage (file:// = opaque origin)",
        count("main .pt-res") === 1 && text("main .pt-res .lv").length > 0,
        text("main .pt-res .lv"));
  console.log("== Muc 21b: kiem tra chang ==");
  win.show("cp");
  await wait(400);
  check("mo duoc trang kiem tra chang",
        text("main h1").includes("Ki\u1ec3m tra ch\u1eb7ng"), text("main h1"));
  check("menu liet ke du 12 nhom", count("main .ot-card[data-g]") === 12,
        count("main .ot-card[data-g]") + " nhom");

  // Moi nhom phai rut duoc du 15 cau — neu khong de bi hut, nguoi hoc lam bai cut
  const supply = [];
  for (let g = 1; g <= 12; g++) {
    const docs = await win.cpLoadGroup(g);
    const all = win.cpHarvest(docs);
    const picked = win.cpPick(all);
    supply.push({ g, all: all.length, picked: picked.length });
    // Dap an phai nam trong so lua chon, va moi cau phai tro ve mot bai co that
    const bad = picked.filter(q => !(q.a >= 0 && q.a < q.opts.length) || !win.KC_DATA.lessons[q.lesson]);
    if (bad.length) supply[supply.length - 1].bad = bad.length;
  }
  check("moi nhom rut du 15 cau", supply.every(x => x.picked === 15),
        supply.map(x => "N" + x.g + ":" + x.picked).join(" "));
  check("khong cau nao sai chi so dap an hay tro toi bai khong co",
        supply.every(x => !x.bad), supply.filter(x => x.bad).map(x => "N" + x.g).join(" ") || "sach");

  // Dao thu tu: hai lan ra de cua cung mot nhom khong duoc giong het nhau
  const docs3 = await win.cpLoadGroup(3);
  const a1 = win.cpPick(win.cpHarvest(docs3)).map(q => q.opts.join("|")).join("#");
  const a2 = win.cpPick(win.cpHarvest(docs3)).map(q => q.opts.join("|")).join("#");
  check("de duoc dao thu tu moi lan ra", a1 !== a2, a1 === a2 ? "hai de giong het" : "khac nhau");

  // Lam that mot bai: nhom 3, tra loi dung het -> phai dat
  win.cpStart(3);
  await wait(900);
  check("vao de nhom 3, ve du 15 cau", count("main .pt-q") === 15, count("main .pt-q") + " cau");
  // Trong luc LAM BAI khong duoc lo bai goc (muc 21b: "giau bai goc")
  check("luc lam bai khong lo bai goc", count("main button[data-go]") === 0,
        count("main button[data-go]") + " nut lo bai");
  win.CP.qs.forEach((q, i) => {
    d.querySelectorAll('.pt-opts button[data-q="' + i + '"]')[q.a]
     .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
  await wait(200);
  d.getElementById("cpDone").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("dung het -> 100% va dat", win.CP.res.pc === 100 && win.CP.res.ok === 15,
        win.CP.res.pc + "% (" + win.CP.res.ok + "/" + win.CP.res.n + ")");
  check("cham xong moi lo bai goc", count("main button[data-go]") === 15,
        count("main button[data-go]") + " nut");

  // Sai het -> phai chi ra nhung bai can hoc lai
  win.cpStart(3);
  await wait(900);
  win.CP.qs.forEach((q, i) => {
    const bs = d.querySelectorAll('.pt-opts button[data-q="' + i + '"]');
    bs[(q.a + 1) % bs.length].dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
  await wait(200);
  d.getElementById("cpDone").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("sai het -> 0% va chua dat", win.CP.res.pc === 0, win.CP.res.pc + "%");
  check("chua dat -> chi thang bai can hoc lai",
        Object.keys(win.CP.res.miss).length > 0 && count("main .pt-res .pt-gs .g") > 0,
        Object.keys(win.CP.res.miss).length + " bai");

  console.log("== Muc 21c: trang Ban dang o dau ==");
  const CD = win.KC_DATA.cando;
  check("co du lieu cando trong bundle", !!CD && Array.isArray(CD.levels),
        CD ? CD.levels.length + " bac" : "khong co");
  const cdItems = CD.levels.reduce((a, l) => a.concat(l.items), []);
  // 24 muc goc (muc 21c) + 6 muc them o muc 26 cho chang 2, 8, 9, 13
  check("4 bac, 30 muc viec lam duoc",
        CD.levels.length === 4 && cdItems.length === 30,
        CD.levels.length + " bac / " + cdItems.length + " muc");
  // Moi muc phai co de tu kiem chung VA moc dat — thieu mot trong hai thi nguoi hoc
  // khong tu xac nhan duoc, trang chi con la mot danh sach uoc muon.
  const noCheck = cdItems.filter(i => !i.task || !i.ok);
  check("muc nao cung co de tu kiem chung va moc dat", noCheck.length === 0,
        noCheck.length + " muc thieu");
  // Moi muc phai gan it nhat mot bai, va bai do phai CO THAT
  const pools = {
    g: new Set(), s: new Set(), n: new Set(), f: new Set(),
  };
  [["g", "gindex"], ["s", "sindex"], ["n", "bindex"], ["f", "index"]].forEach(([k, src]) => {
    win.KC_DATA[src].groups.forEach(g => g.items.forEach(it => pools[k].add(it.id)));
  });
  const noLink = cdItems.filter(i => !["g", "s", "n", "f"].some(k => (i[k] || []).length));
  check("muc nao cung gan it nhat mot bai", noLink.length === 0, noLink.length + " muc troi");
  const broken = [];
  cdItems.forEach(i => ["g", "s", "n", "f"].forEach(k =>
    (i[k] || []).forEach(id => { if (!pools[k].has(id)) broken.push(k + ":" + id); })));
  check("moi bai duoc gan deu co that", broken.length === 0,
        broken.join(", ") || "deu ton tai");

  win.show("cd");
  await wait(400);
  check("mo duoc trang Ban dang o dau",
        text("main h1").includes("B\u1ea1n \u0111ang \u1edf \u0111\u00e2u"), text("main h1"));
  check("ve du 4 bac va du muc",
        count("main .cd-lv") === 4 && count("main .cd-it") === cdItems.length,
        count("main .cd-lv") + " bac / " + count("main .cd-it") + " muc");
  check("muc nao cung ve de tu kiem chung", count("main .cd-task") === cdItems.length,
        count("main .cd-task") + " khoi");
  check("co nut dan toi bai hoc", count("main .cd-links button") >= 24,
        count("main .cd-links button") + " nut");

  // Tich mot muc -> phai doi trang thai va dem lai
  const box0 = d.querySelector("main .cd-it .bx");
  box0.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("tich duoc mot muc va bo dem len",
        count("main .cd-it.on") === 1 && text("main .sub").includes("1/" + cdItems.length),
        count("main .cd-it.on") + " muc da tich");
  d.querySelector("main .cd-it .bx").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("bo tich duoc", count("main .cd-it.on") === 0, count("main .cd-it.on") + " muc");

  // Nut dan phai thuc su mo ra bai do
  win.show("cd");
  await wait(300);
  d.querySelector('main .cd-links button[data-k="g"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(500);
  check("bam nut dan thi mo dung bai ngu phap",
        text(".eyebrow").includes("B\u00e0i"), text(".eyebrow"));

  console.log("== Muc 19a: nghe chep chinh ta ==");
  // Ham cham la thu quan trong nhat cua muc nay — sai o day thi nguoi hoc bi bao
  // sai nhung cho ho go dung. Kiem rieng truoc khi dung toi giao dien.
  const G = (said, target) => win.dtGrade(said, target);
  let g = G("I had my hair cut yesterday.", "I had my hair cut yesterday.");
  check("go dung het -> 100%", g.pc === 100 && g.extra.length === 0, g.pc + "%");
  g = G("i had my hair cut yesterday", "I had my hair cut yesterday.");
  check("khong phan biet hoa thuong va dau cau", g.pc === 100, g.pc + "%");
  g = G("I dont like it", "I don't like it.");
  check("dau nhay cong hay thang deu tinh la dung", g.pc === 100, g.pc + "%");
  // Day la ly do dung LCS thay vi so theo vi tri: sot MOT tu o dau cau thi
  // nhung tu con lai van phai duoc tinh dung.
  g = G("had my hair cut yesterday", "I had my hair cut yesterday");
  check("sot mot tu dau cau: 5/6 chu khong phai 0/6",
        g.ok === 5 && g.n === 6 && g.hit[0] === false,
        g.ok + "/" + g.n);
  g = G("I really had my hair cut yesterday", "I had my hair cut yesterday");
  check("go thua mot tu: van dung het, tu thua bi tach rieng",
        g.ok === 6 && g.extra.length === 1 && g.extra[0] === "really",
        g.ok + "/" + g.n + " · thua: " + g.extra.join(","));
  g = G("", "I had my hair cut yesterday");
  check("bo trong -> 0%", g.pc === 0 && g.hit.every(x => !x), g.pc + "%");
  g = G("She had her car repaired", "I had my hair cut yesterday");
  check("go cau khac han -> diem thap", g.pc < 50, g.pc + "%");

  win.show("dt");
  await wait(1200);
  check("mo duoc trang nghe chep",
        text("main h1").includes("Nghe ch\u00e9p ch\u00ednh t\u1ea3"), text("main h1"));
  // Chi tieu ke hoach la ~1.000 cau phu toan bo tai lieu
  check("gom duoc tren 1.000 cau nghe chep", win.DT.pool.length > 1000,
        win.DT.pool.length + " cau");
  const bySrc = {};
  win.DT.pool.forEach(q => { bySrc[q.src] = (bySrc[q.src] || 0) + 1; });
  check("du ca bon nguon tai lieu",
        ["nm", "kc", "ng", "sk"].every(k => bySrc[k] > 0), JSON.stringify(bySrc));
  // Cau qua ngan khong con la bai nghe, qua dai thanh bai tri nho
  const badLen = win.DT.pool.filter(q => {
    const w = q.en.split(/\s+/).length; return w < 3 || w > 14;
  });
  check("moi cau dai 3-14 tu", badLen.length === 0, badLen.length + " cau ngoai khoang");
  const noVi = win.DT.pool.filter(q => !q.vi || !q.en);
  check("cau nao cung co ca tieng Anh lan nghia tieng Viet", noVi.length === 0,
        noVi.length + " cau thieu");
  // Moi cau phai tro ve mot bai co that de nut "Mo bai" dung duoc
  const docOf = { nm: "basics", kc: "frames", ng: "lessons", sk: "skills" };
  const badDoc = win.DT.pool.filter(q => !win.KC_DATA[docOf[q.src]][q.lesson]);
  check("moi cau tro ve mot bai co that", badDoc.length === 0,
        badDoc.length + " cau tro sai");

  check("co o go va nut nghe", !!d.getElementById("dtIn") && !!d.getElementById("dtPlay"),
        d.getElementById("dtIn") ? "co" : "khong");
  // Cham that qua giao dien: go dung y nguyen cau dang hoi
  d.getElementById("dtIn").value = win.DT.q.en;
  d.getElementById("dtCheck").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("cham qua giao dien: go dung -> 100%", win.DT.graded.pc === 100,
        win.DT.graded.pc + "%");
  check("ve ket qua tung tu, khong tu nao bi to do",
        count("main .dt-line .w.ok") > 0 && count("main .dt-line .w.no") === 0,
        count("main .dt-line .w.ok") + " tu dung");
  check("cham xong moi lo cau nay tu bai nao", count("main #dtGo") === 1,
        count("main #dtGo") + " nut");

  // Loc theo nguon phai doi tap cau
  d.querySelector('#dtSrc button[data-s="ng"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("loc theo nguon Ngu phap thi cau rut ra deu tu do",
        win.DT.src === "ng" && win.DT.q.src === "ng", win.DT.q.src);

  console.log("== Muc 19a: nghe chon dap an ==");
  win.show("lq");
  await wait(1000);
  check("mo duoc trang nghe chon dap an",
        text("main h1").includes("Nghe ch\u1ecdn \u0111\u00e1p \u00e1n"), text("main h1"));
  check("ve du 4 phuong an", count("main .lq-opts button") === 4,
        count("main .lq-opts button") + " phuong an");
  check("dap an dung nam trong so phuong an", win.LQ.opts.includes(win.LQ.q),
        win.LQ.opts.indexOf(win.LQ.q) > -1 ? "co" : "khong");

  // Ra de 200 lan o ca hai kieu: khong lan nao duoc co hai phuong an TRUNG CHU,
  // vi khi do cau hoi mat dap an dung duy nhat.
  const dup = { nghia: 0, cau: 0 };
  const noQ = { nghia: 0, cau: 0 };
  ["nghia", "cau"].forEach((mode) => {
    win.LQ.mode = mode;
    for (let k = 0; k < 60; k++) {
      win.lqNext();
      if (!win.LQ.q) { noQ[mode]++; continue; }
      const key = mode === "cau" ? "en" : "vi";
      const seen = new Set(win.LQ.opts.map(o => win.dtNorm(o[key])));
      if (seen.size !== 4) dup[mode]++;
      if (!win.LQ.opts.includes(win.LQ.q)) dup[mode] += 100;
    }
  });
  check("khong de nao co hai phuong an trung chu",
        dup.nghia === 0 && dup.cau === 0, JSON.stringify(dup));
  check("de nao cung ra duoc du phuong an",
        noQ.nghia === 0 && noQ.cau === 0, JSON.stringify(noQ));

  // Ra de kieu "chon cau" phai NHANH. Ban dau code sort ca kho 5.000 cau moi lan
  // ra de (2*n*log n lan goi lqSim) -> treo may vai giay giua hai cau hoi.
  win.LQ.mode = "cau";
  win.LQ.src = "all";
  const t0 = Date.now();
  for (let k = 0; k < 20; k++) win.lqNext();
  const msPer = (Date.now() - t0) / 20;
  check("ra de kieu 'chon cau' duoi 500ms moi cau", msPer < 500,
        msPer.toFixed(0) + " ms/cau tren kho " + win.DT.pool.length + " cau");

  // Kieu "chon cau" phai lay nhieu la cau GIONG NHAT, khong phai cau ngau nhien
  win.LQ.mode = "cau";
  let simPicked = 0, simRandom = 0, rounds = 30;
  for (let k = 0; k < rounds; k++) {
    win.lqNext();
    const q = win.LQ.q;
    const others = win.LQ.opts.filter(o => o !== q);
    simPicked += others.reduce((a, o) => a + win.lqSim(o.en, q.en), 0) / others.length;
    const pool = win.DT.pool;
    let r = 0;
    for (let j = 0; j < 3; j++) {
      r += win.lqSim(pool[Math.floor(Math.random() * pool.length)].en, q.en);
    }
    simRandom += r / 3;
  }
  check("nhieu cua kieu 'chon cau' giong cau that hon han cau ngau nhien",
        simPicked / rounds > simRandom / rounds * 2,
        "nhieu da chon " + (simPicked / rounds).toFixed(3) +
        " vs ngau nhien " + (simRandom / rounds).toFixed(3));

  // Bam dung dap an -> phai dem la dung
  win.LQ.mode = "nghia";
  win.show("lq");
  await wait(600);
  const nBefore = win.LQ.n, okBefore = win.LQ.ok;
  const right = win.LQ.opts.indexOf(win.LQ.q);
  d.querySelectorAll("main .lq-opts button")[right]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("chon dung -> dem vao so cau dung",
        win.LQ.n === nBefore + 1 && win.LQ.ok === okBefore + 1,
        win.LQ.ok + "/" + win.LQ.n);
  check("cham xong moi lo cau tieng Anh va bai goc",
        count("main .dt-res") === 1 && count("main #lqGo") === 1,
        count("main .dt-res") + " khoi ket qua");

  // Chon sai -> khong duoc tinh dung, va phai to do dung o minh chon
  win.show("lq");
  await wait(600);
  const wrong = win.LQ.opts.findIndex(o => o !== win.LQ.q);
  const ok2 = win.LQ.ok;
  d.querySelectorAll("main .lq-opts button")[wrong]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("chon sai -> khong cong diem, to do o da chon",
        win.LQ.ok === ok2 && count("main .lq-opts button.no") === 1
        && count("main .lq-opts button.ok") === 1,
        count("main .lq-opts button.no") + " o do");

  console.log("== Muc 20: noi bam gio ==");
  const PR = win.KC_DATA.produce;
  check("co du lieu produce trong bundle", !!PR && Array.isArray(PR.timed),
        PR ? PR.timed.length + " de" : "khong co");
  // 36 de theo nhom ngu phap + 9 de gan thang vao chang khoa hoc (truong "st", muc 26)
  check("de khong gan nhom thi gan chang khoa hoc 0-13",
        PR.timed.filter(x => !x.g).length === 9
        && PR.timed.filter(x => !x.g).every(x => x.st >= 0 && x.st <= 13),
        PR.timed.filter(x => !x.g).map(x => x.st).join(","));
  check("36 de theo nhom, 12 nhom moi nhom 3 de",
        PR.timed.filter(x => x.g).length === 36 &&
        [...Array(12)].every((_, i) => PR.timed.filter(x => x.g === i + 1).length === 3),
        PR.timed.length + " de");
  // Thang tu soat la phan quan trong nhat cua muc 20 — de nao thieu thi nguoi hoc
  // noi xong khong biet dua vao dau ma soat.
  const thin = PR.timed.filter(x => (x.must || []).length < 3 || !x.task || !x.start);
  check("de nao cung co de bai, cau mo loi va >=3 y tu soat", thin.length === 0,
        thin.length + " de thieu");
  const badSec = PR.timed.filter(x => !(x.seconds >= 15 && x.seconds <= 300));
  check("thoi luong moi de nam trong 15-300 giay", badSec.length === 0,
        badSec.length + " de sai");

  win.show("tm");
  await wait(600);
  check("mo duoc trang noi bam gio",
        text("main h1").includes("N\u00f3i b\u1ea5m gi\u1edd"), text("main h1"));
  check("menu liet ke du 12 nhom", count("main .tm-pick button") === 12,
        count("main .tm-pick button") + " nhom");

  d.querySelector('main .tm-pick button[data-g="3"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  const it3 = PR.timed.filter(x => x.g === 3)[0];
  check("vao de nhom 3, dong ho dung bang thoi luong de",
        win.TM.left === it3.seconds && text("main .tm-clock").length > 0,
        text("main .tm-clock"));
  // Doc truoc thang tu soat thi nguoi hoc bam vao danh sach thay vi noi tu nhien
  check("chua het gio thi KHONG lo thang tu soat", count("main .tm-must") === 0,
        count("main .tm-must") + " khoi");

  // Chay dong ho that: sau ~2 giay phai tru di 2
  d.getElementById("tmGo").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  const l0 = win.TM.left;
  await wait(2100);
  check("dong ho dem nguoc that", win.TM.left <= l0 - 2 && win.TM.on === true,
        l0 + " -> " + win.TM.left);
  check("dong ho chi ve lai so, khong ve lai ca trang",
        !!d.getElementById("tmGo") === false && !!d.getElementById("tmStop"),
        "nut Dung van con do");

  // Roi trang phai dung dong ho, khong thi vai phut sau no doc "Time is up"
  // giua mot bai khac.
  win.show("g1");
  await wait(400);
  check("roi trang thi dong ho dung han", win.TM.on === false && win.TM.tick === null,
        "on=" + win.TM.on);

  // Het gio -> hien thang tu soat, va tich duoc tung y
  win.show("tm");
  await wait(500);
  win.TM.g = 3; win.tmPick(0);
  win.TM.left = 1;
  d.getElementById("tmGo").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  win.TM.left = 1;
  await wait(1600);
  check("het gio -> hien thang tu soat",
        win.TM.done === true && count("main .tm-must li") === it3.must.length,
        count("main .tm-must li") + " y");
  d.querySelector("main .tm-must .bx")
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("tich duoc tung y trong thang tu soat", win.TM.ticked.length === 1,
        win.TM.ticked.length + " y da tich");

  console.log("== Muc 20: de noi & viet ==");
  check("co du lieu prompt trong bundle", Array.isArray(PR.prompt),
        PR.prompt ? PR.prompt.length + " de" : "khong co");
  const skIds = new Set();
  win.KC_DATA.sindex.groups.forEach(g => g.items.forEach(it => skIds.add(it.id)));
  check("44 de theo ky nang, 22 bai ky nang moi bai 2 de",
        PR.prompt.filter(x => x.s).length === 44 &&
        [...skIds].every(i => PR.prompt.filter(x => x.s === i).length === 2),
        PR.prompt.length + " de / " + skIds.size + " bai");
  check("moi de tro toi mot bai ky nang co that",
        PR.prompt.every(x => skIds.has(x.s) || (!x.s && x.st >= 1 && x.st <= 3)),
        PR.prompt.filter(x => !skIds.has(x.s) && !x.st).map(x => x.s).join(",") || "deu ton tai");
  // "check" la thang TU CHAM — thay cho mot nguoi cham bai. De nao thieu la de do hong.
  const thinP = PR.prompt.filter(x =>
    (x.must || []).length < 3 || (x.check || []).length < 3 || !x.model || !x.task);
  check("de nao cung co >=3 y bat buoc, bai mau va >=3 cau tu cham",
        thinP.length === 0, thinP.length + " de thieu");
  check("mode chi la speak hoac write",
        PR.prompt.every(x => x.mode === "speak" || x.mode === "write"),
        JSON.stringify(PR.prompt.reduce((a, x) => (a[x.mode] = (a[x.mode] || 0) + 1, a), {})));

  win.show("pr");
  await wait(600);
  check("mo duoc trang de noi & viet",
        text("main h1").includes("\u0110\u1ec1 n\u00f3i"), text("main h1"));
  check("danh sach liet ke du de", count("main .pr-row") === PR.prompt.length,
        count("main .pr-row") + " de");
  // Loc theo kieu
  d.querySelector('#prMode button[data-m="write"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  const nWrite = PR.prompt.filter(x => x.mode === "write").length;
  check("loc duoc rieng de viet", count("main .pr-row") === nWrite,
        count("main .pr-row") + " / " + nWrite);

  d.querySelectorAll("main .pr-row")[0]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("mo mot de viet: co o soan va y bat buoc",
        !!d.getElementById("prWork") && count("main .pr-must li") >= 3,
        count("main .pr-must li") + " y bat buoc");
  // Day la cho de hong nhat cua muc 20: lo bai mau truoc khi nguoi hoc tu lam
  // thi ho chep lai y cua no, va de mat sach gia tri.
  check("chua bam thi KHONG lo bai mau va thang tu cham",
        count("main .pr-model") === 0 && count("main .pr-check .q") === 0,
        count("main .pr-model") + " bai mau");

  d.getElementById("prWork").value = "I believe companies should allow staff to work from home.";
  d.getElementById("prWork").dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(200);
  check("dem duoc so tu da viet", text("main .pr-count").startsWith("10 "),
        text("main .pr-count"));

  d.getElementById("prShow").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("bam xong moi hien bai mau va thang tu cham",
        count("main .pr-model") === 1 && count("main .pr-check .q") >= 3,
        count("main .pr-check .q") + " cau tu cham");
  d.querySelector("main .pr-check .bx")
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("tich duoc tung cau tu cham", win.PR.ticked.length === 1,
        win.PR.ticked.length + " cau da tich");

  console.log("== Muc 20: dong vai ==");
  check("co du lieu roleplay trong bundle", Array.isArray(PR.roleplay),
        PR.roleplay ? PR.roleplay.length + " man" : "khong co");
  const fIds = new Set();
  win.KC_DATA.index.groups.forEach(g => g.items.forEach(it => fIds.add(it.id)));
  check("100 man, moi khung cau dung mot man",
        PR.roleplay.length === 100 &&
        new Set(PR.roleplay.map(x => x.f)).size === fIds.size &&
        PR.roleplay.every(x => fIds.has(x.f)),
        PR.roleplay.length + " man / " + fIds.size + " khung");
  const thinR = PR.roleplay.filter(x => !x.you || !x.them || !x.goal);
  check("man nao cung co du hai vai va muc tieu", thinR.length === 0,
        thinR.length + " man thieu");
  // File du lieu CHU Y khong chep lai hoi thoai — no phai lay tu khoi dialog cua
  // chinh khung do. Neu co man nao co san "sample" la dau hieu da nhan ban du lieu.
  const dupRp = PR.roleplay.filter(x => x.sample || x.useful);
  check("khong nhan ban hoi thoai sang file du lieu", dupRp.length === 0,
        dupRp.length + " man chep lai hoi thoai");
  // Moi khung duoc gan phai THUC SU co dialog, khong thi trang hien man rong
  let noDlg = 0, noMe = 0;
  PR.roleplay.forEach(x => {
    const doc = win.KC_DATA.frames[x.f];
    const got = win.rpFromFrame(doc);
    if (!got.lines.length) noDlg++;
    else if (!got.lines.some(l => l.me)) noMe++;
  });
  check("moi khung deu rut duoc hoi thoai mau", noDlg === 0, noDlg + " khung khong co");
  check("hoi thoai nao cung co it nhat mot luot cua NGUOI HOC",
        noMe === 0, noMe + " khung khong co luot me");

  win.show("rp");
  await wait(700);
  check("mo duoc trang dong vai",
        text("main h1").includes("\u0110\u00f3ng vai"), text("main h1"));
  check("danh sach liet ke du 100 man", count("main .pr-row") === 100,
        count("main .pr-row") + " man");

  d.querySelectorAll("main .pr-row")[0]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(600);
  check("mo mot man: co hai vai va muc tieu",
        count("main .rp-role") === 2 && count("main .rp-goal") === 1,
        count("main .rp-role") + " vai");
  check("co hoi thoai mau rut tu khung cau", count("main .rp-turn") > 0,
        count("main .rp-turn") + " luot");
  // Day la toan bo cai moi so voi mot khoi dialog thuong: luot cua NGUOI HOC
  // phai bi giau cho den khi bam hien.
  const nMe = count("main .rp-turn.me");
  check("luot cua nguoi hoc bi giau truoc khi bam",
        nMe > 0 && count("main .rp-hide") === nMe && count("main .rp-turn.me .en") === 0,
        nMe + " luot bi giau");

  d.getElementById("rpShow").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("bam xong moi hien luot cua nguoi hoc",
        count("main .rp-hide") === 0 && count("main .rp-turn.me .en") === nMe,
        count("main .rp-turn.me .en") + " luot da hien");

  console.log("== Muc 22: doc doan dai ==");
  const RDD = win.KC_DATA.reading;
  check("co du lieu reading trong bundle", !!RDD && Array.isArray(RDD.items),
        RDD ? RDD.items.length + " bai" : "khong co");
  // B2 doi hoi doc hieu bai 400-600 tu — ngan hon thi khong con la bai doc dai
  const lens = RDD.items.map(x => x.text.join(" ").split(/\s+/).length);
  // Bac A1 (muc 26) la bai ngan 150-300 tu; con lai giu chuan 380-620 cua muc 22
  check("bai nao cung dung do dai theo bac",
        RDD.items.every((x, i) => x.lv === "A1" ? lens[i] >= 150 && lens[i] <= 300
                                                : lens[i] >= 380 && lens[i] <= 620),
        Math.min(...lens) + "-" + Math.max(...lens) + " tu");
  check("bai nao cung co 5 cau hoi x 4 phuong an",
        RDD.items.every(x => x.q.length === 5 && x.q.every(q => q.opts.length === 4
                        && q.a >= 0 && q.a < 4)),
        "5x4");
  // Muc 22 ghi ro: 2 y chinh, 2 chi tiet, 1 doan nghia tu qua ngu canh
  check("moi bai du 2 y chinh + 2 chi tiet + 1 doan nghia",
        RDD.items.every(x => {
          const k = x.q.map(q => q.kind);
          return k.filter(v => v === "main").length === 2
              && k.filter(v => v === "detail").length === 2
              && k.filter(v => v === "guess").length === 1;
        }), "du loai");
  // Chi tieu muc 22: moi bai nhoi 15-20 tu cua chu de do vao ngu canh that
  const glN = RDD.items.map(x => x.gloss.length);
  check("bai nao cung du tu chu de (A1 >=10, con lai >=15)",
        RDD.items.every((x, i) => glN[i] >= (x.lv === "A1" ? 10 : 15)),
        Math.min(...glN) + "-" + Math.max(...glN) + " tu");
  check("moi bai gan dung mot chu de tu vung co that",
        RDD.items.every(x => win.KC_DATA.vocab.topics.some(t => t.id === x.topic)),
        [...new Set(RDD.items.map(x => x.topic))].join(" "));
  // Moi chu de chi duoc mot bai trong dot 13-14; trung chu de la phi mot o phu song
  check("khong chu de nao bi lap hai bai",
        new Set(RDD.items.map(x => x.topic)).size === RDD.items.length,
        new Set(RDD.items.map(x => x.topic)).size + " chu de / " + RDD.items.length + " bai");
  check("id bai lien tuc tu 1, khong trung khong nhay",
        RDD.items.every((x, i) => x.id === i + 1),
        RDD.items.map(x => x.id).join(","));
  check("du 31 bai, phu kin 31/31 chu de tu vung",
        RDD.items.length === 31 && RDD.items.length === win.KC_DATA.vocab.topics.length,
        RDD.items.length + " bai");
  // Co bai de hon de nguoi chua len B2 van vao duoc, va bai kho de co cho tien toi
  const lvs = RDD.items.reduce((a, x) => (a[x.lv] = (a[x.lv] || 0) + 1, a), {});
  check("co du ca bac de lan bac kho", (lvs.A2 || 0) >= 1 && (lvs.B1 || 0) >= 5
        && (lvs.B2 || 0) >= 5, JSON.stringify(lvs));
  // Glossary phai tro toi tu CO THAT trong dung chu de do, khong thi nut mo
  // tab Tu vung bam vao khong ra gi.
  const vpair = new Set(win.KC_DATA.vocab.words.map(w => w[0] + "|" + w[3]));
  const badG = [];
  RDD.items.forEach(x => x.gloss.forEach(g => {
    if (!vpair.has(g[0] + "|" + x.topic)) badG.push(x.id + ":" + g[0]);
  }));
  check("glossary tro dung tu trong vocab.json", badG.length === 0,
        badG.slice(0, 5).join(", ") || "deu khop");
  // Tu chu de phai THUC SU xuat hien trong bai, khong phai danh sach gan bua.
  // Cum dong tu chia o TU DAU ("made a decision", "took over") nen phai biet ca
  // dang bat quy tac — lay thang tu bang verbs.json cua du an, dung doan.
  const irr = {};
  win.KC_DATA.verbs.verbs.forEach(v => {
    (irr[v[0].toLowerCase()] = irr[v[0].toLowerCase()] || new Set())
      .add(v[1].toLowerCase()).add(v[2].toLowerCase());
  });
  const SUF = "(?:s|es|ed|d|ing|ies)?";
  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordPat = (w, first) => {
    w = w.toLowerCase();
    if (!first) return escRe(w) + SUF;
    const forms = [w, ...(irr[w] ? [...irr[w]] : [])]
                  .sort((a, b) => b.length - a.length).map(escRe);
    return "(?:" + forms.join("|") + ")" + SUF;
  };
  let notIn = 0, missed = [];
  RDD.items.forEach(x => {
    const low = x.text.join(" ").toLowerCase().replace(/[^a-z' ]/g, " ")
                      .replace(/\s+/g, " ");
    x.gloss.forEach(g => {
      const parts = g[0].split(" / ")[0].toLowerCase().split(" ");
      const re = new RegExp("(?<![a-z])" +
                 parts.map((w, i) => wordPat(w, i === 0)).join("\\s+") + "(?![a-z])");
      if (!re.test(low)) { notIn++; if (missed.length < 5) missed.push(x.id + ":" + g[0]); }
    });
  });
  check("tu trong glossary deu xuat hien that trong bai", notIn === 0,
        missed.join(", ") || "deu co trong bai");

  win.show("rd");
  await wait(700);
  check("mo duoc trang doc doan dai",
        text("main h1").includes("\u0110\u1ecdc \u0111o\u1ea1n d\u00e0i"), text("main h1"));
  check("danh sach liet ke du bai", count("main .pr-row") === RDD.items.length,
        count("main .pr-row") + " bai");

  d.querySelectorAll("main .pr-row")[0]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  const r0 = RDD.items[0];
  check("mo mot bai: ve du so doan va 5 cau hoi",
        count("main .rd-text p") === r0.text.length && count("main .rd-q") === 5,
        count("main .rd-text p") + " doan");
  // Hien danh sach tu truoc thi nguoi hoc tra tung tu, khong bao gio doc lien mach
  check("chua cham thi KHONG lo danh sach tu", count("main .rd-gloss") === 0,
        count("main .rd-gloss") + " khoi");
  check("chua tra loi het thi nut cham bi khoa",
        d.getElementById("rdCheck") && d.getElementById("rdCheck").disabled,
        d.getElementById("rdCheck") ? d.getElementById("rdCheck").textContent : "?");

  r0.q.forEach((q, i) => {
    d.querySelectorAll('.pt-opts button[data-q="' + i + '"]')[q.a]
     .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
  await wait(250);
  d.getElementById("rdCheck").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("tra loi dung het -> 5/5", text("main .pt-res .lv") === "5/5",
        text("main .pt-res .lv"));
  check("cham xong moi hien danh sach tu",
        count("main .rd-gloss") === 1 && count("main .rd-gw button") === r0.gloss.length,
        count("main .rd-gw button") + " tu");

  console.log("== Muc 19b: nghe giong nguoi that qua link ngoai ==");
  const lsnOf = (id) => {
    const out = [];
    (win.KC_DATA.skills[id].sections || []).forEach(sec =>
      (sec.blocks || []).forEach(b => { if (b.t === "listen") out.push(b); }));
    return out;
  };
  const lsnIds = [7, 8, 9, 10];
  check("ca 4 bai Ky nang 07-10 deu co khoi listen",
        lsnIds.every(id => lsnOf(id).length === 1),
        lsnIds.map(id => id + ":" + lsnOf(id).length).join(" "));
  const lsnItems = lsnIds.flatMap(id => lsnOf(id)[0].items);
  check("du 32 muc nghe", lsnItems.length === 32, lsnItems.length + " muc");
  // Nhuoc diem da biet cua cach nhung link: LINK CO THE CHET. Moi muc phai giu
  // du en + vi + focus de bai hoc van dung duoc khi do xay ra.
  const lsnThin = lsnItems.filter(i => !i.en || !i.vi || !i.focus);
  check("muc nao cung giu en + vi + focus (link chet van dung duoc)",
        lsnThin.length === 0, lsnThin.length + " muc thieu");

  win.show("s7");
  await wait(500);
  check("bai 07 ve duoc khoi listen", count("main .lsn") === 1,
        count("main .lsn") + " khoi");
  check("ve du 8 nut nghe", count("main .lsn-row .go") === 8,
        count("main .lsn-row .go") + " nut");
  // Link mo trang ngoai: bat buoc target=_blank va rel=noopener, khong thi trang
  // ngoai co the dieu khien tab goc.
  const lsnLinks = [...d.querySelectorAll("main .lsn a")];
  check("link nao cung mo tab moi va co rel=noopener",
        lsnLinks.length > 0 && lsnLinks.every(a =>
          a.getAttribute("target") === "_blank" &&
          (a.getAttribute("rel") || "").includes("noopener")),
        lsnLinks.length + " link");
  check("link deu la https va thuoc mien da chot (youglish / bbc)",
        lsnLinks.every(a => {
          const u = a.getAttribute("href") || "";
          return u.startsWith("https://") &&
                 (u.includes("youglish.com") || u.includes("bbc.co.uk"));
        }),
        lsnLinks[0].getAttribute("href"));
  check("URL YouGlish dung ma hoa, khong vo vi khoang trang",
        lsnLinks.some(a => /youglish\.com\/pronounce\/[^\s]+\/english$/
                           .test(a.getAttribute("href") || "")),
        lsnLinks[0].getAttribute("href"));
  check("co dong tran an khi link khong mo duoc", count("main .lsn-note") === 1,
        text("main .lsn-note").slice(0, 40));

  win.show(lessonBefore);
  await wait(400);

  console.log("== Muc 25: luyen TOEIC ==");
  const TQ = win.KC_DATA.toeic;
  check("co du lieu toeic trong bundle", !!TQ && Array.isArray(TQ.parts),
        TQ ? TQ.parts.length + " part" : "khong co");
  const p5 = TQ.p5 || [];
  check("Part 5 co ngan hang cau hoi", p5.length >= 60, p5.length + " cau");
  check("cau nao cung du 4 lua chon va chi so dap an hop le",
        p5.every(x => x.opts.length === 4 && x.a >= 0 && x.a < 4),
        p5.filter(x => x.opts.length !== 4).length + " cau sai");
  check("cau Part 5 nao cung co dung MOT cho trong ____",
        p5.every(x => (x.q.match(/____/g) || []).length === 1),
        p5.filter(x => (x.q.match(/____/g) || []).length !== 1).length + " cau sai");
  // Bai hoc tu muc 21a: viet tay thi dap an don het ve cot dau
  const tcPos = {};
  p5.forEach(x => { tcPos[x.a] = (tcPos[x.a] || 0) + 1; });
  check("vi tri dap an rai deu bon cot",
        Math.max(...Object.values(tcPos)) <= p5.length * 0.35, JSON.stringify(tcPos));
  check("cau nao cung co giai thich va nhan loai",
        p5.every(x => x.why && x.tag && TQ.tags[x.tag]),
        p5.filter(x => !x.why || !x.tag).length + " cau thieu");
  // Nguoi dung yeu cau RO: bai tap TOEIC phai KHAC bai da co, khong tai che.
  const oldQ = new Set();
  ["lessons", "skills", "frames", "basics"].forEach(src =>
    Object.values(win.KC_DATA[src]).forEach(doc =>
      (doc.sections || []).forEach(sec =>
        (sec.blocks || []).forEach(b2 => {
          if (b2.t !== "quiz") return;
          (b2.items || []).forEach(it => { if (it.blank) oldQ.add(it.blank.trim()); });
        }))));
  const recycled = p5.filter(x => oldQ.has(x.q.trim()));
  check("cau TOEIC la cau VIET MOI, khong tai che tu bai tap cu",
        recycled.length === 0, recycled.length + " cau trung");
  // Dinh dang TOEIC: de bai hoan toan bang tieng Anh, khong co cau dan tieng Viet
  const hasVi = p5.filter(x => /[\u00c0-\u1ef9]/.test(x.q));
  check("de bai Part 5 hoan toan bang tieng Anh",
        hasVi.length === 0, hasVi.length + " cau con tieng Viet");

  win.show("tc");
  await wait(700);
  check("mo duoc tab TOEIC",
        text("main h1").includes("Luy\u1ec7n TOEIC"), text("main h1"));
  check("menu liet ke cac part", count("main .tc-card") === TQ.parts.length,
        count("main .tc-card") + " part");

  d.querySelector('main .tc-card[data-p="5"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);
  check("vao Part 5: 4 lua chon va co meo lam bai",
        count("main .tc-opts button") === 4 && count("main .tc-tip") === 1,
        count("main .tc-opts button") + " lua chon");
  // Lo giai thich truoc khi chon la cho khong con gi de kiem tra
  check("chua chon thi KHONG lo dap an hay giai thich",
        count("main .tc-why") === 0 && count("main .tc-opts button.ok") === 0,
        count("main .tc-why") + " khoi");

  const tq0 = win.tcBank(5)[win.TC.order[0]];
  d.querySelectorAll("main .tc-opts button")[tq0.a]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("chon dung -> to xanh, hien giai thich kem nhan loai",
        count("main .tc-opts button.ok") === 1 && count("main .tc-opts button.no") === 0
        && count("main .tc-why .tag") === 1,
        text("main .tc-why .tag"));

  d.getElementById("tcNext").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  const tq1 = win.tcBank(5)[win.TC.order[1]];
  d.querySelectorAll("main .tc-opts button")[(tq1.a + 1) % 4]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("chon sai -> to do o minh chon VA to xanh o dung",
        count("main .tc-opts button.no") === 1 && count("main .tc-opts button.ok") === 1,
        count("main .tc-opts button.no") + " o do");

  d.getElementById("tcStop").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("ket qua: 1 dung / 2 cau = 50%", text("main .pt-res .lv") === "50%",
        text("main .pt-res .lv"));
  // Mot con so khong du: phai noi duoc YEU CHO NAO.
  // So dong = so NHAN LOAI khac nhau trong nhung cau da lam — khong phai so cau,
  // vi thu tu duoc tron nen hai cau co the trung nhan.
  const doneTags = new Set([win.tcBank(5)[win.TC.order[0]].tag,
                            win.tcBank(5)[win.TC.order[1]].tag]);
  check("ket qua tach theo loai cau",
        count("main .tc-res .rows .r") === doneTags.size,
        count("main .tc-res .rows .r") + " dong / " + doneTags.size + " nhan");
  // Yeu nhat phai len dau: cau sai o vi tri 1, nen nhan cua no phai dung dau
  // tru khi ca hai cau cung nhan.
  if (doneTags.size === 2) {
    const weakTag = win.KC_DATA.toeic.tags[win.tcBank(5)[win.TC.order[1]].tag];
    check("nhan yeu nhat xep len dau", text("main .tc-res .rows .r .nm") === weakTag,
          text("main .tc-res .rows .r .nm") + " (cho doi " + weakTag + ")");
  } else {
    check("nhan yeu nhat xep len dau", true, "ca hai cau cung nhan, bo qua");
  }

  console.log("== Muc 25: Part 2 — nghe hoi dap ==");
  const p2 = TQ.p2 || [];
  const meta2 = TQ.parts.find(x => x.p === 2);
  check("Part 2 co ngan hang cau hoi", p2.length >= 40, p2.length + " cau");
  check("Part 2 khai bao la phan NGHE va chi co 3 lua chon",
        meta2.audio === true && meta2.nopt === 3,
        "audio=" + meta2.audio + " nopt=" + meta2.nopt);
  check("cau nao cung dung 3 lua chon va chi so dap an hop le",
        p2.every(x => x.opts.length === 3 && x.a >= 0 && x.a < 3),
        p2.filter(x => x.opts.length !== 3).length + " cau sai");
  // Phan nghe: biet minh sai chua du, phai biet minh bi lua kieu gi
  check("cau nao cung co giai thich bay", p2.every(x => x.trap && x.why),
        p2.filter(x => !x.trap).length + " cau thieu bay");
  check("cau nao cung co nhan loai cau hoi",
        p2.every(x => x.tag && TQ.tags[x.tag]),
        [...new Set(p2.map(x => x.tag))].join(" "));
  const p2pos = {};
  p2.forEach(x => { p2pos[x.a] = (p2pos[x.a] || 0) + 1; });
  check("Part 2: vi tri dap an rai deu ba cot",
        Math.max(...Object.values(p2pos)) <= p2.length * 0.45, JSON.stringify(p2pos));
  check("Part 2 dung dau danh sach part (dung thu tu de thi)",
        TQ.parts[0].p === 2, TQ.parts.map(x => x.p).join(" "));

  win.TC.part = 0;
  win.show("tc");
  await wait(500);
  d.querySelector('main .tc-card[data-p="2"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);
  check("Part 2 ve khoi nghe va 3 lua chon",
        count("main .tc-audio") === 1 && count("main .tc-opts button") === 3,
        count("main .tc-opts button") + " lua chon");
  check("co nut nghe ca bai, nghe lai cau hoi va nghe cham",
        !!d.getElementById("tcPlay") && !!d.getElementById("tcPlayQ")
        && !!d.getElementById("tcSlow"), "3 nut");
  // In chu truoc la bai nghe bien thanh bai doc — mat sach cai no muon do
  const it2 = win.tcBank(2)[win.TC.order[0]];
  check("CHUA tra loi thi khong in chu cua ba cau dap",
        count("main .tc-hidden") === 3 && count("main .tc-script") === 0
        && !text("main .tc-opts").includes(it2.opts[0]),
        count("main .tc-hidden") + " o bi giau");

  d.querySelectorAll("main .tc-opts button")[it2.a]
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("tra loi xong moi hien loi thoai day du",
        count("main .tc-hidden") === 0 && count("main .tc-script .ln") === 4,
        count("main .tc-script .ln") + " dong loi thoai");
  check("tra loi xong hien giai thich bay", count("main .tc-trap") === 1,
        text("main .tc-trap").slice(0, 40));
  check("speakSeq doc lien tiep nhieu cau (speak() thuong cancel truoc)",
        typeof win.speakSeq === "function", typeof win.speakSeq);

  win.TC.part = 0;
  win.show("tc");
  await wait(400);

  console.log("== Muc 25: Part 3 — nghe hoi thoai ==");
  const p3 = TQ.p3 || [];
  const meta3 = TQ.parts.find(x => x.p === 3);
  check("Part 3 co ngan hang hoi thoai", p3.length >= 12, p3.length + " hoi thoai");
  check("Part 3 la phan nghe nhung co 4 lua chon",
        meta3.audio === true && meta3.nopt === 4,
        "audio=" + meta3.audio + " nopt=" + meta3.nopt);
  check("hoi thoai nao cung co boi canh, >=6 luot va 3 cau hoi",
        p3.every(x => x.who && x.lines.length >= 6 && x.qs.length === 3),
        p3.filter(x => x.lines.length < 6).length + " hoi thoai ngan");
  check("moi luot thoai co du nguoi noi va noi dung",
        p3.every(x => x.lines.every(l => Array.isArray(l) && l.length === 2 && l[0] && l[1])),
        "dung dinh dang");
  const p3q = p3.flatMap(x => x.qs);
  check("cau Part 3 nao cung du 4 lua chon, giai thich va nhan loai",
        p3q.every(q => q.opts.length === 4 && q.a >= 0 && q.a < 4 && q.why && q.tag
                       && TQ.tags[q.tag]),
        p3q.length + " cau");
  const p3pos = {};
  p3q.forEach(q => { p3pos[q.a] = (p3pos[q.a] || 0) + 1; });
  check("Part 3: vi tri dap an rai deu",
        Math.max(...Object.values(p3pos)) <= p3q.length * 0.35, JSON.stringify(p3pos));
  check("thu tu part dung nhu de thi: 2 - 3 - 5 - 7",
        TQ.parts.map(x => x.p).join(",") === "2,3,5,7",
        TQ.parts.map(x => x.p).join(" "));

  win.TC.part = 0;
  win.show("tc");
  await wait(500);
  d.querySelector('main .tc-card[data-p="3"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("Part 3 ve khoi nghe kem 3 cau hoi, moi cau 4 lua chon",
        count("main .tc-audio") === 1 && count("main .tc-sub") === 3
        && count("main .tc-sub .tc-opts button") === 12,
        count("main .tc-sub") + " cau");
  // KHAC Part 2: trong de thi that, cau hoi va lua chon CO in ra
  check("cau hoi va lua chon CO in ra ngay (khac Part 2)",
        count("main .tc-hidden") === 0 && text("main .tc-sub .qt .tx").length > 10,
        text("main .tc-sub .qt .tx").slice(0, 40));
  check("CHUA tra loi thi loi thoai bi giau", count("main .tc-script") === 0,
        count("main .tc-script") + " khoi loi thoai");
  check("co hien boi canh hoi thoai", count("main .tc-who") === 1, text("main .tc-who"));

  const conv3 = win.tcBank(3)[win.TC.order[0]];
  conv3.qs.forEach((q, j) => {
    [...d.querySelectorAll("main .tc-sub")][j]
      .querySelectorAll(".tc-opts button")[q.a]
      .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
  await wait(300);
  check("tra loi du 3 cau moi hien loi thoai day du",
        count("main .tc-script .cl") === conv3.lines.length,
        count("main .tc-script .cl") + "/" + conv3.lines.length + " luot");
  check("Part 3 cham dung: 3/3 = 100%", text("main .tc-bar").includes("100%"),
        text("main .tc-bar"));

  win.TC.part = 0;
  win.show("tc");
  await wait(400);

  console.log("== Muc 25: Part 7 — van ban + nhieu cau ==");
  const p7 = TQ.p7 || [];
  check("Part 7 co ngan hang van ban", p7.length >= 8, p7.length + " van ban");
  check("van ban nao cung du kind, title, text va 3 cau hoi",
        p7.every(x => x.kind && x.title && (x.text || []).length && x.qs.length === 3),
        p7.filter(x => x.qs.length !== 3).length + " van ban sai");
  const p7q = p7.flatMap(x => x.qs);
  check("cau Part 7 nao cung du 4 lua chon, giai thich va nhan loai",
        p7q.every(q => q.opts.length === 4 && q.a >= 0 && q.a < 4 && q.why && q.tag
                       && TQ.tags[q.tag]),
        p7q.length + " cau");
  const p7pos = {};
  p7q.forEach(q => { p7pos[q.a] = (p7pos[q.a] || 0) + 1; });
  check("Part 7: vi tri dap an rai deu",
        Math.max(...Object.values(p7pos)) <= p7q.length * 0.35, JSON.stringify(p7pos));
  // Da dang the loai van ban moi sat de that
  check("co nhieu the loai van ban khac nhau",
        new Set(p7.map(x => x.kind)).size >= 6,
        [...new Set(p7.map(x => x.kind))].join(" "));
  // De bai Part 7 cung phai hoan toan bang tieng Anh
  const p7vi = p7q.filter(q => /[\u00c0-\u1ef9]/.test(q.q));
  check("cau hoi Part 7 hoan toan bang tieng Anh", p7vi.length === 0,
        p7vi.length + " cau con tieng Viet");

  // Khoi Part 5 chay truoc de lai TC.part = 5, nen trang van o man hinh cau hoi.
  // Phai ve MENU truoc thi moi bam duoc the Part 7.
  win.TC.part = 0;
  win.show("tc");
  await wait(500);
  check("ve duoc menu chon part", count("main .tc-card") === TQ.parts.length,
        count("main .tc-card") + " the part");
  d.querySelector('main .tc-card[data-p="7"]')
   .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("Part 7 ve van ban kem 3 cau tren cung man hinh",
        count("main .tc-doc") === 1 && count("main .tc-sub") === 3
        && count("main .tc-sub .tc-opts button") === 12,
        count("main .tc-sub") + " cau");
  // Chua lam het cau cua van ban thi chua duoc sang bai sau
  const doc0 = win.tcBank(7)[win.TC.order[0]];
  [...d.querySelectorAll("main .tc-sub")][0].querySelectorAll(".tc-opts button")[doc0.qs[0].a]
    .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("moi tra loi 1/3 cau thi CHUA hien nut sang bai sau",
        !d.getElementById("tcNext"),
        d.getElementById("tcNext") ? "da hien som" : "chua hien");
  [1, 2].forEach(j => {
    const bs = [...d.querySelectorAll("main .tc-sub")][j].querySelectorAll(".tc-opts button");
    bs[doc0.qs[j].a].dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  });
  await wait(250);
  check("tra loi du 3 cau thi moi hien nut sang bai sau",
        !!d.getElementById("tcNext"), "da hien");
  check("dap an luu theo tung cau con, khong de len nhau",
        Object.keys(win.TC.ans).length === 3,
        Object.keys(win.TC.ans).length + " cau da luu");

  d.getElementById("tcStop").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("Part 7 cham dung: 3/3 cau dung = 100%", text("main .pt-res .lv") === "100%",
        text("main .pt-res .lv"));

  // Tron thu tu: lam lan hai khong duoc trung thu tu lan dau
  win.tcStart(5); const o1 = win.TC.order.slice(0, 15).join(",");
  win.tcStart(5); const o2 = win.TC.order.slice(0, 15).join(",");
  check("moi lan vao part la mot thu tu khac", o1 !== o2,
        o1 === o2 ? "trung thu tu" : "khac nhau");
  win.TC = { part: 0, i: 0, ans: null, order: null, show: false };

  console.log("== Muc 24: lo trinh hoc ==");
  const RM = win.KC_DATA.roadmap;
  check("co du lieu roadmap trong bundle", !!RM && Array.isArray(RM.stages),
        RM ? RM.stages.length + " chang" : "khong co");
  const allTops = win.KC_DATA.vocab.topics.map(t => t.id);
  const usedTops = RM.stages.flatMap(x => x.topics);
  // Chu de bi bo quen la chu de nguoi hoc KHONG CO DUONG NAO di toi, va loi do
  // im lang hoan toan. Soat ca hai chieu: phu kin va khong lap.
  check("13 chang phu kin 31/31 chu de tu vung, khong lap",
        RM.stages.length === 13 && usedTops.length === allTops.length
        && new Set(usedTops).size === allTops.length
        && allTops.every(t => usedTops.includes(t)),
        usedTops.length + " chu de dung / " + allTops.length + " chu de co");
  const gN = win.KC_DATA.gindex.groups.length;
  check("moi chang tro toi nhom ngu phap co that (g=0 la chang cung co)",
        RM.stages.every(x => x.g === 0 || (x.g >= 1 && x.g <= gN)),
        RM.stages.map(x => x.g).join(","));
  check("12 nhom ngu phap deu co chang cua minh",
        new Set(RM.stages.filter(x => x.g).map(x => x.g)).size === gN,
        new Set(RM.stages.filter(x => x.g).map(x => x.g)).size + "/" + gN);
  check("chang nao cung co muc tieu", RM.stages.every(x => !!x.goal),
        RM.stages.filter(x => !x.goal).length + " chang thieu");

  console.log("== Muc 26: khoa hoc A0 -> B2 ==");
  const CO = win.KC_DATA.course;
  check("co du lieu khoa hoc trong bundle", !!CO && Array.isArray(CO.stages),
        CO ? CO.stages.length + " chang" : "khong co");
  check("14 chang: chang 0 Nhap mon + 13 chang lo trinh, dung thu tu",
        CO.stages.length === 14 && CO.stages.every((x, i) => x.n === i),
        CO.stages.map(x => x.n).join(","));
  const coLs = CO.stages.flatMap(x => x.lessons);
  const coSteps = coLs.flatMap(l => l.steps);
  const usedIds = t => coSteps.filter(s => s.t === t).map(s => s.id);
  const idsOf = idx => idx.groups.flatMap(g => g.items.map(i => i.id));
  // Bo quen mot bai la nguoi hoc theo khoa hoc KHONG BAO GIO gap no — loi im lang.
  for (const [t, all] of [["basic", idsOf(win.KC_DATA.bindex)], ["grammar", idsOf(win.KC_DATA.gindex)],
                          ["skill", idsOf(win.KC_DATA.sindex)], ["read", win.KC_DATA.reading.items.map(r => r.id)]]) {
    const u = usedIds(t);
    check("khoa hoc dung moi " + t + " dung mot lan",
          u.length === all.length && new Set(u).size === all.length && all.every(i => u.includes(i)),
          u.length + " buoc / " + all.length + " muc");
  }
  const fr = new Set(usedIds("frame"));
  check("du 100/100 khung cau co cho trong khoa hoc", fr.size === 100, fr.size + " khung");
  const nWords = win.KC_DATA.vocab.words.length;
  const vCov = coSteps.filter(s => s.t === "vocab").reduce((a, s) => a + s.to - s.from, 0);
  check("moi tu vung nam trong dung mot lat", vCov === nWords, vCov + " / " + nWords);
  for (const k of ["timed", "prompt"]) {
    const u = coSteps.filter(s => s.t === k).map(s => s.i);
    const n = win.KC_DATA.produce[k].length;
    check("khoa hoc dung moi de " + k + " dung mot lan", u.length === n && new Set(u).size === n,
          u.length + " / " + n);
  }
  check("bai B2-C1 danh dau tuy chon, khong mang tu vung",
        coLs.filter(l => l.opt).length === 4 && coLs.filter(l => l.opt).every(l => !l.steps.some(s => s.t === "vocab")),
        coLs.filter(l => l.opt).map(l => l.id).join(","));

  win.show("lt");
  await wait(900);
  check("mo duoc tab Khoa hoc", text("main h1").includes("Khóa học"), text("main h1"));
  check("trang tong quan ve du 14 the chang", count("main .lt-stage") === 14,
        count("main .lt-stage") + " chang");
  // Menu cay Cap -> Chang -> Bai: nut tam giac an / hien tang con, nhanh doc lap
  const treeBefore = JSON.stringify(win.LT.tree);
  check("menu co du 5 cap", count("#list .co-node.lvl") === 5, count("#list .co-node.lvl") + " cap");
  win.LT.tree = {}; win.buildRoadmapSide();
  check("dong het thi chi con 5 dong cap", count("#list .co-node.stg") === 0
        && count("#list .row.les") === 0, count("#list .co-node.stg") + " chang");
  [...d.querySelectorAll("#list .co-node.lvl .tg")].forEach(b => b.click());
  check("mo 5 cap thay du 14 chang", count("#list .co-node.stg") === 14,
        count("#list .co-node.stg") + " chang");
  const tgS = n => [...d.querySelectorAll("#list .co-node.stg")]
                    .find(r => r.querySelector(".nm .no").textContent.trim() === String(n)).querySelector(".tg");
  tgS(4).click(); tgS(9).click();
  const nLes = CO.stages[4].lessons.length + CO.stages[9].lessons.length;
  check("mo hai chang cung luc, nhanh doc lap", count("#list .row.les") === nLes,
        count("#list .row.les") + " / " + nLes + " bai");
  tgS(4).click();
  check("an chang 4 khong dong chang 9", count("#list .row.les") === CO.stages[9].lessons.length,
        count("#list .row.les") + " bai");
  [...d.querySelectorAll("#list .co-node.stg")].find(r => r.querySelector(".nm .no").textContent.trim() === "9")
    .querySelector(".nm").click();
  await wait(400);
  check("bam ten chang thi mo trang tong quan chang", text("main h1").includes("Chặng 9")
        && count("main .co-lslist .pr-row") === CO.stages[9].lessons.length, text("main h1"));
  d.querySelector("#list .co-node.lvl .nm").click();
  await wait(400);
  check("bam ten cap thi mo trang tong quan cap", text("main h1").startsWith("A0")
        && count("main .lt-stage") === 1, text("main h1"));
  win.LT.tree = JSON.parse(treeBefore); win.save("co_tree", win.LT.tree);
  win.coOpen(""); await wait(400);
  check("nguoi moi bat dau o chang 0", win.ltCurrent() === 0, "chang " + win.ltCurrent());

  // Tien do tu vung suy tu SRS — doi otSrs roi xem co nhich.
  const st4 = CO.stages.find(x => x.n === 4);
  const v0 = win.ltVocab(st4.topics);
  const srsAdded = [], ngAdded = [], coAdded = [];
  let put = 0;
  win.KC_DATA.vocab.words.forEach(w => {
    if (st4.topics.includes(w[3]) && put < 60) {
      const k = "v:" + win.hash36(w[0] + "|" + w[3]);
      srsAdded.push(k); win.otSrs[k] = [4, Date.now()]; put++;
    }
  });
  const v1 = win.ltVocab(st4.topics);
  check("tu len hop >=3 thi tu tinh la da thuoc (khong tich tay)",
        v0.ok === 0 && v1.ok === 60 && v1.n === v0.n && v1.n >= 120,
        v0.ok + "/" + v0.n + " -> " + v1.ok + "/" + v1.n);

  // Mo mot bai chinh: moi buoc phai ve NGAY TRONG BAI, khong chuyen tab
  const L1 = st4.lessons[0];
  win.coOpen(L1.id);
  await wait(1500);
  check("bai chinh ve du so buoc", count("main .co-step") === L1.steps.length,
        count("main .co-step") + " / " + L1.steps.length);
  const bad = [...d.querySelectorAll("main .co-sb")].filter(b => /Đang tải|Không vẽ được|Không tìm thấy/.test(b.textContent));
  check("khong buoc nao con dang tai hay bao loi", bad.length === 0, bad.length + " buoc loi");
  check("mo bai khong roi tab Khoa hoc", win.MODE === "lt" && win.current === "lt", win.MODE + " / " + win.current);
  const vStep = L1.steps.find(s => s.t === "vocab");
  check("buoc tu vung hien du the tu cua lat", count('main .co-step[data-t="vocab"] .co-w') === vStep.to - vStep.from,
        count('main .co-step[data-t="vocab"] .co-w') + " the");
  check("buoc khung cau kem man dong vai, luot nguoi hoc dang giau",
        count('main .co-step[data-t="frame"] .co-rp') >= 1 && count('main .co-step[data-t="frame"] .rp-hide') >= 1);
  const gBody = d.querySelector('main .co-step[data-t="grammar"] .co-sb');
  const say0 = gBody.querySelectorAll("button.say").length, rev0 = gBody.querySelectorAll("button.rev").length;
  win.decorate(gBody);
  check("decorate chay lai khong nhan doi nut loa / nut dap an",
        say0 > 0 && rev0 > 0 && gBody.querySelectorAll("button.say").length === say0
        && gBody.querySelectorAll("button.rev").length === rev0, say0 + " loa, " + rev0 + " dap an");

  // Nut Nho trong buoc tu vung ghi thang vao SRS
  const w0 = win.KC_DATA.vocab.words.filter(w => w[3] === vStep.topic)[vStep.from];
  const k0 = "v:" + win.hash36(w0[0] + "|" + w0[3]);
  const had0 = win.otSrs[k0];
  const logBefore = JSON.stringify(win.otLog);   // srsGrade ghi ca nhat ky on tap
  d.querySelector('main .co-step[data-t="vocab"] [data-ok="1"][data-i="0"]').click();
  check("bam Nho trong bai la len hop trong On tap", !!win.otSrs[k0], JSON.stringify(win.otSrs[k0]));
  if (had0) win.otSrs[k0] = had0; else if (!srsAdded.includes(k0)) srsAdded.push(k0);
  Object.keys(win.otLog).forEach(k => { delete win.otLog[k]; });
  Object.assign(win.otLog, JSON.parse(logBefore));
  win.save("ot_log", win.otLog);

  // Hoan thanh bai: ghi co_done VA danh dau luon bai ngu phap goc
  const gid = L1.steps.find(s => s.t === "grammar").id;
  const ngHad = win.ngDone.includes(gid);
  d.querySelector("main .done-bar .btn").click();
  await wait(1200);
  check("Hoan thanh bai ghi co_done va ngDone, roi sang bai sau",
        win.coDone.includes(L1.id) && win.ngDone.includes(gid) && win.LT.open === st4.lessons[1].id,
        win.LT.open);
  coAdded.push(L1.id); if (!ngHad) ngAdded.push(gid);

  // Bai doc: danh sach tu chi hien SAU khi cham
  const RL = st4.lessons.find(l => l.kind === "read");
  win.coOpen(RL.id);
  await wait(900);
  check("bai doc: chua cham thi chua lo danh sach tu", count("main .rd-gloss") === 0);
  [...d.querySelectorAll("main .rd-q")].forEach(q => q.querySelector(".pt-opts button").click());
  d.querySelector("main [data-check]").click();
  check("bai doc: cham xong moi hien danh sach tu", count("main .rd-gloss") === 1);

  // Noi bam gio: thang tu soat chi hien sau khi het gio; roi tab thi dong ho dung
  const PRL = st4.lessons.find(l => l.kind === "produce");
  win.coOpen(PRL.id);
  await wait(800);
  check("noi bam gio: thang tu soat chua hien truoc khi noi", count("main .tm-must") === 0);
  d.querySelector("main [data-go1]").click();
  check("bam Bat dau thi co dong ho chay", win.CO_TIMERS.length === 1, win.CO_TIMERS.length + " dong ho");
  win.show(1); await wait(300);
  check("roi tab Khoa hoc thi dong ho dung", win.CO_TIMERS.length === 0, win.CO_TIMERS.length + " dong ho");

  // Kiem tra chang ngay trong bai, ket qua ghi vao cp_res
  win.show("lt"); await wait(500);
  const CL = st4.lessons.find(l => l.kind === "check");
  const cpHad = JSON.stringify(win.cpAllRes()[4] || null);
  win.coOpen(CL.id);
  await wait(1500);
  check("kiem tra chang ve 15 cau ngay trong bai", count('main .co-step[data-t="check"] .pt-q') === 15,
        count('main .co-step[data-t="check"] .pt-q') + " cau");
  [...d.querySelectorAll('main .co-step[data-t="check"] .pt-q')].forEach(q => q.querySelector(".pt-opts button").click());
  d.querySelector("main [data-done]").click();
  check("cham xong ghi vao cp_res cua nhom", !!win.cpAllRes()[4] && win.cpAllRes()[4].n === 15,
        JSON.stringify(win.cpAllRes()[4]));
  const cpAll = win.cpAllRes();
  if (cpHad === "null") delete cpAll[4]; else cpAll[4] = JSON.parse(cpHad);
  win.save("cp_res", cpAll);

  // Chang 0 va 13 co kiem tra rieng
  const pool0 = await win.coCheckPool("s0"), pool13 = await win.coCheckPool("s13");
  check("chang 0 rut duoc de tu bai Nhap mon", pool0.length >= 15, pool0.length + " cau");
  check("chang 13 rut duoc de tu vung, 4 lua chon khac nhau",
        pool13.length >= 15 && pool13.every(q => q.opts.length === 4 && new Set(q.opts).size === 4),
        pool13.length + " cau");

  // Tra lai nguyen trang
  srsAdded.forEach(k => { delete win.otSrs[k]; });
  win.save("ot_srs", win.otSrs);
  ngAdded.forEach(id => { const i = win.ngDone.indexOf(id); if (i > -1) win.ngDone.splice(i, 1); });
  win.save("ng_done", win.ngDone);
  coAdded.forEach(id => { const i = win.coDone.indexOf(id); if (i > -1) win.coDone.splice(i, 1); });
  win.save("co_done", win.coDone);
  win.LT.open = ""; win.save("co_last", "");
  check("khoi Khoa hoc da don sach trang thai gia dat vao",
        srsAdded.every(k => win.otSrs[k] === undefined) && ngAdded.every(id => !win.ngDone.includes(id))
        && coAdded.every(id => !win.coDone.includes(id)),
        srsAdded.length + " the + " + ngAdded.length + " bai + " + coAdded.length + " bai khoa hoc");

  win.show(lessonBefore);
  await wait(400);

  console.log("== Khoi BAY: mot khoi, cau sai tren cau dung duoi ==");
  win.show("g63");
  await wait(500);
  const prs = [...d.querySelectorAll("main .pair")];
  check("khoi BAY ve ra duoc", prs.length >= 10, prs.length + " cap");
  // Gop vao MOT khoi: moi cap chi co dung mot .pair, trong do co dung mot dong
  // sai va mot dong dung — khong con hai the roi canh nhau.
  check("moi cap la mot khoi, mot dong Sai + mot dong Dung",
        prs.every(x => x.querySelectorAll(".pp-row.w").length === 1
                    && x.querySelectorAll(".pp-row.r").length === 1),
        "1 khoi / 2 dong");
  check("cau sai nam TREN cau dung",
        prs.every(x => {
          const rows = [...x.querySelectorAll(".pp-row")];
          return rows.length === 2 && rows[0].classList.contains("w")
                                   && rows[1].classList.contains("r");
        }), "sai truoc, dung sau");
  check("khong con the .wrong / .right roi cua bo cuc cu",
        count("main .pair .wrong") === 0 && count("main .pair .right") === 0,
        count("main .pair .wrong") + " the cu");
  // <b> trong du lieu = PHAN DUOC SUA. Truoc day CSS to moi <b> con thanh nhan
  // in hoa xuong dong, nen cho sua hien ra nhu mot nhan chu khong phai highlight.
  const hi = prs.filter(x => x.querySelector(".pp-row.w b") && x.querySelector(".pp-row.r b"));
  check("ca hai dong deu highlight phan duoc sua", hi.length >= prs.length - 1,
        hi.length + "/" + prs.length + " cap co highlight");
  check("nhan Sai/Dung la the rieng, khong phai <b>",
        prs.every(x => [...x.querySelectorAll(".mk")].length === 2
                    && [...x.querySelectorAll("b")].every(b2 => !b2.classList.contains("mk"))),
        "nhan = .mk");
  // "DUNG" viet hoa + gian chu rong hon cot 30px cu nen tung bi be xuong dong
  const mk = d.querySelector(".pp-row .mk"), mcs = win.getComputedStyle(mk);
  check("nhan Sai/Dung khong xuong dong", mcs.whiteSpace === "nowrap" && parseInt(mcs.flexBasis, 10) >= 40,
        mcs.whiteSpace + " / " + mcs.flexBasis);

  // GOC LOI "cau bi vo thanh nhieu dong": phan highlight bi mot luat khac bien
  // thanh KHOI. Do thang bang getComputedStyle thay vi doan qua markup.
  const hiW = win.getComputedStyle(d.querySelector("main .pp-row.w .tx b"));
  const hiR = win.getComputedStyle(d.querySelector("main .pp-row.r .tx b"));
  check("phan highlight la INLINE, khong phai khoi (neu khong cau bi vo dong)",
        hiW.display === "inline" && hiR.display === "inline",
        "sai=" + hiW.display + " dung=" + hiR.display);
  check("highlight khong co khung nen va khong co padding",
        hiW.padding === "0px" && hiR.padding === "0px"
        && !/rgb\(/.test(hiW.backgroundColor) && !/rgb\(/.test(hiR.backgroundColor),
        "pad=" + hiW.padding + " bg=" + hiW.backgroundColor);
  check("highlight giu dam va dung co chu cua cau",
        hiW.fontWeight === "700" && hiW.fontSize === hiR.fontSize,
        "weight=" + hiW.fontWeight + " size=" + hiW.fontSize);
  // Ten lop phai RIENG: .pr-row thuoc ve danh sach "De noi & viet" va co luat
  // ".pr-row .tx b{display:block}" — dung chung ten la cau lai vo dong.
  check("khoi BAY khong dung chung ten lop voi danh sach De noi & viet",
        count("main .pair .pr-row") === 0 && count("main .pair .pp-row") > 0,
        count("main .pair .pp-row") + " dong .pp-row");
  const css = [...d.querySelectorAll("style")].map(x => x.textContent).join("\n");
  check("CSS ghi han display:inline cho highlight (chan luat tuong lai)",
        /\.pp-row b\{[^}]*display:inline/.test(css), "co ghi han");
  check("van con gach ngang o cau sai va gach chan o cau dung",
        /\.pp-row\.w b\{[^}]*line-through/.test(css)
        && /\.pp-row\.r b\{[^}]*underline/.test(css), "co ca hai");

  console.log("== Nghe chep: o chu phai khop voi tu duoc cham ==");
  // 482/5.284 cau co mot tieng chuan hoa xong khong con chu nao (dau gach ngang
  // dung rieng). Lech mot nhip la tu cuoi bi to do du go dung y nguyen.
  win.show("dt");
  await wait(1200);
  const odd = win.DT.pool.filter(q =>
    q.en.split(/\s+/).length !== win.dtWords(q.en).length);
  check("kho cau co san cau lech nhip de thu", odd.length > 0,
        odd.length + " cau");
  win.DT.q = odd[0]; win.DT.graded = null; win.DT.said = ""; win.drawDictation();
  await wait(200);
  d.getElementById("dtIn").value = win.DT.q.en;
  d.getElementById("dtCheck").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("go dung y nguyen cau lech nhip -> khong tu nao bi to do",
        count("main .dt-line .w.no") === 0 && win.DT.graded.pc === 100,
        win.DT.graded.pc + "% · " + count("main .dt-line .w.no") + " tu do · " +
        win.DT.q.en);

  win.show(lessonBefore);
  await wait(400);

  console.log("== Khoi link trong bai ngu phap -> tro ve khung cau ==");
  const back = [...d.querySelectorAll("main .lnk a")].filter(a => !/^g/.test(a.getAttribute("data-go")));
  check("co khoi link tro ve khung cau", back.length >= 3, back.length + " the");

  console.log("== Menu moi: thu tu hoc, dieu huong theo menu ==");
  const flat = [];
  win.document.querySelectorAll("#list .grp .item .n").forEach(n => flat.push(n.textContent));
  check("menu bat dau bang bai 43 (trat tu tu)", flat[0] === "43", "5 bai dau: " + flat.slice(0, 5).join(", "));
  const nIndexed = win.KC_DATA.gindex.groups.reduce((n, g) => n + g.items.length, 0);
  check("menu liet ke du moi bai trong gindex", flat.length === nIndexed,
        flat.length + " / " + nIndexed + " bai");
  check("bai 63 have-get something done co trong menu",
        !!win.KC_DATA.lessons[63] && flat.indexOf("63") > -1, "bai 63");
  check("bai 64 the more the more co trong menu",
        !!win.KC_DATA.lessons[64] && flat.indexOf("64") > -1, "bai 64");
  // Bai va lo hong B2 phai nam DUNG NHOM, khong duoc nhet cuoi muc luc.
  const grpOf = (id) => (win.KC_DATA.gindex.groups.find(
        g => g.items.some(it => it.id === id)) || {}).name || "";
  check("bai 63 nam trong Nhom 8", /Nhóm 8/.test(grpOf(63)), grpOf(63));
  check("bai 64 nam trong Nhom 6", /Nhóm 6/.test(grpOf(64)), grpOf(64));
  check("bai 65 nhan manh do + It is said that co trong menu",
        !!win.KC_DATA.lessons[65] && flat.indexOf("65") > -1, "bai 65");
  check("bai 65 nam trong Nhom 12", /Nhóm 12/.test(grpOf(65)), grpOf(65));
  check("bai 66 tuong thuat cau hoi & menh lenh co trong menu",
        !!win.KC_DATA.lessons[66] && flat.indexOf("66") > -1, "bai 66");
  check("bai 66 nam trong Nhom 11", /Nhóm 11/.test(grpOf(66)), grpOf(66));
  // Muc 23 da tron: bon bai va lo hong B2 phai co du ca bon.
  check("du bon bai va lo hong B2 (63-66)",
        [63, 64, 65, 66].every(id => !!win.KC_DATA.lessons[id]), "63 64 65 66");
  check("ten nhom dau", text("#list .grp summary").indexOf("Nền móng") > -1, text("#list .grp summary"));

  win.show("g43");
  await wait(400);
  let nav = [...win.document.querySelectorAll(".done-bar .nav button")].map(b => b.textContent);
  check("bai dau menu: khong co nut Truoc", nav.length === 1, nav.join(" | "));
  check("bai dau menu: Sau la Bai 53", /53/.test(nav[0]), nav.join(" | "));

  win.show("g1");
  await wait(400);
  nav = [...win.document.querySelectorAll(".done-bar .nav button")].map(b => b.textContent);
  check("bai 01 nam giua menu: Truoc=58, Sau=02", /58/.test(nav[0]) && /02/.test(nav[1]), nav.join(" | "));
  check("eyebrow bai 01 da doi nhom", text(".eyebrow").indexOf("Nhóm 3") > -1, text(".eyebrow"));

  win.show("g50");
  await wait(400);
  nav = [...win.document.querySelectorAll(".done-bar .nav button")].map(b => b.textContent);
  // Bai cuoi menu chi co nut Truoc, va nut do phai tro ve DUNG bai dung ngay truoc no
  // trong thu tu hoc — khong hard-code so, vi mo bai va se chen them vao giua.
  const prevOfLast = flat[flat.length - 2];
  check("bai cuoi menu: khong co nut Sau", nav.length === 1, nav.join(" | "));
  check("bai cuoi menu: nut Truoc tro dung bai lien ke",
        new RegExp(prevOfLast).test(nav[0]), nav.join(" | ") + "  (cho doi: " + prevOfLast + ")");

  console.log("== Bai chua soan hien stub ==");
  const nLessons = Object.keys(win.KC_DATA.lessons).length;
  const todo = [];
  win.KC_DATA.gindex.groups.forEach(g => g.items.forEach(it => {
    if (!win.KC_DATA.lessons[it.id]) todo.push(it.id);
  }));
  if (todo.length) {
    win.show("g" + todo[0]);
    await wait(400);
    check("bai chua soan (" + todo[0] + ") hien trang 'chua co file'", count("main .soon") === 1, text("main h1"));
  } else {
    console.log("  --   moi bai deu da soan, bo qua");
  }

  console.log("== Tab 3: Dong tu bat quy tac ==");
  d.querySelector('#tabs button[data-m="vb"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(500);
  const nVerbs = win.KC_DATA.verbs.verbs.length;
  const nHot = win.KC_DATA.verbs.verbs.filter(v => v[5]).length;
  check("tieu de doi sang bang dong tu", text("#appTitle") === "Động Từ Bất Quy Tắc", text("#appTitle"));
  const PER = 50, pages = Math.ceil(nVerbs / PER);
  check("trang 1 hien " + PER + " dong (phan trang)", count("table.vb tbody tr") === PER,
        count("table.vb tbody tr") + " dong");
  check("thanh tien do dem dung", text("#prog").indexOf(nVerbs + " động từ") === 0, text("#prog"));
  check("o tim doi placeholder", /động từ/.test(d.getElementById("search").placeholder),
        d.getElementById("search").placeholder);
  check("co nut che cot va bo loc", count("#vbHide button") === 3 && !!d.getElementById("vbReset"));
  check("moi dong co chip nhom + nut nghe",
        count("table.vb .ptag") === PER && count("table.vb [data-say]") === PER);

  console.log("== Sap xep theo alphabet ==");
  const col1 = () => [...d.querySelectorAll("table.vb td.c1")].map(t => t.textContent.trim());
  const first = col1();
  check("cot V1 xep tang dan A->Z",
        first.every((w, i) => i === 0 || first[i-1].localeCompare(w, "en") <= 0),
        first.slice(0, 6).join(", ") + " … " + first[first.length-1]);

  console.log("== Phan trang ==");
  check("co thanh phan trang", !!d.getElementById("pager"), text(".pginfo"));
  check("trang 1/" + pages, text(".pginfo") === "Trang 1 / " + pages, text(".pginfo"));
  check("nut Truoc bi khoa o trang dau", d.querySelector("#pager button[data-p='0']").disabled);
  d.querySelector("#pager button[data-p='2']").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("sang trang 2", text(".pginfo") === "Trang 2 / " + pages, text(".pginfo") + " · " + text(".errcount"));
  check("trang 2 noi tiep trang 1 theo alphabet",
        first[first.length-1].localeCompare(col1()[0], "en") <= 0,
        first[first.length-1] + " -> " + col1()[0]);
  d.querySelector("#pager button[data-p='" + pages + "']").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("trang cuoi: nut Sau bi khoa",
        d.querySelector("#pager button[data-p='" + (pages+1) + "']").disabled, text(".pginfo"));

  console.log("== Nhay toi chu cai ==");
  check("sidebar co dai A-Z (Tat ca + 26 chu)", count("#az button") === 27);
  const nS = win.KC_DATA.verbs.verbs.filter(v => v[0][0].toUpperCase() === "S").length;
  d.querySelector('#az button[data-l="S"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("loc chu S", text(".errcount").indexOf(nS + " động từ · chữ S") === 0,
        text(".errcount") + " (ky vong " + nS + ")");
  check("moi dong deu bat dau bang S", col1().every(w => w[0].toUpperCase() === "S"),
        col1().slice(0, 5).join(", "));
  check("ve trang 1 khi doi chu cai", !d.getElementById("pager") || /Trang 1/.test(text(".pginfo")));

  console.log("== Loc chong nhau + che cot ==");
  d.querySelector('#vbHide button[data-h="v23"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("che V2-V3", d.querySelector("table.vb").className.indexOf("hide-v23") > -1,
        d.querySelector("table.vb").className);
  d.getElementById("vbOnly").checked = true;
  d.getElementById("vbOnly").dispatchEvent(new win.Event("change", { bubbles: true }));
  await wait(250);
  check("chu S + chi tu hay gap", count("table.vb tbody tr") > 0 && count("table.vb tbody tr") < nS,
        text(".errcount"));

  console.log("== Tim theo tu ==");
  const sbox = d.getElementById("search");
  sbox.value = "broke";
  sbox.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(250);
  check("go 'broke' loc thang trong bang", count("table.vb tbody tr") >= 1, text(".errcount"));
  check("tim tu dong bo loc chu cai dang bat", text(".errcount").indexOf("chữ S") === -1 &&
        d.querySelector('#az button[data-l=""]').className === "on", text(".errcount"));
  sbox.value = "nằm";
  sbox.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(250);
  check("tim duoc ca bang nghia tieng Viet", count("table.vb tbody tr") >= 1, text(".errcount"));

  console.log("== O tim ngay tren bang dong tu ==");
  const bFind = d.getElementById("vbFind");
  check("bang dong tu co o tim rieng", !!bFind);
  bFind.value = "broke";
  bFind.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(250);
  check("go tren bang loc duoc", count("table.vb tbody tr") >= 1, text(".errcount"));
  check("o tim thanh ben bat kip", d.getElementById("search").value === "broke",
        d.getElementById("search").value);

  console.log("== Bo loc ==");
  d.getElementById("vbReset").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(300);
  check("bo loc tra lai trang 1 / " + pages, text(".pginfo") === "Trang 1 / " + pages,
        text(".pginfo") + " · " + text(".errcount"));
  check("co bang bay Sai/Dung o cuoi trang", count("main .pair") === win.KC_DATA.verbs.traps.length,
        count("main .pair") + " cap");

  console.log("== Tab 4: Ky nang B2 ==");
  d.querySelector('#tabs button[data-m="sk"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(500);
  check("tieu de doi sang tab ky nang", text("#appTitle") === "22 Bài Kỹ Năng B2", text("#appTitle"));
  check("sidebar liet ke 22 bai / 4 nhom", count("#list .grp .item") === 22 && count("#list .grp") === 4,
        count("#list .grp .item") + " bai, " + count("#list .grp") + " nhom");
  check("mo bai 01", text("main h1").indexOf("Phụ âm cuối") > -1, text("main h1"));
  check("bai ky nang co 9 muc", count("main h2") === 9, count("main h2") + " muc");
  check("eyebrow dung nhan Bai", text(".eyebrow").indexOf("· Bài 01") > -1, text(".eyebrow"));
  nav = [...d.querySelectorAll(".done-bar .nav button")].map(b => b.textContent);
  check("bai dau: chi co nut Sau", nav.length === 1 && /02/.test(nav[0]), nav.join(" | "));

  console.log("== Tham chieu cheo [Ky nang NN] ==");
  const sLink = [...d.querySelectorAll("main a[data-go]")].filter(a => /^s\d+$/.test(a.getAttribute("data-go")));
  check("co link [Ky nang NN] trong bai", sLink.length > 0,
        sLink.slice(0, 4).map(a => a.getAttribute("data-go")).join(", "));
  sLink[0].dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
  await wait(400);
  check("bam link nhay sang bai ky nang khac", text(".eyebrow").indexOf("· Bài") > -1 &&
        text("#appTitle") === "22 Bài Kỹ Năng B2", text(".eyebrow"));

  console.log("== Bai ky nang chua soan hien stub ==");
  const sTodo = [];
  win.KC_DATA.sindex.groups.forEach(g => g.items.forEach(it => {
    if (!win.KC_DATA.skills[it.id]) sTodo.push(it.id);
  }));
  if (sTodo.length) {
    win.show("s" + sTodo[0]);
    await wait(400);
    check("bai ky nang " + sTodo[0] + " hien trang 'chua co file'", count("main .soon") === 1 &&
          /skills/.test(d.querySelector("main .soon").textContent), text("main h1"));
  } else {
    console.log("  --   moi bai ky nang deu da soan, bo qua");
  }

  console.log("== Khoi link tro ve khung cau ==");
  win.show("s1");
  await wait(400);
  const kcLink = [...d.querySelectorAll("main .lnk a")];
  check("muc 7 tro sang khung cau", kcLink.length >= 4 &&
        kcLink.every(a => /^\d+$/.test(a.getAttribute("data-go"))), kcLink.length + " the");
  kcLink[0].dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
  await wait(400);
  check("nhay ve tab khung cau", text("#appTitle") === "100 Khung Câu Giao Tiếp", text(".eyebrow"));

  console.log("== Tab 5: Tu vung B2 — hai panel ==");
  check("co du 9 tab", [...d.querySelectorAll("#tabs button[data-m]")]
        .filter(b => b.style.display !== "none").length === 9,
        [...d.querySelectorAll("#tabs button[data-m]")].map(b => b.textContent).join(" | "));
  // Thu tu tab la lua chon co chu dich cua nguoi dung: Lo trinh dung DAU (mo app
  // la thay ngay hoc gi), roi di tu de den kho, Khung cau va On tap de cuoi.
  // Khoa lai de mot lan sua HTML sau nay khong lam xao tron.
  const tabOrder = [...d.querySelectorAll("#tabs button[data-m]")].map(b => b.getAttribute("data-m"));
  check("thu tu tab dung nhu da chot",
        tabOrder.join(",") === "lt,nm,ng,sk,vc,vb,kc,ot,tc", tabOrder.join(" > "));
  d.querySelector('#tabs button[data-m="vc"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(500);
  const vc = win.KC_DATA.vocab;
  const nW = vc.words.length, nT = vc.topics.length;
  const doneT = new Set(vc.words.map(w => w[3])).size;
  const cap = () => text("#vcCap");
  check("tieu de doi sang tab tu vung", text("#appTitle") === "Từ Vựng B2", text("#appTitle"));
  check("thanh tien do dem tu + chu de",
        text("#prog").indexOf(nW + " từ · " + doneT + "/" + nT + " chủ đề") === 0, text("#prog"));
  check("sidebar liet ke Tat ca + " + nT + " chu de", count("#list .grp .item") === nT + 1,
        count("#list .grp .item") + " muc");

  check("co dung hai panel", count(".vc2 > .vc-pane") === 2, count(".vc2 > .vc-pane") + " panel");
  check("main bi khoa chieu cao de cuon trong panel",
        d.querySelector("main").className.indexOf("vcmode") > -1,
        d.querySelector("main").className);
  check("panel trai co du 3 tang: caption / danh sach / phan trang",
        !!d.getElementById("vcCap") && !!d.getElementById("vcRows") && !!d.getElementById("vcFoot"));
  check("phan trang nam o DAY panel trai, khong nam trong vung cuon",
        d.getElementById("vcFoot").querySelector(".pager") !== null &&
        d.getElementById("vcRows").querySelector(".pager") === null);
  check("danh sach phan trang 40", count(".vcrow") === Math.min(40, nW), count(".vcrow") + " dong");
  check("moi dong co tu + loai tu + nghia",
        count(".vcrow .w") === count(".vcrow") &&
        count(".vcrow .pos") === count(".vcrow") &&
        count(".vcrow .m") === count(".vcrow"));
  const nIpa = vc.words.filter(w => w.length > 7 && String(w[7]).trim()).length;
  if(nIpa){
    const shown = vc.words.slice(0, 40).filter(w => w.length > 7 && String(w[7]).trim()).length;
    check("phien am hien ra tren dong", count(".vcrow .ipa") === shown,
          count(".vcrow .ipa") + " / " + shown + " dong co IPA trong 40 dong dau");
  }

  console.log("== Panel phai: chi tiet mot tu ==");
  check("mo tab la da chon san dong dau", count(".vcrow.on") === 1, count(".vcrow.on") + " dong duoc chon");
  check("panel phai hien dung tu dang chon",
        text("#vcDet .hd .w") === vc.words[0][0], text("#vcDet .hd .w"));
  const heads = () => [...d.querySelectorAll("#vcDet h4")].map(h => h.textContent);
  check("du 4 muc chi tiet",
        ["Câu ngữ cảnh", "Từ đồng nghĩa", "Thay thế", "Từ trái nghĩa"]
          .every(x => heads().indexOf(x) > -1), heads().join(" | "));
  check("chi tiet co loai tu va phien am",
        !!d.querySelector("#vcDet .hd .pos") &&
        (!vc.words[0][7] || !!d.querySelector("#vcDet .hd .ipa")));
  check("luon co it nhat mot cau ngu canh", count("#vcDet .ex") >= 1 &&
        !!d.querySelector("#vcDet .ex .en") && !!d.querySelector("#vcDet .ex .vi"),
        count("#vcDet .ex") + " cau");

  // Bam sang mot dong khac thi panel phai phai doi theo
  const row2 = d.querySelectorAll(".vcrow")[3];
  const want2 = row2.querySelector(".w").textContent;
  row2.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("bam dong khac thi panel phai doi theo", text("#vcDet .hd .w") === want2,
        text("#vcDet .hd .w") + " / mong " + want2);
  check("chi mot dong duoc to sang", count(".vcrow.on") === 1);

  // Tu co soan chi tiet: phai hien dong nghia that, khong phai dong "chua soan"
  const det = win.KC_DATA.vdetail && win.KC_DATA.vdetail.items;
  if(det && Object.keys(det).length){
    const k = Object.keys(det).find(k => (det[k].syn || []).length);
    win.vcJump(k);
    await wait(250);
    check("tu da soan chi tiet hien dong nghia that",
          count("#vcDet .wl li") >= (det[k].syn || []).length &&
          text("#vcDet").indexOf("Chưa soạn") === -1,
          k + " -> " + count("#vcDet .wl li") + " muc");
    check("tu dong nghia bam sang duoc", count("#vcDet .jump") >= 1,
          count("#vcDet .jump") + " lien ket");
    check("cau ngu canh nhieu hon cau goc",
          count("#vcDet .ex") === 1 + (det[k].ex || []).length,
          count("#vcDet .ex") + " cau");
  }
  check("co dai tu cung chu de de hoc theo cum", count("#vcDet .near button") >= 1,
        count("#vcDet .near button") + " tu");

  console.log("== Phan trang trong panel ==");
  d.getElementById("vcReset").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  const pg2 = d.querySelector('#vcFoot #vcPager button[data-p="2"]');
  check("co nut sang trang 2", !!pg2);
  pg2.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("sang trang 2 doi dung 40 dong sau", cap().indexOf("dòng 41–80") > -1, cap());
  check("sang trang thi panel phai chon lai dong dau trang",
        text("#vcDet .hd .w") === vc.words[40][0], text("#vcDet .hd .w"));
  check("vung cuon danh sach bi keo ve dau", d.getElementById("vcRows").scrollTop === 0);

  console.log("== Che nghia de tu kiem tra ==");
  d.querySelector('#vcHide button[data-h="vi"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("danh sach chuyen sang che nghia",
        d.getElementById("vcRows").className.indexOf("hide-vi") > -1,
        d.getElementById("vcRows").className);
  d.querySelector('#vcHide button[data-h=""]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);

  console.log("== Loc chu de & tim tu ==");
  const wTopic = [...d.querySelectorAll("#list .grp .item")].find(b => /Công việc/.test(b.querySelector("b").textContent));
  wTopic.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  const nWork = vc.words.filter(w => w[3] === "work").length;
  check("loc chu de Cong viec", cap().indexOf(nWork + " từ · Công việc") === 0, cap());
  const vbox = d.getElementById("search");
  vbox.value = "deadline";
  vbox.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(250);
  // tim khop ca cau vi du, nen so dong = so tu thuc su chua "deadline" o bat ky cot nao
  const nDl = vc.words.filter(w =>
    (w[0] + " " + w[2] + " " + w[4] + " " + w[5]).toLowerCase().indexOf("deadline") > -1).length;
  check("go 'deadline' loc duoc", count(".vcrow") === nDl && nDl > 0 &&
        d.querySelector(".vcrow .w").textContent.trim() === "deadline", cap());
  vbox.value = "lương";
  vbox.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(250);
  check("tim duoc bang nghia tieng Viet", count(".vcrow") >= 1, cap());
  check("o tim tren panel bat kip o thanh ben", d.getElementById("vcFind").value === "lương",
        d.getElementById("vcFind").value);
  d.getElementById("vcReset").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("bo loc tra lai du " + nW + " tu", cap().indexOf(nW + " từ") === 0, cap());

  console.log("== O tim ngay tren panel tu vung ==");
  const vFind = d.getElementById("vcFind");
  check("panel tu vung co o tim rieng", !!vFind);
  vFind.value = "deadline";
  vFind.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(250);
  check("go tren panel cung loc duoc", count(".vcrow") === nDl, cap());
  check("o tim thanh ben bat kip lai", d.getElementById("search").value === "deadline",
        d.getElementById("search").value);
  check("nut xoa hien ra", d.getElementById("vcFindWrap").className.indexOf("has") > -1,
        d.getElementById("vcFindWrap").className);
  d.getElementById("vcFindClr").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("bam x tra lai du " + nW + " tu", cap().indexOf(nW + " từ") === 0, cap());

  console.log("== Quay lai tab khung cau ==");
  d.querySelector('#tabs button[data-m="kc"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(500);
  check("ve dung tab khung cau", text("#appTitle") === "100 Khung Câu Giao Tiếp", text("#appTitle"));
  check("roi tab tu vung thi bo khoa chieu cao",
        d.querySelector("main").className.indexOf("vcmode") === -1,
        d.querySelector("main").className || "(khong co class)");
  check("trang phu quay lai dung so",
        count("#list > div:first-child .item") === nSpecial("kc"),
        count("#list > div:first-child .item") + " / " + nSpecial("kc"));

  console.log("== Tu dien loi ==");
  win.show("err");
  await wait(2500);
  win.show("err");
  await wait(3000);
  check("tieu de Tu dien loi", text("main h1") === "Từ điển lỗi", text("main h1"));
  const nSkills = Object.keys(win.KC_DATA.skills).length;
  // Dem cap pairs THUC TE trong du lieu thay vi doan theo cong thuc — bai nhap mon
  // khong co dinh 10 cap moi bai nen cong thuc cu khong con dung.
  const countPairs = (docs) => Object.values(docs).reduce((n, f) =>
    n + (f.sections || []).reduce((m, sec) =>
      m + (sec.blocks || []).filter(b => b.t === "pairs")
            .reduce((k, b) => k + (b.items || []).length, 0), 0), 0);
  const nBasicPairs = countPairs(win.KC_DATA.basics);
  const wantErr = 600 + 10 * nLessons + 10 * nSkills + nBasicPairs;
  check("gom du " + wantErr + " loi (" + nLessons + " ngu phap + " + nSkills +
        " ky nang + " + nBasicPairs + " nhap mon)",
        text("main .sub").indexOf(wantErr + " cặp") === 0, text("main .sub").slice(0, 150));
  check("tab Nhap mon co mat trong Tu dien loi", nBasicPairs > 0 &&
        text("main .sub").indexOf(nBasicPairs + " từ bài nhập môn") > -1,
        text("main .sub").slice(0, 150));
  check("co 5 nut loc nguon", count("#errScope button") === 5,
        [...d.querySelectorAll("#errScope button")].map(b => b.textContent).join(" | "));
  check("co o tim kiem", !!d.getElementById("errQ"));
  check("trang dau hien 60 loi", count("#errBody .pair") === 60, count("#errBody .pair") + " cap");
  check("moi loi co nguon tro ve", count("#errBody .pair .src a") === count("#errBody .pair"));
  check("co nut hien them", !!d.getElementById("errMore"), text("#errMore"));

  console.log("== Tim trong Tu dien loi ==");
  const q = d.getElementById("errQ");
  q.value = "although";
  q.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(200);
  const hits = count("#errBody .pair");
  check("loc theo tu khoa", hits > 0 && hits < 60, hits + " cap khop 'although' — " + text(".errcount"));

  console.log("== Doi pham vi nguon ==");
  q.value = "";
  q.dispatchEvent(new win.Event("input", { bubbles: true }));
  await wait(150);
  d.querySelector('#errScope button[data-s="sk"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("loc rieng nguon Ky nang", count("#errBody .pair") > 0 &&
        [...d.querySelectorAll("#errBody .pair .src a")].every(a => /^s\d+$/.test(a.getAttribute("data-go"))),
        text(".errcount"));
  d.querySelector('#errScope button[data-s="kc"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  check("chi con nguon khung cau", [...d.querySelectorAll("#errBody .pair .src a")]
        .every(a => /^\d+$/.test(a.getAttribute("data-go"))), text(".errcount"));

  console.log("== Bam nguon trong Tu dien loi ==");
  d.querySelector("#errBody .pair .src a").dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
  await wait(400);
  check("nhay ve trang khung cau", text(".eyebrow").indexOf("Khung") > -1, text(".eyebrow"));

  console.log("== Tab On tap (lap ngat quang) ==");
  d.querySelector('#tabs button[data-m="ot"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(1200);
  check("vao dung tab On tap", text("#appTitle") === "Ôn tập lặp ngắt quãng", text("#appTitle"));
  check("co 9 tab", count("#tabs button") === 9, count("#tabs button") + " tab");

  // So the phai khop voi du lieu that: tu vung + quiz + pairs + dong tu
  const nVc = win.KC_DATA.vocab.words.length;
  const nVb = win.KC_DATA.verbs.verbs.length;
  let nQz = 0, nEr = 0;
  for (const src of ["frames", "lessons", "skills", "basics"]) {
    for (const k of Object.keys(win.KC_DATA[src] || {})) {
      for (const s of win.KC_DATA[src][k].sections || []) {
        for (const b of s.blocks || []) {
          if (b.t === "quiz")  nQz += (b.items || []).length;
          if (b.t === "pairs") nEr += (b.items || []).length;
        }
      }
    }
  }
  const nAll = nVc + nVb + nQz + nEr;
  check("gom du the tu MOI nguon tai lieu", text(".sub").indexOf(nAll + " thẻ") === 0,
        text(".sub").slice(0, 40) + " · cho doi " + nAll);
  // Tang A0 phai co mat trong bo the — nguoi moi can on nhat ma lai bi bo ra thi vo ly
  const nBasicCards = Object.values(win.KC_DATA.basics).reduce((n, f) =>
    n + (f.sections || []).reduce((m, sec) =>
      m + (sec.blocks || []).filter(b => b.t === "quiz" || b.t === "pairs")
            .reduce((k, b) => k + (b.items || []).length, 0), 0), 0);
  check("the tu tab Nhap mon co trong bo on tap", nBasicCards > 0,
        nBasicCards + " the tu 26 bai nhap mon");
  check("4 o bo the", count(".ot-card") === 4, count(".ot-card") + " o");
  check("5 hop Leitner", count(".ot-boxes .bx") === 5, count(".ot-boxes .bx") + " hop");
  check("chua hoc thi moi the deu den han", text(".ot-hero .big") === String(nAll),
        text(".ot-hero .big") + " / " + nAll);
  check("thanh ben liet ke Tat ca + 4 bo", count("#list .grp .item") === 5,
        count("#list .grp .item") + " muc");
  check("thanh tien do dem the", text("#prog").indexOf(nAll + " thẻ đến hạn") === 0, text("#prog"));

  // Id the phai dung tu NOI DUNG, khong phai chi so mang — kiem tra tinh on dinh
  const ids = win.OT.cards.map((c) => c.id);
  check("id the khong trung nhau", new Set(ids).size === ids.length,
        ids.length - new Set(ids).size + " id trung");
  check("id the co tien to theo bo",
        win.OT.cards.every((c) => /^[vqpb]:/.test(c.id)));

  console.log("== Phien on: lat the, tu cham, Leitner ==");
  d.getElementById("otStart").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("vao phien on", !!d.getElementById("otCard"));
  check("phien dung 30 the", text(".ot-top .cnt") === "1 / 30", text(".ot-top .cnt"));
  // .cnt cung la <span> nen :last-of-type bat nham — lay thang theo danh sach .pill
  const pills = [...d.querySelectorAll(".ot-top .pill")].map(e => e.textContent);
  check("the moi thi bao la the moi", pills[1] === "thẻ mới", pills.join(" | "));
  check("chua lat thi chua co nut cham", !d.getElementById("otYes") && !!d.getElementById("otShow"));

  const id1 = win.OT.sess.cards[0].id;
  d.getElementById("otShow").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("lat ra mat sau", d.getElementById("otCard").className.indexOf("open") > -1 &&
        !!d.getElementById("otYes") && !!d.getElementById("otNo"));

  // "Nho roi" tren the moi -> hop 1, han 1 ngay
  d.getElementById("otYes").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  const s1 = win.otSrs[id1];
  check("nho roi -> len hop 1", s1 && s1[0] === 1, JSON.stringify(s1));
  check("han moi la 1 ngay", s1 && Math.abs(s1[1] - Date.now() - 86400000) < 20000,
        s1 ? Math.round((s1[1] - Date.now()) / 3600000) + " gio nua" : "khong co");
  check("sang the thu hai", text(".ot-top .cnt") === "2 / 30", text(".ot-top .cnt"));

  // "Chua nho" -> ve hop 1 du truoc do o hop nao
  const id2 = win.OT.sess.cards[1].id;
  win.otSrs[id2] = [4, Date.now() - 1000];
  d.getElementById("otShow").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  d.getElementById("otNo").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("quen -> roi thang ve hop 1", win.otSrs[id2][0] === 1, JSON.stringify(win.otSrs[id2]));

  // Nho lien tiep tu hop 4 -> hop 5, han 16 ngay
  const id3 = win.OT.sess.cards[2].id;
  win.otSrs[id3] = [4, Date.now() - 1000];
  d.getElementById("otShow").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  d.getElementById("otYes").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("hop 4 + nho -> hop 5, 16 ngay", win.otSrs[id3][0] === 5 &&
        Math.abs(win.otSrs[id3][1] - Date.now() - 16 * 86400000) < 20000,
        JSON.stringify(win.otSrs[id3]));

  const todayK = new Date().getFullYear() + "-" +
    String(new Date().getMonth() + 1).padStart(2, "0") + "-" +
    String(new Date().getDate()).padStart(2, "0");
  check("nhat ky dem dung 3 the / 2 nho", win.otLog[todayK] &&
        win.otLog[todayK].n === 3 && win.otLog[todayK].ok === 2,
        JSON.stringify(win.otLog[todayK]));
  // jsdom nem SecurityError khi dung localStorage voi origin file:// (opaque origin).
  // App da boc try/catch nen van chay; o day chi kiem tra save() KHONG lam vo phien.
  let lsOk = false;
  try { win.localStorage.getItem("ot_srs"); lsOk = true; } catch (e) { lsOk = false; }
  check("save() khong lam vo phien du localStorage bi chan",
        win.otSrs[id3][0] === 5 && !!d.getElementById("otCard"),
        lsOk ? "localStorage dung duoc" : "localStorage bi chan (dung nhu du doan o file://)");

  check("thanh tien do chay theo", d.querySelector(".ot-prog i").style.width === "10%",
        d.querySelector(".ot-prog i").style.width);

  d.getElementById("otQuit").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("thoat phien ve tong quan", !!d.getElementById("otStart") && !d.getElementById("otCard"));
  check("so den han da tru di 3", text(".ot-hero .big") === String(nAll - 3),
        text(".ot-hero .big") + " / cho doi " + (nAll - 3));

  console.log("== Pham vi on tap ==");
  // Chon bo Tu vung -> thanh ben phai hien danh sach chu de
  [...d.querySelectorAll(".ot-card")].find(e => e.getAttribute("data-deck") === "vc")
    .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("chon bo Tu vung", win.OT.deck === "vc" && text(".ot-hero .lb").indexOf("bộ Từ vựng") > -1,
        text(".ot-hero .lb"));
  const subHdr = [...d.querySelectorAll("#list .grp summary")].map(e => e.textContent);
  check("thanh ben hien loc theo chu de", subHdr.indexOf("Lọc theo chủ đề") > -1, subHdr.join(" | "));
  const nTopics = win.KC_DATA.vocab.topics.length;
  check("du " + nTopics + " chu de + Tat ca",
        count("#list .grp:nth-of-type(2) .item") === nTopics + 1,
        count("#list .grp:nth-of-type(2) .item") + " muc");

  // Chon mot chu de cu the
  const topicBtn = [...d.querySelectorAll("#list .grp:nth-of-type(2) .item")]
    .find(b => b.querySelector("b").textContent.indexOf("Công việc") > -1);
  topicBtn.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  // Con so tren man hinh la the DEN HAN, khong phai TONG the. Phien truoc da cham
  // 3 the rut ngau nhien, nen neu tinh co trung the chu de work thi tong se lech.
  // Dem lai dung dieu kien app dung, thay vi so voi tong.
  const nWorkDue = win.OT.cards.filter(c =>
    c.deck === "vc" && c.topic === "work" && win.isDue(c.id)).length;
  check("loc dung so the den han cua chu de work",
        text(".ot-hero .big") === String(nWorkDue) && nWorkDue > 0,
        text(".ot-hero .big") + " / " + nWorkDue);

  // Doi chieu hoi sang Anh -> Viet
  d.querySelector('#otDir button[data-d="en"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);
  check("doi chieu hoi Anh->Viet", win.OT.dir === "en" &&
        text(".ot-hero .lb").indexOf("hỏi Anh → Việt") > -1, text(".ot-hero .lb"));
  d.getElementById("otStart").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);
  const c0 = win.OT.sess.cards[0];
  check("mat truoc la tu tieng Anh", text(".ot-flip .q") === c0.back,
        text(".ot-flip .q") + " / cho doi " + c0.back);
  d.getElementById("otShow").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("mat sau la nghia tieng Viet", text(".ot-flip .back .a") === c0.front,
        text(".ot-flip .back .a"));
  d.getElementById("otQuit").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);

  // "Chi bai da hoc xong" — chua danh dau bai nao thi bo tu vung phai ve 0
  d.getElementById("otDone").checked = true;
  d.getElementById("otDone").dispatchEvent(new win.Event("change", { bubbles: true }));
  await wait(400);
  check("chi bai da hoc xong -> tu vung ve 0", text(".ot-hero .big") === "0",
        text(".ot-hero .big"));
  check("noi ro vi sao rong", text(".ot-hero .ok").indexOf("không gắn với bài nào") > -1,
        text(".ot-hero .ok").slice(0, 60));

  // Bo loc dua tat ca ve nhu cu
  d.getElementById("otReset").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("bo loc tra lai toan bo pham vi", win.OT.deck === "" && win.OT.sub === "" &&
        win.OT.onlyDone === false && win.OT.dir === "vi" &&
        text(".ot-hero .big") === String(nAll - 3),
        text(".ot-hero .big") + " / cho doi " + (nAll - 3));

  console.log("== Lich 7 ngay & thong ke ==");
  check("co 7 cot lich", count(".ot-fc .col") === 7, count(".ot-fc .col") + " cot");
  check("cot dau la hom nay", d.querySelector(".ot-fc .col").className.indexOf("now") > -1 &&
        text(".ot-fc .col.now .d") === "hôm nay", text(".ot-fc .col .d"));
  // 3 the da cham o dot 47: 2 the hop 1 (mai), 1 the hop 5 (16 ngay nua)
  check("cot hom nay gom het the chua hoc", text(".ot-fc .col.now .v") === String(nAll - 3),
        text(".ot-fc .col.now .v") + " / cho doi " + (nAll - 3));
  const cols = [...d.querySelectorAll(".ot-fc .col .v")].map(e => e.textContent);
  check("ngay mai co 2 the roi ve hop 1", cols[1] === "2", cols.join(" | "));
  check("16 ngay nua nam ngoai bieu do 7 ngay", cols.slice(2).every(v => v === ""),
        cols.join(" | "));

  check("chuoi ngay on dem duoc", text(".ot-stat .s b") === "1", text(".ot-stat .s b"));
  const stats = [...d.querySelectorAll(".ot-stat .s b")].map(e => e.textContent);
  check("da gap 3 the", stats[1] === "3", stats.join(" | "));
  check("ti le nho chung 2/3 = 67%", stats[2] === "67%", stats[2]);
  check("da on 3 the hom nay", stats[3] === "3", stats[3]);
  check("co thanh ti le nho tung bo", count(".ot-rec .r") >= 1, count(".ot-rec .r") + " bo");

  console.log("== Xuat / nhap tien do ==");
  d.getElementById("otExp").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(200);
  const dump = d.getElementById("otIo").value;
  let parsed = null;
  try { parsed = JSON.parse(dump); } catch (e) {}
  check("xuat ra JSON doc duoc", !!parsed && !!parsed.srs && Object.keys(parsed.srs).length === 3,
        parsed ? Object.keys(parsed.srs).length + " the" : "khong parse duoc");

  // Nhap ban CU hon cho cung mot the: phai GIU ban da hoc xa hon, khong ghi de
  const keepId = Object.keys(win.otSrs).find(k => win.otSrs[k][0] === 5);
  const before = win.otSrs[keepId].slice();
  win.confirm = () => true;
  d.getElementById("otIo").value = JSON.stringify({
    v: 1, srs: { [keepId]: [1, Date.now() + 1000], "x:moi-toanh": [2, Date.now() + 5000] }, log: {}
  });
  d.getElementById("otImp").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(500);
  check("nhap ban cu KHONG de len ban moi", win.otSrs[keepId][0] === before[0] &&
        win.otSrs[keepId][1] === before[1],
        JSON.stringify(win.otSrs[keepId]) + " / truoc do " + JSON.stringify(before));
  check("the chua co thi duoc them vao", !!win.otSrs["x:moi-toanh"],
        JSON.stringify(win.otSrs["x:moi-toanh"]));
  check("bao lai ket qua gop", text("#otIoMsg").indexOf("thêm mới 1 thẻ") > -1 &&
        text("#otIoMsg").indexOf("giữ nguyên 1 thẻ") > -1, text("#otIoMsg"));

  // Dan rac vao thi bao loi chu khong lam hong tien do
  d.getElementById("otIo").value = "khong phai json";
  d.getElementById("otImp").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(250);
  check("dan rac thi bao loi, khong dong vao tien do",
        text("#otIoMsg").indexOf("không phải JSON hợp lệ") > -1 && win.otSrs[keepId][0] === 5,
        text("#otIoMsg"));

  console.log("== Loc A1 / B2 o tab Tu vung ==");
  d.querySelector('#tabs button[data-m="vc"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(800);
  const vt = win.KC_DATA.vocab.topics;
  const nA1 = vc.words.filter(x => (vt.find(t => t.id === x[3]) || {}).lv === "a1").length;
  const nB2 = vc.words.length - nA1;
  check("co 3 nut loc trinh do", count("#vcLv button") === 3,
        [...d.querySelectorAll("#vcLv button")].map(e => e.textContent).join(" | "));
  d.querySelector('#vcLv button[data-l="a1"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("loc A1 ra dung so tu", text("#vcCap").indexOf(nA1 + " từ · trình độ A1") === 0,
        text("#vcCap") + " / cho doi " + nA1);
  const a1Topics = vt.filter(t => t.lv === "a1").length;
  check("thanh ben chi con chu de A1",
        count("#list .grp:nth-of-type(1) .item") === a1Topics + 1,
        count("#list .grp:nth-of-type(1) .item") + " muc / cho doi " + (a1Topics + 1));
  d.querySelector('#vcLv button[data-l="b2"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("loc B2 ra dung so tu", text("#vcCap").indexOf(nB2 + " từ · trình độ B2") === 0,
        text("#vcCap") + " / cho doi " + nB2);
  d.getElementById("vcReset").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  check("bo loc tra lai ca hai trinh do",
        text("#vcCap").indexOf(vc.words.length + " từ") === 0, text("#vcCap"));
  d.querySelector('#tabs button[data-m="ot"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(900);

  console.log("== Link nguoc ve bai goc ==");
  // Chon bo Bai tap: moi the deu co bai goc nen phai co link bam duoc
  [...d.querySelectorAll(".ot-card")].find(e => e.getAttribute("data-deck") === "qz")
    .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  d.getElementById("otStart").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);
  const fromA = d.querySelector(".ot-top a.from");
  check("the bai tap co link ve bai goc", !!fromA, fromA ? fromA.textContent : "khong co");
  const cq = win.OT.sess.cards[0];
  // Dung chinh keyOf() cua trang thay vi viet lai cong thuc o day. Ban cu tu suy
  // ra tien to bang cq.src[0].replace("n","g") nen "nm" (nhap mon) cung ra "g" —
  // kiem tra chi xanh chung nao the dau tien tinh co KHONG phai tu tab Nhap mon.
  const wantGo = String(win.keyOf(cq.src, cq.fid));
  check("link tro dung bai",
        !!fromA && fromA.getAttribute("data-go") === wantGo,
        (fromA ? fromA.getAttribute("data-go") : "?") + " / cho doi " + wantGo);

  // Bam link phai roi phien va mo dung bai
  fromA.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
  await wait(500);
  check("bam link thi roi phien", win.OT.sess === null);
  check("mo dung trang bai hoc", text(".eyebrow").length > 0 && !d.getElementById("otCard"),
        text(".eyebrow"));

  // The tu vung khong co bai goc -> hien ten chu de, khong phai link
  d.querySelector('#tabs button[data-m="ot"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(900);
  d.getElementById("otReset").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);
  [...d.querySelectorAll(".ot-card")].find(e => e.getAttribute("data-deck") === "vc")
    .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(400);
  d.getElementById("otStart").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);
  check("the tu vung khong co link, chi ghi chu de",
        !d.querySelector(".ot-top a.from") && count(".ot-top .pill") === 3,
        [...d.querySelectorAll(".ot-top .pill")].map(e => e.textContent).join(" | "));
  d.getElementById("otQuit").dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(350);

  console.log("== Da go trang On tap tron cu ==");
  check("khong con ham viewReview", typeof win.viewReview === "undefined");
  check("van con shuffle() cho tab moi", typeof win.shuffle === "function");

  console.log("== Tab Nhap mon A0 ==");
  d.querySelector('#tabs button[data-m="nm"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(900);
  check("vao dung tab Nhap mon", text("#appTitle") === "Nhập Môn — Bắt Đầu Từ Số 0",
        text("#appTitle"));
  const nBasics = win.KC_DATA.bindex.groups.reduce((a, g) => a + g.items.length, 0);
  check("du 26 bai trong muc luc", nBasics === 26, nBasics + " bai");
  check("ca 26 bai deu da soan",
        win.KC_DATA.bindex.groups.every(g => g.items.every(i => i.detail === true)),
        Object.keys(win.KC_DATA.basics).length + " file");
  check("thanh ben co 6 nhom", count("#list .grp") === 6, count("#list .grp") + " nhom");

  // Mo bai 04 — bai thuat ngu, bai quan trong nhat
  const b4 = [...d.querySelectorAll("#list .grp .item")]
    .find(b => /Thuật ngữ/.test(b.querySelector("b").textContent + b.querySelector("i").textContent));
  b4.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(600);
  check("mo duoc bai thuat ngu", text("h1").indexOf("Thuật ngữ") > -1, text("h1"));
  check("bai nhap mon co dung 6 muc", count("main h2") === 6, count("main h2") + " muc");
  const secs = [...d.querySelectorAll("main h2")].map(e => e.textContent.replace(/^\d+/, ""));
  check("ten 6 muc dung chuan muc 15",
        secs[0] === "Bài này dạy gì" && secs[2] === "Quy tắc" && secs[5] === "Nhớ ba điều này",
        secs.join(" | "));
  check("bai 04 dinh nghia S V O", text("main").indexOf("chủ ngữ + động từ + tân ngữ") > -1);

  console.log("== Bai ngu phap sach, khong con dong nhac thuat ngu ==");
  // Nguoi dung yeu cau bo dong nhac [Nhap mon 04] o dau moi bai ngu phap.
  // Kiem tra tren DU LIEU: khong file nao con dau nhan cua linkterms.py.
  const lessons = Object.values(win.KC_DATA.lessons || {});
  const dirty = lessons.filter((L) => JSON.stringify(L).indexOf("data-terms-note") > -1);
  check("khong bai ngu phap nao con dong nhac", dirty.length === 0,
        dirty.length ? dirty.length + " bai con sot" : lessons.length + " bai deu sach");

  d.querySelector('#tabs button[data-m="ng"]').dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(900);
  // Bai 43 la bai dau tien trong thu tu hoc — chinh bai nguoi dung bao la kho hieu
  const g43 = [...d.querySelectorAll("#list .grp .item")]
    .find(b => b.querySelector(".n").textContent === "43");
  g43.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  await wait(600);
  check("bai 43 mo ra binh thuong sau khi go", text("h1").length > 0, text("h1"));
  check("bai 43 khong con callout thuat ngu",
        text("main").indexOf("Chưa quen mấy chữ in đậm") === -1);

  console.log("\n=== KET QUA ===");
  if (errors.length) {
    console.log("CO " + errors.length + " van de:");
    errors.forEach((e) => console.log(" - " + e));
    process.exit(1);
  }
  console.log("Sach — khong loi runtime, moi kiem tra deu dat.");
  process.exit(0);
})();
