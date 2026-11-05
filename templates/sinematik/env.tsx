// Lingkungan sinematik Muslim Leveling (varian "Sinematik", acuan: Mukjizat Al-Qur'an #1 Abu Lahab, 2026-11-04).
// Salin ke projects/<topik>/film-remotion/src/env.tsx, lalu di Video.tsx:
//   import { C, NIGHT, DAWN, MORNING, STORM, lerpSky, Sky, Stars, Orb, Mountain, Dune, Houses, Kaaba, Palm, Person,
//            Dust, Embers, Clouds, Rays, Vignette, Valley, Mihrab, Bubble, Prophecy, glow, textGlow, shake, ramp, win } from "./env";
// Semua acak pakai random("seed") (deterministik). Tiap adegan menggambar lingkungannya sendiri (layer penuh), crossfade 0,4 dtk.
// Contoh komposisi adegan lengkap: templates/sinematik/contoh-AbuLahab.tsx.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { loadFont as loadKufi } from "@remotion/google-fonts/ReemKufi";
import { loadFont as loadReadex } from "@remotion/google-fonts/ReadexPro";

const KUFI = loadKufi("normal", { weights: ["700"] }).fontFamily;
const READEX = loadReadex("normal", { weights: ["500", "700"] }).fontFamily;

// Palet sinematik "Makkah abad ke-7": malam indigo, fajar jingga, pasir, bara, Arab emas
export const C = {
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

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN = Easing.bezier(0.7, 0, 0.84, 0);
export const BACK = Easing.out(Easing.back(1.8));
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (t: number, a: number, b: number, e = OUT) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
export const win = (t: number, a: number, b: number, f = 0.4) => interpolate(t, [a - f, a, b - f, b], [0, 1, 1, 0], clamp);
export const mix = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * p)).join(",")})`;
};
export const glow = (c: string, r = 1) => `drop-shadow(0 0 ${8 * r}px ${c}) drop-shadow(0 0 ${22 * r}px ${c}88)`;
export const textGlow = (c: string) => `0 0 14px ${c}99, 0 0 40px ${c}44, 0 5px 0 rgba(0,0,0,0.65)`;
// guncangan kamera singkat mulai `at` (pakai di style translate)
export const shake = (t: number, at: number, amp = 14, dur = 0.4) => {
  const k = t >= at && t < at + dur ? (1 - (t - at) / dur) * amp : 0;
  return `${Math.sin(t * 90) * k}px ${Math.cos(t * 77) * k}px`;
};

// =================== LINGKUNGAN (ilustrasi berlapis, deterministik) ===================
export const W = 1080, H = 1920;

type SkyP = { top: string; mid: string; low: string };
export const NIGHT: SkyP = { top: "#05061A", mid: "#141A46", low: "#3A2D5C" };
export const DAWN: SkyP = { top: "#1B1B4A", mid: "#7A4A7E", low: "#F2A35E" };
export const MORNING: SkyP = { top: "#2C4F8C", mid: "#D98A63", low: "#FFD39A" };
export const STORM: SkyP = { top: "#06040C", mid: "#1E0F1C", low: "#5A2418" };
export const lerpSky = (a: SkyP, b: SkyP, p: number): SkyP => ({ top: mix(a.top, b.top, p), mid: mix(a.mid, b.mid, p), low: mix(a.low, b.low, p) });

export const Sky: React.FC<{ p: SkyP; horizon?: number }> = ({ p, horizon = 1250 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${p.top} 0%, ${p.mid} ${(horizon / H) * 62}%, ${p.low} ${(horizon / H) * 100}%, ${p.low} 100%)` }} />
);

export const Stars: React.FC<{ t: number; o: number; n?: number; milky?: number }> = ({ t, o, n = 140, milky = 0 }) => {
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

export const Orb: React.FC<{ x: number; y: number; r: number; color: string; halo?: number; moon?: boolean }> = ({ x, y, r, color, halo = 1, moon }) => (
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
export const ridgePath = (seed: string, y: number, amp: number, step = 46) => {
  const pts: string[] = [];
  const ph = [random(seed + "a") * 6, random(seed + "b") * 6, random(seed + "c") * 6];
  for (let x = -200; x <= W + 200; x += step) {
    const h = amp * (0.55 * Math.sin(x / 230 + ph[0]) + 0.3 * Math.sin(x / 97 + ph[1]) + 0.15 * Math.sin(x / 41 + ph[2]))
      + (random(`${seed}${x}`) - 0.5) * amp * 0.25;
    pts.push(`${x},${(y - h).toFixed(1)}`);
  }
  return `M-200,${H} L${pts.join(" L")} L${W + 200},${H} Z`;
};
export const Mountain: React.FC<{ seed: string; y: number; amp: number; top: string; bottom: string; x?: number; rim?: string }> = ({
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

export const dunePath = (seed: string, y: number, amp: number) => {
  const pts: string[] = [];
  const ph = random(seed) * 6;
  for (let x = -200; x <= W + 200; x += 20) {
    pts.push(`${x},${(y - amp * Math.sin(x / 260 + ph) - amp * 0.35 * Math.sin(x / 110 + ph * 2)).toFixed(1)}`);
  }
  return `M-200,${H} L${pts.join(" L")} L${W + 200},${H} Z`;
};
export const Dune: React.FC<{ seed: string; y: number; amp: number; top: string; bottom: string; x?: number }> = ({ seed, y, amp, top, bottom, x = 0 }) => (
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
export const Houses: React.FC<{ seed: string; y: number; n: number; scale?: number; wall: string; shade: string; lit?: number; x?: number; t?: number }> = ({
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

export const Kaaba: React.FC<{ x: number; y: number; s: number; lit?: number }> = ({ x, y, s, lit = 0 }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={120} ry={14} fill={C.goldHi} opacity={0.12 * lit} />
      <path d="M-50,0 L-50,-82 L10,-92 L10,-6 Z" fill="#0B0B10" />
      <path d="M10,-6 L10,-92 L52,-84 L52,-2 Z" fill="#17161E" />
      <path d="M-50,-62 L10,-70 L52,-64" stroke={C.gold} strokeWidth={5} fill="none" opacity={0.9} />
    </g>
  </svg>
);

export const Palm: React.FC<{ x: number; y: number; s: number; t: number; color: string; seed: number }> = ({ x, y, s, t, color, seed }) => {
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
export const Person: React.FC<{ x: number; y: number; s: number; color: string; rim?: string; aura?: string; hood?: boolean }> = ({
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

export const Dust: React.FC<{ t: number; n?: number; color?: string; o?: number; speed?: number }> = ({ t, n = 40, color = "#F3C98B", o = 0.5, speed = 1 }) => (
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

export const Embers: React.FC<{ t: number; n?: number; o?: number; x0?: number; x1?: number }> = ({ t, n = 36, o = 1, x0 = 0, x1 = W }) => (
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

export const Clouds: React.FC<{ t: number; color: string; o: number; y?: number; speed?: number }> = ({ t, color, o, y = 420, speed = 8 }) => (
  <AbsoluteFill style={{ opacity: o }}>
    {new Array(7).fill(0).map((_, i) => {
      const w = 380 + random(`cw${i}`) * 420;
      const x = ((random(`cx${i}`) * (W + w) + t * speed * (0.6 + random(`cs${i}`))) % (W + w)) - w;
      return <div key={i} style={{ position: "absolute", left: x, top: y + random(`cy${i}`) * 420 - 200, width: w, height: w * 0.32, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${color} 0%, rgba(0,0,0,0) 70%)`, opacity: 0.5 + 0.4 * random(`co${i}`) }} />;
    })}
  </AbsoluteFill>
);

export const Rays: React.FC<{ t: number; x: number; y: number; o: number; color?: string; n?: number; len?: number }> = ({ t, x, y, o, color = C.goldHi, n = 14, len = 1500 }) => (
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

export const Vignette: React.FC<{ k?: number }> = ({ k = 0.75 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,${k}) 100%)` }} />
);

// Lembah Makkah lengkap (dipakai adegan 2, 5, 8 dengan waktu berbeda)
export const Valley: React.FC<{ t: number; sky: SkyP; night: number; sun?: { x: number; y: number }; pan?: number; shafaLight?: number; kaaba?: boolean }> = ({
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


// Interior masjid: lengkung mihrab, lampu gantung, ubin geometris, sajadah
export const Mihrab: React.FC<{ t: number; o: number }> = ({ t, o }) => (
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

// =================== MOTIF (opsional) ===================
// Gelembung kata kosong (putus-putus) + kursor berkedip
export const Bubble: React.FC<{ t: number; w?: number; h?: number; o?: number; text?: string; typed?: number; cursor?: boolean; color?: string; dim?: number; ghost?: boolean }> = ({
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

export const Hourglass: React.FC<{ t: number; size?: number; color?: string }> = ({ t, size = 34, color = C.ink }) => (
  <svg width={size} height={size} viewBox="-12 -16 24 32" style={{ rotate: `${Math.floor(t / 1.5) % 2 ? 180 : 0}deg` }}>
    <path d="M-9,-14 H9 M-9,14 H9 M-7,-14 C -7,-4 7,-2 7,0 C 7,2 -7,4 -7,14 M7,-14 C 7,-4 -7,-2 -7,0 C -7,2 7,4 7,14" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <path d="M-4,10 L4,10 L0,4 Z" fill={color} />
  </svg>
);

// Kartu nubuat (perkamen) + stempel TERBUKTI
export const Prophecy: React.FC<{ t: number; stampAt?: number; crack?: number; wobble?: number; w?: number }> = ({ t, stampAt = 999, crack = 0, wobble = 0, w = 760 }) => {
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

