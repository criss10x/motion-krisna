// Waktu kata kunci, kamera virtual dan event visual #ikhlas-dicintai. Murni (tanpa import) supaya bisa dibaca node untuk shots/k.txt:
//   node --experimental-strip-types skills/kamera-virtual/scripts/k.mts projects/ikhlas-dicintai
export type Wd = { w: string; s: number; e: number; k?: string };
export type Key = [number, number, number, number]; // [t, x, y, zoom]  (x,y = titik dunia di jangkar layar 540,830)
export type Run = { spk: string; s: number; e: number };

export const makeTiming = (words: Wd[], starts: number[]) => {
  const W = words.filter((w) => w.w);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const kw = (target: string, after = 0) => {
    const tg = norm(target);
    const w = W.find((x) => x.s >= after - 0.01 && norm(x.w).length > 0 && norm(x.w).startsWith(tg));
    if (!w) throw new Error(`kata kunci tidak ketemu: ${target} setelah ${after}`);
    return w.s;
  };
  const [, S1, S2, S3, S4, S5, S6, S7, S8, S9, END] = starts;
  const K = {
    // 1 hook
    kamu: kw("kamu", 0), spam: kw("spam", 0), alikhlas1: kw("alikhlas", 0), ada: kw("ada", 0), sahabat1: kw("sahabat", 0), begitu: kw("begitu", 0),
    rasulullah1: kw("rasulullah", 0), bilang: kw("bilang", 0), allah1: kw("allah", 0), mencintainya1: kw("mencintainya", 0), dengerin: kw("dengerin", 0), alasannya: kw("alasannya", 0),
    // 2 kisah
    rasulullah2: kw("rasulullah", S1), mengutus: kw("mengutus", S1), seorang: kw("seorang", S1), sahabat2: kw("sahabat", S1), memimpin: kw("memimpin", S1), pasukan2: kw("pasukan", S1),
    setiap: kw("setiap", S1), menjadi: kw("menjadi", S1), imam2: kw("imam", S1), shalat: kw("shalat", S1), selalu2: kw("selalu", S1), menutup2: kw("menutup", S1),
    bacaannya2: kw("bacaannya", S1), surat2: kw("surat", S1), alikhlas2: kw("alikhlas", S1),
    // 3 lapor (PRAJURIT)
    sepulangnya: kw("sepulangnya", S2), pasukan3: kw("pasukan", S2), melapor: kw("melapor", S2), ya: kw("ya", S2), rasulullah3: kw("rasulullah", S2), imam3: kw("imam", S2),
    kami: kw("kami", S2), alikhlas3: kw("alikhlas", S2),
    // 4 "tanyakan" (narator)
    beliau: kw("beliau", S3), bersabda4: kw("bersabda", S3), tanyakan: kw("tanyakan", S3), kepadanya4: kw("kepadanya", S3), kenapa4: kw("kenapa", S3), melakukan: kw("melakukan", S3),
    // 5 PRAJURIT bertanya
    kenapa5: kw("kenapa", S4), kamu5: kw("kamu", S4), menutup5: kw("menutup", S4), alikhlas5: kw("alikhlas", S4),
    // 6 IMAM menjawab
    karena6: kw("karena", S5), surat6: kw("surat", S5), sifat6: kw("sifat", S5), arrahman: kw("arrahman", S5), dan6: kw("dan", S5), aku6: kw("aku", S5), suka: kw("suka", S5), membacanya: kw("membacanya", S5),
    // 7 Allah mencintainya
    mendengar: kw("mendengar", S6), rasulullah7: kw("rasulullah", S6), bersabda7: kw("bersabda", S6), beritahukan: kw("beritahukan", S6), kepadanya7: kw("kepadanya", S6),
    allah7: kw("allah", S6), mencintainya7: kw("mencintainya", S6),
    // 8 empat sifat
    sifat8: kw("sifat", S7), apa: kw("apa", S7), cintai: kw("cintai", S7), empat: kw("empat", S7), ayat8: kw("ayat", S7), allah8: kw("allah", S7), maha: kw("maha", S7), esa: kw("esa", S7),
    tempat: kw("tempat", S7), meminta: kw("meminta", S7), segala: kw("segala", S7), sesuatu: kw("sesuatu", S7),
    tidak8a: kw("tidak", S7), beranak: kw("beranak", S7), tidak8b: kw("tidak", kw("beranak", S7) + 0.05), diperanakkan: kw("diperanakkan", S7),
    dan8: kw("dan", kw("diperanakkan", S7) + 0.05), tidak8c: kw("tidak", kw("diperanakkan", S7) + 0.05), ada8: kw("ada", kw("diperanakkan", S7) + 0.05), setara: kw("setara", S7), dengannya: kw("dengannya", S7),
    // 9 pelajaran
    sahabat9: kw("sahabat", S8), dicintai: kw("dicintai", S8), allah9: kw("allah", S8), karena9: kw("karena", S8), mencintai: kw("mencintai", S8), surat9: kw("surat", S8), sifatnya: kw("sifatnya", S8),
    maka: kw("maka", S8), bacalah: kw("bacalah", S8), alikhlas9: kw("alikhlas", S8), bukan: kw("bukan", S8), sekadar: kw("sekadar", S8), hafalan: kw("hafalan", S8),
    tapi: kw("tapi", S8), cinta9: kw("cinta", S8), allah9b: kw("allah", kw("cinta", S8)), sebut: kw("sebut", S8), dalamnya: kw("dalamnya", S8),
    // 10 CTA
    tulis: kw("tulis", S9), aku10: kw("aku", S9), cinta10: kw("cinta", S9), alikhlas10: kw("alikhlas", S9), komentar: kw("komentar", S9), simpan: kw("simpan", S9), bagikan: kw("bagikan", S9),
  };

  // run suara karakter (selain narator), dari kunci "k" tiap kata
  const SP: Run[] = [];
  for (const w of W) {
    const spk = w.k ?? "NARATOR";
    const last = SP[SP.length - 1];
    if (last && last.spk === spk) last.e = w.e;
    else SP.push({ spk, s: w.s, e: w.e });
  }
  const RUNS = SP.filter((r) => r.spk !== "NARATOR");
  const [P1, P2, I1] = RUNS;

  // ===== DUNIA A: Madinah (fajar) → gurun → kemah (malam) =====
  const GY = 700;
  const MASJ = 1350;                 // ambang pintu bercahaya (tanpa sosok)
  const IMX = 420;                   // sang imam di Madinah
  const PRX1 = 1500, PRX2 = 690;     // prajurit: di kanan pintu (menghadap kiri) / berhadapan imam
  const GRP = 1650;                  // barisan pasukan di Madinah (berkumpul / kembali)
  const MARCH = 2050;                // jarak berjalan keluar kota
  const CIMX = 5300;                 // imam di kemah
  const TENTS = [4700, 5900];
  const FIRE = 5640;

  // ===== DUNIA B: lembar Al-Ikhlas =====
  const LY = [-1750, -1390, -1030, -670];
  const PAGE = { x0: -1100, x1: 1100, y0: -2330, y1: -470 };
  const WORDS: [number, number, number][] = [
    [0, 510, 200], [0, 240, 200], [0, -100, 340], [0, -475, 270],
    [1, 240, 340], [1, -205, 410],
    [2, 545, 200], [2, 240, 270], [2, -100, 270], [2, -475, 340],
    [3, 680, 270], [3, 340, 270], [3, 35, 200], [3, -305, 340], [3, -680, 270],
  ];
  const WORD_T = [
    K.allah8 - 0.2, K.allah8, K.maha, K.esa,
    K.tempat, K.meminta + 0.1,
    K.tidak8a, K.beranak, K.tidak8b, K.diperanakkan,
    K.dan8, K.tidak8c, K.ada8 + 0.1, K.setara, K.dengannya,
  ];

  // ===== DUNIA C: kamar malam =====
  const FY = 300;

  const TR = {
    ab0: S7 - 0.25, ab1: S7 + 0.3,       // A → B (flash-zoom ke lembar)
    ba0: S8 - 0.25, ba1: S8 + 0.3,       // B → A (crossfade ke imam)
    ac0: K.maka - 0.3, ac1: K.maka + 0.2, // A → C (match-cut imam → "kamu")
    end: END,
  };
  // pergerakan pasukan & prajurit
  const MV = { m0: K.mengutus - 0.05, m1: K.setiap - 0.4 };
  const PW = { p0: S4 - 0.25, p1: S4 + 0.2 }; // prajurit pindah dari pintu ke depan imam (saat whip)

  const A: Key[] = [
    [0, 5230, GY - 232, 0.95],                          // 1 hook: kemah malam
    [K.alasannya, 5285, GY - 226, 1.15],                //   push-in pelan
    [K.rasulullah2 - 0.35, 5290, GY - 226, 1.16],
    [K.rasulullah2 + 0.35, MASJ + 40, GY - 260, 1.0],   // 2a whip ke Madinah (cahaya pintu)
    [MV.m0, MASJ + 120, GY - 255, 0.95],
    [MV.m0 + 0.35, GRP + 300, GY - 245, 0.86],          // 2b track barisan keluar kota
    [MV.m1, GRP + 300 + MARCH, GY - 245, 0.86],
    [K.setiap + 0.3, CIMX - 140, GY - 245, 0.9],        // 2c tiba di kemah
    [K.menutup2 - 0.25, CIMX - 100, GY - 236, 0.97],
    [K.menutup2 + 0.4, CIMX, GY - 270, 1.55],           // 2d push-in ke imam
    [S2 - 0.05, CIMX, GY - 276, 1.62],
    [K.sepulangnya - 0.2, CIMX, GY - 276, 1.62],
    [K.sepulangnya + 0.5, MASJ + 160, GY - 250, 0.95],  // 3a whip balik ke Madinah
    [K.ya - 0.35, MASJ + 120, GY - 250, 0.98],
    [K.ya + 0.25, PRX1 - 80, GY - 190, 1.55],           // 3b push ke prajurit + pintu
    [S3 - 0.05, PRX1 - 75, GY - 194, 1.6],
    [K.beliau - 0.1, PRX1 - 75, GY - 194, 1.6],
    [K.beliau + 0.6, MASJ - 10, GY - 232, 1.25],        // 4 tilt ke cahaya
    [PW.p0, MASJ - 20, GY - 236, 1.3],
    [PW.p1, PRX2 - 90, GY - 190, 1.5],                  // 5 whip ke prajurit ↔ imam
    [S5 - 0.1, PRX2 - 95, GY - 192, 1.55],
    [S5 + 0.4, IMX + 50, GY - 250, 1.9],                // 6 push-in ke imam
    [S6 - 0.1, IMX + 45, GY - 252, 1.95],
    [S6 + 0.6, MASJ - 20, GY - 250, 1.2],               // 7 kembali ke cahaya
    [K.allah7 - 0.4, MASJ - 30, GY - 256, 1.28],
    [K.allah7 + 0.45, 880, GY - 300, 0.72],             //   tarik lebar: cahaya, prajurit, imam
    [S7 - 0.45, 870, GY - 300, 0.74],
    [S7 + 0.3, IMX + 10, GY - 150, 2.6],                //   flash-zoom ke imam
    [S8 - 0.3, IMX + 10, GY - 160, 2.0],
    [S8 + 0.5, IMX + 30, GY - 190, 1.55],               // 9a imam bercahaya
    [TR.ac0, IMX + 20, GY - 182, 1.68],
    [TR.ac1, IMX + 20, GY - 180, 1.72],
    [END + 3.5, IMX + 20, GY - 180, 1.72],
  ];

  const B: Key[] = [
    [0, 0, -1300, 0.9],
    [TR.ab0, 0, -1300, 0.95],
    [S7 + 0.6, 0, -1300, 0.36],                         // 8 lembar utuh
    [K.allah8 - 0.4, 0, -1300, 0.37],
    [K.allah8 + 0.15, 60, LY[0] - 60, 0.66],                 //   baris 1
    [K.tempat - 0.3, 60, LY[0] - 60, 0.67],
    [K.tempat + 0.25, 40, LY[1] - 60, 0.8],                  //   baris 2
    [K.tidak8a - 0.3, 40, LY[1] - 60, 0.81],
    [K.tidak8a + 0.25, 60, LY[2] - 60, 0.62],                //   baris 3
    [K.dan8 - 0.3, 60, LY[2] - 60, 0.63],
    [K.dan8 + 0.25, 100, LY[3] - 60, 0.55],                  //   baris 4
    [K.dengannya + 0.25, 100, LY[3] - 60, 0.56],
    [S8 + 0.3, 0, -1300, 0.36],                         //   tarik keluar
    [END, 0, -1370, 0.38],
  ];

  const C: Key[] = [
    [0, -34, FY - 185, 1.75],
    [TR.ac0, -34, FY - 185, 1.75],                       // 9b match-cut: kepala "kamu" = posisi kepala imam
    [K.bukan, 0, FY - 172, 1.62],
    [K.tapi, 40, FY - 176, 1.5],
    [S9 - 0.1, 60, FY - 220, 1.22],
    [S9 + 0.7, 260, -330, 0.95],                         // 10 crane ke jendela
    [END + 3.5, 260, -350, 0.99],
  ];

  // Event visual (dtk) untuk SFX
  const EV: Record<string, number> = {
    hook_text: 0, hi_spam: K.spam, hi_mencintai: K.mencintainya1, fire_on: 0, cam_hook: 0, cam_hook_end: K.alasannya,
    whip_madinah: K.rasulullah2 - 0.35, whip_madinah_end: K.rasulullah2 + 0.35, label_madinah: K.rasulullah2 + 0.3, door_glow: K.rasulullah2 + 0.35,
    title_utus: K.mengutus, march_start: MV.m0, march_end: MV.m1, label_imam_march: K.memimpin,
    cam_camp: MV.m1, cam_camp_end: K.setiap + 0.3, label_kemah: K.setiap, title_imam: K.imam2, label_imam_camp: K.imam2,
    cam_push_imam: K.menutup2 - 0.25, cam_push_imam_end: K.menutup2 + 0.4, title_ditutup: K.menutup2, qul_glow: K.menutup2 + 0.1, hi_ikhlas2: K.alikhlas2,
    whip_back: K.sepulangnya - 0.2, whip_back_end: K.sepulangnya + 0.5, title_lapor: K.sepulangnya, group_arrive: K.sepulangnya + 0.4,
    cam_push_pr: K.ya - 0.35, cam_push_pr_end: K.ya + 0.25, bubble_p1: P1.s - 0.25, bubble_p1_out: P1.e + 0.5,
    cam_tilt_light: K.beliau - 0.1, cam_tilt_light_end: K.beliau + 0.6, card_tanya: K.bersabda4 - 0.2, pill_hadits: K.beliau,
    whip_dialog: PW.p0, whip_dialog_end: PW.p1, bubble_p2: P2.s - 0.25, bubble_p2_out: P2.e + 0.4,
    cam_push_imam6: S5 - 0.1, cam_push_imam6_end: S5 + 0.4, bubble_i1: I1.s - 0.25, card_imam: K.karena6 - 0.15, card_imam2: K.dan6, bubble_i1_out: I1.e + 0.5,
    cam_back_light: S6 - 0.1, cam_back_light_end: S6 + 0.6, card_cinta: K.bersabda7 - 0.2,
    cam_pull_wide7: K.allah7 - 0.4, cam_pull_wide7_end: K.allah7 + 0.45, burst: K.allah7, title_cinta: K.allah7, hi_cinta: K.mencintainya7,
    flash_zoom: S7 - 0.45, flash_peak: S7, page_in: TR.ab1,
    title_sifat: K.sifat8, hi_cintai8: K.cintai, markers: K.empat, title_4ayat: K.empat,
    cam_l1: K.allah8 - 0.4, cam_l1_end: K.allah8 + 0.15, title_esa: K.allah8, w0: WORD_T[0], w1: WORD_T[1], w2: WORD_T[2], w3: WORD_T[3],
    cam_l2: K.tempat - 0.3, cam_l2_end: K.tempat + 0.25, title_meminta: K.tempat, w4: WORD_T[4], w5: WORD_T[5],
    cam_l3: K.tidak8a - 0.3, cam_l3_end: K.tidak8a + 0.25, title_beranak: K.tidak8a, w6: WORD_T[6], w7: WORD_T[7], w8: WORD_T[8], w9: WORD_T[9],
    cam_l4: K.dan8 - 0.3, cam_l4_end: K.dan8 + 0.25, title_setara: K.dan8, w10: WORD_T[10], w11: WORD_T[11], w12: WORD_T[12], w13: WORD_T[13], w14: WORD_T[14],
    cam_page_out: K.dengannya + 0.25, cam_page_out_end: S8 + 0.3, fade_to_imam: TR.ba0,
    title_dicintai: K.sahabat9, hi_dicintai: K.dicintai, title_mencintai: K.karena9, hi_mencintai9: K.mencintai, aura_imam: S8,
    matchcut: TR.ac0, matchcut_end: TR.ac1, title_bacalah: K.maka, hafalan_lines: K.bukan, title_hafalan: K.bukan, hi_hafalan: K.hafalan,
    title_cinta9: K.tapi, hi_cinta9: K.cinta9, mushaf_glow: K.cinta9,
    crane_window: S9 - 0.1, crane_window_end: S9 + 0.7, title_tulis: K.tulis, card_komentar: K.aku10, btn_simpan: K.simpan, btn_bagikan: K.bagikan,
    end_card: END,
  };
  return { K, A, B, C, TR, EV, SP, RUNS, P1, P2, I1, GY, MASJ, IMX, PRX1, PRX2, GRP, MARCH, CIMX, TENTS, FIRE, LY, PAGE, WORDS, WORD_T, FY, MV, PW, S: starts };
};
