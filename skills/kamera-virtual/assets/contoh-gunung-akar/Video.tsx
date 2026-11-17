// Gunung Punya Akar (versi anak, remake #15). Tema #15 (malam ungu, garis tanah emas, kerak coklat, mantel merah, akar biru),
// desain BARU untuk KAMERA VIRTUAL: 3 lapisan (DUNIA ikut kamera · LABEL-DUNIA posisi ikut, ukuran tetap · HUD diam).
// Skala vertikal penampang ASLI (30 px/km): puncak ±9 km, kerak di bawah pegunungan ±70 km. TIDAK ada klaim gunung mencegah gempa.
// Nabi ﷺ tidak digambar; manusia hanya ikon (George Airy = teleskop), palu tanpa tangan.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadKufi } from "@remotion/google-fonts/ReemKufi";
import { loadFont as loadReadex } from "@remotion/google-fonts/ReadexPro";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import cues from "../public/cues.json";
import { C, NIGHT, DAWN, lerpSky, mix, Stars, Clouds, Rays, Vignette, Valley, glow, textGlow, ramp, win, IN, BACK, W, H } from "./env";
import { makeTiming, Key, Wd } from "./timing";

const KUFI = loadKufi("normal", { weights: ["700"], subsets: ["arabic", "latin"] }).fontFamily;
const READEX = loadReadex("normal", { weights: ["500", "700"] }).fontFamily;
const AMIRI = loadAmiri("normal", { weights: ["700"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

const STARTS = [...cues.scenes.map((s) => s.start)];
const TM = makeTiming(cues.words as Wd[], STARTS);
const { K, TR, HITS, GY, KM, MX, PEAK, TIP, BGY, PX } = TM;
const [, S1, S2, S3, S4, S5, S6, END] = STARTS;
const BLUE = "#9CCBFF";
const LABEL = "MUKJIZAT AL-QUR'AN · UNTUK ANAK";
const MOHO = GY + 35 * KM;   // dasar kerak biasa (±35 km)
const RW = 620;              // setengah lebar akar di dasar kerak biasa

// =================== KAMERA ===================
type Cam = { x: number; y: number; z: number };
const AX = 540, AY = 830; // jangkar layar: titik fokus jendela kamera
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
// napas kamera: zoom bergerak sangat pelan supaya shot diam tidak terasa beku
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

// =================== GEOMETRI DUNIA A (penampang) ===================
const rootY = (x: number) => {
  const u = (x - MX) / RW;
  if (Math.abs(u) >= 1) return MOHO;
  const env = 1 - u * u;
  return MOHO + (TIP - MOHO) * Math.pow(env, 1.6) + 8 * Math.sin(x / 37) * env;
};
const BULGE: [number, number][] = (() => {
  const p: [number, number][] = [];
  for (let x = MX - RW; x <= MX + RW; x += 10) p.push([x, rootY(x)]);
  return p;
})();
const BULGE_LINE = "M" + BULGE.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L");
const BULGE_FILL = `M${MX - RW},${MOHO} L` + BULGE.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L") + ` L${MX + RW},${MOHO} Z`;
const CRUST_D = `M-1500,${GY} L-1500,${MOHO} L${MX - RW},${MOHO} L` + BULGE.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L") + ` L${MX + RW},${MOHO} L4500,${MOHO} L4500,${GY} Z`;
const STRATA = [0.16, 0.34, 0.52, 0.7, 0.86].map((f, k) => {
  const pts: string[] = [];
  for (let x = -1500; x <= 4500; x += 40) pts.push(`${x},${(GY + (MOHO - GY) * f + (rootY(x) - MOHO) * f + 6 * Math.sin(x / 90 + k)).toFixed(1)}`);
  return "M" + pts.join(" L");
});
// gunung: puncak utama ±9 km + dua puncak samping, bergerigi
const mH = (x: number) => {
  const pk = (cx: number, h: number, w: number) => Math.max(0, 1 - Math.abs((x - cx) / w) ** 1.15) * h;
  const base = Math.max(pk(MX, GY - PEAK, 560), pk(MX - 340, 150, 270), pk(MX + 310, 178, 260), pk(MX - 640, 60, 220), pk(MX + 620, 70, 230));
  const env = Math.min(1, base / 40);
  return Math.max(0, base + ((random(`mj${Math.round(x)}`) - 0.5) * 12 + 7 * Math.sin(x / 19)) * env * (x === MX ? 0 : 1));
};
const MTN_PTS: [number, number][] = (() => {
  const p: [number, number][] = [];
  for (let x = MX - 900; x <= MX + 900; x += 8) p.push([x, GY - mH(x)]);
  return p;
})();
const MTN_D = `M${MX - 900},${GY + 2} L` + MTN_PTS.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L") + ` L${MX + 900},${GY + 2} Z`;
const SNOW_D = (() => {
  const top = MTN_PTS.filter(([, y]) => y < PEAK + 78);
  if (!top.length) return "";
  const bottom = [...top].reverse().map(([x]) => [x, Math.min(PEAK + 78 + 10 * Math.sin(x / 7), GY)] as [number, number]);
  return "M" + [...top, ...bottom].map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L") + " Z";
})();
// sisi bayangan gunung (kanan puncak)
const SHADE_D = `M${MX},${PEAK} ` + MTN_PTS.filter(([x]) => x >= MX).map(([x, y]) => `L${x},${y.toFixed(1)}`).join(" ") + ` L${MX + 900},${GY} L${MX + 120},${GY} Z`;
const ridge = (seed: string, base: number, amp: number) => {
  const pts: string[] = [];
  const ph = [random(seed + "a") * 6, random(seed + "b") * 6];
  for (let x = -1500; x <= 4500; x += 40) {
    const h = amp * (0.6 + 0.4 * Math.sin(x / 260 + ph[0])) * (0.7 + 0.3 * Math.sin(x / 83 + ph[1])) + (random(`${seed}${x}`) - 0.5) * amp * 0.2;
    pts.push(`${x},${(base - h).toFixed(1)}`);
  }
  return `M-1500,${base + 600} L${pts.join(" L")} L4500,${base + 600} Z`;
};
const FAR1 = ridge("far1", GY, 230), FAR2 = ridge("far2", GY, 140);
const MOTES = new Array(46).fill(0).map((_, i) => ({ x: MX - 520 + random(`mo${i}`) * 1040, y: random(`my${i}`) * 1250, v: 40 + random(`mv${i}`) * 70, r: 3 + random(`mr${i}`) * 5 }));
const STAR_PTS = new Array(320).fill(0).map((_, i) => ({ x: random(`ax${i}`) * 3000, y: -900 + random(`ay${i}`) * 3100, r: 0.8 + random(`ar${i}`) ** 3 * 2.4, k: random(`ak${i}`) }));

// pasak: titik siluet untuk morph (urutan sama)
const pegB = (top: number): [number, number][] => [
  [PX - 34, top], [PX + 34, top], [PX + 34, top + 28], [PX + 13, top + 40], [PX + 9, top + 440], [PX, top + 520], [PX - 9, top + 440], [PX - 13, top + 40], [PX - 34, top + 28],
];
const PEG_A: [number, number][] = [
  [MX - 240, PEAK - 30], [MX + 240, PEAK - 30], [MX + 240, GY - 90], [MX + 150, GY + 10], [MX + 90, TIP - 300], [MX, TIP], [MX - 90, TIP - 300], [MX - 150, GY + 10], [MX - 240, GY - 90],
];
// cabang akar (pesan): SHALAT · DOA · KEBAIKAN
const BRANCHES = [
  { at: K.shalat, d: `M${MX - 60},2770 C ${MX - 120},2800 ${MX - 170},2850 ${MX - 210},2880`, end: [MX - 210, 2880], label: "SHALAT", dx: 120 },
  { at: K.doa, d: `M${MX + 70},2890 C ${MX + 130},2930 ${MX + 180},2975 ${MX + 215},3010`, end: [MX + 215, 3010], label: "DOA", dx: -100 },
  { at: K.kebaikan, d: `M${MX - 30},3040 C ${MX - 70},3080 ${MX - 120},3120 ${MX - 150},3150`, end: [MX - 150, 3150], label: "KEBAIKAN", dx: 150 },
];

// =================== STATUS WAKTU ===================
const reveal = (t: number) => ramp(t, K.padahal + 1.07, K.padahal + 1.75, Easing.bezier(0.33, 0, 0.2, 1));
const growY = (t: number) => interpolate(t, [K.akar2 - 0.05, K.puluhan + 0.6], [MOHO - 30, TIP + 10], { ...clamp, easing: EASE });
const rootGlow = (t: number) => ramp(t, K.akar2 - 0.2, K.akar2 + 0.3);
const dawnK = (t: number) => 0.6 * ramp(t, K.walau - 0.3, S6 + 1.5);
const pegTopB = (t: number) => BGY - 110 + 27 * HITS.filter((h) => t >= h).length;

// =================== DUNIA A ===================
const WorldA: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const sky = lerpSky(NIGHT, DAWN, 0.12 + dawnK(t));
  const rv = reveal(t);
  const gy = growY(t);
  const rg = rootGlow(t);
  const flash = Math.max(0, 1 - Math.abs(t - K.getaran - 0.15) / 0.45);
  const bs = cl((c.z - 1.3) * 4, 0, 6); // fokus dangkal: blur latar (px layar)
  const sw = 1 / c.z;                   // 1 px layar dalam satuan dunia
  const par = (f: number, rx = MX, ry = PEAK) => `translate(${(c.x - rx) * (1 - f)} ${(c.y - ry) * (1 - f)})`;
  const qO = (1 - ramp(t, K.padahal + 0.6, K.padahal + 1.1)) * (0.65 + 0.35 * Math.sin(t * 4));
  const arrowP = ramp(t, K.akar2, K.puluhan + 0.6, EASE) * (1 - ramp(t, K.ilmuwan + 0.2, K.ilmuwan + 0.6));
  // gelombang gempa
  const SRC: [number, number] = [MX + 820, GY];
  const DTIP = Math.hypot(SRC[0] - MX, SRC[1] - TIP);
  const waves = [0, 1, 2].map((k) => {
    const t0 = K.lalu2 + 0.15 + k * 0.45;
    const r = (t - t0) * 1500;
    const r2 = (t - t0 - DTIP / 1500) * 1300;
    return { r, r2, o: t >= t0 ? cl(1 - r / 2600) : 0, o2: r2 > 0 ? cl(1 - r2 / 1600) * 0.8 : 0 };
  });
  const wavesOn = t > K.lalu2 && t < S2 + 0.5;
  const branchesOn = t > K.shalat - 0.1;
  return (
    <g transform={worldTf(c)}>
      <defs>
        <linearGradient id="skyA" x1="0" y1="-1200" x2="0" y2={GY} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={sky.top} /><stop offset="0.62" stopColor={sky.mid} /><stop offset="1" stopColor={sky.low} />
        </linearGradient>
        <linearGradient id="mantleA" x1="0" y1={MOHO} x2="0" y2={TIP + 900} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B8401E" /><stop offset="0.5" stopColor="#7A2412" /><stop offset="1" stopColor="#3A0E08" />
        </linearGradient>
        <linearGradient id="crustA" x1="0" y1={GY} x2="0" y2={TIP} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6B4A33" /><stop offset="0.4" stopColor="#4A3426" /><stop offset="1" stopColor="#2E2019" />
        </linearGradient>
        <linearGradient id="mtnA" x1="0" y1={PEAK} x2="0" y2={GY} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#EEF2FA" /><stop offset="0.3" stopColor="#9A8CA8" /><stop offset="1" stopColor="#3A2E4A" />
        </linearGradient>
        <linearGradient id="rootA" x1="0" y1={MOHO} x2="0" y2={TIP} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3D78C8" stopOpacity={0.3} /><stop offset="1" stopColor="#7FB8FF" stopOpacity={0.6} />
        </linearGradient>
        <radialGradient id="moonA"><stop offset="0" stopColor="#FFF9E8" /><stop offset="0.5" stopColor="#DCE6FF" /><stop offset="1" stopColor="#DCE6FF" stopOpacity={0} /></radialGradient>
        <linearGradient id="growG" x1="0" y1={gy - 260} x2="0" y2={gy} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
        <mask id="growA" maskUnits="userSpaceOnUse" x={-1500} y={-5000} width={6000} height={12000}><rect x={-1500} y={-5000} width={6000} height={gy + 5000} fill="url(#growG)" /></mask>
        <clipPath id="bulgeA"><path d={BULGE_FILL} /></clipPath>
        <clipPath id="underA"><rect x={-1500} y={GY + 2} width={6000} height={6000} /></clipPath>
        <filter id="dofA" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={bs / c.z} /></filter>
      </defs>
      {/* langit */}
      <rect x={-1500} y={-3000} width={6000} height={GY + 3005} fill="url(#skyA)" />
      {/* bintang (parallax 0,2) */}
      <g transform={par(0.2)} opacity={1 - dawnK(t) * 0.9}>
        <ellipse cx={MX - 300} cy={300} rx={1600} ry={300} transform={`rotate(-24 ${MX - 300} 300)`} fill="#B8AEFF" opacity={0.08} />
        {STAR_PTS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={(s.r * sw) * Math.pow(c.z, 0.3)} fill={i % 7 ? "#FFF6E0" : "#BFD6FF"} opacity={0.5 + 0.5 * Math.sin(t * (1 + s.k * 3) + i)} />
        ))}
      </g>
      {/* bulan (parallax 0,1) */}
      <g transform={par(0.1)}><circle cx={MX + 900} cy={600} r={120} fill="url(#moonA)" opacity={0.85 - dawnK(t)} /><circle cx={MX + 900} cy={600} r={46} fill="#F4F1FF" opacity={0.9 - dawnK(t)} /></g>
      {/* pegunungan jauh (parallax 0,5), blur saat close-up */}
      <g filter={bs > 0.3 ? "url(#dofA)" : undefined}>
        <path d={FAR1} transform={par(0.45)} fill={mix("#2B2550", "#5A4A7A", dawnK(t))} />
        <path d={FAR2} transform={par(0.65)} fill={mix("#3A3570", "#7A5A8A", dawnK(t))} />
      </g>
      {/* mantel + kerak berakar */}
      <rect x={-1500} y={MOHO - 40} width={6000} height={7000} fill="url(#mantleA)" />
      <path d={CRUST_D} fill="url(#crustA)" />
      {STRATA.map((d, i) => <path key={i} d={d} stroke="#8A6A4A" strokeOpacity={0.35} strokeWidth={3} fill="none" />)}
      {/* garis kerak biasa (putus-putus) */}
      <line x1={-1500} y1={MOHO} x2={4500} y2={MOHO} stroke="#FFE7A3" strokeOpacity={0.45 * rg} strokeWidth={2.5 * sw} strokeDasharray={`${16 * sw} ${12 * sw}`} />
      {/* akar menyala, tumbuh mengikuti kamera */}
      <g mask="url(#growA)" opacity={rg}>
        <path d={BULGE_FILL} fill="url(#rootA)" opacity={0.9 + 0.1 * Math.sin(t * 3) + 0.4 * flash} />
        <path d={BULGE_LINE} fill="none" stroke={BLUE} strokeWidth={20 * sw} opacity={0.22 + 0.4 * flash} />
        <path d={BULGE_LINE} fill="none" stroke={BLUE} strokeWidth={5 * sw} />
        <g clipPath="url(#bulgeA)">
          {MOTES.map((m, i) => {
            const y = TIP + 100 - ((m.y + t * m.v) % (TIP - MOHO + 200));
            return <circle key={i} cx={m.x + 30 * Math.sin(t * 0.7 + i)} cy={y} r={m.r * 1.4 * sw} fill={i % 3 ? "#CFE6FF" : "#FFFFFF"} opacity={0.55 + 0.35 * Math.sin(t * 2 + i)} />;
          })}
        </g>
      </g>
      {/* panah "menghujam" */}
      {arrowP > 0 && (
        <g opacity={arrowP > 0 ? 1 : 0}>
          <line x1={MX + 130} y1={GY + 20} x2={MX + 130} y2={Math.min(gy, TIP - 30)} stroke={C.goldHi} strokeWidth={4 * sw} strokeDasharray={`${14 * sw} ${10 * sw}`} />
          <path d={`M${MX + 130 - 16 * sw},${Math.min(gy, TIP - 30) - 24 * sw} L${MX + 130},${Math.min(gy, TIP - 30)} L${MX + 130 + 16 * sw},${Math.min(gy, TIP - 30) - 24 * sw}`} stroke={C.goldHi} strokeWidth={4 * sw} fill="none" />
        </g>
      )}
      {/* cabang akar */}
      {branchesOn && BRANCHES.map((b, i) => {
        const p = ramp(t, b.at - 0.05, b.at + 0.5);
        return (
          <g key={i}>
            <path d={b.d} fill="none" stroke={BLUE} strokeWidth={16 * sw} opacity={0.25 * p} pathLength={1} strokeDasharray={`${p} 1`} />
            <path d={b.d} fill="none" stroke={BLUE} strokeWidth={6 * sw} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
            <circle cx={b.end[0]} cy={b.end[1]} r={9 * sw} fill={BLUE} opacity={ramp(t, b.at + 0.4, b.at + 0.6)} />
          </g>
        );
      })}
      {/* gelombang gempa */}
      {wavesOn && (
        <g clipPath="url(#underA)">
          {waves.map((w, i) => (
            <React.Fragment key={i}>
              {w.o > 0 && w.r > 0 && <circle cx={SRC[0]} cy={SRC[1]} r={w.r} fill="none" stroke="#FFF1C8" strokeWidth={4 * sw} opacity={w.o * 0.85} />}
              {w.o2 > 0 && <circle cx={MX} cy={TIP} r={w.r2} fill="none" stroke={BLUE} strokeWidth={4 * sw} opacity={w.o2} />}
            </React.Fragment>
          ))}
          <circle cx={SRC[0]} cy={SRC[1]} r={18 * sw} fill="#FFF1C8" opacity={win(t, K.lalu2 + 0.15, S2, 0.3)} />
        </g>
      )}
      {/* gunung */}
      <path d={MTN_D} fill="url(#mtnA)" />
      <path d={SHADE_D} fill="#1E1630" opacity={0.28} />
      <path d={SNOW_D} fill="#FFFFFF" opacity={0.92} />
      <path d={"M" + MTN_PTS.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" L")} fill="none" stroke="#FFE7A3" strokeOpacity={0.5} strokeWidth={2 * sw} />
      {/* kilau salju puncak */}
      <circle cx={MX - 14} cy={PEAK + 18} r={26} fill="#FFFFFF" opacity={0.6 * win(t, K.puncak - 0.1, K.puncak + 1.2, 0.4) * (0.6 + 0.4 * Math.sin(t * 12))} />
      {/* garis tanah */}
      <line x1={-1500} y1={GY} x2={4500} y2={GY} stroke={C.gold} strokeWidth={16 * sw} opacity={0.25} />
      <line x1={-1500} y1={GY} x2={4500} y2={GY} stroke={C.goldHi} strokeWidth={4 * sw} />
      {/* tutup gelap bawah tanah (dibuka seperti tirai) */}
      {rv < 1 && (
        <g>
          <rect x={-1500} y={GY + 3} width={MX + 1500 - rv * 2400} height={7000} fill="#08060E" />
          <rect x={MX + rv * 2400} y={GY + 3} width={3000} height={7000} fill="#08060E" />
          {rv > 0 && [MX - rv * 2400, MX + rv * 2400].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={GY} x2={x} y2={GY + 7000} stroke={C.gold} strokeWidth={22 * sw} opacity={0.25} />
              <line x1={x} y1={GY} x2={x} y2={GY + 7000} stroke={C.goldHi} strokeWidth={4 * sw} />
            </g>
          ))}
          {qO > 0 && (
            <text x={MX} y={GY + 195} textAnchor="middle" fontFamily={READEX} fontWeight={700} fontSize={210} fill={BLUE} opacity={qO}
              style={{ filter: `drop-shadow(0 0 ${18 * sw}px ${BLUE})` }}>?</text>
          )}
        </g>
      )}
    </g>
  );
};

// =================== DUNIA B (perkemahan) ===================
const HILLS_B = ridge("hb", BGY, 120);
const WorldB: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const sky = lerpSky(NIGHT, DAWN, 0.25);
  const sw = 1 / c.z;
  const see = ramp(t, K.tertanam4 - 0.3, K.tertanam4 + 0.3);
  const top = pegTopB(t);
  const lastHit = [...HITS].reverse().find((h) => t >= h) ?? -9;
  const sinceHit = t - lastHit;
  const pts = pegB(top);
  const shaftGlow = ramp(t, K.tertanam4 - 0.1, K.tertanam4 + 0.4);
  const par = (f: number) => `translate(${(c.x - 1100) * (1 - f)} ${(c.y - 1200) * (1 - f)})`;
  // palu (ikon, tanpa tangan): berayun pada poros di udara
  const hammerO = win(t, K.yang4 + 0.25, HITS[2] + 0.45, 0.25);
  let ang = 26;
  for (const h of HITS) {
    if (t >= h - 0.38 && t < h + 0.2) {
      ang = t < h - 0.08 ? interpolate(t, [h - 0.38, h - 0.08], [8, 30], { ...clamp, easing: Easing.out(Easing.quad) })
        : t < h ? interpolate(t, [h - 0.08, h], [30, 0], { ...clamp, easing: Easing.in(Easing.quad) })
          : interpolate(t, [h, h + 0.2], [0, 10], clamp);
      break;
    }
  }
  if (t >= HITS[2] + 0.2) ang = 10 + 18 * ramp(t, HITS[2] + 0.2, HITS[2] + 0.6);
  const strikeTop = BGY - 110 + 27 * Math.min(3, HITS.filter((h) => t >= h - 0.38).length);
  const piv: [number, number] = [PX + 190, strikeTop - 43];
  const flap = (s: number) => Math.sin(t * 7 + s * 9) * 14 * s;
  const tentEdge = new Array(11).fill(0).map((_, i) => { const s = i / 10; return `${850 + 290 * s + flap(s)},${BGY - 430 + 430 * s}`; }).join(" L");
  return (
    <g transform={worldTf(c)}>
      <defs>
        <linearGradient id="skyB" x1="0" y1="-600" x2="0" y2={BGY} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={sky.top} /><stop offset="0.62" stopColor={sky.mid} /><stop offset="1" stopColor={sky.low} />
        </linearGradient>
        <linearGradient id="soilB" x1="0" y1={BGY} x2="0" y2={BGY + 700} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5A3E2A" /><stop offset="1" stopColor="#2A1C14" />
        </linearGradient>
        <linearGradient id="tentB" x1="0" y1={BGY - 430} x2="0" y2={BGY} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D9A36A" /><stop offset="1" stopColor="#8A5A34" />
        </linearGradient>
        <radialGradient id="moonB"><stop offset="0" stopColor="#FFF9E8" /><stop offset="0.5" stopColor="#DCE6FF" /><stop offset="1" stopColor="#DCE6FF" stopOpacity={0} /></radialGradient>
        <radialGradient id="lampB"><stop offset="0" stopColor="#FFD08A" stopOpacity={0.9} /><stop offset="1" stopColor="#FFD08A" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-1500} y={-2000} width={6000} height={BGY + 2005} fill="url(#skyB)" />
      <g transform={par(0.2)}>
        {STAR_PTS.slice(0, 200).map((s, i) => (
          <circle key={i} cx={s.x - 300} cy={s.y - 300} r={s.r * sw * Math.pow(c.z, 0.3)} fill="#FFF6E0" opacity={0.45 + 0.45 * Math.sin(t * (1 + s.k * 3) + i)} />
        ))}
      </g>
      <g transform={par(0.15)}><circle cx={500} cy={520} r={110} fill="url(#moonB)" opacity={0.8} /><circle cx={500} cy={520} r={42} fill="#F4F1FF" /></g>
      <path d={HILLS_B} transform={par(0.5)} fill="#2B2550" />
      <rect x={-1500} y={BGY} width={6000} height={3000} fill="#140D0A" />
      {/* tali tenda ke pasak */}
      <path d={`M1100,${BGY - 140} Q ${(1100 + PX) / 2},${BGY - 60} ${PX},${top + 14}`} stroke="#E8D6B4" strokeWidth={4 * sw} fill="none" opacity={0.85} />
      {/* tenda */}
      <path d={`M560,${BGY} L850,${BGY - 430} L${tentEdge} L1140,${BGY} Z`} fill="url(#tentB)" />
      <path d={`M850,${BGY - 430} L${tentEdge} L1140,${BGY} L850,${BGY} Z`} fill="#000000" opacity={0.18} />
      <path d={`M790,${BGY} L850,${BGY - 250} L910,${BGY} Z`} fill="#3A2214" />
      <ellipse cx={850} cy={BGY - 60} rx={90} ry={70} fill="url(#lampB)" opacity={0.55 + 0.1 * Math.sin(t * 5)} />
      <line x1={850} y1={BGY - 430} x2={850} y2={BGY - 470} stroke="#5A3A22" strokeWidth={8} />
      {/* batang pasak (digambar sebelum tanah; tanah lalu jadi tembus pandang) */}
      <path d={"M" + pts.map(([x, y]) => `${x},${y}`).join(" L") + " Z"} fill="#C8A070" stroke="#FFE7A3" strokeWidth={3 * sw} />
      <rect x={-1500} y={BGY} width={6000} height={3000} fill="url(#soilB)" opacity={1 - 0.72 * see} />
      {[0.12, 0.3, 0.52, 0.74].map((f, i) => (
        <path key={i} d={`M-1500,${BGY + 620 * f} Q ${PX},${BGY + 620 * f + 24} 4500,${BGY + 620 * f}`} stroke="#8A6A4A" strokeOpacity={0.4} strokeWidth={3 * sw} fill="none" />
      ))}
      {/* rumput */}
      {new Array(60).fill(0).map((_, i) => {
        const x = -200 + i * 50 + random(`gx${i}`) * 30;
        return <path key={i} d={`M${x},${BGY} l${-6},${-22 - random(`gh${i}`) * 18} M${x + 6},${BGY} l${4},${-18 - random(`gk${i}`) * 14}`} stroke="#3A5A3A" strokeWidth={4} opacity={0.8} />;
      })}
      <line x1={-1500} y1={BGY} x2={4500} y2={BGY} stroke={C.gold} strokeWidth={14 * sw} opacity={0.22} />
      <line x1={-1500} y1={BGY} x2={4500} y2={BGY} stroke={C.goldHi} strokeWidth={4 * sw} />
      {/* bagian tertanam menyala biru */}
      {shaftGlow > 0 && (
        <g opacity={shaftGlow}>
          <path d={`M${PX - 13},${Math.max(BGY + 2, top + 40)} L${PX - 9},${top + 440} L${PX},${top + 520} L${PX + 9},${top + 440} L${PX + 13},${Math.max(BGY + 2, top + 40)}`} fill={`${BLUE}55`} stroke={BLUE} strokeWidth={5 * sw} />
          <path d={`M${PX - 13},${Math.max(BGY + 2, top + 40)} L${PX - 9},${top + 440} L${PX},${top + 520} L${PX + 9},${top + 440} L${PX + 13},${Math.max(BGY + 2, top + 40)}`} fill="none" stroke={BLUE} strokeWidth={18 * sw} opacity={0.25} />
        </g>
      )}
      {/* debu saat dipukul */}
      {sinceHit >= 0 && sinceHit < 0.4 && new Array(8).fill(0).map((_, i) => (
        <circle key={i} cx={PX + (i - 3.5) * 9 * (1 + sinceHit * 9)} cy={BGY - 4 - sinceHit * 140 * random(`pd${i}`) + sinceHit * sinceHit * 300} r={4} fill="#C8AA80" opacity={1 - sinceHit / 0.4} />
      ))}
      {/* palu */}
      {hammerO > 0 && (
        <g transform={`translate(${piv[0]} ${piv[1]}) rotate(${ang})`} opacity={hammerO}>
          <rect x={-190} y={-6} width={190} height={12} rx={6} fill="#8A5A32" stroke="#2A1A10" strokeWidth={2} />
          <rect x={-210} y={-43} width={40} height={86} rx={7} fill="#5A6070" stroke="#C8CCD8" strokeWidth={2.5} />
          <rect x={-210} y={-43} width={40} height={11} rx={4} fill="#9AA0B0" />
        </g>
      )}
    </g>
  );
};

// =================== DUNIA C (lembah Makkah malam) ===================
const WorldC: React.FC<{ t: number; c: Cam }> = ({ t, c }) => {
  const light = ramp(t, K.allah5 - 0.2, K.allah5 + 0.7);
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${AX - c.x * c.z}px, ${AY - c.y * c.z}px) scale(${c.z})` }}>
      <div style={{ position: "absolute", left: -600, top: -900, width: W + 1200, height: H + 1200, background: NIGHT.top }} />
      <Valley t={t} sky={NIGHT} night={1} sun={{ x: 870, y: 930 }} />
      {light > 0 && (
        <>
          <Rays t={t} x={540} y={560} o={0.45 * light} n={18} len={1700} />
          <div style={{ position: "absolute", left: 540 - 220, top: 560 - 220, width: 440, height: 440, borderRadius: "50%", opacity: light,
            background: `radial-gradient(circle, #FFFBEA 0%, ${C.goldHi}cc 12%, ${C.gold}44 34%, rgba(0,0,0,0) 70%)` }} />
          <div style={{ position: "absolute", left: 540 - 70, top: 560, width: 140, height: 800, opacity: 0.55 * light,
            background: `linear-gradient(180deg, ${C.goldHi}cc, ${C.gold}22 70%, rgba(0,0,0,0))`, filter: "blur(10px)" }} />
        </>
      )}
    </AbsoluteFill>
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
              textShadow: textGlow(hi ? color : "#000000") }}>{w.replace(/\*/g, "").replace(/_/g, " ")}</span>
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
  background: "linear-gradient(180deg, rgba(22,16,40,0.70), rgba(10,8,22,0.78))", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
  border: `1px solid ${C.gold}66`, borderRadius: 28, boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,231,163,0.15)",
};
// Label-dunia: posisi mengikuti kamera, ukuran huruf tetap (dikoreksi 1/zoom)
const WLabel: React.FC<{ t: number; c: Cam; at: number; until: number; wx: number; wy: number; text: string; dx?: number; dy?: number; color?: string; dark?: boolean; fade?: number; size?: number }> = ({
  t, c, at, until, wx, wy, text, dx = 0, dy = -70, color = C.goldHi, dark, fade = 1, size = 38,
}) => {
  const o = win(t, at + 0.3, until, 0.3) * fade;
  if (o <= 0.01) return null;
  const [sx, sy] = scr(c, wx, wy);
  const p = ramp(t, at, at + 0.4, BACK);
  const lx = sx + dx, ly = sy + dy;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
        <line x1={sx} y1={sy} x2={lx} y2={ly} stroke={color} strokeWidth={2} opacity={0.8} />
        <circle cx={sx} cy={sy} r={7} fill={color} style={{ filter: glow(color, 0.4) }} />
      </svg>
      <div style={{ position: "absolute", left: lx - 300, top: ly - 32, width: 600, display: "flex", justifyContent: "center", opacity: o, scale: String(0.7 + 0.3 * p) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: size, letterSpacing: 2, whiteSpace: "nowrap", padding: "6px 20px", borderRadius: 14,
          color: dark ? "#0C1420" : color, background: dark ? color : "rgba(10,7,20,0.78)", border: `2px solid ${color}`, boxShadow: `0 0 22px ${color}55` }}>{text}</div>
      </div>
    </>
  );
};
// Penggaris kedalaman/ketinggian (kiri) + mini-map
const fmtM = (m: number) => `${Math.floor(m / 1000)}.${String(m % 1000).padStart(3, "0")}`;
const Ruler: React.FC<{ c: Cam; o: number }> = ({ c, o }) => {
  if (o <= 0.01) return null;
  const top = 520, bot = 1060, x = 52;
  const ticks: React.ReactNode[] = [];
  for (let d = -10; d <= 80; d += 5) {
    const sy = AY + (GY + d * KM - c.y) * c.z;
    if (sy < top || sy > bot) continue;
    const major = d % 10 === 0;
    const a = cl(1 - Math.abs(sy - AY) / 40, 0, 1);
    ticks.push(<line key={`l${d}`} x1={x} y1={sy} x2={x + (major ? 20 : 11)} y2={sy} stroke={d === 0 ? C.goldHi : C.muted} strokeWidth={d === 0 ? 3 : 2} />);
    if (major) ticks.push(<text key={`t${d}`} x={x + 26} y={sy + 6} fontFamily={READEX} fontWeight={500} fontSize={18} fill={C.muted} opacity={1 - a}>{d === 0 ? "0" : d < 0 ? `+${-d}` : `−${d}`}</text>);
  }
  const dc = (c.y - GY) / KM;
  const above = dc < 0;
  const val = above ? `+${fmtM(Math.min(8849, Math.round(-dc * 1000)))} m` : `−${Math.round(dc)} km`;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: o }}>
      <div style={{ position: "absolute", left: 26, top: top - 34, fontFamily: READEX, fontWeight: 700, fontSize: 15, letterSpacing: 3, color: C.gold }}>{above ? "TINGGI" : "DALAM"}</div>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={x} y1={top} x2={x} y2={bot} stroke={C.gold} strokeOpacity={0.55} strokeWidth={2} />
        {ticks}
      </svg>
      <div style={{ position: "absolute", left: 22, top: AY - 22, height: 44, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 24, color: "#1A1020", background: C.goldHi, padding: "4px 12px", borderRadius: 10,
          boxShadow: `0 0 18px ${C.gold}99`, whiteSpace: "nowrap" }}>{val}</div>
      </div>
    </div>
  );
};
const MiniMap: React.FC<{ c: Cam; o: number }> = ({ c, o }) => {
  if (o <= 0.01) return null;
  const L = 26, T = 1078, Wm = 112, Hm = 150, s = 0.042;
  const X0 = MX - Wm / 2 / s, Y0 = 900;
  const mx = (wx: number) => L + (wx - X0) * s, my = (wy: number) => T + (wy - Y0) * s;
  const vx0 = c.x - AX / c.z, vy0 = c.y - AY / c.z, vw = W / c.z, vh = H / c.z;
  const rx0 = cl(mx(vx0), L, L + Wm), ry0 = cl(my(vy0), T, T + Hm), rx1 = cl(mx(vx0 + vw), L, L + Wm), ry1 = cl(my(vy0 + vh), T, T + Hm);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
      <defs><clipPath id="mmclip"><rect x={L} y={T} width={Wm} height={Hm} rx={10} /></clipPath></defs>
      <g clipPath="url(#mmclip)">
        <rect x={L} y={T} width={Wm} height={Hm} fill="#141A46" />
        <rect x={L} y={my(GY)} width={Wm} height={Hm} fill="#4A3426" />
        <rect x={L} y={my(MOHO)} width={Wm} height={Hm} fill="#7A2412" />
        <path d={`M${mx(MX - RW)},${my(MOHO)} L${mx(MX)},${my(TIP)} L${mx(MX + RW)},${my(MOHO)} Z`} fill="#4A3426" stroke={BLUE} strokeWidth={1.5} />
        <path d={`M${mx(MX - 560)},${my(GY)} L${mx(MX)},${my(PEAK)} L${mx(MX + 560)},${my(GY)} Z`} fill="#C8C0D8" />
        <line x1={L} y1={my(GY)} x2={L + Wm} y2={my(GY)} stroke={C.goldHi} strokeWidth={1.5} />
        <rect x={rx0} y={ry0} width={Math.max(4, rx1 - rx0)} height={Math.max(4, ry1 - ry0)} fill={`${C.gold}22`} stroke={C.goldHi} strokeWidth={2} />
      </g>
      <rect x={L} y={T} width={Wm} height={Hm} rx={10} fill="none" stroke={`${C.gold}88`} strokeWidth={1.5} />
    </svg>
  );
};
// teks hook 1 kalimat, penuh sejak frame 0
const HookText: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - ramp(t, S1 - 0.15, S1 + 0.25);
  const bG = Math.max(0, 1 - Math.abs(t - K.gunung0 - 0.15) / 0.45);
  const bA = Math.max(0, 1 - Math.abs(t - K.akar0 - 0.15) / 0.5);
  return (
    <div style={{ position: "absolute", top: 380, left: 100, width: 840, textAlign: "center", fontFamily: KUFI, fontWeight: 700, fontSize: 70, lineHeight: 1.12,
      color: C.text, textShadow: textGlow("#000000"), opacity: o }}>
      Di umur berapa<br />kalian tahu kalau<br />
      <span style={{ display: "inline-block", fontSize: 98, scale: String(1 + 0.07 * bG) }}>GUNUNG</span> itu punya<br />
      <span style={{ display: "inline-block", fontSize: 150, lineHeight: 1.0, letterSpacing: 6, color: mix(C.gold, C.goldHi, 0.5 + 0.5 * Math.sin(t * 4)),
        textShadow: `0 0 ${20 + 30 * bA}px ${C.gold}, 0 5px 0 rgba(0,0,0,0.65)`, scale: String(1 + 0.08 * bA) }}>AKAR?</span>
    </div>
  );
};
const SeriesLabel: React.FC<{ o: number; y?: number }> = ({ o, y = 330 }) => (
  <div style={{ position: "absolute", top: y, left: 100, width: 840, textAlign: "center", fontFamily: READEX, fontWeight: 700, fontSize: 24, letterSpacing: 5,
    color: C.goldHi, opacity: o, textShadow: "0 2px 8px #000" }}>{LABEL}</div>
);
// kartu George Airy (ikon teleskop, tanpa wajah)
const Telescope: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="rotate(-28 50 50)">
      <rect x={14} y={38} width={62} height={20} rx={5} fill={C.goldHi} />
      <rect x={70} y={34} width={16} height={28} rx={4} fill={C.gold} />
      <rect x={6} y={42} width={10} height={12} rx={3} fill={C.gold} />
    </g>
    <path d="M48,60 L34,94 M52,60 L66,94 M50,60 L50,94" stroke={C.goldHi} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
const AiryCard: React.FC<{ t: number }> = ({ t }) => {
  const at = TM.EV.card_airy, until = K.lalu2 - 0.05;
  const o = win(t, at + 0.3, until, 0.3);
  if (o <= 0) return null;
  const p = ramp(t, at, at + 0.45, BACK);
  return (
    <div style={{ position: "absolute", left: 160, top: 600, width: 720, padding: "28px 34px", opacity: o, scale: String(0.92 + 0.08 * p), ...GLASS,
      display: "flex", gap: 26, alignItems: "center" }}>
      <div style={{ width: 130, height: 130, borderRadius: 24, background: "rgba(233,196,106,0.12)", border: `1px solid ${C.gold}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Telescope size={104} />
      </div>
      <div style={{ fontFamily: READEX, color: C.text }}>
        <div style={{ fontWeight: 700, fontSize: 42 }}>George Airy</div>
        <div style={{ fontWeight: 500, fontSize: 26, color: C.muted, marginTop: 2 }}>ilmuwan Inggris</div>
        <div style={{ fontWeight: 700, fontSize: 26, marginTop: 12, whiteSpace: "nowrap", opacity: ramp(t, K.n1855 - 0.1, K.n1855 + 0.3) }}>
          1855 · <span style={{ color: C.goldHi }}>menduga</span>: gunung punya akar
        </div>
      </div>
    </div>
  );
};
// panel ayat An-Naba' 6–7
const AR1 = "أَلَمْ نَجْعَلِ ٱلْأَرْضَ مِهَٰدًا";
const AR2a = "وَٱلْجِبَالَ";
const AR2b = "أَوْتَادًا";
const AyatPanel: React.FC<{ t: number }> = ({ t }) => {
  const at = TM.EV.panel_ayat;
  const o = ramp(t, at, at + 0.45) * (1 - ramp(t, S3 - 0.1, S3 + 0.15));
  if (o <= 0) return null;
  const p = ramp(t, at, at + 0.5, BACK);
  const q1 = interpolate(t, [K.bukankah, K.dan3 - 0.2], [0, 1], clamp);
  const q2 = interpolate(t, [K.dan3, K.pasak3 + 0.3], [0, 1], clamp);
  const pk = ramp(t, K.pasak3 - 0.1, K.pasak3 + 0.35, BACK);
  const pkPop = Math.max(0, 1 - Math.abs(t - K.pasak3 - 0.15) / 0.5);
  const sweep = (txt: string, q: number, color = C.gold) => (
    <span style={{ position: "relative", display: "inline-block", padding: "0 6px" }}>
      <span style={{ color: `${color}44` }}>{txt}</span>
      <span style={{ position: "absolute", inset: 0, padding: "0 6px", color, textShadow: `0 0 26px ${color}aa`, clipPath: `inset(-20px 0 -20px ${(1 - q) * 100}%)` }}>{txt}</span>
    </span>
  );
  const phr = (txt: React.ReactNode, a: number) => (
    <span style={{ opacity: 0.12 + 0.88 * ramp(t, a - 0.1, a + 0.25) }}>{txt} </span>
  );
  return (
    <div style={{ position: "absolute", left: 120, top: 520, width: 800, padding: "30px 32px 34px", opacity: o, scale: String(0.94 + 0.06 * p), textAlign: "center", ...GLASS }}>
      <div style={{ direction: "rtl", fontFamily: AMIRI, fontWeight: 700, fontSize: 52, lineHeight: 1.7, whiteSpace: "nowrap" }}>
        {sweep(AR1, q1)}{" "}{sweep(AR2a, Math.min(1, q2 * 1.6))}{" "}
        <span style={{ display: "inline-block", scale: String(1 + 0.12 * pkPop) }}>{sweep(AR2b, cl(q2 * 1.6 - 0.6), pk > 0.5 ? C.goldHi : C.gold)}</span>
      </div>
      <div style={{ height: 1, background: `${C.gold}44`, margin: "14px 40px 18px" }} />
      <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 40, lineHeight: 1.35, color: C.text }}>
        {phr("“Bukankah Kami telah menjadikan bumi", K.bukankah)}
        {phr("sebagai hamparan,", K.sebagai1)}
        {phr("dan gunung-gunung", K.dan3)}
        {phr(<>sebagai <span style={{ display: "inline-block", color: C.goldHi, scale: String(1 + 0.15 * pkPop), textShadow: `0 0 ${10 + 24 * pk}px ${C.gold}` }}>pasak</span>?”</>, K.sebagai2)}
      </div>
    </div>
  );
};
// chip ikon dicoret (adegan 5)
const EyeIcon: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 64 64"><path d="M4,32 C 16,14 48,14 60,32 C 48,50 16,50 4,32 Z" fill="none" stroke={C.goldHi} strokeWidth={4} /><circle cx={32} cy={32} r={9} fill={C.goldHi} /></svg>
);
const GaugeIcon: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 64 64"><path d="M6,40 L16,40 L22,22 L30,54 L38,14 L44,40 L58,40" fill="none" stroke={C.goldHi} strokeWidth={4} strokeLinejoin="round" /></svg>
);
const CrossChip: React.FC<{ t: number; at: number; strike: number; out: number; y: number; icon: React.ReactNode; text: string }> = ({ t, at, strike, out, y, icon, text }) => {
  const o = ramp(t, at, at + 0.35) * (1 - ramp(t, out, out + 0.35));
  if (o <= 0) return null;
  const s = ramp(t, strike, strike + 0.3);
  return (
    <div style={{ position: "absolute", left: 170, top: y, width: 700, display: "flex", justifyContent: "center", opacity: o, scale: String(0.9 + 0.1 * ramp(t, at, at + 0.4, BACK)) }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, padding: "14px 30px", ...GLASS, borderRadius: 22 }}>
        {icon}
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 36, color: C.text, whiteSpace: "nowrap" }}>{text}</div>
        <div style={{ position: "absolute", left: 18, right: 18, top: "50%", height: 6, borderRadius: 3, background: C.red, transformOrigin: "left center",
          scale: `${s} 1`, rotate: "-4deg", boxShadow: `0 0 12px ${C.red}` }} />
      </div>
    </div>
  );
};
// Progres + watermark
const CHAPTERS = [S1, S2, S3, S4, S5, S6];
const Progress: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(t / END, 1);
  return (
    <div style={{ position: "absolute", left: 100, top: 236, width: 820, opacity: 1 - ramp(t, END, END + 0.4) }}>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,231,163,0.18)" }} />
      <div style={{ position: "absolute", top: 0, height: 6, width: 820 * p, borderRadius: 3, background: `linear-gradient(90deg, ${C.ember}, ${C.goldHi})`, boxShadow: `0 0 14px ${C.gold}` }} />
      {CHAPTERS.map((c) => (
        <div key={c} style={{ position: "absolute", left: (c / END) * 820 - 6, top: -4, width: 14, height: 14, borderRadius: 7,
          background: t >= c ? C.gold : "#1A1426", border: `2px solid ${t >= c ? C.gold : C.muted}` }} />
      ))}
    </div>
  );
};
const Watermark: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 100, top: 262, display: "flex", alignItems: "center", gap: 12, opacity: ramp(t, 1.5, 2.1) * (1 - ramp(t, END - 0.3, END)) }}>
    <Img src={staticFile("logo.png")} style={{ width: 44, height: 44 }} />
    <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 26, color: C.text, textShadow: "0 2px 8px #000" }}>Muslim Leveling</div>
  </div>
);
// Caption kata per kata dengan pita gelap
const GROUPS: Wd[][] = (() => {
  const g: Wd[][] = [];
  let cur: Wd[] = [];
  (cues.words as Wd[]).filter((w) => w.w).forEach((w, i, arr) => {
    cur.push(w);
    const next = arr[i + 1];
    if (!next || cur.length >= 4 || /[.,?!:…]["']?$/.test(w.w) || next.s - w.e > 0.35) { g.push(cur); cur = []; }
  });
  return g;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= END) return null;
  const grp = GROUPS.find((g, i) => t >= g[0].s - 0.05 && t < (GROUPS[i + 1]?.[0].s ?? 999) - 0.05 && t < g[g.length - 1].e + 0.6);
  if (!grp) return null;
  const pop = ramp(t, grp[0].s - 0.05, grp[0].s + 0.15, BACK);
  return (
    <div style={{ position: "absolute", bottom: 520, left: 100, width: 820, textAlign: "center", scale: String(0.92 + 0.08 * pop), opacity: pop }}>
      <span style={{ fontFamily: READEX, fontWeight: 700, fontSize: 48, lineHeight: 1.3, padding: "10px 24px", borderRadius: 22,
        background: "rgba(10,7,18,0.72)", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
        {grp.map((w, i) => {
          const on = t >= w.s - 0.03 && t < w.e + 0.08;
          return (
            <React.Fragment key={i}>
              <span style={{ color: on ? C.gold : C.text, opacity: t >= w.s - 0.03 ? 1 : 0.55, whiteSpace: "nowrap",
                textShadow: on ? `0 0 18px ${C.gold}aa` : "none" }}>{w.w}</span>
              {i < grp.length - 1 ? " " : ""}
            </React.Fragment>
          );
        })}
      </span>
    </div>
  );
};
// partikel latar depan (parallax 1,4) dan angin
const Foreground: React.FC<{ t: number; c: Cam; o: number }> = ({ t, c, o }) => {
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: o, filter: "blur(2.5px)" }}>
      {new Array(22).fill(0).map((_, i) => {
        const sx = (((random(`fx${i}`) * (W + 300) - c.x * c.z * 0.4 + t * 18) % (W + 300)) + (W + 300)) % (W + 300) - 150;
        const sy = (((random(`fy${i}`) * (H + 300) - c.y * c.z * 0.4 - t * 10) % (H + 300)) + (H + 300)) % (H + 300) - 150;
        const s = 4 + random(`fs${i}`) * 8;
        return <div key={i} style={{ position: "absolute", left: sx, top: sy, width: s, height: s, borderRadius: "50%", background: "#FFE7C8", opacity: 0.18 + 0.2 * random(`fo${i}`) }} />;
      })}
    </AbsoluteFill>
  );
};
const Wind: React.FC<{ t: number; c: Cam; o: number }> = ({ t, c, o }) => {
  if (o <= 0) return null;
  const gy = AY + (GY - c.y) * c.z;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
      {new Array(16).fill(0).map((_, i) => {
        const len = 120 + random(`wl${i}`) * 220;
        const x = ((random(`wx${i}`) * (W + 600) + t * (900 + random(`wv${i}`) * 500)) % (W + 600)) - 300;
        const y = gy - 20 - random(`wy${i}`) * 260;
        return <path key={i} d={`M${x},${y} q ${len / 2},${-10} ${len},0`} stroke="#EAF2FF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.25 + 0.35 * random(`wo${i}`)} />;
      })}
    </svg>
  );
};
const Check: React.FC<{ t: number; at: number; until: number; x: number; y: number }> = ({ t, at, until, x, y }) => {
  const p = ramp(t, at, at + 0.45, BACK) * (1 - ramp(t, until - 0.25, until));
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - 56, top: y - 56, width: 112, height: 112, borderRadius: 56, background: C.em, opacity: Math.min(1, p),
      scale: String(0.5 + 0.5 * p), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${C.em}aa` }}>
      <svg width={64} height={64} viewBox="0 0 64 64"><path d="M12,34 L26,48 L52,18" fill="none" stroke="#06140E" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
};
// End card
const Center: React.FC<{ y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y = 1000, children, style }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: W, height: 0, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>{children}</div>
);
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const g = ramp(t, END, END + 0.7, BACK);
  return (
    <AbsoluteFill style={{ background: NIGHT.top }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NIGHT.top}, ${NIGHT.mid} 60%, ${NIGHT.low})` }} />
      <Stars t={t} o={0.8} milky={0.5} />
      <Clouds t={t} color="#3B3A6E" o={0.25} y={1300} />
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
const EV = TM.EV;
export const GunungAkar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cA = cam(TM.A, t), cB = cam(TM.B, t), cC = cam(TM.C, t);
  // peralihan antar-set
  const pAB = ramp(t, TR.ab0, TR.ab1, EASE), pMO = ramp(t, TR.mo0, TR.mo1, EASE), pAC = ramp(t, TR.ac0, TR.ac1, EASE), pCA = ramp(t, TR.ca0, TR.ca1, EASE);
  const inA1 = t < TR.ab1 + 0.02, inA2 = t > TR.mo0 - 0.02 && t < TR.ac1 + 0.02, inA3 = t > TR.ca0 - 0.02;
  const showA = inA1 || inA2 || inA3;
  const showB = t > TR.ab0 - 0.02 && t < TR.mo1 + 0.02;
  const showC = t > TR.ac0 - 0.02 && t < TR.ca1 + 0.02;
  const offA = inA1 ? [-W * pAB, 0] : inA2 ? [0, H * pAC] : [0, H * (1 - pCA)];
  const opA = inA2 ? pMO : 1;
  const offB = [W * (1 - pAB), 0];
  const offC = [0, -H * (1 - pAC) - H * pCA];
  const whipX = Math.sin(Math.PI * pAB) * 30, whipYac = Math.sin(Math.PI * pAC) * 30, whipYca = Math.sin(Math.PI * pCA) * 30;
  // motion blur searah gerak kamera
  const vA = vel(TM.A, t), vB = vel(TM.B, t), vC = vel(TM.C, t);
  const mb = (v: { dx: number; dy: number }, ex = 0, ey = 0) => [Math.min(40, Math.max(0, Math.abs(v.dx) - 30) * 0.4 + ex), Math.min(40, Math.max(0, Math.abs(v.dy) - 30) * 0.4 + ey)];
  const bA = mb(vA, inA1 ? whipX : 0, inA2 ? whipYac : inA3 ? whipYca : 0), bB = mb(vB, whipX), bC = mb(vC, 0, whipYac + whipYca);
  const fil = (b: number[], id: string) => (b[0] > 1.2 || b[1] > 1.2 ? `url(#${id})` : undefined);
  // guncangan
  const sh = [shakeXY(t, K.getaran, 7, 0.5), ...HITS.map((h) => shakeXY(t, h, 6, 0.22))].reduce((a, b) => [a[0] + b[0], a[1] + b[1]] as const, [0, 0] as const);
  // kamera aktif (vignette, label)
  const activeZ = showB && !showA ? cB.z : showC && !showA ? cC.z : cA.z;
  const fadeFast = (v: { dx: number; dy: number }) => cl(1 - (Math.hypot(v.dx, v.dy) - 40) / 40);
  const lfA = fadeFast(vA), lfB = fadeFast(vB);
  // penggaris + mini-map: hanya di dunia A saat menjelajah
  const instr = (win(t, S1 + 0.2, S2 + 0.6, 0.4) + win(t, TR.ca1, K.walau, 0.4)) * (inA1 || inA3 ? 1 : 0);
  // morph pasak
  const morphOn = t > TR.mo0 - 0.02 && t < TR.ac0 + 0.05;
  const ptsB = pegB(pegTopB(t)).map(([x, y]) => scr(cB, x, y));
  const ptsA = PEG_A.map(([x, y]) => scr(cA, x, y));
  const mPts = ptsA.map((a, i) => [ptsB[i][0] + (a[0] - ptsB[i][0]) * pMO, ptsB[i][1] + (a[1] - ptsB[i][1]) * pMO]);
  const morphO = (t < TR.mo0 + 0.1 ? ramp(t, TR.mo0 - 0.05, TR.mo0 + 0.1) : 1) * (1 - ramp(t, TR.ac0 - 0.05, TR.ac0 + 0.1));
  const endO = ramp(t, END, END + 0.4);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
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
        {showB && (
          <AbsoluteFill style={{ translate: `${offB[0]}px ${offB[1]}px`, opacity: 1 - pMO, filter: fil(bB, "mbB") }}>
            <svg width={W} height={H} style={{ position: "absolute" }}><WorldB t={t} c={cB} /></svg>
          </AbsoluteFill>
        )}
        {showC && (
          <AbsoluteFill style={{ translate: `${offC[0]}px ${offC[1]}px`, filter: fil(bC, "mbC") }}>
            <WorldC t={t} c={cC} />
          </AbsoluteFill>
        )}
        {showA && (
          <AbsoluteFill style={{ translate: `${offA[0]}px ${offA[1]}px`, opacity: opA, filter: fil(bA, "mbA") }}>
            <svg width={W} height={H} style={{ position: "absolute" }}><WorldA t={t} c={cA} /></svg>
            {/* latar blur saat kartu 1855 (fokus ke HUD) */}
          </AbsoluteFill>
        )}
        {showA && (t > K.ilmuwan + 0.2 && t < K.lalu2 + 0.4) && (
          <AbsoluteFill style={{ backdropFilter: `blur(${6 * win(t, K.ilmuwan + 0.6, K.lalu2 + 0.3, 0.4)}px)`, background: `rgba(6,4,14,${0.3 * win(t, K.ilmuwan + 0.6, K.lalu2 + 0.3, 0.4)})` }} />
        )}
        <Foreground t={t} c={showB && !showA ? cB : cA} o={(showA && !inA2) || showB ? 1 : 0} />
        <Wind t={t} c={cA} o={win(t, K.walau - 0.1, S6 + 0.4, 0.4)} />
      </AbsoluteFill>
      {/* morph pasak → akar gunung */}
      {morphOn && morphO > 0 && (
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: morphO }}>
          <polygon points={mPts.map(([x, y]) => `${x},${y}`).join(" ")} fill={`${C.gold}1c`} stroke={C.goldHi} strokeWidth={5} strokeDasharray="18 10" strokeDashoffset={-t * 30}
            style={{ filter: glow(C.gold, 0.7) }} />
        </svg>
      )}
      <Vignette k={0.42 + 0.22 * cl((activeZ - 1) / 1.5)} />
      {/* ===== LABEL-DUNIA ===== */}
      {inA1 && (
        <>
          <WLabel t={t} c={cA} at={K.puncak} until={K.padahal + 0.65} wx={MX} wy={PEAK} dx={-170} dy={-120} text="PUNCAK" fade={lfA} />
          <WLabel t={t} c={cA} at={EV.label_akar} until={K.puluhan - 0.05} wx={MX - 60} wy={cA.y + 60} dx={-150} dy={-40} text="AKAR" color={BLUE} dark />
          <WLabel t={t} c={cA} at={K.puluhan} until={K.ilmuwan - 0.3} wx={MX + 130} wy={TIP - 60} dx={-250} dy={-70} text="PULUHAN KM" fade={lfA} />
        </>
      )}
      {showB && (
        <>
          <WLabel t={t} c={cB} at={K.ujungnya} until={K.bagian + 0.05} wx={PX} wy={pegTopB(t)} dx={-200} dy={-150} text="UJUNG" fade={lfB} />
          <WLabel t={t} c={cB} at={K.tertanam4 + 0.1} until={TR.mo0} wx={PX + 9} wy={pegTopB(t) + 300} dx={-230} dy={0} text="DI DALAM TANAH" color={BLUE} dark fade={lfB} />
        </>
      )}
      {inA2 && (
        <>
          <WLabel t={t} c={cA} at={EV.label_pasak} until={TR.ac0} wx={MX - 240} wy={PEAK + 20} dx={-150} dy={-30} text="PASAK" size={34} />
          <WLabel t={t} c={cA} at={EV.label_gunung} until={TR.ac0} wx={MX + 330} wy={GY - 60} dx={160} dy={50} text="GUNUNG" color="#E8EEF8" size={34} />
        </>
      )}
      {inA3 && (
        <>
          <WLabel t={t} c={cA} at={K.akarnya6} until={K.iman} wx={MX} wy={2780} dx={0} dy={-90} text="AKAR" color={BLUE} dark fade={lfA} />
          <WLabel t={t} c={cA} at={K.iman} until={K.walau - 0.1} wx={MX} wy={2780} dx={0} dy={-90} text="IMAN" color={BLUE} dark fade={lfA} size={46} />
          {BRANCHES.map((b, i) => (
            <WLabel key={i} t={t} c={cA} at={b.at + 0.1} until={K.walau - 0.1} wx={b.end[0]} wy={b.end[1]} dx={b.dx} dy={i === 2 ? 60 : -50} text={b.label} size={32} fade={lfA} />
          ))}
        </>
      )}
      {/* ===== HUD ===== */}
      <Ruler c={cA} o={instr} />
      <MiniMap c={cA} o={instr} />
      {/* 1 hook */}
      <SeriesLabel o={1 - ramp(t, S1 - 0.2, S1 + 0.2)} y={322} />
      <HookText t={t} />
      {/* 2 sains */}
      <Title t={t} at={EV.title_lihat} until={K.padahal + 0.7} text="YANG KITA *LIHAT*" hiAt={K.puncak} />
      <Title t={t} at={EV.title_tersembunyi} until={K.akar2 - 0.05} text="YANG *TERSEMBUNYI*" color={BLUE} />
      <Title t={t} at={EV.title_akar} until={K.ilmuwan - 0.3} text="AKAR *GUNUNG*" color={BLUE} hiAt={K.menghujam} />
      {t > EV.title_1855 - 0.1 && t < K.lalu2 && (
        <div style={{ position: "absolute", top: 300, left: 100, width: 840, textAlign: "center", fontFamily: KUFI, fontWeight: 700, fontSize: 120, color: C.goldHi,
          textShadow: textGlow(C.gold), opacity: win(t, EV.title_1855 + 0.3, K.lalu2, 0.3), scale: String(1 + 0.08 * Math.max(0, 1 - Math.abs(t - K.n1855 - 0.1) / 0.4)) }}>
          {Math.round(interpolate(t, [EV.title_1855, K.n1855], [1700, 1855], { ...clamp, easing: Easing.out(Easing.cubic) }))}
        </div>
      )}
      <AiryCard t={t} />
      <Title t={t} at={EV.title_gempa} until={K.gempa - 0.05} text="GETARAN *GEMPA*" size={74} />
      <Title t={t} at={K.gempa} until={S2 + 0.15} text="*TERBUKTI* ✓" color={C.em} size={86} />
      <Check t={t} at={K.gempa + 0.05} until={S2 + 0.15} x={760} y={1060} />
      {t > K.ilmuwan + 0.6 && t < S2 && (
        <div style={{ position: "absolute", left: 100, width: 820, top: 1160, textAlign: "right", fontFamily: READEX, fontWeight: 500, fontSize: 21, color: C.muted,
          opacity: win(t, K.lalu2 + 0.3, S2, 0.3), textShadow: "0 2px 6px #000" }}>ilustrasi · tinggi & dalam sesuai skala</div>
      )}
      {/* 3 ayat */}
      {t > EV.title_1400 - 0.1 && t < S3 + 0.2 && (
        <div style={{ position: "absolute", top: 318, left: 100, width: 840, textAlign: "center", fontFamily: KUFI, fontWeight: 700, fontSize: 78, lineHeight: 1.1,
          color: C.text, textShadow: textGlow("#000000"), opacity: win(t, EV.title_1400 + 0.3, S3 + 0.15, 0.3) }}>
          <span style={{ color: C.goldHi, textShadow: textGlow(C.gold) }}>{Math.round(interpolate(t, [EV.title_1400, EV.title_1400 + 0.8], [0, 1400], { ...clamp, easing: Easing.out(Easing.cubic) }))}+</span> TAHUN LALU
        </div>
      )}
      <AyatPanel t={t} />
      <Pill t={t} at={K.surat} until={S3 + 0.1}>QS. An-Naba': 6–7</Pill>
      {/* 4 pasak */}
      <Title t={t} at={EV.title_apa_pasak} until={K.yang4 - 0.4} text="APA ITU *PASAK*?" hiAt={K.pasak4} />
      <Title t={t} at={EV.title_kelihatan} until={K.bagian + 0.05} text="YANG *KELIHATAN*" hiAt={K.ujungnya} />
      <Title t={t} at={EV.title_tertanam} until={TR.mo0} text="YANG *TERTANAM*" color={BLUE} />
      <Title t={t} at={K.kan - 0.05} until={TR.ac0 + 0.05} text="*MIRIP*, KAN?" size={86} />
      <Check t={t} at={K.kan + 0.1} until={TR.ac0 + 0.05} x={790} y={1030} />
      {/* 5 siapa */}
      <Title t={t} at={EV.title_siapa} until={K.allah5 - 0.1} text="SIAPA YANG | *MEMBERI_TAHU*?" size={68} />
      <CrossChip t={t} at={K.tidak5} strike={K.bumi5} out={K.yang5 - 0.1} y={600} icon={<EyeIcon />} text="MELIHAT KE DALAM BUMI" />
      <CrossChip t={t} at={K.tidak5 + 0.35} strike={K.bumi5 + 0.2} out={K.yang5 - 0.1} y={740} icon={<GaugeIcon />} text="ALAT UKUR" />
      <Title t={t} at={K.allah5} until={TR.ca0 + 0.05} text="*ALLAH*" size={124} />
      {t > K.menciptakan - 0.1 && t < TR.ca0 + 0.1 && (
        <div style={{ position: "absolute", top: 462, left: 100, width: 840, textAlign: "center", fontFamily: READEX, fontWeight: 700, fontSize: 40, color: C.text,
          textShadow: "0 3px 12px #000, 0 0 24px #000", opacity: win(t, K.menciptakan + 0.25, TR.ca0 + 0.05, 0.3) }}>yang menciptakan gunung</div>
      )}
      {/* 6 pesan */}
      <Title t={t} at={EV.title_kuat} until={K.kekuatan - 0.1} text="KUAT KARENA *AKAR*" color={BLUE} hiAt={K.akarnya6} />
      <Title t={t} at={K.kekuatan} until={K.iman - 0.1} text="KEKUATAN *DI_HATI*" hiAt={K.hati} />
      <Title t={t} at={K.iman} until={K.tanam - 0.1} text="AKAR KITA: *IMAN*" color={BLUE} />
      <Title t={t} at={K.tanam} until={K.walau - 0.15} text="TANAM *SETIAP_HARI*" hiAt={K.shalat} />
      <Title t={t} at={EV.title_kokoh} until={S6 + 0.05} text="*KOKOH*" size={110} />
      {/* 7 CTA */}
      <Title t={t} at={EV.title_tulis} until={END} text={'TULIS *"SUBHANALLAH"*'} size={66} hiAt={K.subhanallah} />
      {t > K.subhanallah - 0.2 && t < END + 0.1 && (
        <div style={{ position: "absolute", left: 160, top: 470, width: 720, display: "flex", justifyContent: "center", opacity: win(t, K.subhanallah + 0.2, END, 0.3) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 30px", ...GLASS, borderRadius: 22, scale: String(0.9 + 0.1 * ramp(t, K.subhanallah - 0.2, K.subhanallah + 0.3, BACK)) }}>
            <svg width={52} height={52} viewBox="0 0 52 52"><path d="M6,8 H46 V36 H22 L12,46 V36 H6 Z" fill="none" stroke={C.goldHi} strokeWidth={4} strokeLinejoin="round" />
              <circle cx={17} cy={22} r={3} fill={C.goldHi} /><circle cx={26} cy={22} r={3} fill={C.goldHi} /><circle cx={35} cy={22} r={3} fill={C.goldHi} /></svg>
            <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 34, color: C.text }}>di kolom komentar</div>
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
      <SeriesLabel o={win(t, S6 + 0.6, END, 0.3)} y={1000} />
      <Captions t={t} />
      <Progress t={t} />
      <Watermark t={t} />
      {t > END - 0.05 && <AbsoluteFill style={{ opacity: endO }}><EndCard t={t} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};
