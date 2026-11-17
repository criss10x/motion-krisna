// Al-Ikhlas: Sahabat yang Dicintai Allah (Surah Pendek · 3), KAMERA VIRTUAL + DIALOG KARAKTER (skill kamera-virtual).
// Dunia A = panorama Madinah (fajar) → gurun → kemah pasukan (malam). Dunia B = lembar Al-Ikhlas. Dunia C = kamar malam "kamu".
// Rasulullah ﷺ TIDAK digambar & TIDAK disuarakan karakter: hanya cahaya lembut di ambang pintu; sabdanya dibacakan narator.
// Allah tidak digambar dalam bentuk apa pun. Semua tokoh = siluet tanpa wajah. PRAJURIT (teal) & SANG IMAM (emas) berdialog lewat balon.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadKufi } from "@remotion/google-fonts/ReemKufi";
import { loadFont as loadReadex } from "@remotion/google-fonts/ReadexPro";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import cues from "../public/cues.json";
import { C, NIGHT, Stars, Clouds, Rays, Vignette, glow, textGlow, mix, ramp as rampE, win as winE, IN, BACK, W, H } from "./env";
import { makeTiming, Key, Wd, Run } from "./timing";

const KUFI = loadKufi("normal", { weights: ["700"], subsets: ["arabic", "latin"] }).fontFamily;
const READEX = loadReadex("normal", { weights: ["500", "700"] }).fontFamily;
const AMIRI = loadAmiri("normal", { weights: ["700"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ramp = (t: number, a: number, b: number, e?: (x: number) => number) => (b - a < 1e-3 ? (t >= b ? 1 : 0) : rampE(t, a, b, e));
const win = (t: number, a: number, b: number, f = 0.4) => {
  const g = Math.min(f, (b - a) / 2 - 1e-3);
  return g <= 1e-3 ? 0 : winE(t, a, b, g);
};
const pulse = (t: number, at: number, dur = 0.6) => (t < at ? 0 : Math.max(0, 1 - (t - at) / dur));
const smooth = (x: number) => x * x * (3 - 2 * x);

const WORDS_ALL = cues.words as Wd[];
const STARTS = [...cues.scenes.map((s) => s.start)];
const TM = makeTiming(WORDS_ALL, STARTS);
const { K, TR, EV, P1, P2, I1, GY, MASJ, IMX, PRX1, PRX2, GRP, MARCH, CIMX, TENTS, FIRE, LY, PAGE, WORDS, WORD_T, FY, MV, PW } = TM;
const [, S1, S2, S3, S4, S5, S6, S7, S8, S9, END] = TM.S;
const LABEL = "SURAH PENDEK YANG KAMU BACA TIAP SHALAT · 3";
const TEAL = "#3FB8A8", TEAL_HI = "#9FF2E2";
const SPK: Record<string, { name: string; col: string; soft: string }> = {
  PRAJURIT: { name: "PRAJURIT", col: TEAL_HI, soft: "#D8FBF4" },
  IMAM: { name: "SANG IMAM", col: C.goldHi, soft: "#FFF1CC" },
};
const AR = ["قُلْ", "هُوَ", "ٱللَّهُ", "أَحَدٌ", "ٱللَّهُ", "ٱلصَّمَدُ", "لَمْ", "يَلِدْ", "وَلَمْ", "يُولَدْ", "وَلَمْ", "يَكُن", "لَهُۥ", "كُفُوًا", "أَحَدٌۢ"];
const AR_NUM = ["١", "٢", "٣", "٤"];

// =================== KAMERA ===================
type Cam = { x: number; y: number; z: number };
const AX = 540, AY = 830;
const EASE = Easing.bezier(0.65, 0, 0.35, 1);
const camAt = (keys: Key[], t: number): Cam => {
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], z: keys[0][3] };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) {
      const p = EASE(cl((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
      return { x: a[1] + (b[1] - a[1]) * p, y: a[2] + (b[2] - a[2]) * p, z: Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * p) };
    }
  }
  const l = keys[keys.length - 1];
  return { x: l[1], y: l[2], z: l[3] };
};
const cam = (keys: Key[], t: number): Cam => {
  const c = camAt(keys, t);
  return { ...c, z: c.z * (1 + 0.012 * Math.sin(t * 0.8)) };
};
const scr = (c: Cam, wx: number, wy: number) => [AX + (wx - c.x) * c.z, AY + (wy - c.y) * c.z] as const;
const vel = (keys: Key[], t: number) => {
  const a = cam(keys, t - 1 / 30), b = cam(keys, t);
  return { dx: (b.x - a.x) * b.z, dy: (b.y - a.y) * b.z };
};
const worldTf = (c: Cam) => `translate(${AX - c.x * c.z} ${AY - c.y * c.z}) scale(${c.z})`;
const shakeXY = (t: number, at: number, amp: number, dur: number) => {
  const k = t >= at && t < at + dur ? (1 - (t - at) / dur) * amp : 0;
  return [Math.sin(t * 90) * k, Math.cos(t * 77) * k] as const;
};

// =================== WARNA (hex → rgb aman) ===================
const hx = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const lerpV = (a: number[], b: number[], p: number) => a.map((v, i) => v + (b[i] - v) * p);
const rgb = (v: number[]) => `rgb(${v.map((x) => Math.round(x)).join(",")})`;
const MAD = { top: "#2A2260", mid: "#A35E80", low: "#F7B46C" };   // fajar Madinah
const CAMPN = { top: "#04051A", mid: "#131A46", low: "#352A5C" }; // malam kemah
const skyAt = (d: number) => {
  const k = (key: "top" | "mid" | "low") => rgb(lerpV(hx(MAD[key]), hx(CAMPN[key]), d));
  return { top: k("top"), mid: k("mid"), low: k("low") };
};

// =================== GEOMETRI DUNIA A ===================
const groundY = (x: number) => {
  let y = GY;
  if (x > 2300 && x < 4600) {
    const k = Math.sin((Math.PI * (x - 2300)) / 2300);
    y -= k * (30 + 26 * Math.sin(x / 230) + 12 * Math.sin(x / 91 + 1));
  }
  return y;
};
const GROUND_PTS: [number, number][] = [];
for (let x = -2600; x <= 8600; x += 30) GROUND_PTS.push([x, groundY(x)]);
const GROUND_D = `M-2600,${GY + 3000} L` + GROUND_PTS.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L") + ` L8600,${GY + 3000} Z`;
const GROUND_LINE = "M" + GROUND_PTS.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L");
const ridge = (seed: string, base: number, amp: number, x0 = -3600, x1 = 9600) => {
  const ph = [random(seed + "a") * 6, random(seed + "b") * 6, random(seed + "c") * 6];
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 40) {
    const h = amp * (0.55 + 0.45 * Math.sin(x / 1300 + ph[0])) * (0.6 + 0.25 * Math.sin(x / 260 + ph[1]) + 0.15 * Math.sin(x / 97 + ph[2]));
    pts.push(`${x},${(base - Math.max(10, h)).toFixed(1)}`);
  }
  return `M${x0},${base + 2500} L${pts.join(" L")} L${x1},${base + 2500} Z`;
};
const FAR1 = ridge("df1", GY - 30, 320), FAR2 = ridge("df2", GY - 8, 190);
const DUNES = ridge("ddn", GY + 6, 150, 2100, 4900);
type House = { x: number; w: number; h: number; win: number; door: boolean };
const houses = (seed: string, x0: number, x1: number, n: number, sc: number): House[] =>
  new Array(n).fill(0).map((_, i) => {
    const w = (70 + random(`${seed}w${i}`) * 80) * sc;
    const h = (60 + random(`${seed}h${i}`) * 90) * sc;
    const x = x0 + (i / Math.max(1, n - 1)) * (x1 - x0) + (random(`${seed}x${i}`) - 0.5) * 40 * sc;
    return { x, w, h, win: random(`${seed}l${i}`), door: w > 110 * sc };
  });
const HB = houses("mdb", -700, 2500, 30, 0.8);
const HF = [...houses("mdf1", -600, 180, 4, 1.05), ...houses("mdf2", 2000, 2500, 3, 1.05)];
const PALMS = [{ x: -260, s: 1.1 }, { x: 250, s: 0.95 }, { x: 960, s: 1.05 }, { x: 1830, s: 1.0 }, { x: 2480, s: 1.1 }, { x: 3350, s: 0.9 }, { x: 4380, s: 1.0 }, { x: 6250, s: 1.1 }];
const STAR_PTS = new Array(1100).fill(0).map((_, i) => ({ x: -3000 + random(`sx${i}`) * 12000, y: GY - 3000 + random(`sy${i}`) ** 0.8 * 2700, r: 0.8 + random(`sr${i}`) ** 3 * 2.6, k: random(`sk${i}`) }));
const PERSON = "M-34,0 C -36,-60 -30,-104 -18,-112 L 18,-112 C 30,-104 36,-60 34,0 Z M-17,-128 a17,17 0 1,0 34,0 a17,17 0 1,0 -34,0 Z";
const ROBE = "M-46,0 C -48,-50 -36,-104 -21,-115 L 21,-115 C 36,-104 48,-50 46,0 Z M-18,-131 a18,18 0 1,0 36,0 a18,18 0 1,0 -36,0 Z";
const TURBAN = "M-23,-134 C -26,-160 26,-160 23,-134 C 14,-128 -14,-128 -23,-134 Z";
const SIT = "M-34,0 C -36,-26 -30,-58 -16,-66 L 12,-66 C 24,-60 28,-44 26,-24 L 66,-20 C 74,-18 74,-2 66,0 Z M-13,-84 a16,16 0 1,0 32,0 a16,16 0 1,0 -32,0 Z";
// barisan pasukan Madinah (3 baris × 8, menghadap kanan saat berangkat)
const TROOP = new Array(24).fill(0).map((_, i) => {
  const row = Math.floor(i / 8), k = i % 8;
  return { x: GRP + k * 58 + row * 20 + (random(`tp${i}`) - 0.5) * 10, row, s: 1.0 + row * 0.07, ph: random(`tq${i}`) * 6 };
});
const LEADER_DX = 8 * 58 + 70;
// shaf di kemah (3 shaf di belakang imam)
const SHAF = new Array(15).fill(0).map((_, i) => {
  const r = Math.floor(i / 5), k = i % 5;
  return { x: CIMX - 200 - r * 115 + k * 12, y: GY - 10 + k * 6, s: 1.05 + k * 0.05 };
});

// =================== STATUS WAKTU ===================
const dayK = (c: Cam) => smooth(cl((c.x - 2300) / 2300)); // 0 fajar Madinah → 1 malam kemah
const doorGlow = (t: number) => cl(0.5 + 0.5 * (win(t, K.rasulullah2, K.memimpin, 0.4) + win(t, K.ya - 0.2, S4, 0.4) + win(t, K.mendengar, S7, 0.4)), 0, 1);
const marchP = (t: number) => (t >= S2 - 0.05 ? 0 : ramp(t, MV.m0, MV.m1, (x) => x));
const prX = (t: number) => {
  if (t < PW.p0) return interpolate(t, [K.sepulangnya + 0.45, K.ya - 0.35], [GRP - 40, PRX1], { ...clamp, easing: EASE });
  return interpolate(t, [PW.p0, PW.p1], [PRX1, PRX2], { ...clamp, easing: EASE });
};
const burstO = (t: number) => win(t, K.allah7 - 0.05, S7 + 0.35, 0.3);
const auraO = (t: number) => win(t, S8 - 0.3, TR.ac1 + 0.2, 0.5);

// ---------- karakter ----------
const Soldier: React.FC<{ x: number; y: number; s: number; face: number; fill: string; rim: string; rimO?: number; shield?: boolean; bob?: number }> = ({
  x, y, s, face, fill, rim, rimO = 0.55, shield, bob = 0,
}) => (
  <g transform={`translate(${x} ${y - bob}) scale(${s * face} ${s})`}>
    <line x1={24} y1={-4} x2={34} y2={-236} stroke={mix("#5A4030", "#2A2030", 0.4)} strokeWidth={5} />
    <path d="M28,-236 L34,-262 L40,-236 Z" fill="#C9CCD6" />
    <path d={PERSON} fill={fill} stroke={rim} strokeOpacity={rimO} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
    {shield && <g><circle cx={30} cy={-62} r={24} fill={mix("#3A4A5A", "#1C2230", 0.3)} stroke={rim} strokeOpacity={0.8} strokeWidth={2} vectorEffect="non-scaling-stroke" /><circle cx={30} cy={-62} r={6} fill={rim} opacity={0.7} /></g>}
  </g>
);
const Imam: React.FC<{ x: number; y: number; s: number; fill: string; rim?: string; rimO?: number }> = ({ x, y, s, fill, rim = C.goldHi, rimO = 0.7 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={ROBE} fill={fill} stroke={rim} strokeOpacity={rimO} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
    <path d={TURBAN} fill={mix("#EDE3CF", "#6A6070", 0.25)} stroke={rim} strokeOpacity={rimO} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
    <path d="M18,-136 C 30,-124 30,-108 24,-96" stroke={mix("#EDE3CF", "#6A6070", 0.25)} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M-30,-60 L30,-60" stroke={rim} strokeOpacity={rimO * 0.5} strokeWidth={2} vectorEffect="non-scaling-stroke" />
  </g>
);

// =================== DUNIA A ===================
const WorldA: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const d = dayK(c);
  const sky = skyAt(d);
  const sw = 1 / c.z;
  const bs = cl((c.z - 1.3) * 4, 0, 6);
  const par = (f: number, rx = 2600, ry = GY - 300) => `translate(${(c.x - rx) * (1 - f)} ${(c.y - ry) * (1 - f)})`;
  const wallB = mix("#9C6440", "#2A1F35", d), shadeB = mix("#74452E", "#1D1528", d);
  const wall = mix("#B57A4C", "#30243D", d), shade = mix("#85532F", "#20182C", d);
  const palmC = mix("#3A2A1E", "#0E0A16", d);
  const dg = doorGlow(t);
  const mp = marchP(t);
  const moving = t > MV.m0 && t < MV.m1 + 0.2 && t < S2;
  const fireF = 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 6.3);
  const qul = ramp(t, K.menutup2 + 0.35, K.menutup2 + 0.75) * (1 - ramp(t, S2 + 0.25, S2 + 0.7));
  const qulHot = pulse(t, K.alikhlas2, 1.2);
  const bo = burstO(t), ao = auraO(t);
  const px = prX(t);
  const prMoving = (t > K.sepulangnya + 0.45 && t < K.ya - 0.35) || (t > PW.p0 && t < PW.p1);
  const showMad = t >= S2 - 0.1;
  const troopO = 1;
  return (
    <g transform={worldTf(c)}>
      <defs>
        <linearGradient id="skyA" x1="0" y1={GY - 2400} x2="0" y2={GY} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={sky.top} /><stop offset="0.6" stopColor={sky.mid} /><stop offset="1" stopColor={sky.low} />
        </linearGradient>
        <linearGradient id="groundA" x1="0" y1={GY - 100} x2="0" y2={GY + 900} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mix("#C98A52", "#3A2E50", d)} /><stop offset="0.35" stopColor={mix("#9A6238", "#221A34", d)} /><stop offset="1" stopColor={mix("#6A3E22", "#100C1A", d)} />
        </linearGradient>
        <radialGradient id="lampA"><stop offset="0" stopColor="#FFF4CF" /><stop offset="0.3" stopColor={C.gold} stopOpacity={0.55} /><stop offset="1" stopColor={C.ember} stopOpacity={0} /></radialGradient>
        <radialGradient id="fireA"><stop offset="0" stopColor="#FFE2A0" /><stop offset="0.3" stopColor="#FF9A4A" stopOpacity={0.6} /><stop offset="1" stopColor={C.ember} stopOpacity={0} /></radialGradient>
        <radialGradient id="holyA"><stop offset="0" stopColor="#FFFBEA" /><stop offset="0.18" stopColor={C.goldHi} stopOpacity={0.85} /><stop offset="0.5" stopColor={C.gold} stopOpacity={0.3} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient>
        <radialGradient id="horizA" cx="0.5" cy="1" r="0.8"><stop offset="0" stopColor="#FFD9A0" stopOpacity={0.9} /><stop offset="0.5" stopColor="#F7A86A" stopOpacity={0.35} /><stop offset="1" stopColor="#F7A86A" stopOpacity={0} /></radialGradient>
        <radialGradient id="moonA"><stop offset="0" stopColor="#FFF9E8" /><stop offset="0.5" stopColor="#DCE6FF" /><stop offset="1" stopColor="#DCE6FF" stopOpacity={0} /></radialGradient>
        <linearGradient id="beamA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF3C8" stopOpacity={0.55} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></linearGradient>
        <filter id="dofA" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={bs / c.z} /></filter>
      </defs>
      <rect x={-3600} y={GY - 6000} width={13000} height={6005} fill="url(#skyA)" />
      {/* cahaya fajar di ufuk Madinah */}
      <ellipse cx={600} cy={GY} rx={2600} ry={900} fill="url(#horizA)" opacity={0.75 * (1 - d)} />
      {/* bintang (parallax 0,2) */}
      <g transform={par(0.2)} opacity={0.15 + 0.85 * d}>
        {STAR_PTS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * sw * Math.pow(c.z, 0.3)} fill={i % 7 ? "#FFF6E0" : "#BFD6FF"} opacity={0.5 + 0.5 * Math.sin(t * (1 + s.k * 3) + i)} />
        ))}
      </g>
      {/* bulan di atas kemah (parallax 0,12) */}
      <g opacity={d}>
        <circle cx={5790} cy={GY - 330} r={130} fill="url(#moonA)" opacity={0.6} /><circle cx={5790} cy={GY - 330} r={44} fill="#F4F1FF" opacity={0.95} />
      </g>
      {/* punggung gunung jauh (parallax), blur saat close-up */}
      <g filter={bs > 0.3 ? "url(#dofA)" : undefined}>
        <path d={FAR1} transform={par(0.45)} fill={mix("#9A6A7A", "#2A2550", d)} />
        <path d={FAR2} transform={par(0.65)} fill={mix("#7A4638", "#221A33", d)} stroke={mix("#FFD7A0", "#6B6AA8", d)} strokeOpacity={0.4} strokeWidth={2 * sw} />
      </g>
      <path d={DUNES} fill={mix("#B07A4A", "#2A2036", d)} stroke={mix("#FFD7A0", "#6B6AA8", d)} strokeOpacity={0.45} strokeWidth={2.5 * sw} />
      {/* rumah belakang Madinah */}
      {HB.map((b, i) => (
        <g key={`hb${i}`} transform={`translate(${b.x - b.w / 2} ${GY - 62 - b.h})`}>
          <rect width={b.w} height={b.h + 80} fill={wallB} /><rect x={b.w * 0.72} width={b.w * 0.28} height={b.h + 80} fill={shadeB} />
          <rect x={-3} y={-5} width={b.w + 6} height={7} fill={shadeB} />
          <rect x={b.w * 0.25} y={b.h * 0.3} width={8} height={11} rx={3} fill={b.win < 0.45 ? C.ember : "#1A1020"} opacity={0.75} />
        </g>
      ))}
      {/* tembok bata + ambang pintu bercahaya (kehadiran Rasulullah ﷺ, TANPA sosok) */}
      <g>
        <rect x={MASJ - 330} y={GY - 250} width={660} height={260} fill={mix("#A86E44", "#2E2238", d)} />
        <rect x={MASJ + 170} y={GY - 250} width={160} height={260} fill={mix("#82522F", "#22192C", d)} />
        <path d={`M${MASJ - 345},${GY - 250} ` + new Array(23).fill(0).map((_, k) => `L${MASJ - 345 + k * 30 + 15},${GY - 270 - (k % 2) * 10} L${MASJ - 345 + (k + 1) * 30},${GY - 250}`).join(" ")}
          fill={mix("#5A6A3A", "#1E2230", d)} />
        {[-240, -150, 150, 240].map((dx, i) => <rect key={i} x={MASJ + dx - 9} y={GY - 230} width={18} height={150} rx={6} fill={mix("#6E4A2E", "#1B1424", d)} opacity={0.7} />)}
        {/* sinar dari pintu ke tanah */}
        <path d={`M${MASJ - 50},${GY - 10} L${MASJ + 50},${GY - 10} L${MASJ + 320},${GY + 120} L${MASJ - 320},${GY + 120} Z`} fill="url(#beamA)" opacity={0.55 * dg} />
        <ellipse cx={MASJ} cy={GY + 8} rx={330} ry={34} fill="url(#holyA)" opacity={0.5 * dg} />
        <circle cx={MASJ} cy={GY - 90} r={260} fill="url(#holyA)" opacity={0.42 * dg} />
        <path d={`M${MASJ - 58},${GY} L${MASJ - 58},${GY - 130} C ${MASJ - 58},${GY - 200} ${MASJ + 58},${GY - 200} ${MASJ + 58},${GY - 130} L${MASJ + 58},${GY} Z`}
          fill="#FFF3C8" opacity={0.6 + 0.4 * dg} style={{ filter: `drop-shadow(0 0 ${(16 + 26 * dg) * sw}px ${C.goldHi})` }} />
        <path d={`M${MASJ - 70},${GY} L${MASJ - 70},${GY - 132} C ${MASJ - 70},${GY - 214} ${MASJ + 70},${GY - 214} ${MASJ + 70},${GY - 132} L${MASJ + 70},${GY}`}
          fill="none" stroke={mix("#E9C46A", "#8A7650", d)} strokeWidth={8} />
      </g>
      {/* tanah */}
      <path d={GROUND_D} fill="url(#groundA)" />
      <path d={GROUND_LINE} fill="none" stroke={mix("#FFD7A0", "#6B6AA8", d)} strokeOpacity={0.5} strokeWidth={2.5 * sw} />
      {/* rumah depan */}
      {HF.map((b, i) => (
        <g key={`hf${i}`} transform={`translate(${b.x - b.w / 2} ${GY - b.h})`}>
          <rect width={b.w} height={b.h + 60} fill={wall} /><rect x={b.w * 0.72} width={b.w * 0.28} height={b.h + 60} fill={shade} />
          <rect x={-3} y={-6} width={b.w + 6} height={8} fill={shade} />
          <rect x={b.w * 0.25} y={b.h * 0.3} width={10} height={14} rx={4} fill={b.win < 0.5 ? C.ember : "#1A1020"} opacity={0.8} />
          {b.door && <rect x={b.w * 0.5} y={b.h * 0.55} width={16} height={b.h * 0.45} rx={7} fill="#140B12" />}
        </g>
      ))}
      {/* palem */}
      {PALMS.map((p, i) => {
        const sway = Math.sin(t * 0.9 + i) * 3;
        return (
          <g key={`p${i}`} transform={`translate(${p.x} ${groundY(p.x) + 4}) scale(${p.s})`}>
            <path d={`M0,0 C ${8 + sway},-90 ${-6 + sway},-180 ${14 + sway * 2},-260`} stroke={palmC} strokeWidth={13} fill="none" strokeLinecap="round" />
            <g transform={`translate(${14 + sway * 2} -260) rotate(${sway})`}>
              {[-150, -115, -80, -45, -10, 25, 60, 200].map((a, k) => (
                <path key={k} transform={`rotate(${a + Math.sin(t * 1.3 + k + i) * 4})`} d="M0,0 C 40,-24 90,-20 128,12 C 92,-4 46,-2 0,8 Z" fill={palmC} />
              ))}
            </g>
          </g>
        );
      })}
      {/* ===== KEMAH PASUKAN (malam) ===== */}
      {TENTS.map((x, i) => (
        <g key={`tn${i}`} transform={`translate(${x} ${GY})`}>
          <path d="M-190,0 L0,-210 L190,0 Z" fill={mix("#8A7A6A", "#3A3048", d)} stroke={mix("#FFD7A0", "#8A7AB0", d)} strokeOpacity={0.5} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <path d="M0,-210 L60,0 L-10,0 Z" fill={mix("#5A4A3A", "#211A2C", d)} />
          <path d="M0,-210 L0,-240" stroke="#3A2A1E" strokeWidth={6} />
          <path d="M-190,0 L-250,10 M190,0 L250,10" stroke={mix("#8A7A6A", "#4A4058", d)} strokeWidth={2} />
          <ellipse cx={-30} cy={-40} rx={40} ry={26} fill="url(#lampA)" opacity={0.5 * fireF} />
        </g>
      ))}
      {/* api unggun */}
      <g transform={`translate(${FIRE} ${GY})`}>
        <circle cx={0} cy={-40} r={330 * fireF} fill="url(#fireA)" opacity={0.6 * (0.3 + 0.7 * d)} />
        <path d="M-50,0 L40,-18 M-40,-18 L50,0" stroke="#3A2414" strokeWidth={12} strokeLinecap="round" />
        <path d={`M-30,-6 Q-34,${-60 - 10 * Math.sin(t * 9)} 0,${-100 - 14 * Math.sin(t * 7)} Q34,${-60 - 10 * Math.cos(t * 8)} 30,-6 Z`} fill="#FF9A4A" />
        <path d={`M-16,-6 Q-18,${-40 - 8 * Math.sin(t * 10)} 0,${-70 - 10 * Math.sin(t * 8)} Q18,${-40 - 8 * Math.cos(t * 9)} 16,-6 Z`} fill="#FFE2A0" />
        {[0, 1, 2, 3].map((k) => { const ph = ((t * 0.7 + k / 4) % 1); return <circle key={k} cx={Math.sin(k * 3 + t) * 20} cy={-100 - ph * 260} r={4} fill="#FFC870" opacity={1 - ph} />; })}
      </g>
      {/* shaf di belakang imam + imam kemah */}
      {SHAF.map((p, i) => (
        <path key={`sf${i}`} d={PERSON} transform={`translate(${p.x} ${p.y}) scale(${p.s})`} fill={mix("#3A2E4A", "#16122A", d)}
          stroke={C.goldHi} strokeOpacity={0.35} strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
      ))}
      <Imam x={CIMX} y={GY} s={1.5} fill={mix("#4A3A5A", "#1C1630", d)} rimO={0.75} />
      {/* Al-Ikhlas menyala di atas imam (visual saja) */}
      {qul > 0.01 && (
        <g opacity={qul}>
          <circle cx={CIMX} cy={GY - 380} r={300} fill="url(#holyA)" opacity={0.25 + 0.25 * qulHot} />
          {[0, 1, 2, 3, 4, 5].map((k) => { const ph = ((t * 0.6 + k / 6) % 1); return <circle key={k} cx={CIMX + Math.sin(k * 2.1 + t) * 40} cy={GY - 220 - ph * 180} r={4 * sw} fill={C.goldHi} opacity={Math.sin(Math.PI * ph)} />; })}
          <text x={CIMX} y={GY - 380} fontFamily={AMIRI} fontWeight={700} fontSize={84} fill={C.goldHi} textAnchor="middle" dominantBaseline="central"
            style={{ filter: `drop-shadow(0 0 ${(10 + 20 * qulHot) * sw}px ${C.gold})` }}>قُلْ هُوَ ٱللَّهُ أَحَدٌ</text>
        </g>
      )}
      {/* ===== PASUKAN MADINAH (berkumpul → berangkat → kembali) ===== */}
      <g opacity={troopO}>
        {TROOP.slice().sort((a, b) => a.row - b.row).map((p, i) => {
          const x = p.x + mp * MARCH;
          const bob = moving ? Math.abs(Math.sin(t * 9 + p.ph)) * 6 : 0;
          return <Soldier key={`tr${i}`} x={x} y={groundY(x) - 8 + p.row * 9} s={p.s} face={t < S2 - 0.05 ? 1 : -1} fill={mix(p.row === 2 ? "#3A2E44" : "#4A3A54", "#1C1630", d)}
            rim={mix("#FFE7A3", "#9FF2E2", 0.3)} rimO={0.45} bob={bob} />;
        })}
        {t < S2 - 0.05 && (() => {
          const x = GRP + LEADER_DX + mp * MARCH;
          const bob = moving ? Math.abs(Math.sin(t * 9)) * 6 : 0;
          return <g transform={`translate(0 ${-bob})`}><Imam x={x} y={groundY(x) + 2} s={1.42} fill={mix("#4A3A5A", "#1C1630", d)} rimO={0.8} /></g>;
        })()}
        {/* debu langkah */}
        {moving && new Array(8).fill(0).map((_, k) => {
          const ph = ((t * 1.4 + k / 8) % 1);
          const x = GRP - 60 + mp * MARCH + k * 70;
          return <ellipse key={`du${k}`} cx={x - ph * 120} cy={groundY(x) - 10 - ph * 40} rx={40 + ph * 70} ry={18 + ph * 26} fill={mix("#E8B98A", "#6B5A7A", d)} opacity={0.35 * (1 - ph)} />;
        })}
      </g>
      {/* ===== SANG IMAM & PRAJURIT di Madinah ===== */}
      {showMad && (
        <g>
          {(ao > 0.01 || bo > 0.01) && <circle cx={IMX} cy={GY - 120} r={300 + 160 * bo} fill="url(#holyA)" opacity={0.75 * Math.max(ao, bo)} />}
          {ao > 0.01 && new Array(9).fill(0).map((_, k) => {
            const ph = ((t * 0.4 + k / 9) % 1);
            return <path key={`ap${k}`} d="M0,-10 L3,-3 L10,0 L3,3 L0,10 L-3,3 L-10,0 L-3,-3 Z" transform={`translate(${IMX + Math.sin(k * 2.4 + t * 0.8) * 120} ${GY - 40 - ph * 300}) scale(${1.2 * sw * 1.6})`}
              fill="#FFF3C8" opacity={ao * Math.sin(Math.PI * ph)} />;
          })}
          {bo > 0.01 && (
            <g opacity={bo} transform={`translate(${IMX} ${GY - 130})`}>
              {new Array(16).fill(0).map((_, i) => {
                const a = (i / 16) * Math.PI * 2 + t * 0.35;
                const L = 520 + 120 * Math.sin(i * 1.7);
                return <path key={i} d={`M0,0 L${Math.cos(a - 0.04) * L},${Math.sin(a - 0.04) * L} L${Math.cos(a + 0.04) * L},${Math.sin(a + 0.04) * L} Z`} fill={C.goldHi} opacity={0.16} />;
              })}
              {new Array(14).fill(0).map((_, i) => {
                const a = (i / 14) * Math.PI * 2 + 0.3;
                const r = 90 + 380 * ramp(t, K.allah7, K.allah7 + 1.2);
                return <path key={`st${i}`} d="M0,-14 L4,-4 L14,0 L4,4 L0,14 L-4,4 L-14,0 L-4,-4 Z" transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r * 0.8}) scale(${1.4 + Math.sin(t * 6 + i)})`} fill="#FFF6D8" />;
              })}
            </g>
          )}
          <Imam x={IMX} y={GY} s={1.5} fill={mix("#4A3A5A", "#1C1630", d)} rimO={0.85} />
          <Soldier x={px} y={GY} s={1.32} face={-1} fill={mix("#33485A", "#162030", d)} rim={TEAL_HI} rimO={0.85} shield bob={prMoving ? Math.abs(Math.sin(t * 9)) * 5 : 0} />
        </g>
      )}
    </g>
  );
};

// =================== DUNIA B (lembar Al-Ikhlas) ===================
const STAR8 = (r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i) / 16 - Math.PI / 2, rr = i % 2 ? r * 0.55 : r;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return "M" + pts.join(" L") + " Z";
};
const S8_60 = STAR8(30), S8_40 = STAR8(20);
const BORDER_STARS: [number, number][] = [];
{
  const { x0, x1, y0, y1 } = PAGE, m = 50;
  for (let x = x0 + 110; x <= x1 - 100; x += 110) { BORDER_STARS.push([x, y0 + m]); BORDER_STARS.push([x, y1 - m]); }
  for (let y = y0 + 160; y <= y1 - 150; y += 110) { BORDER_STARS.push([x0 + m, y]); BORDER_STARS.push([x1 - m, y]); }
}
const LATTICE: [number, number][] = [];
for (let x = PAGE.x0 + 200; x < PAGE.x1 - 120; x += 170) for (let y = PAGE.y0 + 260; y < PAGE.y1 - 120; y += 170) LATTICE.push([x, y]);
const BSTARS = new Array(500).fill(0).map((_, i) => ({ x: -2600 + random(`gx${i}`) * 5200, y: -3800 + random(`gy${i}`) * 4600, r: 1 + random(`gr${i}`) ** 3 * 3, k: random(`gk${i}`) }));
const LINE_T = [[K.allah8 - 0.3, K.tempat - 0.25], [K.tempat - 0.2, K.tidak8a - 0.25], [K.tidak8a - 0.2, K.dan8 - 0.25], [K.dan8 - 0.2, K.dengannya + 0.4]];
const wordLitB = (i: number, t: number) => cl(Math.max(ramp(t, WORD_T[i] - 0.05, WORD_T[i] + 0.25), ramp(t, K.empat - 0.1 + i * 0.03, K.empat + 0.2 + i * 0.03) * 0.35));
const WorldB: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const sw = 1 / c.z;
  const allGlow = ramp(t, K.dengannya + 0.3, K.dengannya + 0.8);
  return (
    <g transform={worldTf(c)}>
      <defs>
        <radialGradient id="bgB" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#1A1E4E" /><stop offset="0.6" stopColor="#0B0F30" /><stop offset="1" stopColor="#04051A" /></radialGradient>
        <linearGradient id="pageB" x1="0" y1={PAGE.y0} x2="0" y2={PAGE.y1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#13234A" /><stop offset="0.55" stopColor="#0D1A3C" /><stop offset="1" stopColor="#0A1430" />
        </linearGradient>
      </defs>
      <rect x={-4000} y={-5200} width={8000} height={7600} fill="url(#bgB)" />
      {BSTARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * sw * Math.pow(c.z, 0.35)} fill="#FFF6E0" opacity={0.35 + 0.45 * Math.sin(t * (1 + s.k * 3) + i)} />)}
      <rect x={PAGE.x0 - 80} y={PAGE.y0 - 80} width={PAGE.x1 - PAGE.x0 + 160} height={PAGE.y1 - PAGE.y0 + 160} rx={120} fill={C.gold} opacity={0.1 + 0.08 * allGlow} style={{ filter: "blur(40px)" }} />
      <rect x={PAGE.x0} y={PAGE.y0} width={PAGE.x1 - PAGE.x0} height={PAGE.y1 - PAGE.y0} rx={46} fill="url(#pageB)" stroke={C.gold} strokeWidth={8} />
      <rect x={PAGE.x0 + 22} y={PAGE.y0 + 22} width={PAGE.x1 - PAGE.x0 - 44} height={PAGE.y1 - PAGE.y0 - 44} rx={32} fill="none" stroke={C.gold} strokeOpacity={0.7} strokeWidth={3} />
      <rect x={PAGE.x0 + 82} y={PAGE.y0 + 82} width={PAGE.x1 - PAGE.x0 - 164} height={PAGE.y1 - PAGE.y0 - 164} rx={22} fill="none" stroke={C.gold} strokeOpacity={0.7} strokeWidth={3} />
      {BORDER_STARS.map(([x, y], i) => <path key={i} d={S8_40} transform={`translate(${x} ${y})`} fill="none" stroke={C.gold} strokeOpacity={0.75} strokeWidth={3} />)}
      {LATTICE.map(([x, y], i) => <path key={`l${i}`} d={S8_60} transform={`translate(${x} ${y})`} fill="none" stroke={TEAL} strokeOpacity={0.09} strokeWidth={3} />)}
      {[[PAGE.x0 + 50, PAGE.y0 + 50], [PAGE.x1 - 50, PAGE.y0 + 50], [PAGE.x0 + 50, PAGE.y1 - 50], [PAGE.x1 - 50, PAGE.y1 - 50]].map(([x, y], i) => (
        <g key={`c${i}`} transform={`translate(${x} ${y})`}><circle r={44} fill="#0B1634" stroke={C.gold} strokeWidth={4} /><path d={S8_40} fill={C.gold} opacity={0.85} /></g>
      ))}
      <g transform={`translate(0 ${PAGE.y0 + 190})`}>
        <path d="M-520,0 L-460,-80 L460,-80 L520,0 L460,80 L-460,80 Z" fill="#0A1430" stroke={C.gold} strokeWidth={5} />
        <text x={0} y={4} fontFamily={AMIRI} fontWeight={700} fontSize={92} fill={C.goldHi} textAnchor="middle" dominantBaseline="central">سُورَةُ ٱلْإِخْلَاصِ</text>
      </g>
      {LY.map((y, l) => {
        const o = win(t, LINE_T[l][0], LINE_T[l][1], 0.35);
        return o > 0.01 ? <rect key={`h${l}`} x={PAGE.x0 + 120} y={y - 130} width={PAGE.x1 - PAGE.x0 - 240} height={260} rx={40} fill={TEAL} opacity={0.13 * o} /> : null;
      })}
      {WORDS.map(([l, x], i) => {
        const L = Math.max(wordLitB(i, t), allGlow), g = pulse(t, WORD_T[i], 0.8) + 0.6 * allGlow;
        return (
          <text key={`w${i}`} x={x} y={LY[l]} fontFamily={AMIRI} fontWeight={700} fontSize={150} textAnchor="middle" dominantBaseline="central"
            fill={L > 0.5 ? C.goldHi : "#8A7650"} opacity={0.5 + 0.5 * L}
            style={{ filter: L > 0.2 ? `drop-shadow(0 0 ${(6 + 22 * cl(g)) * Math.max(sw, 0.6)}px ${C.gold})` : undefined }}>{AR[i]}</text>
        );
      })}
      {LY.map((y, l) => {
        const last = WORDS.filter((w) => w[0] === l).slice(-1)[0];
        const mx = last[1] - last[2] / 2 - 85;
        const at = K.empat + l * 0.12;
        const hot = pulse(t, at, 0.8);
        return (
          <g key={`m${l}`} transform={`translate(${mx} ${y}) scale(${1 + 0.35 * hot})`}>
            <circle r={48} fill="#0A1430" stroke={C.gold} strokeWidth={4} style={{ filter: hot > 0.05 ? `drop-shadow(0 0 ${18 * sw}px ${C.gold})` : undefined }} />
            <path d={S8_40} fill="none" stroke={C.gold} strokeOpacity={0.6} strokeWidth={2.5} transform="scale(1.9)" />
            <text x={0} y={4} fontFamily={AMIRI} fontWeight={700} fontSize={56} fill={C.goldHi} textAnchor="middle" dominantBaseline="central">{AR_NUM[l]}</text>
          </g>
        );
      })}
    </g>
  );
};

// =================== DUNIA C (kamar malam "kamu") ===================
const HAFAL = "قُلْ هُوَ ٱللَّهُ أَحَدٌ  ٱللَّهُ ٱلصَّمَدُ  لَمْ يَلِدْ وَلَمْ يُولَدْ  ";
const BOOKS = new Array(30).fill(0).map((_, i) => ({ w: 18 + random(`bw${i}`) * 16, h: 70 + random(`bh${i}`) * 40, c: ["#5A2E3A", "#2E4A5A", "#6A5A2E", "#3A2E5A", "#2E5A44"][i % 5] }));
const WorldC: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const sw = 1 / c.z;
  const hafal = win(t, K.bukan - 0.15, K.cinta9 + 0.4, 0.35);
  const love = ramp(t, K.cinta9 - 0.1, K.cinta9 + 0.6);
  const lan = 0.9 + 0.1 * Math.sin(t * 7) * Math.sin(t * 4.3);
  const PX = -60;
  return (
    <g transform={worldTf(c)}>
      <defs>
        <linearGradient id="wallC" x1="0" y1={-1600} x2="0" y2={FY} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#0C1030" /><stop offset="1" stopColor="#1B1E44" /></linearGradient>
        <linearGradient id="floorC" x1="0" y1={FY} x2="0" y2={FY + 900} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2A2240" /><stop offset="1" stopColor="#0E0A1A" /></linearGradient>
        <radialGradient id="lampC"><stop offset="0" stopColor="#FFF4CF" /><stop offset="0.3" stopColor={C.gold} stopOpacity={0.5} /><stop offset="1" stopColor={C.ember} stopOpacity={0} /></radialGradient>
        <radialGradient id="loveC"><stop offset="0" stopColor="#FFFBEA" /><stop offset="0.2" stopColor={C.goldHi} stopOpacity={0.7} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient>
        <linearGradient id="winC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060A2A" /><stop offset="1" stopColor="#1C2A5A" /></linearGradient>
        <linearGradient id="moonBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFD6FF" stopOpacity={0.22} /><stop offset="1" stopColor="#BFD6FF" stopOpacity={0} /></linearGradient>
      </defs>
      <rect x={-1800} y={-2000} width={3600} height={2000 + FY} fill="url(#wallC)" />
      {/* jendela + bulan */}
      <g>
        <rect x={130} y={-720} width={360} height={470} rx={14} fill="url(#winC)" stroke="#3A3060" strokeWidth={14} />
        {new Array(16).fill(0).map((_, i) => <circle key={i} cx={150 + random(`ws${i}`) * 320} cy={-700 + random(`wy${i}`) * 300} r={2 + random(`wr${i}`) * 2.5} fill="#FFF6E0" opacity={0.5 + 0.4 * Math.sin(t * 2 + i)} />)}
        <circle cx={390} cy={-590} r={90} fill="#DCE6FF" opacity={0.18} /><circle cx={390} cy={-590} r={44} fill="#F4F1FF" />
        <path d="M310,-720 L310,-250 M130,-485 L490,-485" stroke="#3A3060" strokeWidth={10} />
        <path d={`M130,-250 L490,-250 L700,${FY} L80,${FY} Z`} fill="url(#moonBeam)" />
      </g>
      {/* rak buku */}
      <g transform={`translate(-820 ${-640})`}>
        <rect x={0} y={0} width={330} height={640 + FY - 0} fill="#1A1430" stroke="#3A3060" strokeWidth={8} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r} transform={`translate(14 ${30 + r * 180})`}>
            <rect x={-6} y={130} width={314} height={10} fill="#3A3060" />
            {BOOKS.slice(r * 7, r * 7 + 7).map((b, k) => <rect key={k} x={k * 40 + 6} y={130 - b.h} width={b.w} height={b.h} rx={3} fill={b.c} opacity={0.85} />)}
          </g>
        ))}
      </g>
      {/* lantai + sajadah */}
      <rect x={-1800} y={FY} width={3600} height={1400} fill="url(#floorC)" />
      <path d={`M${PX - 230},${FY + 6} L${PX + 300},${FY + 6} L${PX + 330},${FY + 70} L${PX - 260},${FY + 70} Z`} fill="#5A1E2E" stroke={C.gold} strokeOpacity={0.6} strokeWidth={3} />
      <path d={`M${PX + 230},${FY + 16} L${PX + 290},${FY + 16} L${PX + 300},${FY + 60} L${PX + 240},${FY + 60} Z`} fill="none" stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} />
      {/* meja rendah + lampu */}
      <g transform={`translate(-430 ${FY})`}>
        <circle cx={0} cy={-150} r={300 * lan} fill="url(#lampC)" opacity={0.55} />
        <rect x={-110} y={-80} width={220} height={16} rx={4} fill="#3A2A22" /><rect x={-96} y={-64} width={12} height={64} fill="#2A1E18" /><rect x={84} y={-64} width={12} height={64} fill="#2A1E18" />
        <rect x={-10} y={-150} width={20} height={70} fill="#8A6A3A" /><path d="M-60,-150 L60,-150 L40,-220 L-40,-220 Z" fill="#E8C878" opacity={0.95} />
      </g>
      {/* teks hafalan (abu-abu, mekanis) */}
      {hafal > 0.01 && (
        <g opacity={hafal * (1 - 0.8 * love)}>
          {[0, 1, 2, 3, 4].map((r) => (
            <text key={r} x={-700 + (((-(t - K.bukan) * (380 + r * 60)) % 900) - 0) + r * 120} y={FY - 520 + r * 70} fontFamily={AMIRI} fontWeight={700} fontSize={46}
              fill="#8A8AA0" opacity={0.28} style={{ whiteSpace: "pre" }}>{HAFAL.repeat(3)}</text>
          ))}
        </g>
      )}
      {/* cinta: cahaya hangat dari mushaf */}
      {love > 0.01 && <circle cx={PX + 150} cy={FY - 150} r={420} fill="url(#loveC)" opacity={0.55 * love} />}
      {love > 0.01 && new Array(10).fill(0).map((_, k) => {
        const ph = ((t * 0.45 + k / 10) % 1);
        return <path key={k} d="M0,-10 L3,-3 L10,0 L3,3 L0,10 L-3,3 L-10,0 L-3,-3 Z" transform={`translate(${PX + 200 + Math.sin(k * 2.3 + t) * 140} ${FY - 140 - ph * 420}) scale(${1.4 * sw * 1.5})`}
          fill="#FFF3C8" opacity={love * Math.sin(Math.PI * ph)} />;
      })}
      {/* rehal + mushaf */}
      <g transform={`translate(${PX + 230} ${FY})`}>
        <path d="M-50,0 L40,-100 M50,0 L-40,-100" stroke="#6A4A2E" strokeWidth={10} strokeLinecap="round" />
        <path d="M-70,-100 L0,-118 L0,-150 L-74,-132 Z" fill={mix("#EFE3C8", "#FFF6D8", love)} stroke={C.gold} strokeWidth={2} />
        <path d="M70,-100 L0,-118 L0,-150 L74,-132 Z" fill={mix("#E5D6B6", "#FFF6D8", love)} stroke={C.gold} strokeWidth={2} />
        {[0, 1, 2].map((k) => <path key={k} d={`M${-62 + k * 3},${-110 - k * 6} L-8,${-124 - k * 6} M${8},${-124 - k * 6} L${60 - k * 3},${-110 - k * 6}`} stroke="#8A7650" strokeWidth={2} opacity={0.6} />)}
        <circle cx={0} cy={-130} r={90} fill="url(#loveC)" opacity={0.25 + 0.55 * love} />
      </g>
      {/* "kamu": siluet duduk membaca (tanpa wajah) */}
      <path d={SIT} transform={`translate(${PX} ${FY}) scale(2.4)`} fill="#161C34" stroke={love > 0.3 ? C.goldHi : TEAL_HI} strokeOpacity={0.55 + 0.35 * love} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </g>
  );
};

// =================== HUD ===================
const Title: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number; color?: string; hiAt?: number }> = ({
  t, at, until, text, y = 318, size = 78, color = C.gold, hiAt,
}) => {
  if (t < at - 0.1 || t > until + 0.05) return null;
  const words = text.split(" ");
  const out = 1 - ramp(t, until - 0.3, until, IN);
  const pop = hiAt === undefined ? 0 : Math.max(0, 1 - Math.abs(t - hiAt - 0.12) / 0.35);
  return (
    <div style={{ position: "absolute", top: y, left: 100, width: 840, textAlign: "center", opacity: out,
      fontFamily: KUFI, fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: -1 }}>
      {words.map((w, i) => {
        if (w === "|") return <br key={i} />;
        const hi = w.startsWith("*");
        const p = ramp(t, at + i * 0.07, at + i * 0.07 + 0.42, BACK);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0 9px" }}>
            <span style={{ display: "inline-block", translate: `0px ${(1 - p) * 110}%`, color: hi ? color : C.text, scale: hi ? String(1 + 0.06 * pop) : undefined,
              textShadow: hi ? `0 0 3px #000, 0 4px 12px rgba(0,0,0,0.85), 0 0 30px ${color}88` : textGlow("#000000") }}>{w.replace(/\*/g, "").replace(/_/g, " ")}</span>
          </span>
        );
      })}
    </div>
  );
};
const Pill: React.FC<{ t: number; at: number; until: number; children: React.ReactNode; y?: number; color?: string; size?: number }> = ({
  t, at, until, children, y = 1205, color = C.goldHi, size = 30,
}) => (
  <div style={{ position: "absolute", top: y, left: 100, width: 840, display: "flex", justifyContent: "center",
    opacity: win(t, at + 0.35, until), scale: String(0.9 + 0.1 * ramp(t, at, at + 0.45, BACK)) }}>
    <div style={{ fontFamily: READEX, fontWeight: 500, fontSize: size, color, padding: "9px 24px", borderRadius: 999, textAlign: "center",
      background: C.card, border: `1.5px solid ${color}77`, boxShadow: `0 0 18px ${color}33` }}>{children}</div>
  </div>
);
const GLASS: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(20,14,36,0.78), rgba(8,6,20,0.85))", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
  border: `1px solid ${C.gold}66`, borderRadius: 28, boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,231,163,0.15)",
};
const WLabel: React.FC<{ t: number; c: Cam; at: number; until: number; wx: number; wy: number; text: string; dx?: number; dy?: number; color?: string; fade?: number; size?: number }> = ({
  t, c, at, until, wx, wy, text, dx = 0, dy = -70, color = C.goldHi, fade = 1, size = 36,
}) => {
  const o = win(t, at + 0.3, until, 0.3) * fade;
  if (o <= 0.01) return null;
  const [sx, sy] = scr(c, wx, wy);
  const p = ramp(t, at, at + 0.4, BACK);
  const lx = Math.max(220, Math.min(800, sx + dx)), ly = sy + dy;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
        <line x1={sx} y1={sy} x2={lx} y2={ly} stroke={color} strokeWidth={2} opacity={0.8} />
        <circle cx={sx} cy={sy} r={7} fill={color} style={{ filter: glow(color, 0.4) }} />
      </svg>
      <div style={{ position: "absolute", left: lx - 300, top: ly - 32, width: 600, display: "flex", justifyContent: "center", opacity: o, scale: String(0.7 + 0.3 * p) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: size, letterSpacing: 2, whiteSpace: "nowrap", padding: "6px 20px", borderRadius: 14,
          color, background: "rgba(10,6,20,0.82)", border: `2px solid ${color}`, boxShadow: `0 0 22px ${color}55` }}>{text}</div>
      </div>
    </>
  );
};
const SAW = <span style={{ fontFamily: AMIRI }}>ﷺ</span>;
const HookText: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - ramp(t, S1 - 0.2, S1 + 0.15);
  const bs = Math.max(0, 1 - Math.abs(t - K.spam - 0.15) / 0.5);
  const bm = Math.max(0, 1 - Math.abs(t - K.allah1 - 0.25) / 0.7);
  const big = (b: number, sz: number): React.CSSProperties => ({ display: "inline-block", fontSize: sz, lineHeight: 1.0, color: C.goldHi, textShadow: `0 0 ${20 + 30 * b}px ${C.gold}, 0 5px 0 rgba(0,0,0,0.65)`, scale: String(1 + 0.07 * b) });
  return (
    <div style={{ position: "absolute", top: 342, left: 80, width: 880, textAlign: "center", fontFamily: KUFI, fontWeight: 700, fontSize: 58, lineHeight: 1.08,
      color: C.text, textShadow: textGlow("#000000"), opacity: o }}>
      Kamu <span style={big(bs, 88)}>spam</span> Al-Ikhlas<br />
      tiap hari?<br />
      <span style={{ fontSize: 44 }}>Ada sahabat yang juga begitu,</span><br />
      <span style={{ fontSize: 44 }}>dan Rasulullah {SAW} bilang:</span><br />
      <span style={big(bm, 84)}>Allah mencintainya.</span>
    </div>
  );
};
const SeriesLabel: React.FC<{ o: number; y?: number }> = ({ o, y = 304 }) => (
  <div style={{ position: "absolute", top: y, left: 90, width: 860, textAlign: "center", fontFamily: READEX, fontWeight: 700, fontSize: 22, letterSpacing: 3,
    color: C.goldHi, opacity: o, textShadow: "0 2px 8px #000" }}>{LABEL}</div>
);
// kartu kaca: header + baris Arab (menyala) + terjemah (kata menyala mengikuti narasi)
const wordsBetween = (a: number, b: number) => WORDS_ALL.filter((w) => w.w && w.s >= a - 0.01 && w.s <= b + 0.01);
const clean = (s: string) => s.replace(/^"/, "“").replace(/"$/, "”").replace(/"\.$/, ".”").replace(/"\?$/, "?”").replace(/\?"$/, "?”").replace(/\."$/, ".”");
const Card: React.FC<{ t: number; at: number; until: number; header: React.ReactNode; lines: { ar: string; on: number }[]; from?: number; to?: number; arSize?: number }> = ({
  t, at, until, header, lines, from, to, arSize = 60,
}) => {
  const o = win(t, at + 0.3, until, 0.3);
  if (o <= 0.01) return null;
  const ws = from !== undefined && to !== undefined ? wordsBetween(from, to) : [];
  const p = ramp(t, at, at + 0.45, BACK);
  return (
    <div style={{ position: "absolute", left: 100, top: 326, width: 820, padding: "12px 28px 18px", opacity: o, scale: String(0.94 + 0.06 * p), textAlign: "center", ...GLASS }}>
      <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: C.gold, marginBottom: 2 }}>{header}</div>
      {lines.map((l, i) => {
        const on = ramp(t, l.on - 0.05, l.on + 0.3);
        return (
          <div key={i} style={{ direction: "rtl", fontFamily: AMIRI, fontWeight: 700, fontSize: arSize, lineHeight: 1.55, whiteSpace: "nowrap",
            color: on > 0.5 ? C.goldHi : `${C.gold}66`, textShadow: on > 0.5 ? `0 0 22px ${C.gold}aa` : "none" }}>{l.ar}</div>
        );
      })}
      {ws.length > 0 && <div style={{ height: 1, background: `${C.gold}44`, margin: "4px 40px 10px" }} />}
      {ws.length > 0 && (
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 40, lineHeight: 1.3, color: C.text }}>
          {ws.map((w, i) => {
            const on = t >= w.s - 0.03, cur = on && t < w.e + 0.12;
            return (
              <React.Fragment key={i}>
                <span style={{ color: cur ? C.goldHi : C.text, opacity: on ? 1 : 0.32, textShadow: cur ? `0 0 18px ${C.gold}aa` : "none" }}>{clean(w.w)}</span>
                {i < ws.length - 1 ? " " : ""}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
// balon dialog karakter (label-dunia: menempel di kepala, ukuran tetap)
const VoiceBars: React.FC<{ t: number; active: boolean; col: string }> = ({ t, active, col }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, height: 26 }}>
    {[0, 1, 2, 3].map((i) => {
      const h = active ? 7 + 17 * Math.abs(Math.sin(t * 13 + i * 1.7)) * (0.55 + 0.45 * Math.sin(t * 7.3 + i * 2.1)) : 5;
      return <div key={i} style={{ width: 5, height: Math.max(5, h), borderRadius: 3, background: col, opacity: active ? 1 : 0.45 }} />;
    })}
  </div>
);
const Bubble: React.FC<{ t: number; c: Cam; run: Run; until: number; wx: number; wy: number; fade?: number }> = ({ t, c, run, until, wx, wy, fade = 1 }) => {
  const at = run.s - 0.3;
  const o = win(t, at + 0.25, until, 0.25) * fade;
  if (o <= 0.01) return null;
  const sp = SPK[run.spk];
  const ws = WORDS_ALL.filter((w) => w.w && w.k === run.spk && w.s >= run.s - 0.01 && w.e <= run.e + 0.01);
  const [sx, sy] = scr(c, wx, wy);
  const BW = 620;
  const left = cl(sx - BW * 0.42, 70, 920 - BW);
  const bottom = cl(sy - 44, 560, 1010);
  const p = ramp(t, at, at + 0.4, BACK);
  const active = t >= run.s - 0.05 && t <= run.e + 0.05;
  const tailX = cl(sx, left + 60, left + BW - 60);
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
        <path d={`M${tailX - 22},${bottom - 2} L${sx},${Math.min(sy - 8, bottom + 70)} L${tailX + 22},${bottom - 2} Z`} fill="rgba(12,8,24,0.9)" stroke={sp.col} strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left, top: bottom, width: BW, translate: "0 -100%", opacity: o, scale: String(0.82 + 0.18 * p), transformOrigin: `${tailX - left}px 100%` }}>
        <div style={{ background: "linear-gradient(180deg, rgba(18,12,32,0.92), rgba(8,6,18,0.94))", border: `2.5px solid ${sp.col}`, borderRadius: 26,
          boxShadow: `0 0 26px ${sp.col}44, 0 14px 40px rgba(0,0,0,0.5)`, padding: "12px 24px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "#120A1A", background: sp.col, padding: "3px 14px", borderRadius: 999 }}>{sp.name}</div>
            <VoiceBars t={t} active={active} col={sp.col} />
          </div>
          <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 36, lineHeight: 1.28, color: sp.soft }}>
            {ws.map((w, i) => {
              const on = t >= w.s - 0.03, cur = on && t < w.e + 0.1;
              return (
                <React.Fragment key={i}>
                  <span style={{ opacity: on ? 1 : 0.16, color: cur ? sp.col : sp.soft, textShadow: cur ? `0 0 16px ${sp.col}aa` : "none" }}>{w.w.replace(/"/g, "")}</span>
                  {i < ws.length - 1 ? " " : ""}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
// Progres + watermark
const CHAPTERS = [S1, S2, S3, S4, S5, S6, S7, S8, S9];
const Progress: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(t / END, 1);
  return (
    <div style={{ position: "absolute", left: 100, top: 236, width: 820, opacity: 1 - ramp(t, END, END + 0.4) }}>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,231,163,0.18)" }} />
      <div style={{ position: "absolute", top: 0, height: 6, width: 820 * p, borderRadius: 3, background: `linear-gradient(90deg, ${TEAL}, ${C.goldHi})`, boxShadow: `0 0 14px ${C.gold}` }} />
      {CHAPTERS.map((c) => (
        <div key={c} style={{ position: "absolute", left: (c / END) * 820 - 6, top: -4, width: 14, height: 14, borderRadius: 7,
          background: t >= c ? C.gold : "#0E1430", border: `2px solid ${t >= c ? C.gold : C.muted}` }} />
      ))}
    </div>
  );
};
const Watermark: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 100, top: 262, display: "flex", alignItems: "center", gap: 12, opacity: ramp(t, S1 - 0.1, S1 + 0.4) * (1 - ramp(t, END - 0.3, END)) }}>
    <Img src={staticFile("logo.png")} style={{ width: 44, height: 44 }} />
    <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 26, color: C.text, textShadow: "0 2px 8px #000" }}>Muslim Leveling</div>
  </div>
);
// Caption kata per kata, berwarna per pembicara + chip nama
const GROUPS: Wd[][] = (() => {
  const g: Wd[][] = [];
  let cur: Wd[] = [];
  WORDS_ALL.filter((w) => w.w).forEach((w, i, arr) => {
    cur.push(w);
    const next = arr[i + 1];
    if (!next || cur.length >= 4 || /[.,?!:…]["'”]?$/.test(w.w) || next.s - w.e > 0.35 || (next.k ?? "") !== (w.k ?? "")) { g.push(cur); cur = []; }
  });
  return g;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= END) return null;
  const grp = GROUPS.find((g, i) => t >= g[0].s - 0.05 && t < (GROUPS[i + 1]?.[0].s ?? 999) - 0.05 && t < g[g.length - 1].e + 0.6);
  if (!grp) return null;
  const pop = ramp(t, grp[0].s - 0.05, grp[0].s + 0.15, BACK);
  const sp = grp[0].k && grp[0].k !== "NARATOR" ? SPK[grp[0].k] : undefined;
  return (
    <div style={{ position: "absolute", bottom: 520, left: 100, width: 820, textAlign: "center", scale: String(0.92 + 0.08 * pop), opacity: pop }}>
      {sp && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: "#120A1A", background: sp.col, padding: "3px 14px", borderRadius: 999 }}>{sp.name}</div>
        </div>
      )}
      <span style={{ fontFamily: READEX, fontWeight: 700, fontSize: 48, lineHeight: 1.3, padding: "10px 24px", borderRadius: 22,
        background: "rgba(8,6,20,0.76)", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", border: sp ? `2px solid ${sp.col}88` : undefined }}>
        {grp.map((w, i) => {
          const on = t >= w.s - 0.03 && t < w.e + 0.08;
          const base = sp ? sp.soft : C.text, hot = sp ? sp.col : C.gold;
          return (
            <React.Fragment key={i}>
              <span style={{ color: on ? hot : base, opacity: t >= w.s - 0.03 ? 1 : 0.55, whiteSpace: "nowrap",
                textShadow: on ? `0 0 18px ${hot}aa` : "none", fontFamily: w.w.includes("ﷺ") ? AMIRI : undefined }}>{w.w}</span>
              {i < grp.length - 1 ? " " : ""}
            </React.Fragment>
          );
        })}
      </span>
    </div>
  );
};
const Foreground: React.FC<{ t: number; c: Cam; o: number; warm: number }> = ({ t, c, o, warm }) => {
  if (o <= 0.01) return null;
  return (
    <AbsoluteFill style={{ opacity: o, filter: "blur(2px)" }}>
      {new Array(18).fill(0).map((_, i) => {
        const sx = (((random(`fx${i}`) * (W + 300) - c.x * c.z * 0.4 + t * 14) % (W + 300)) + (W + 300)) % (W + 300) - 150;
        const sy = (((random(`fy${i}`) * (H + 300) - c.y * c.z * 0.4 - t * 10) % (H + 300)) + (H + 300)) % (H + 300) - 150;
        const s = 4 + random(`fs${i}`) * 7;
        return <div key={i} style={{ position: "absolute", left: sx, top: sy, width: s, height: s, borderRadius: "50%", background: i % 3 ? mix("#F3C98B", "#FFE7A3", warm) : TEAL_HI, opacity: 0.12 + 0.2 * random(`fo${i}`) }} />;
      })}
    </AbsoluteFill>
  );
};
const Center: React.FC<{ y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y = 1000, children, style }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: W, height: 0, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>{children}</div>
);
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const g = ramp(t, END, END + 0.7, BACK);
  return (
    <AbsoluteFill style={{ background: NIGHT.top }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NIGHT.top}, ${NIGHT.mid} 60%, #3A2D5C)` }} />
      <Stars t={t} o={0.8} milky={0.5} />
      <Clouds t={t} color="#4A3A6E" o={0.25} y={1300} />
      <Rays t={t} x={540} y={900} o={0.35 * g} />
      <Center y={900} style={{ opacity: g, scale: String(0.4 + 0.6 * g) }}>
        <Img src={staticFile("logo.png")} style={{ width: 440, height: 440, filter: glow(C.gold, 0.6) }} />
      </Center>
      <Center y={1210} style={{ opacity: ramp(t, END + 0.4, END + 0.9) }}>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 92, color: C.text, textShadow: textGlow(C.gold) }}>Muslim Leveling</div>
      </Center>
      <Center y={1350} style={{ opacity: ramp(t, END + 0.8, END + 1.3), scale: String(0.9 + 0.1 * ramp(t, END + 0.8, END + 1.3, BACK)) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 38, color: "#1A1020", background: C.gold, padding: "16px 44px", borderRadius: 999,
          boxShadow: `0 0 30px ${C.gold}88` }}>Download sekarang</div>
      </Center>
    </AbsoluteFill>
  );
};

// =================== KOMPOSISI ===================
export const IkhlasDicintai: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cA = cam(TM.A, t), cB = cam(TM.B, t), cC = cam(TM.C, t);
  // opasitas dunia
  const oB = ramp(t, TR.ab0, TR.ab1) * (1 - ramp(t, TR.ba0, TR.ba1));
  const oC = ramp(t, TR.ac0, TR.ac1);
  const oA = (1 - ramp(t, TR.ab0, TR.ab1)) + ramp(t, TR.ba0, TR.ba1) * (1 - oC);
  const showA = oA > 0.005 && !(t > TR.ab1 && t < TR.ba0) && t < TR.ac1 + 0.05;
  const showB = oB > 0.005;
  const showC = oC > 0.005;
  const vA = vel(TM.A, t), vB = vel(TM.B, t), vC = vel(TM.C, t);
  const mb = (v: { dx: number; dy: number }) => [Math.min(40, Math.max(0, Math.abs(v.dx) - 30) * 0.4), Math.min(40, Math.max(0, Math.abs(v.dy) - 30) * 0.4)];
  const flashB = Math.max(0, 1 - Math.abs(t - TR.ab0 - 0.25) / 0.35);
  const bA = mb(vA), bB = mb(vB), bC = mb(vC);
  bA[0] += 14 * flashB; bA[1] += 14 * flashB; bB[0] += 10 * flashB; bB[1] += 10 * flashB;
  const fil = (b: number[], id: string) => (b[0] > 1.2 || b[1] > 1.2 ? `url(#${id})` : undefined);
  const sh = [shakeXY(t, K.allah7, 7, 0.4), shakeXY(t, EV.qul_glow + 0.3, 3, 0.3), shakeXY(t, EV.whip_back_end, 5, 0.3), shakeXY(t, EV.whip_madinah_end, 5, 0.3),
    shakeXY(t, TR.ab0 + 0.25, 6, 0.35), shakeXY(t, K.cinta9, 3, 0.3)].reduce((a, b) => [a[0] + b[0], a[1] + b[1]] as const, [0, 0] as const);
  const activeZ = showC && oC > 0.5 ? cC.z : showB && oB > 0.5 ? cB.z : cA.z;
  const fadeFast = (v: { dx: number; dy: number }) => cl(1 - (Math.hypot(v.dx, v.dy) - 40) / 40);
  const lfA = fadeFast(vA);
  const endO = ramp(t, END, END + 0.4);
  const prHead = GY - 128 * 1.32 - 22, imHead = GY - 131 * 1.5 - 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#04051A", overflow: "hidden" }}>
      <Audio src={staticFile("narasi.wav")} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="mbA" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bA[0]} ${bA[1]}`} edgeMode="duplicate" /></filter>
          <filter id="mbB" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bB[0]} ${bB[1]}`} edgeMode="duplicate" /></filter>
          <filter id="mbC" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bC[0]} ${bC[1]}`} edgeMode="duplicate" /></filter>
        </defs>
      </svg>
      {/* ===== DUNIA ===== */}
      <AbsoluteFill style={{ translate: `${sh[0]}px ${sh[1]}px` }}>
        {showA && (
          <AbsoluteFill style={{ opacity: cl(oA), filter: fil(bA, "mbA") }}>
            <svg width={W} height={H} style={{ position: "absolute" }}><WorldA t={t} c={cA} /></svg>
          </AbsoluteFill>
        )}
        {showB && (
          <AbsoluteFill style={{ opacity: oB, filter: fil(bB, "mbB") }}>
            <svg width={W} height={H} style={{ position: "absolute" }}><WorldB t={t} c={cB} /></svg>
          </AbsoluteFill>
        )}
        {showC && (
          <AbsoluteFill style={{ opacity: oC, filter: fil(bC, "mbC") }}>
            <svg width={W} height={H} style={{ position: "absolute" }}><WorldC t={t} c={cC} /></svg>
          </AbsoluteFill>
        )}
        <Foreground t={t} c={cA} o={showA ? 0.75 * cl(oA) : 0} warm={1 - dayK(cA)} />
      </AbsoluteFill>
      {flashB > 0.01 && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,248,220,0.95), rgba(255,231,163,0.55) 40%, rgba(233,196,106,0) 75%)", opacity: 0.85 * flashB }} />}
      <Vignette k={0.4 + 0.22 * cl((activeZ - 1) / 1.5)} />
      {showB && <AbsoluteFill style={{ opacity: oB, background: "linear-gradient(180deg, rgba(4,5,26,0.94) 0%, rgba(4,5,26,0.9) 21%, rgba(4,5,26,0.0) 29%)" }} />}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,3,18,0.62) 0%, rgba(4,3,18,0.44) 14%, rgba(4,3,18,0.0) 36%)" }} />
      {/* ===== LABEL-DUNIA ===== */}
      {showA && (
        <>
          <WLabel t={t} c={cA} at={EV.label_madinah} until={K.memimpin - 0.1} wx={900} wy={GY - 160} dx={-40} dy={-150} text="MADINAH" fade={lfA} />
          <WLabel t={t} c={cA} at={EV.label_imam_march} until={MV.m1 - 0.1} wx={GRP + LEADER_DX + marchP(t) * MARCH} wy={GY - 215} dx={0} dy={-110} text="SANG IMAM" fade={lfA} />
          <WLabel t={t} c={cA} at={EV.label_kemah} until={K.imam2 - 0.1} wx={TENTS[1]} wy={GY - 230} dx={-80} dy={-130} text="KEMAH PASUKAN" fade={lfA} />
          <WLabel t={t} c={cA} at={EV.label_imam_camp} until={K.menutup2 - 0.1} wx={CIMX} wy={GY - 230} dx={0} dy={-110} text="SANG IMAM" fade={lfA} />
          <Bubble t={t} c={cA} run={P1} until={P1.e + 0.45} wx={prX(t)} wy={prHead} fade={lfA} />
          <Bubble t={t} c={cA} run={P2} until={P2.e + 0.25} wx={prX(t)} wy={prHead} fade={lfA} />
          <Bubble t={t} c={cA} run={I1} until={I1.e + 0.45} wx={IMX} wy={imHead} fade={lfA} />
        </>
      )}
      {/* ===== HUD ===== */}
      <SeriesLabel o={1 - ramp(t, S1 - 0.2, S1 + 0.15)} />
      <HookText t={t} />
      {/* 2 kisah */}
      <Title t={t} at={K.mengutus} until={K.setiap - 0.1} text="DIUTUS | *MEMIMPIN* PASUKAN" size={76} hiAt={K.memimpin} />
      <Title t={t} at={K.imam2} until={K.menutup2 - 0.1} text="SETIAP JADI | *IMAM* SHALAT" size={76} hiAt={K.imam2} />
      <Title t={t} at={K.menutup2} until={S2 - 0.05} text="SELALU DITUTUP | *AL-IKHLAS*" size={76} hiAt={K.alikhlas2} />
      {/* 3 lapor */}
      <Title t={t} at={K.sepulangnya} until={K.ya - 0.15} text="PASUKAN *MELAPOR*" size={80} hiAt={K.melapor} />
      {/* 4 sabda: tanyakan */}
      <Card t={t} at={EV.card_tanya} until={S4 - 0.12} header={<>SABDA RASULULLAH {SAW}</>} lines={[{ ar: "سَلُوهُ لِأَيِّ شَيْءٍ يَصْنَعُ ذَلِكَ", on: K.tanyakan }]} from={K.tanyakan} to={K.melakukan + 0.5} />
      <Pill t={t} at={K.beliau} until={S7 - 0.1}>HR. Bukhari 7375 · Muslim 813</Pill>
      {/* 6 jawaban imam */}
      <Card t={t} at={EV.card_imam} until={S6 - 0.1} header="JAWABAN SANG IMAM" arSize={54}
        lines={[{ ar: "لِأَنَّهَا صِفَةُ ٱلرَّحْمَٰنِ", on: K.karena6 + 0.1 }, { ar: "وَأَنَا أُحِبُّ أَنْ أَقْرَأَ بِهَا", on: K.dan6 }]} />
      {/* 7 sabda: Allah mencintainya */}
      <Card t={t} at={EV.card_cinta} until={K.allah7 + 0.05} header={<>SABDA RASULULLAH {SAW}</>} lines={[{ ar: "أَخْبِرُوهُ أَنَّ ٱللَّهَ يُحِبُّهُ", on: K.beritahukan }]} from={K.beritahukan} to={K.mencintainya7} />
      <Title t={t} at={K.allah7} until={S7 - 0.05} text="*ALLAH* | *MENCINTAINYA*" size={108} hiAt={K.mencintainya7} />
      {/* 8 empat sifat */}
      <Title t={t} at={K.sifat8} until={K.empat - 0.1} text="SIFAT APA | YANG IA *CINTAI?*" size={62} hiAt={K.cintai} />
      <Title t={t} at={K.empat} until={K.allah8 - 0.1} text="*4* AYAT" size={96} hiAt={K.empat} />
      <Title t={t} at={K.allah8} until={K.tempat - 0.1} text="MAHA *ESA*" size={92} hiAt={K.esa} />
      <Title t={t} at={K.tempat} until={K.tidak8a - 0.1} text="TEMPAT *MEMINTA*" size={84} hiAt={K.meminta} />
      <Title t={t} at={K.tidak8a} until={K.dan8 - 0.1} text="TIDAK *BERANAK* & | TIDAK *DIPERANAKKAN*" size={64} hiAt={K.beranak} />
      <Title t={t} at={K.dan8} until={S8 - 0.05} text="TIDAK ADA YANG | *SETARA*" size={78} hiAt={K.setara} />
      <Pill t={t} at={K.empat} until={S8 - 0.1}>QS. Al-Ikhlas: 1–4</Pill>
      {/* 9 pelajaran */}
      <Title t={t} at={K.sahabat9} until={K.karena9 - 0.1} text="SAHABAT ITU | *DICINTAI* ALLAH" size={76} hiAt={K.dicintai} />
      <Title t={t} at={K.karena9} until={K.maka - 0.15} text="KARENA *MENCINTAI* | SURAT INI" size={76} hiAt={K.mencintai} />
      <Title t={t} at={K.maka} until={K.bukan - 0.1} text="*BACALAH* AL-IKHLAS" size={78} hiAt={K.bacalah} />
      <Title t={t} at={K.bukan} until={K.tapi - 0.1} text="BUKAN SEKADAR | *HAFALAN*" size={80} hiAt={K.hafalan} color="#B8C2D8" />
      <Title t={t} at={K.tapi} until={S9 - 0.05} text="BACA DENGAN | *CINTA*" size={90} hiAt={K.cinta9} />
      {/* 10 CTA */}
      <Title t={t} at={EV.title_tulis} until={END} text={'TULIS | *"AKU_CINTA_AL-IKHLAS"*'} size={64} hiAt={K.aku10} />
      {t > K.aku10 - 0.2 && t < END + 0.1 && (
        <div style={{ position: "absolute", left: 140, top: 520, width: 760, display: "flex", justifyContent: "center", opacity: win(t, K.aku10 + 0.2, END, 0.3) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 30px", ...GLASS, borderRadius: 22, scale: String(0.9 + 0.1 * ramp(t, K.aku10 - 0.2, K.aku10 + 0.3, BACK)) }}>
            <svg width={52} height={52} viewBox="0 0 52 52"><path d="M6,8 H46 V36 H22 L12,46 V36 H6 Z" fill="none" stroke={C.goldHi} strokeWidth={4} strokeLinejoin="round" />
              <circle cx={17} cy={22} r={3} fill={C.goldHi} /><circle cx={26} cy={22} r={3} fill={C.goldHi} /><circle cx={35} cy={22} r={3} fill={C.goldHi} /></svg>
            <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 36, color: C.text, whiteSpace: "nowrap" }}>
              {"Aku cinta Al-Ikhlas".slice(0, Math.round(interpolate(t, [K.aku10, K.aku10 + 1.2], [0, 19], clamp)))}
              <span style={{ opacity: Math.floor(t * 2.2) % 2 ? 1 : 0, color: C.goldHi }}>|</span>
            </div>
          </div>
        </div>
      )}
      {t > K.simpan - 0.2 && t < END + 0.1 && (
        <div style={{ position: "absolute", left: 100, top: 1080, width: 840, display: "flex", justifyContent: "center", gap: 20, opacity: win(t, K.simpan + 0.2, END, 0.3) }}>
          {[{ l: "SIMPAN", at: K.simpan }, { l: "BAGIKAN", at: K.bagikan }].map((b, i) => (
            <div key={i} style={{ fontFamily: READEX, fontWeight: 700, fontSize: 40, color: "#1A1020", background: C.gold, padding: "14px 38px", borderRadius: 999,
              boxShadow: `0 0 30px ${C.gold}88`, opacity: ramp(t, b.at - 0.1, b.at + 0.2), scale: String(0.8 + 0.2 * ramp(t, b.at - 0.1, b.at + 0.35, BACK)) }}>{b.l}</div>
          ))}
        </div>
      )}
      <SeriesLabel o={win(t, S9 + 0.6, END, 0.3)} y={1000} />
      <Captions t={t} />
      <Progress t={t} />
      <Watermark t={t} />
      {t > END - 0.05 && <AbsoluteFill style={{ opacity: endO }}><EndCard t={t} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};
