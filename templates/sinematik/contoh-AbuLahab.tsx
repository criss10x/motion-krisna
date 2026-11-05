// CONTOH LENGKAP varian Sinematik (Mukjizat Al-Qur'an #1, Abu Lahab). Hanya acuan: komponen lingkungan sudah dipisah ke env.tsx.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Solid,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { lightLeak } from "@remotion/effects/light-leak";
import { loadFont as loadKufi } from "@remotion/google-fonts/ReemKufi";
import { loadFont as loadReadex } from "@remotion/google-fonts/ReadexPro";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import cues from "../public/cues.json"; // contoh: proyek abu-lahab (tidak dikompilasi dari sini)

const KUFI = loadKufi("normal", { weights: ["700"] }).fontFamily;
const READEX = loadReadex("normal", { weights: ["500", "700"] }).fontFamily;
const AMIRI = loadAmiri("normal", { weights: ["700"] }).fontFamily;

// Palet sinematik "Makkah abad ke-7": malam indigo, fajar jingga, pasir, bara (lahab), Arab emas
const C = {
  bg: "#07060F",
  card: "rgba(16,11,26,0.74)",
  gold: "#E9C46A",
  goldHi: "#FFE7A3",
  text: "#FFF9EF",
  muted: "#CDBB9E",
  ember: "#FF7A3D",
  red: "#E5483A",
  em: "#3FE0A0",
  sky: "#8FD3FF",
  parch: "#EBD7AE",
  ink: "#3A2414",
};

const S = cues.scenes;
const END = S[8].start;
const AY = cues.ayat[0];
// Waktu kata kunci (detik, dari cues.json setelah tighten)
const K = {
  bukti: 2.16, satuKal: 4.85, tidak: 6.78,
  nama: 8.53, paman: 10.0, saat: 11.82, shafa: 13.04, bentak: 13.91, celaka: 14.67, untuk: 15.98,
  lalu: 18.01, binasa: 23.28, surat: 25.77, pasti: 26.21, mati1: 27.6,
  padahal: 29.01, aku: 30.49, bahkan: 31.78, pura: 32.22, maka: 33.51, salah: 34.99,
  sekitar: 35.57, kesempatan: 37.4, memusuhi: 39.37, mati2: 40.57, badar: 42.83,
  siapa: 43.49, sepuluh: 45.75, hanya: 47.23,
  ingat: 48.17, nasab: 50.37, iman: 52.38, jadi: 54.66, masad: 55.44, hati: 58.07,
  simpan: 59.1, bagikan: 59.97,
};
const SAW = "ﷺ";

const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IN = Easing.bezier(0.7, 0, 0.84, 0);
const BACK = Easing.out(Easing.back(1.8));
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (t: number, a: number, b: number, e = OUT) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
const win = (t: number, a: number, b: number, f = 0.4) => interpolate(t, [a - f, a, b - f, b], [0, 1, 1, 0], clamp);
const mix = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * p)).join(",")})`;
};
const glow = (c: string, r = 1) => `drop-shadow(0 0 ${8 * r}px ${c}) drop-shadow(0 0 ${22 * r}px ${c}88)`;
const textGlow = (c: string) => `0 0 14px ${c}99, 0 0 40px ${c}44, 0 5px 0 rgba(0,0,0,0.65)`;
const shake = (t: number, at: number, amp = 14, dur = 0.4) => {
  const k = t >= at && t < at + dur ? (1 - (t - at) / dur) * amp : 0;
  return `${Math.sin(t * 90) * k}px ${Math.cos(t * 77) * k}px`;
};

// =================== LINGKUNGAN (ilustrasi berlapis, deterministik) ===================
const W = 1080, H = 1920;

type SkyP = { top: string; mid: string; low: string };
const NIGHT: SkyP = { top: "#05061A", mid: "#141A46", low: "#3A2D5C" };
const DAWN: SkyP = { top: "#1B1B4A", mid: "#7A4A7E", low: "#F2A35E" };
const MORNING: SkyP = { top: "#2C4F8C", mid: "#D98A63", low: "#FFD39A" };
const STORM: SkyP = { top: "#06040C", mid: "#1E0F1C", low: "#5A2418" };
const lerpSky = (a: SkyP, b: SkyP, p: number): SkyP => ({ top: mix(a.top, b.top, p), mid: mix(a.mid, b.mid, p), low: mix(a.low, b.low, p) });

const Sky: React.FC<{ p: SkyP; horizon?: number }> = ({ p, horizon = 1250 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${p.top} 0%, ${p.mid} ${(horizon / H) * 62}%, ${p.low} ${(horizon / H) * 100}%, ${p.low} 100%)` }} />
);

const Stars: React.FC<{ t: number; o: number; n?: number; milky?: number }> = ({ t, o, n = 140, milky = 0 }) => {
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {milky > 0 && (
        <div style={{ position: "absolute", left: -300, top: 260, width: 1700, height: 520, rotate: "-28deg", opacity: milky,
          background: "radial-gradient(ellipse at 50% 50%, rgba(200,190,255,0.30) 0%, rgba(140,120,220,0.12) 35%, rgba(0,0,0,0) 70%)" }} />
      )}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {new Array(n).fill(0).map((_, i) => {
          const x = random(`sx${i}`) * W, y = random(`sy${i}`) * 1250;
          const r = 0.8 + random(`sr${i}`) ** 3 * 2.6;
          const tw = 0.55 + 0.45 * Math.sin(t * (1 + random(`st${i}`) * 3) + i);
          return <circle key={i} cx={x} cy={y} r={r} fill={i % 7 ? "#FFF6E0" : "#BFD6FF"} opacity={tw} />;
        })}
        {milky > 0 && new Array(160).fill(0).map((_, i) => {
          const u = random(`mx${i}`), v = random(`my${i}`) - 0.5;
          const x = -100 + u * 1300, y = 900 - u * 700 + v * 160;
          return <circle key={`m${i}`} cx={x} cy={y} r={0.7 + random(`mr${i}`)} fill="#E8E2FF" opacity={milky * (0.3 + 0.5 * random(`mo${i}`))} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Orb: React.FC<{ x: number; y: number; r: number; color: string; halo?: number; moon?: boolean }> = ({ x, y, r, color, halo = 1, moon }) => (
  <>
    <div style={{ position: "absolute", left: x - r * 6, top: y - r * 6, width: r * 12, height: r * 12, borderRadius: "50%", opacity: 0.55 * halo,
      background: `radial-gradient(circle, ${color}66 0%, ${color}22 30%, rgba(0,0,0,0) 65%)` }} />
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%",
      background: moon ? `radial-gradient(circle at 38% 35%, #FFF9E8, ${color})` : `radial-gradient(circle, #FFF8DC, ${color})`,
      boxShadow: `0 0 ${r}px ${color}` }}>
      {moon && <div style={{ position: "absolute", left: r * 0.5, top: -r * 0.15, width: r * 1.9, height: r * 1.9, borderRadius: "50%", background: "rgba(10,10,40,0.0)", boxShadow: `inset ${-r * 0.35}px ${r * 0.1}px 0 rgba(20,20,60,0.25)` }} />}
    </div>
  </>
);

// Punggung gunung berbatu: jumlah sinus + jitter seeded
const ridgePath = (seed: string, y: number, amp: number, step = 46) => {
  const pts: string[] = [];
  const ph = [random(seed + "a") * 6, random(seed + "b") * 6, random(seed + "c") * 6];
  for (let x = -200; x <= W + 200; x += step) {
    const h = amp * (0.55 * Math.sin(x / 230 + ph[0]) + 0.3 * Math.sin(x / 97 + ph[1]) + 0.15 * Math.sin(x / 41 + ph[2]))
      + (random(`${seed}${x}`) - 0.5) * amp * 0.25;
    pts.push(`${x},${(y - h).toFixed(1)}`);
  }
  return `M-200,${H} L${pts.join(" L")} L${W + 200},${H} Z`;
};
const Mountain: React.FC<{ seed: string; y: number; amp: number; top: string; bottom: string; x?: number; rim?: string }> = ({
  seed, y, amp, top, bottom, x = 0, rim,
}) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <defs>
      <linearGradient id={`g${seed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset={String((y - amp) / H)} stopColor={top} />
        <stop offset={String(Math.min(1, (y + 300) / H))} stopColor={bottom} />
      </linearGradient>
    </defs>
    <path d={ridgePath(seed, y, amp)} fill={`url(#g${seed})`} transform={`translate(${x} 0)`}
      stroke={rim ?? "none"} strokeWidth={rim ? 2.5 : 0} strokeOpacity={0.55} />
  </svg>
);

const dunePath = (seed: string, y: number, amp: number) => {
  const pts: string[] = [];
  const ph = random(seed) * 6;
  for (let x = -200; x <= W + 200; x += 20) {
    pts.push(`${x},${(y - amp * Math.sin(x / 260 + ph) - amp * 0.35 * Math.sin(x / 110 + ph * 2)).toFixed(1)}`);
  }
  return `M-200,${H} L${pts.join(" L")} L${W + 200},${H} Z`;
};
const Dune: React.FC<{ seed: string; y: number; amp: number; top: string; bottom: string; x?: number }> = ({ seed, y, amp, top, bottom, x = 0 }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <defs>
      <linearGradient id={`d${seed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset={String((y - amp) / H)} stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <path d={dunePath(seed, y, amp)} fill={`url(#d${seed})`} transform={`translate(${x} 0)`} />
  </svg>
);

// Rumah bata lumpur Makkah: kotak beratap datar, parapet, jendela kecil (menyala saat malam)
const Houses: React.FC<{ seed: string; y: number; n: number; scale?: number; wall: string; shade: string; lit?: number; x?: number; t?: number }> = ({
  seed, y, n, scale = 1, wall, shade, lit = 0, x = 0, t = 0,
}) => {
  const items = new Array(n).fill(0).map((_, i) => {
    const w = (70 + random(`${seed}w${i}`) * 80) * scale;
    const h = (60 + random(`${seed}h${i}`) * 90) * scale;
    const cx = -80 + (i / (n - 1)) * (W + 160) + (random(`${seed}x${i}`) - 0.5) * 50;
    return { w, h, cx, win: random(`${seed}l${i}`) };
  });
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: x, top: 0, overflow: "visible" }}>
      {items.map((b, i) => (
        <g key={i} transform={`translate(${b.cx - b.w / 2} ${y - b.h})`}>
          <rect width={b.w} height={b.h + 400} fill={wall} />
          <rect x={b.w * 0.72} width={b.w * 0.28} height={b.h + 400} fill={shade} />
          <rect x={-3} y={-6 * scale} width={b.w + 6} height={8 * scale} fill={shade} />
          <rect x={b.w * 0.25} y={b.h * 0.3} width={10 * scale} height={14 * scale} rx={4 * scale}
            fill={b.win < lit ? C.ember : "#1A1020"} opacity={b.win < lit ? 0.75 + 0.25 * Math.sin(t * 3 + i) : 0.8}
            style={b.win < lit ? { filter: `drop-shadow(0 0 ${10 * scale}px ${C.ember})` } : undefined} />
          {b.w > 110 * scale && <rect x={b.w * 0.5} y={b.h * 0.55} width={16 * scale} height={b.h * 0.45} rx={7 * scale} fill="#140B12" />}
        </g>
      ))}
    </svg>
  );
};

const Kaaba: React.FC<{ x: number; y: number; s: number; lit?: number }> = ({ x, y, s, lit = 0 }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={120} ry={14} fill={C.goldHi} opacity={0.12 * lit} />
      <path d="M-50,0 L-50,-82 L10,-92 L10,-6 Z" fill="#0B0B10" />
      <path d="M10,-6 L10,-92 L52,-84 L52,-2 Z" fill="#17161E" />
      <path d="M-50,-62 L10,-70 L52,-64" stroke={C.gold} strokeWidth={5} fill="none" opacity={0.9} />
    </g>
  </svg>
);

const Palm: React.FC<{ x: number; y: number; s: number; t: number; color: string; seed: number }> = ({ x, y, s, t, color, seed }) => {
  const sway = Math.sin(t * 0.9 + seed) * 3;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={`M0,0 C ${8 + sway},-90 ${-6 + sway},-180 ${14 + sway * 2},-260`} stroke={color} strokeWidth={13} fill="none" strokeLinecap="round" />
        <g transform={`translate(${14 + sway * 2} -260) rotate(${sway})`}>
          {[-150, -115, -80, -45, -10, 25, 60, 200].map((a, i) => (
            <path key={i} transform={`rotate(${a + Math.sin(t * 1.3 + i + seed) * 4})`}
              d="M0,0 C 40,-24 90,-20 128,12 C 92,-4 46,-2 0,8 Z" fill={color} />
          ))}
        </g>
      </g>
    </svg>
  );
};

// Siluet orang tanpa wajah (kepala + jubah)
const Person: React.FC<{ x: number; y: number; s: number; color: string; rim?: string; aura?: string; hood?: boolean }> = ({
  x, y, s, color, rim, aura, hood,
}) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {aura && <ellipse cx={0} cy={-70} rx={70} ry={120} fill={aura} opacity={0.35} style={{ filter: `blur(18px)` }} />}
      <path d="M-34,0 C -36,-60 -30,-104 -18,-112 L 18,-112 C 30,-104 36,-60 34,0 Z" fill={color} stroke={rim ?? "none"} strokeWidth={rim ? 2.5 : 0} />
      <circle cx={0} cy={-128} r={17} fill={color} stroke={rim ?? "none"} strokeWidth={rim ? 2.5 : 0} />
      {hood && <path d="M-19,-128 C -20,-152 20,-152 19,-128 L 24,-108 L -24,-108 Z" fill={color} />}
    </g>
  </svg>
);

const Dust: React.FC<{ t: number; n?: number; color?: string; o?: number; speed?: number }> = ({ t, n = 40, color = "#F3C98B", o = 0.5, speed = 1 }) => (
  <AbsoluteFill style={{ opacity: o }}>
    {new Array(n).fill(0).map((_, i) => {
      const sp = (30 + random(`dv${i}`) * 70) * speed;
      const x = ((random(`dx${i}`) * (W + 200) + t * sp) % (W + 200)) - 100;
      const y = 300 + random(`dy${i}`) * 1500 + Math.sin(t + i) * 12;
      const s = 1.5 + random(`ds${i}`) * 3.5;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: color, opacity: 0.3 + 0.5 * random(`do${i}`) }} />;
    })}
  </AbsoluteFill>
);

const Embers: React.FC<{ t: number; n?: number; o?: number; x0?: number; x1?: number }> = ({ t, n = 36, o = 1, x0 = 0, x1 = W }) => (
  <AbsoluteFill style={{ opacity: o }}>
    {new Array(n).fill(0).map((_, i) => {
      const sp = 60 + random(`ev${i}`) * 110;
      const y = H + 40 - ((random(`ey${i}`) * (H + 80) + t * sp) % (H + 80));
      const x = x0 + random(`ex${i}`) * (x1 - x0) + Math.sin(t * 2 + i) * 20;
      const s = 2 + random(`es${i}`) * 5;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%",
        background: i % 3 ? C.ember : C.goldHi, boxShadow: `0 0 ${s * 3}px ${C.ember}`, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i)) }} />;
    })}
  </AbsoluteFill>
);

const Clouds: React.FC<{ t: number; color: string; o: number; y?: number; speed?: number }> = ({ t, color, o, y = 420, speed = 8 }) => (
  <AbsoluteFill style={{ opacity: o }}>
    {new Array(7).fill(0).map((_, i) => {
      const w = 380 + random(`cw${i}`) * 420;
      const x = ((random(`cx${i}`) * (W + w) + t * speed * (0.6 + random(`cs${i}`))) % (W + w)) - w;
      return <div key={i} style={{ position: "absolute", left: x, top: y + random(`cy${i}`) * 420 - 200, width: w, height: w * 0.32, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${color} 0%, rgba(0,0,0,0) 70%)`, opacity: 0.5 + 0.4 * random(`co${i}`) }} />;
    })}
  </AbsoluteFill>
);

const Rays: React.FC<{ t: number; x: number; y: number; o: number; color?: string; n?: number; len?: number }> = ({ t, x, y, o, color = C.goldHi, n = 14, len = 1500 }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: o, mixBlendMode: "screen" }}>
    <defs>
      <linearGradient id={`ray${x}${y}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={0.55} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    <g transform={`translate(${x} ${y}) rotate(${t * 2})`}>
      {new Array(n).fill(0).map((_, i) => (
        <path key={i} transform={`rotate(${(360 / n) * i + Math.sin(t + i) * 3})`} d={`M0,0 L${-26 - (i % 3) * 14},${len} L${26 + (i % 3) * 14},${len} Z`} fill={`url(#ray${x}${y})`} />
      ))}
    </g>
  </svg>
);

const Vignette: React.FC<{ k?: number }> = ({ k = 0.75 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,${k}) 100%)` }} />
);

// Lembah Makkah lengkap (dipakai adegan 2, 5, 8 dengan waktu berbeda)
const Valley: React.FC<{ t: number; sky: SkyP; night: number; sun?: { x: number; y: number }; pan?: number; shafaLight?: number; kaaba?: boolean }> = ({
  t, sky, night, sun, pan = 0, shafaLight = 0, kaaba = true,
}) => {
  const rimC = mix("#FFD7A0", "#6B6AA8", night);
  return (
    <AbsoluteFill>
      <Sky p={sky} />
      <Stars t={t} o={night} />
      {sun && <Orb x={sun.x} y={sun.y} r={70} color={night > 0.5 ? "#DCE6FF" : "#FFB45E"} moon={night > 0.5} />}
      <Clouds t={t} color={mix("#FFC58E", "#3B3A6E", night)} o={0.35} y={520} />
      <Mountain seed="far" y={1050} amp={170} top={mix("#9A6A7A", "#2A2550", night)} bottom={mix("#7A4A55", "#1B1838", night)} x={pan * 0.2} />
      <Mountain seed="mid" y={1170} amp={210} top={mix("#7A4638", "#221A33", night)} bottom={mix("#4A2A26", "#140F22", night)} x={pan * 0.4} rim={rimC} />
      {/* Bukit Shafa (kanan) */}
      <svg width={W} height={H} style={{ position: "absolute", left: pan * 0.55, top: 0, overflow: "visible" }}>
        <path d="M560,1330 C 640,1150 700,1010 790,985 C 860,965 900,1000 950,1060 C 1010,1130 1080,1220 1180,1330 Z"
          fill={mix("#6A3A2A", "#1D1428", night)} stroke={rimC} strokeOpacity={0.5} strokeWidth={3} />
        <path d="M700,1060 C 740,1040 760,1060 800,1050 M 820,1100 C 860,1090 880,1110 910,1100" stroke={mix("#8F5A3E", "#2D2240", night)} strokeWidth={6} fill="none" />
      </svg>
      {shafaLight > 0 && (
        <AbsoluteFill style={{ left: pan * 0.55 }}>
          <Rays t={t} x={800} y={975} o={0.55 * shafaLight} n={16} len={900} />
          <div style={{ position: "absolute", left: 800 - 160, top: 975 - 160, width: 320, height: 320, borderRadius: "50%", opacity: shafaLight,
            background: `radial-gradient(circle, #FFFBEA 0%, ${C.goldHi}cc 14%, ${C.gold}55 34%, rgba(0,0,0,0) 70%)` }} />
        </AbsoluteFill>
      )}
      <Houses seed="hb" y={1270} n={14} scale={0.62} wall={mix("#9C6440", "#2A1F35", night)} shade={mix("#74452E", "#1D1528", night)} lit={night * 0.5} x={pan * 0.7} t={t} />
      {kaaba && <Kaaba x={420 + pan * 0.7} y={1290} s={0.9} lit={1 - night * 0.5} />}
      <Houses seed="hf" y={1380} n={9} scale={1.05} wall={mix("#B07548", "#30243D", night)} shade={mix("#82502F", "#20182C", night)} lit={night * 0.6} x={pan} t={t} />
      <Palm x={90 + pan} y={1400} s={1.25} t={t} color={mix("#3A2A1E", "#0E0A16", night)} seed={1} />
      <Palm x={1010 + pan} y={1420} s={1.05} t={t} color={mix("#3A2A1E", "#0E0A16", night)} seed={2} />
      <Dune seed="g1" y={1440} amp={22} top={mix("#C98A52", "#2C2236", night)} bottom={mix("#7A4A2A", "#120D1A", night)} x={pan * 1.1} />
    </AbsoluteFill>
  );
};

// =================== MOTIF & UI ===================
// Gelembung kata kosong (putus-putus) + kursor berkedip
const Bubble: React.FC<{ t: number; w?: number; h?: number; o?: number; text?: string; typed?: number; cursor?: boolean; color?: string; dim?: number; ghost?: boolean }> = ({
  t, w = 620, h = 250, o = 1, text = "", typed = 0, cursor = true, color = C.goldHi, dim = 0, ghost = false,
}) => {
  const shown = text.slice(0, Math.round(text.length * typed));
  const blink = Math.floor(t * 2.2) % 2 === 0;
  return (
    <div style={{ position: "relative", width: w, height: h + 70, opacity: o * (1 - 0.65 * dim) }}>
      <svg width={w} height={h + 70} style={{ position: "absolute", overflow: "visible", filter: glow(color, 0.6 * (1 - dim)) }}>
        <path d={`M40,4 H${w - 40} Q${w - 4},4 ${w - 4},40 V${h - 40} Q${w - 4},${h - 4} ${w - 40},${h - 4} H${w * 0.36} L${w * 0.22},${h + 60} L${w * 0.26},${h - 4} H40 Q4,${h - 4} 4,${h - 40} V40 Q4,4 40,4 Z`}
          fill="rgba(12,9,24,0.55)" stroke={color} strokeWidth={5} strokeDasharray="22 16" strokeDashoffset={-t * 18} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: READEX, fontWeight: 700, fontSize: 56, color: ghost ? `${C.text}88` : C.text, fontStyle: ghost ? "italic" : "normal",
        textShadow: ghost ? "none" : textGlow(C.gold) }}>
        <span>{shown}</span>
        {cursor && <span style={{ display: "inline-block", width: 7, height: 66, marginLeft: 8, background: color, opacity: blink ? 1 : 0, boxShadow: `0 0 12px ${color}` }} />}
      </div>
    </div>
  );
};

const Hourglass: React.FC<{ t: number; size?: number; color?: string }> = ({ t, size = 34, color = C.ink }) => (
  <svg width={size} height={size} viewBox="-12 -16 24 32" style={{ rotate: `${Math.floor(t / 1.5) % 2 ? 180 : 0}deg` }}>
    <path d="M-9,-14 H9 M-9,14 H9 M-7,-14 C -7,-4 7,-2 7,0 C 7,2 -7,4 -7,14 M7,-14 C 7,-4 -7,-2 -7,0 C -7,2 7,4 7,14" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <path d="M-4,10 L4,10 L0,4 Z" fill={color} />
  </svg>
);

// Kartu nubuat (perkamen) + stempel TERBUKTI
const Prophecy: React.FC<{ t: number; stampAt?: number; crack?: number; wobble?: number; w?: number }> = ({ t, stampAt = 999, crack = 0, wobble = 0, w = 760 }) => {
  const st = ramp(t, stampAt, stampAt + 0.22, IN);
  const done = t >= stampAt;
  return (
    <div style={{ position: "relative", width: w, padding: "30px 40px 30px", borderRadius: 18,
      background: `radial-gradient(ellipse at 50% 40%, ${C.parch} 0%, #D8BC88 75%, #B8925A 100%)`,
      boxShadow: `0 20px 50px rgba(0,0,0,0.55), inset 0 0 40px rgba(120,70,20,0.35)${done ? `, 0 0 60px ${C.gold}99` : ""}`,
      rotate: `${Math.sin(t * 13) * 1.6 * wobble}deg`, translate: shake(t, stampAt, 16, 0.35) }}>
      <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: "#7A4A1C" }}>NUBUAT · QS. AL-MASAD</div>
      <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 44, lineHeight: 1.2, color: C.ink, marginTop: 10 }}>
        Abu Lahab akan mati <span style={{ whiteSpace: "nowrap" }}>dalam kekafiran</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, fontFamily: READEX, fontWeight: 500, fontSize: 30,
        color: done ? "#1E6B3A" : "#7A4A1C", opacity: 1 - 0.0 * st }}>
        {done ? <svg width={34} height={34} viewBox="-12 -12 24 24"><path d="M-8,0 L-2,6 L9,-7" stroke="#1E6B3A" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          : <Hourglass t={t} />}
        {done ? "terbukti ±10 tahun kemudian" : "menunggu bukti…"}
      </div>
      {crack > 0 && (
        <svg width={w} height={260} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d={`M${w * 0.62},0 L${w * 0.58},60 L${w * 0.66},110 L${w * 0.6},170 L${w * 0.64},260`} stroke="#3A1E10" strokeWidth={3}
            fill="none" strokeDasharray={320} strokeDashoffset={320 * (1 - crack)} />
        </svg>
      )}
      {st > 0 && (
        <div style={{ position: "absolute", right: -70, top: -52, scale: String(2.4 - 1.4 * st), opacity: st, rotate: "-12deg",
          border: "6px solid #A3201A", borderRadius: 14, padding: "6px 18px", fontFamily: KUFI, fontWeight: 700, fontSize: 52,
          color: "#A3201A", letterSpacing: 3, background: "rgba(255,240,210,0.25)", mixBlendMode: "multiply" }}>TERBUKTI</div>
      )}
    </div>
  );
};

const Title: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number; color?: string }> = ({
  t, at, until, text, y = 420, size = 92, color = C.gold,
}) => {
  if (t < at - 0.1 || t > until) return null;
  const words = text.split(" ");
  const out = 1 - ramp(t, until - 0.3, until, IN);
  return (
    <div style={{ position: "absolute", top: y, left: 60, width: 960, textAlign: "center", opacity: out,
      fontFamily: KUFI, fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: -1 }}>
      {words.map((w, i) => {
        if (w === "|") return <br key={i} />;
        const hi = w.startsWith("*");
        const p = ramp(t, at + i * 0.08, at + i * 0.08 + 0.45, BACK);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0 10px" }}>
            <span style={{ display: "inline-block", translate: `0px ${(1 - p) * 110}%`, color: hi ? color : C.text,
              textShadow: textGlow(hi ? color : "#000000") }}>{w.replace(/\*/g, "")}</span>
          </span>
        );
      })}
    </div>
  );
};

const Pill: React.FC<{ t: number; at: number; until: number; children: React.ReactNode; y?: number; color?: string }> = ({
  t, at, until, children, y = 690, color = C.goldHi,
}) => (
  <div style={{ position: "absolute", top: y, left: 0, width: W, display: "flex", justifyContent: "center",
    opacity: win(t, at + 0.4, until), scale: String(0.9 + 0.1 * ramp(t, at, at + 0.5, BACK)) }}>
    <div style={{ fontFamily: READEX, fontWeight: 500, fontSize: 30, color, padding: "9px 24px", borderRadius: 999,
      background: C.card, border: `1.5px solid ${color}77`, boxShadow: `0 0 18px ${color}33` }}>{children}</div>
  </div>
);

const Center: React.FC<{ y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y = 1000, children, style }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: W, height: 0, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>{children}</div>
);
const Saw: React.FC = () => <span style={{ fontFamily: AMIRI, color: C.gold, fontSize: "1.3em", lineHeight: 0, verticalAlign: "-0.1em" }}>{SAW}</span>;

// Progres + watermark
const CHAPTERS = [S[1].start, S[2].start, S[4].start, S[6].start];
const Progress: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(t / END, 1);
  return (
    <div style={{ position: "absolute", left: 80, top: 236, width: 920, opacity: 1 - ramp(t, END, END + 0.4) }}>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,231,163,0.18)" }} />
      <div style={{ position: "absolute", top: 0, height: 6, width: 920 * p, borderRadius: 3, background: `linear-gradient(90deg, ${C.ember}, ${C.goldHi})`, boxShadow: `0 0 14px ${C.gold}` }} />
      {CHAPTERS.map((c) => (
        <div key={c} style={{ position: "absolute", left: (c / END) * 920 - 6, top: -4, width: 14, height: 14, borderRadius: 7,
          background: t >= c ? C.gold : "#1A1426", border: `2px solid ${t >= c ? C.gold : C.muted}` }} />
      ))}
    </div>
  );
};
const Watermark: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 80, top: 262, display: "flex", alignItems: "center", gap: 14, opacity: ramp(t, 1.5, 2.1) * (1 - ramp(t, END - 0.3, END)) }}>
    <Img src={staticFile("logo.png")} style={{ width: 50, height: 50 }} />
    <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 29, color: C.text, textShadow: "0 2px 8px #000" }}>Muslim Leveling</div>
  </div>
);

// Caption karaoke
type Wd = { w: string; s: number; e: number };
const GROUPS: Wd[][] = (() => {
  const g: Wd[][] = [];
  let cur: Wd[] = [];
  (cues.words as Wd[]).filter((w) => w.w).forEach((w, i, arr) => {
    cur.push(w);
    const next = arr[i + 1];
    if (!next || cur.length >= 4 || /[.,?!:]["']?$/.test(w.w) || next.s - w.e > 0.35) { g.push(cur); cur = []; }
  });
  return g;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= END || (t >= K.hanya - 0.1 && t < S[5].end)) return null;
  const grp = GROUPS.find((g, i) => t >= g[0].s - 0.05 && t < (GROUPS[i + 1]?.[0].s ?? 999) - 0.05 && t < g[g.length - 1].e + 0.6);
  if (!grp) return null;
  const pop = ramp(t, grp[0].s - 0.05, grp[0].s + 0.15, BACK);
  return (
    <div style={{ position: "absolute", bottom: 520, left: 80, width: 840, textAlign: "center", scale: String(0.92 + 0.08 * pop), opacity: pop }}>
      <span style={{ fontFamily: READEX, fontWeight: 700, fontSize: 50, lineHeight: 1.3, padding: "10px 24px", borderRadius: 22,
        background: "rgba(10,7,18,0.66)", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
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

const Leaks: React.FC<{ t: number }> = ({ t }) => {
  const cut = [S[1].start, S[2].start, S[4].start, S[6].start, S[7].start, END].find((c) => Math.abs(t - c) < 0.6);
  if (cut === undefined) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.4 }}>
      <Solid width={W} height={H} color="transparent"
        effects={[lightLeak({ progress: interpolate(t, [cut - 0.6, cut + 0.6], [0, 1], clamp), seed: Math.round(cut), hueShift: 20 })]} />
    </AbsoluteFill>
  );
};

// =================== ADEGAN ===================
// 1 Hook: gurun malam, kota jauh, gelembung kosong
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const dim = ramp(t, K.tidak, K.tidak + 1.2);
  const pulse = 1 + 0.06 * Math.exp(-((t - K.satuKal) ** 2) * 18);
  return (
    <>
      <Sky p={NIGHT} />
      <Stars t={t} o={1} milky={0.8} />
      <Orb x={850} y={1090} r={46} color="#E8E6FF" moon halo={0.8} />
      <Mountain seed="h1" y={1180} amp={160} top="#2B2552" bottom="#15122C" x={-t * 3} />
      <Houses seed="h1c" y={1250} n={16} scale={0.5} wall="#2A2040" shade="#1C1530" lit={0.55} x={-t * 5} t={t} />
      <Dune seed="h1d" y={1330} amp={40} top="#3A2A3E" bottom="#140E1C" x={-t * 9} />
      <Dune seed="h1e" y={1500} amp={60} top="#4A3040" bottom="#120A14" x={-t * 16} />
      <Dust t={t} n={36} color="#D9C4FF" o={0.35} />
      <Title t={t} at={0.15} until={K.tidak - 0.2} text="SATU *KALIMAT*…" y={430} size={104} />
      <Title t={t} at={K.tidak - 0.15} until={S[0].end + 0.3} text="yang *TAK PERNAH* | diucapkan" y={400} size={92} />
      <Center y={890} style={{ scale: String((0.6 + 0.4 * ramp(t, 0.6, 1.4, BACK)) * pulse), translate: `0px ${Math.sin(t * 1.4) * 8}px` }}>
        <Bubble t={t} dim={dim} cursor={t < K.tidak + 0.6 || Math.floor(t * 2.2) % 2 === 0} />
      </Center>
      <div style={{ position: "absolute", top: 352, width: W, textAlign: "center", fontFamily: READEX, fontWeight: 700, fontSize: 26, letterSpacing: 6,
        color: C.goldHi, opacity: ramp(t, 0.4, 1) * (1 - ramp(t, S[0].end - 0.3, S[0].end)) }}>MUKJIZAT AL-QUR'AN · #1</div>
      <Vignette />
    </>
  );
};

// 2 Kisah: pagi di lembah Makkah, cahaya di Shafa, kerumunan berkumpul, Abu Lahab membentak
const CROWD = new Array(16).fill(0).map((_, i) => ({
  x: 150 + (i % 8) * 92 + (random(`cr${i}`) - 0.5) * 40,
  y: 1460 + Math.floor(i / 8) * 70,
  s: 0.85 + random(`cs${i}`) * 0.25 + Math.floor(i / 8) * 0.18,
  from: random(`cf${i}`) < 0.5 ? -200 : 1280,
  d: random(`cd${i}`) * 1.4,
}));
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[1].start;
  const ang = ramp(t, K.bentak - 0.1, K.bentak + 0.5, BACK);
  return (
    <AbsoluteFill style={{ translate: shake(t, K.bentak, 18, 0.45) }}>
      <Valley t={t} sky={MORNING} night={0} sun={{ x: 250, y: 860 - lt * 6 }} pan={-lt * 4} shafaLight={ramp(t, K.saat, K.shafa + 0.3)} />
      {[...CROWD].reverse().map((c, i) => {
        const p = ramp(t, K.saat - 0.6 + c.d, K.saat + 1.6 + c.d, Easing.inOut(Easing.quad));
        const x = interpolate(p, [0, 1], [c.from, c.x]) + Math.sin(t * 6 + i) * 2 * (1 - p);
        return <Person key={i} x={x} y={c.y} s={c.s} color="#1B1018" rim="#FFB87055" />;
      })}
      {/* Abu Lahab: maju, aura bara */}
      <Person x={interpolate(ang, [0, 1], [300, 360])} y={1560} s={1.3 + 0.25 * ang} color="#140A0E" rim={ang > 0.01 ? C.ember : "#FFB87055"} aura={ang > 0.01 ? C.red : undefined} hood />
      <Embers t={t} n={22} o={ang} x0={220} x1={520} />
      <div style={{ position: "absolute", left: 0, top: 380, width: W, display: "flex", justifyContent: "center",
        opacity: win(t, K.nama + 0.4, K.saat + 0.3), scale: String(0.85 + 0.15 * ramp(t, K.nama, K.nama + 0.5, BACK)) }}>
        <div style={{ textAlign: "center", padding: "22px 44px", borderRadius: 24, background: C.card, border: `2px solid ${C.ember}88`, boxShadow: `0 0 30px ${C.ember}44` }}>
          <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 96, color: C.text, letterSpacing: 2, textShadow: textGlow(C.ember) }}>ABU LAHAB</div>
          <div style={{ fontFamily: READEX, fontWeight: 500, fontSize: 36, color: C.goldHi, opacity: ramp(t, K.paman, K.paman + 0.4) }}>paman Rasulullah <Saw /> sendiri</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 640 - lt * 2.2, top: 860, opacity: win(t, K.shafa + 0.3, K.bentak + 0.2), fontFamily: READEX, fontWeight: 700, fontSize: 30,
        color: C.text, padding: "6px 18px", borderRadius: 999, background: C.card, border: `1.5px solid ${C.goldHi}88` }}>Bukit Shafa</div>
      {/* gelembung bentakan bergerigi */}
      <div style={{ position: "absolute", left: 120, top: 520, width: 840, opacity: ang * (1 - ramp(t, S[1].end - 0.4, S[1].end)), scale: String(0.6 + 0.4 * ang), transformOrigin: "30% 100%" }}>
        <svg width={840} height={420} viewBox="0 0 840 420" style={{ position: "absolute", overflow: "visible", filter: glow(C.red, 0.7) }}>
          <path d="M60,40 L150,10 L230,46 L330,8 L420,44 L520,6 L610,42 L720,12 L800,60 L830,150 L800,240 L826,300 L740,330 L640,316 L540,350 L430,318 L330,352 L250,322 L210,410 L190,326 L100,320 L30,280 L54,200 L12,130 Z"
            fill="#2A0C0E" stroke={C.red} strokeWidth={6} strokeLinejoin="round" />
        </svg>
        <div style={{ position: "relative", height: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 70px" }}>
          <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 64, color: "#FFD2C2", opacity: ramp(t, K.celaka - 0.1, K.celaka + 0.2) }}>"Celakalah engkau!</div>
          <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 44, color: C.text, opacity: ramp(t, K.untuk - 0.1, K.untuk + 0.25), marginTop: 6 }}>Untuk inikah kau kumpulkan kami?"</div>
        </div>
      </div>
      <Pill t={t} at={K.celaka + 0.2} until={S[1].end + 0.2} y={1000} color={C.goldHi}>HR. Bukhari no. 4971 · Muslim no. 208</Pill>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

// 3 Ayat: langit menggelap, wahyu turun (sinar), Arab emas + retak cahaya, kartu nubuat
const AYAT_W = AY.ar.split(" ");
const CRACKS = new Array(9).fill(0).map((_, i) => {
  const a = (i / 9) * Math.PI * 2 + random(`ka${i}`) * 0.5;
  let x = 0, y = 0;
  const pts = ["0,0"];
  for (let k = 0; k < 6; k++) {
    x += Math.cos(a + (random(`kb${i}${k}`) - 0.5) * 0.9) * 70;
    y += Math.sin(a + (random(`kb${i}${k}`) - 0.5) * 0.9) * 70;
    pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
  }
  return pts.join(" ");
});
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const dark = ramp(t, K.lalu, AY.s, Easing.inOut(Easing.quad));
  const rev = ramp(t, AY.s - 0.4, AY.s + 0.6);
  const crack = ramp(t, AY.s, AY.e + 0.3, Easing.inOut(Easing.quad));
  const step = (AY.e - AY.s) / AYAT_W.length;
  const up = ramp(t, K.surat - 0.2, K.surat + 0.5);
  return (
    <AbsoluteFill style={{ translate: shake(t, AY.e - 0.25, 10, 0.4) }}>
      <Sky p={lerpSky(DAWN, STORM, dark)} />
      <Stars t={t} o={0.3 * (1 - dark)} />
      <Clouds t={t * 3} color="#6A2A2A" o={0.55 * dark} y={330} speed={14} />
      <Rays t={t} x={540} y={-80} o={rev * 0.9} n={18} len={2000} />
      <Mountain seed="m3" y={1300} amp={190} top="#2A1520" bottom="#0D0710" rim={`${C.ember}`} />
      <Houses seed="h3" y={1420} n={12} scale={0.8} wall="#24141C" shade="#180C14" lit={0.4} t={t} />
      <Embers t={t} n={40} o={0.4 + 0.6 * dark} />
      <div style={{ position: "absolute", left: 0, top: 360, width: W, textAlign: "center", fontFamily: READEX, fontWeight: 500, fontSize: 36,
        color: C.muted, opacity: win(t, K.lalu + 0.3, AY.s + 0.2) }}>Lalu Allah menurunkan…</div>
      <Center y={720 - 190 * up} style={{ scale: String(1 - 0.28 * up) }}>
        <div style={{ position: "relative" }}>
          <svg width={10} height={10} style={{ position: "absolute", left: "50%", top: "50%", overflow: "visible", filter: glow(C.goldHi, 0.8) }}>
            {CRACKS.map((p, i) => (
              <polyline key={i} points={p} fill="none" stroke={C.goldHi} strokeWidth={3} strokeOpacity={0.8 * (1 - up)}
                strokeDasharray={420} strokeDashoffset={420 * (1 - crack)} />
            ))}
          </svg>
          <div style={{ direction: "rtl", fontFamily: AMIRI, fontWeight: 700, fontSize: 112, lineHeight: 1.6, textAlign: "center", width: 1000 }}>
            {AYAT_W.map((w, i) => {
              const p = ramp(t, AY.s + i * step, AY.s + i * step + 0.5);
              return <span key={i} style={{ display: "inline-block", margin: "0 12px", opacity: p, color: C.gold, translate: `0px ${(1 - p) * 30}px`,
                textShadow: `0 0 ${14 + 30 * p}px ${C.gold}cc, 0 4px 0 #2A1406` }}>{w}</span>;
            })}
          </div>
        </div>
      </Center>
      <div style={{ position: "absolute", left: 0, top: 880 - 190 * up, width: W, textAlign: "center", opacity: ramp(t, K.binasa - 0.1, K.binasa + 0.4) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 46, color: C.text, textShadow: "0 3px 12px #000" }}>"Binasalah kedua tangan Abu Lahab"</div>
        <div style={{ display: "inline-block", marginTop: 14, fontFamily: READEX, fontWeight: 500, fontSize: 28, color: C.goldHi, padding: "6px 20px", borderRadius: 999,
          background: C.card, border: `1.5px solid ${C.goldHi}77` }}>QS. Al-Masad: 1</div>
      </div>
      <Center y={1000} style={{ opacity: ramp(t, K.pasti - 0.2, K.pasti + 0.3), scale: String(0.8 + 0.2 * ramp(t, K.pasti - 0.2, K.pasti + 0.4, BACK)) }}>
        <Prophecy t={t} />
      </Center>
      <Vignette k={0.8} />
    </AbsoluteFill>
  );
};

// 4 Tantangan: malam, rumah Abu Lahab berlampu, gelembung "Aku masuk Islam." samar
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[3].start;
  const typed = ramp(t, K.aku - 0.05, K.aku + 0.8, Easing.linear);
  const flick = t > K.pura && t < K.maka ? 0.55 + 0.45 * Math.abs(Math.sin(t * 22)) : 1;
  const threat = ramp(t, K.maka, K.salah);
  return (
    <AbsoluteFill>
      <Sky p={NIGHT} />
      <Stars t={t} o={0.9} />
      <Orb x={190} y={620} r={38} color="#E8E6FF" moon halo={0.6} />
      <Mountain seed="m4" y={1150} amp={150} top="#2A2550" bottom="#15122C" x={-lt * 3} />
      <Houses seed="h4" y={1260} n={13} scale={0.7} wall="#2A2040" shade="#1C1530" lit={0.4} x={-lt * 5} t={t} />
      {/* rumah Abu Lahab (dekat), pintu menyala, siluet di ambang */}
      <svg width={W} height={H} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <radialGradient id="door"><stop offset="0" stopColor="#FFB060" /><stop offset="1" stopColor="#FF6A2A" stopOpacity={0} /></radialGradient>
        </defs>
        <rect x={250} y={1170} width={580} height={500} fill="#3A2636" />
        <rect x={660} y={1170} width={170} height={500} fill="#2A1B28" />
        <rect x={240} y={1160} width={600} height={18} fill="#2A1B28" />
        <ellipse cx={470} cy={1450} rx={260} ry={200} fill="url(#door)" opacity={0.45 + 0.08 * Math.sin(t * 9)} />
        <rect x={410} y={1300} width={120} height={240} rx={56} fill="#FFB060" opacity={0.92} />
        <rect x={310} y={1250} width={40} height={50} rx={14} fill="#FF9A4A" opacity={0.8 + 0.2 * Math.sin(t * 7)} />
        <rect x={700} y={1250} width={40} height={50} rx={14} fill="#1A1020" />
      </svg>
      <Person x={470} y={1540} s={1.0} color="#120A0E" rim={C.ember} hood />
      <Dune seed="d4" y={1560} amp={20} top="#2A1E30" bottom="#0E0A14" />
      <Center y={430} style={{ opacity: ramp(t, S[3].start, S[3].start + 0.5), scale: String(0.72) }}>
        <Prophecy t={t} wobble={threat} crack={threat} />
      </Center>
      <Center y={820} style={{ scale: String(0.6 + 0.4 * ramp(t, K.padahal, K.padahal + 0.5, BACK)), opacity: flick }}>
        <Bubble t={t} w={760} h={220} text="Aku masuk Islam." typed={typed} ghost cursor={typed < 1 || Math.floor(t * 2.2) % 2 === 0} />
      </Center>
      <div style={{ position: "absolute", left: 0, top: 1060, width: W, display: "flex", justifyContent: "center", opacity: win(t, K.aku + 0.9, K.maka) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 32, color: C.goldHi, padding: "6px 22px", borderRadius: 999, background: C.card, border: `1.5px solid ${C.goldHi}88` }}>cukup 3 kata</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 1060, width: W, display: "flex", justifyContent: "center", opacity: ramp(t, K.maka, K.maka + 0.4) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 32, color: "#FFD2C2", padding: "6px 22px", borderRadius: 999, background: "rgba(40,10,12,0.8)", border: `1.5px solid ${C.red}` }}>seandainya diucapkan… nubuat gugur</div>
      </div>
      <Vignette k={0.8} />
    </AbsoluteFill>
  );
};

// 5 Klimaks: time-lapse ±10 tahun, gelembung tetap kosong, berhenti di Badar → TERBUKTI
const Y0 = K.sekitar - 0.1, Y1 = K.mati2;
const SHARDS = new Array(22).fill(0).map((_, i) => ({ a: random(`sa${i}`) * Math.PI * 2, v: 300 + random(`sv${i}`) * 700, r: random(`sr${i}`) * 360, s: 14 + random(`ss${i}`) * 26 }));
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const tc = Math.min(t, Y1);
  const p = ramp(tc, Y0, Y1, Easing.in(Easing.quad));
  const ph = p * 6 * Math.PI * 2; // siklus siang-malam (time-lapse)
  const night = 0.5 + 0.4 * Math.cos(ph) * (t < Y1 ? 1 : 0);
  const sunA = (ph % (Math.PI * 2)) / (Math.PI * 2);
  const year = Math.min(10, 1 + Math.floor(p * 10));
  const hit = ramp(t, Y1, Y1 + 0.35);
  const after = t >= Y1;
  const skyP = after ? lerpSky(STORM, DAWN, ramp(t, Y1, Y1 + 0.5)) : lerpSky(MORNING, NIGHT, night);
  return (
    <AbsoluteFill style={{ translate: shake(t, K.badar, 22, 0.5) }}>
      <Valley t={after ? Y1 : t} sky={skyP} night={after ? 0.6 : night} sun={{ x: 100 + sunA * 880, y: 1150 - Math.sin(sunA * Math.PI) * 600 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${C.goldHi}${Math.round(200 * (1 - hit) * (after ? 1 : 0)).toString(16).padStart(2, "0")} 0%, rgba(0,0,0,0) 60%)` }} />
      {/* penghitung tahun */}
      <div style={{ position: "absolute", top: 360, width: W, textAlign: "center", opacity: ramp(t, Y0, Y0 + 0.4) * (1 - ramp(t, Y1 + 0.2, Y1 + 0.6)) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: C.goldHi, textShadow: "0 2px 10px #000" }}>TAHUN KE-</div>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 190, lineHeight: 1, color: C.text, textShadow: textGlow(C.gold) }}>{year}</div>
      </div>
      {/* gelembung kosong → pecah */}
      {!after ? (
        <Center y={820} style={{ scale: String(0.78 + 0.03 * Math.sin(t * 5)) }}>
          <Bubble t={t} w={600} h={210} />
        </Center>
      ) : (
        <svg width={W} height={H} style={{ position: "absolute", overflow: "visible", opacity: 1 - ramp(t, Y1 + 0.3, Y1 + 1.1) }}>
          {SHARDS.map((s, i) => {
            const d = t - Y1;
            return <rect key={i} x={540 + Math.cos(s.a) * s.v * d - s.s / 2} y={850 + Math.sin(s.a) * s.v * d + 500 * d * d} width={s.s} height={s.s * 0.4}
              fill={C.goldHi} transform={`rotate(${s.r + d * 400} ${540 + Math.cos(s.a) * s.v * d} ${850 + Math.sin(s.a) * s.v * d + 500 * d * d})`} />;
          })}
        </svg>
      )}
      {/* linimasa */}
      <div style={{ position: "absolute", left: 110, top: 1110, width: 860, opacity: ramp(t, Y0, Y0 + 0.4) }}>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)" }} />
        <div style={{ position: "absolute", top: 0, height: 8, width: 860 * (0.9 * p + 0.1 * ramp(t, Y1, K.badar)), borderRadius: 4, background: `linear-gradient(90deg, ${C.gold}, ${C.ember})`, boxShadow: `0 0 16px ${C.ember}` }} />
        {new Array(11).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (i / 10) * 860 - 2, top: -8, width: 4, height: 24, background: p * 10 >= i ? C.goldHi : "#ffffff55" }} />
        ))}
        <div style={{ position: "absolute", left: -20, top: 30, fontFamily: READEX, fontWeight: 700, fontSize: 30, color: C.text, textShadow: "0 2px 8px #000" }}>±613 M</div>
        <div style={{ position: "absolute", right: -30, top: 30, fontFamily: READEX, fontWeight: 700, fontSize: 30, color: t > K.badar ? C.goldHi : C.text, textShadow: "0 2px 8px #000" }}>624 M · Badar</div>
      </div>
      <Center y={820} style={{ opacity: ramp(t, Y1 + 0.15, Y1 + 0.5), scale: String(0.6 + 0.3 * ramp(t, Y1 + 0.15, Y1 + 0.6, BACK)) }}>
        <Prophecy t={t} stampAt={K.badar} />
      </Center>
      <Rays t={t} x={540} y={820} o={ramp(t, K.badar, K.badar + 0.3) * (1 - ramp(t, S[4].end - 0.5, S[4].end)) * 0.7} />
      <Vignette k={0.7} />
    </AbsoluteFill>
  );
};

// 6 Makna: langit berbintang luas, satu orang di bukit pasir, "Hanya Allah"
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[5].start;
  const a = ramp(t, K.hanya - 0.05, K.hanya + 0.5, BACK);
  return (
    <AbsoluteFill>
      <Sky p={NIGHT} horizon={1400} />
      <AbsoluteFill style={{ translate: `0px ${lt * 10}px` }}>
        <Stars t={t} o={1} n={220} milky={1} />
      </AbsoluteFill>
      <Dune seed="d6a" y={1420} amp={50} top="#2A2244" bottom="#0E0B1C" />
      <Dune seed="d6b" y={1560} amp={70} top="#1E1830" bottom="#07050E" />
      <Person x={720} y={1395} s={0.7} color="#06040C" rim="#8C88D855" />
      <div style={{ position: "absolute", left: 80, top: 430, width: 920, textAlign: "center", fontFamily: KUFI, fontWeight: 700, fontSize: 70, lineHeight: 1.18, color: C.text,
        textShadow: "0 4px 18px #000", opacity: ramp(t, S[5].start - 0.1, S[5].start + 0.4) * (1 - ramp(t, K.hanya - 0.3, K.hanya)) }}>
        Siapa yang tahu akhir hidup seseorang <span style={{ color: C.gold, whiteSpace: "nowrap", opacity: 0.3 + 0.7 * ramp(t, K.sepuluh - 0.1, K.sepuluh + 0.3) }}>10 tahun</span> sebelumnya?
      </div>
      <Rays t={t} x={540} y={760} o={a * 0.8} />
      <Center y={740} style={{ opacity: a, scale: String(0.5 + 0.5 * a) }}>
        <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 250, color: C.gold, textShadow: `0 0 40px ${C.gold}, 0 0 90px ${C.gold}88` }}>اللَّه</div>
      </Center>
      <Center y={1010} style={{ opacity: ramp(t, K.hanya + 0.2, K.hanya + 0.6) }}>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 84, color: C.text, textShadow: textGlow(C.gold) }}>Hanya <span style={{ color: C.gold }}>Allah</span></div>
      </Center>
      <Vignette k={0.7} />
    </AbsoluteFill>
  );
};

// 7 Value: fajar → mihrab; NASAB ✕ vs IMAN ✓ → Al-Masad di shalat → hati
const Mark: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 64 }) => (
  <svg width={size} height={size} viewBox="-20 -20 40 40">
    <circle r={18} fill={ok ? "#0F3B2A" : "#3A1012"} stroke={ok ? C.em : C.red} strokeWidth={2.5} />
    {ok ? <path d="M-9,0 L-3,7 L10,-8" stroke={C.em} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke={C.red} strokeWidth={4} strokeLinecap="round" />}
  </svg>
);
const Heart: React.FC<{ t: number }> = ({ t }) => (
  <svg width={120} height={110} viewBox="-60 -50 120 110" style={{ filter: glow(C.ember, 0.8), scale: String(1 + 0.06 * Math.sin(t * 6)) }}>
    <path d="M0,45 C -60,5 -55,-40 -25,-42 C -10,-43 0,-30 0,-22 C 0,-30 10,-43 25,-42 C 55,-40 60,5 0,45 Z" fill={C.ember} />
  </svg>
);
const Mihrab: React.FC<{ t: number; o: number }> = ({ t, o }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1A1028 0%, #2A1A2E 60%, #3A2420 100%)" }} />
    <svg width={W} height={H} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="lamp"><stop offset="0" stopColor="#FFE7A3" /><stop offset="0.3" stopColor="#FFB060" stopOpacity={0.5} /><stop offset="1" stopColor="#FF7A3D" stopOpacity={0} /></radialGradient>
        <pattern id="tile" width="120" height="120" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#E9C46A" strokeOpacity={0.12} strokeWidth={2}>
            <rect x="30" y="30" width="60" height="60" /><rect x="30" y="30" width="60" height="60" transform="rotate(45 60 60)" />
          </g>
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#tile)" />
      {/* lengkung mihrab */}
      <path d="M190,1520 L190,820 C 190,560 400,430 540,360 C 680,430 890,560 890,820 L890,1520 Z" fill="#120A18" stroke="#E9C46A" strokeOpacity={0.6} strokeWidth={6} />
      <path d="M250,1520 L250,840 C 250,620 420,510 540,450 C 660,510 830,620 830,840 L830,1520 Z" fill="none" stroke="#E9C46A" strokeOpacity={0.25} strokeWidth={3} />
      <line x1={540} y1={360} x2={540} y2={560} stroke="#8A6A3A" strokeWidth={3} />
      <circle cx={540} cy={600} r={160 + 8 * Math.sin(t * 4)} fill="url(#lamp)" />
      <path d="M515,575 L565,575 L555,630 L525,630 Z" fill="#FFD27A" />
      {/* sajadah */}
      <path d="M330,1600 L750,1600 L800,1760 L280,1760 Z" fill="#6A1E24" />
      <path d="M350,1620 L730,1620 L770,1740 L310,1740 Z" fill="none" stroke="#E9C46A" strokeOpacity={0.6} strokeWidth={4} />
    </svg>
  </AbsoluteFill>
);
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[6].start;
  const inside = ramp(t, K.jadi - 0.3, K.jadi + 0.5, Easing.inOut(Easing.quad));
  const nasab = ramp(t, K.nasab - 0.1, K.nasab + 0.4, BACK);
  const iman = ramp(t, K.iman - 0.1, K.iman + 0.4, BACK);
  const card = (ok: boolean, k: number, head: string, sub: string, lit: number) => (
    <div style={{ width: 840, display: "flex", alignItems: "center", gap: 26, padding: "26px 34px", borderRadius: 26, opacity: k, scale: String(0.8 + 0.2 * k),
      background: C.card, border: `2px solid ${ok ? C.em : C.red}${ok ? "" : "88"}`, boxShadow: ok ? `0 0 ${30 * lit}px ${C.em}66` : "none",
      filter: ok ? "none" : `saturate(${1 - 0.6 * iman}) brightness(${1 - 0.35 * iman})` }}>
      <Mark ok={ok} size={92} />
      <div>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 72, lineHeight: 1, color: ok ? C.em : "#FFB3A8", letterSpacing: 2 }}>{head}</div>
        <div style={{ fontFamily: READEX, fontWeight: 500, fontSize: 36, color: C.text, marginTop: 8 }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Valley t={t} sky={lerpSky(DAWN, MORNING, ramp(lt, 0, 6))} night={0.35 * (1 - ramp(lt, 0, 6))} sun={{ x: 820, y: 1180 - lt * 25 }} kaaba />
      <Mihrab t={t} o={inside} />
      <div style={{ opacity: 1 - inside }}>
        <div style={{ position: "absolute", top: 360, width: W, textAlign: "center", fontFamily: READEX, fontWeight: 700, fontSize: 40, color: C.goldHi,
          textShadow: "0 2px 12px #000", opacity: ramp(t, K.ingat, K.ingat + 0.4) }}>Abu Lahab = paman Nabi <Saw /></div>
        <Center y={560}>{card(false, nasab, "NASAB", "tidak menyelamatkan", 0)}</Center>
        <Center y={800}>{card(true, iman, "IMAN", "yang menyelamatkan", iman)}</Center>
      </div>
      <div style={{ opacity: inside }}>
        <Center y={470} style={{ scale: String(0.85 + 0.15 * ramp(t, K.masad - 0.2, K.masad + 0.3, BACK)), opacity: ramp(t, K.masad - 0.2, K.masad + 0.3) }}>
          <div style={{ textAlign: "center", padding: "22px 40px", borderRadius: 24, background: C.card, border: `2px solid ${C.gold}88` }}>
            <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 84, lineHeight: 1.3, color: C.gold, textShadow: `0 0 20px ${C.gold}88` }}>سُورَةُ الْمَسَد</div>
            <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 36, color: C.text }}>QS. Al-Masad (111) · di shalat</div>
          </div>
        </Center>
        <Center y={870} style={{ opacity: ramp(t, K.hati - 0.9, K.hati - 0.4), scale: String(0.7 + 0.3 * ramp(t, K.hati - 0.9, K.hati - 0.3, BACK)) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 36px", borderRadius: 999, background: C.card, border: `2px solid ${C.ember}88` }}>
            <Heart t={t} />
            <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 44, color: C.text }}>pengingat untuk <span style={{ color: C.gold }}>hatimu</span></div>
          </div>
        </Center>
      </div>
      <Vignette k={0.65} />
    </AbsoluteFill>
  );
};

// 8 CTA: pagi tenang di lembah Makkah, kartu TERBUKTI kecil, pill simpan & bagikan
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[7].start;
  return (
    <AbsoluteFill>
      <Valley t={t} sky={MORNING} night={0} sun={{ x: 860, y: 1080 - lt * 8 }} pan={-lt * 6} />
      <Dust t={t} n={30} o={0.4} />
      <Center y={520} style={{ scale: String(0.7), opacity: ramp(lt, 0, 0.5) }}>
        <Prophecy t={t} stampAt={-10} />
      </Center>
      <Title t={t} at={K.simpan - 0.2} until={S[7].end + 0.3} text="SIMPAN & *BAGIKAN*" y={760} size={96} />
      <Pill t={t} at={K.bagikan} until={S[7].end + 0.3} y={900}>ke yang butuh bukti ini</Pill>
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const g = ramp(t, END, END + 0.7, BACK);
  return (
    <>
      <Sky p={NIGHT} />
      <Stars t={t} o={0.8} milky={0.5} />
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
    </>
  );
};

const SCENES: React.FC<{ t: number }>[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, EndCard];

export const AbuLahab: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <Audio src={staticFile("narasi.wav")} />
      {SCENES.map((Scene, i) => {
        const s = S[i];
        if (t < s.start - 0.4 || t > s.end + 0.4) return null;
        const lt = t - s.start;
        return (
          <AbsoluteFill key={i} style={{
            opacity: i === 0 ? 1 - ramp(t, s.end, s.end + 0.4) : win(t, s.start + 0.4, s.end + 0.4, 0.4),
            scale: String(interpolate(lt, [0, s.end - s.start], [1, 1.05], clamp)),
            rotate: `${(i % 2 ? -0.6 : 0.6) * ramp(lt, 0, s.end - s.start, Easing.linear)}deg`,
          }}>
            <Scene t={t} />
          </AbsoluteFill>
        );
      })}
      <Leaks t={t} />
      <Progress t={t} />
      <Watermark t={t} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};
