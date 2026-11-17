// Waktu kata kunci, kamera virtual dan event visual #gunung-akar. Murni (tanpa import) supaya bisa dibaca node untuk shots/k.txt:
//   node --experimental-strip-types tools-k.mts
export type Wd = { w: string; s: number; e: number };
export type Key = [number, number, number, number]; // [t, x, y, zoom]  (x,y = titik dunia di jangkar layar 540,830)

export const makeTiming = (words: Wd[], starts: number[]) => {
  const W = words.filter((w) => w.w);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const kw = (target: string, after = 0) => {
    const tg = norm(target);
    const w = W.find((x) => x.s >= after - 0.01 && norm(x.w).length > 0 && norm(x.w).startsWith(tg));
    if (!w) throw new Error(`kata kunci tidak ketemu: ${target} setelah ${after}`);
    return w.s;
  };
  const [, S1, S2, S3, S4, S5, S6, END] = starts;
  const K = {
    // 1 hook
    gunung0: kw("gunung", 0), akar0: kw("akar", 0),
    // 2 sains
    yang2: kw("yang", S1), puncak: kw("puncaknya", S1), padahal: kw("padahal", S1), bawah: kw("bawah", S1), akar2: kw("akar", kw("tanah", S1)),
    menghujam: kw("menghujam", S1), puluhan: kw("puluhan", S1), ilmuwan: kw("ilmuwan", S1), n1855: kw("1855", S1), lalu2: kw("lalu", kw("1855", S1)),
    getaran: kw("getaran", S1), gempa: kw("gempa", S1),
    // 3 ayat
    tapi: kw("tapi", S2), n1400: kw("1400", S2), surat: kw("surat", S2), allah3: kw("allah", S2), bukankah: kw("bukankah", S2),
    sebagai1: kw("sebagai", S2), dan3: kw("dan", kw("hamparan", S2)), sebagai2: kw("sebagai", kw("gunung", S2)), pasak3: kw("pasak", S2),
    // 4 pasak
    pasak4: kw("pasak", S3), tenda: kw("tenda", S3), yang4: kw("yang", S3), ujungnya: kw("ujungnya", S3), bagian: kw("bagian", S3),
    tertanam4: kw("tertanam", S3), persis: kw("persis", S3), gunung4: kw("gunung", kw("persis", S3)), kan: kw("kan", kw("persis", S3)),
    // 5 siapa
    nabi: kw("nabi", S4), tidak5: kw("tidak", S4), bumi5: kw("bumi", S4), yang5: kw("yang", kw("bumi", S4)), allah5: kw("allah", S4), menciptakan: kw("menciptakan", S4),
    // 6 pesan
    pelajaran: kw("pelajarannya", S5), kuat: kw("kuat", S5), akarnya6: kw("akarnya", S5), kita6: kw("kita", S5), kekuatan: kw("kekuatan", S5),
    hati: kw("hati", S5), iman: kw("iman", S5), tanam: kw("tanam", S5), shalat: kw("shalat", S5), doa: kw("doa", S5), kebaikan: kw("kebaikan", S5),
    walau: kw("walau", S5), melihat6: kw("melihat", kw("walau", S5)),
    // 7 CTA
    tulis: kw("tulis", S6), subhanallah: kw("subhanallah", S6), simpan: kw("simpan", S6), bagikan: kw("bagikan", S6),
  };

  // Dunia A (penampang gunung): garis tanah, skala vertikal ASLI 30 px/km
  const GY = 1500, KM = 30, MX = 1500;
  const PEAK = GY - 9 * KM, TIP = GY + 70 * KM;
  // Peralihan antar-set (dtk)
  const TR = {
    ab0: S3 + 0.03, ab1: S3 + 0.33,                     // A → B (whip samping)
    mo0: K.persis - 0.1, mo1: K.persis + 0.5,            // B → A (morph pasak → akar gunung)
    ac0: S4 - 0.07, ac1: S4 + 0.23,                      // A → C (whip naik)
    ca0: S5 + 0.03, ca1: S5 + 0.33,                      // C → A (whip turun)
    end: END,
  };
  const WIDE: [number, number, number] = [MX, PEAK + 875, 0.4]; // seluruh penampang: puncak di y≈480, ujung akar di y≈1430
  const A: Key[] = [
    [0, MX, 1137, 0.8],
    [S1 - 0.05, MX, 1178, 0.9],                          // push-in pelan (hook)
    [S1 + 0.75, MX, PEAK, 2.2],                          // 2a zoom ke puncak
    [K.padahal + 0.7, MX + 20, PEAK - 4, 2.32],          // napas di puncak
    [K.padahal + 1.05, MX, GY + 520, 1.4],               // 2b WHIP turun menembus tanah
    [K.akar2 - 0.05, MX, GY + 560, 1.42],
    [K.puluhan + 0.6, MX, TIP - 260, 1.05],              // 2c menyusuri akar sampai ujung (bentuk U akar terlihat)
    [K.ilmuwan - 0.25, MX, TIP - 250, 1.08],
    [K.ilmuwan + 0.6, ...WIDE],                          // 2d pull-out lebar (latar blur)
    [K.lalu2 - 0.1, MX, WIDE[1], 0.42],
    [S2 - 0.05, MX, WIDE[1] - 25, 0.46],                 // 2e lebar + getar
    [K.n1400 - 0.2, MX, 700, 0.9],                       // 3 crane up ke langit
    [S3 + 0.4, MX, 600, 1.0],
    [TR.mo0 - 0.3, ...WIDE],                             // (tak terlihat) siap untuk morph
    [TR.ac0, MX, WIDE[1] - 25, 0.43],
    [TR.ca0, MX, 2700, 1.6],                             // 6a tiba di akar
    [K.akarnya6 - 0.1, MX, 2700, 1.62],
    [K.akarnya6 + 0.6, MX, 2850, 2.0],                   // push-in "akarnya"
    [K.kita6 - 0.05, MX, 2860, 2.02],
    [K.kita6 + 0.75, MX, 2700, 1.5],                     // pull "kita juga begitu"
    [K.tanam - 0.1, MX, 2930, 1.3],
    [K.shalat, MX, 2930, 1.3], [K.shalat + 0.35, MX, 2930, 1.38],   // 6b tiap kata zoom naik
    [K.doa, MX, 2930, 1.38], [K.doa + 0.35, MX, 2930, 1.46],
    [K.kebaikan, MX, 2930, 1.46], [K.kebaikan + 0.35, MX, 2930, 1.54],
    [K.walau - 0.2, MX, 2930, 1.56],
    [K.melihat6 - 0.1, ...WIDE],                         // 6c pull-out lebar
    [S6 - 0.05, MX, WIDE[1], 0.41],
    [S6 + 0.4, MX, 1400, 0.6],                           // 7 CTA: naik ke gunung + langit fajar
    [END + 3.5, MX, 1380, 0.66],
  ];
  // Dunia B (perkemahan): tanah BGY, pasak di PX
  const BGY = 1400, PX = 1350;
  const HITS = [K.ujungnya - 0.06, K.ujungnya + 0.34, K.ujungnya + 0.74];
  const B: Key[] = [
    [S3, 1050, 1150, 0.85],
    [K.yang4 - 0.45, 1100, 1190, 0.95],
    [K.yang4 + 0.3, PX + 20, 1300, 2.5],                 // 4b close-up kepala pasak
    [K.bagian + 0.1, PX + 20, 1305, 2.55],
    [K.tertanam4 - 0.15, PX, 1600, 1.8],                 // 4c tilt down batang pasak
    [TR.mo0 - 0.6, PX, 1610, 1.82],
    [TR.mo0, PX, 1560, 1.3],
  ];
  // Dunia C (lembah Makkah malam)
  const Cc: Key[] = [
    [S4 - 0.1, 540, 830, 1.0],
    [K.allah5 - 0.4, 540, 760, 1.12],
    [K.allah5 + 0.3, 540, 640, 1.3],                     // push-in ke cahaya
    [TR.ca0 + 0.3, 540, 620, 1.36],
  ];

  // Event visual (dtk) untuk SFX: gerak kamera + kemunculan teks/label
  const EV: Record<string, number> = {
    hook_text: 0,
    cam_peak_start: S1, cam_peak_end: S1 + 0.75, title_lihat: S1 + 0.9, label_puncak: K.puncak,
    cam_whip_down: K.padahal + 0.7, cam_whip_down_end: K.padahal + 1.05, ground_curtain_open: K.padahal + 1.07, title_tersembunyi: K.padahal + 1.2,
    title_akar: K.akar2 + 0.1, cam_track_root_start: K.akar2 - 0.05, root_grow_start: K.akar2, label_akar: K.menghujam,
    label_puluhan_km: K.puluhan, cam_track_root_end: K.puluhan + 0.6,
    cam_pullout_wide: K.ilmuwan - 0.25, cam_pullout_wide_end: K.ilmuwan + 0.6, title_1855: K.ilmuwan + 0.75, card_airy: K.ilmuwan + 0.75, n1855_lands: K.n1855,
    title_gempa: K.lalu2 + 0.1, wave1: K.lalu2 + 0.15, wave2: K.lalu2 + 0.6, wave3: K.lalu2 + 1.05, shake_gempa: K.getaran, root_flash: K.getaran + 0.05, title_terbukti: K.gempa,
    cam_crane_up: S2 + 0.1, cam_crane_up_end: K.n1400 - 0.2, title_1400: K.n1400 - 0.05, pill_annaba: K.surat, panel_ayat: K.allah3 - 0.2,
    tr_bukankah: K.bukankah, tr_hamparan: K.sebagai1, tr_gunung: K.dan3, tr_pasak: K.sebagai2, pasak_glow: K.pasak3,
    whip_side_to_camp: TR.ab0, whip_side_end: TR.ab1, title_apa_pasak: TR.ab1 + 0.15,
    cam_closeup_peg: K.yang4 - 0.45, cam_closeup_peg_end: K.yang4 + 0.3, title_kelihatan: K.yang4 + 0.45, label_ujung: K.ujungnya,
    hit1: HITS[0], hit2: HITS[1], hit3: HITS[2],
    cam_tilt_peg: K.bagian + 0.1, cam_tilt_peg_end: K.tertanam4 - 0.15, ground_see_through: K.tertanam4 - 0.3, shaft_glow: K.tertanam4, title_tertanam: K.tertanam4,
    morph_start: TR.mo0, morph_end: TR.mo1, label_pasak: TR.mo1 + 0.15, label_gunung: TR.mo1 + 0.15, title_mirip: K.kan, check_mirip: K.kan,
    whip_up_to_makkah: TR.ac0, whip_up_end: TR.ac1, title_siapa: TR.ac1 + 0.15, chip_mata: K.tidak5, chip_alat: K.tidak5 + 0.35,
    strike_chips: K.bumi5, chips_out: K.yang5 - 0.1, cam_push_light: K.allah5 - 0.4, light_descends: K.allah5 - 0.15, title_allah: K.allah5, sub_menciptakan: K.menciptakan,
    whip_down_to_root: TR.ca0, whip_down_end: TR.ca1, title_kuat: K.kuat - 0.4, label_akar6: K.akarnya6, cam_push_akarnya: K.akarnya6 - 0.1,
    cam_pull_kita: K.kita6 - 0.05, title_hati: K.kekuatan, label_iman: K.iman, title_tanam: K.tanam,
    branch_shalat: K.shalat, branch_doa: K.doa, branch_kebaikan: K.kebaikan,
    cam_pullout_kokoh: K.walau - 0.2, wind_start: K.walau - 0.1, title_kokoh: K.melihat6 + 0.05,
    cam_crane_cta: S6 - 0.05, title_tulis: S6 + 0.55, card_komentar: K.subhanallah, btn_simpan: K.simpan, btn_bagikan: K.bagikan,
    end_card: END,
  };
  return { K, A, B, C: Cc, TR, EV, HITS, GY, KM, MX, PEAK, TIP, BGY, PX, S: starts };
};
