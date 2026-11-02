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
import cues from "../public/cues.json";

const KUFI = loadKufi("normal", { weights: ["700"] }).fontFamily;
const READEX = loadReadex("normal", { weights: ["500", "700"] }).fontFamily;
const AMIRI = loadAmiri("normal", { weights: ["700"] }).fontFamily;

// Palet Muslim Leveling Neon
const C = {
  bg: "#030B09",
  card: "rgba(10,26,21,0.72)",
  em: "#2EF2A4",
  tosca: "#00E1EF",
  gold: "#E9C46A",
  text: "#FFF9EF",
  muted: "#8FB5A8",
};

const S = cues.scenes;
const END = S[9].start; // mulai end card
// Waktu kata kunci (detik, dari cues.json take2 x1.12)
const K = {
  ten: 2.59, sanggup: 9.82, jawaban: 16.34, berkumpul: 22.68, keluar1: 27.32, arab: 28.75, arabEnd: 30.5,
  bisik: 32.77, keluar2: 35.45, ketahuilah: 37.59, setara1: 39.02,
  hukum: 50.0, kisah: 52.14, tauhid: 55.36, ikhlas: 57.95,
  salat: 63.75, kisah2: 66.25, semuanya: 68.75, siapa: 71.34,
  setara2: 74.2, tidak: 79.2, tetap: 82.23,
  rahman: 92.95, kabarkan: 96.7, allah: 97.86,
  pelan: 103.39, simpan: 107.32,
};

const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IN = Easing.bezier(0.7, 0, 0.84, 0);
const BACK = Easing.out(Easing.back(1.8));
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// ponytail: helper kecil agar 10 adegan tetap terbaca; semua tetap interpolate() per frame
const ramp = (t: number, a: number, b: number, e = OUT) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
const win = (t: number, a: number, b: number, f = 0.4) =>
  interpolate(t, [a - f, a, b - f, b], [0, 1, 1, 0], clamp);

const neon = (c: string, r = 1) => `drop-shadow(0 0 ${6 * r}px ${c}) drop-shadow(0 0 ${18 * r}px ${c}99)`;
const textGlow = (c: string) => `0 0 12px ${c}aa, 0 0 34px ${c}55, 0 6px 0 #030B09`;

// ---------- Latar ----------
const Background: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const warm = ramp(t, K.rahman - 2, K.kabarkan, Easing.inOut(Easing.quad)) * (1 - ramp(t, END, END + 2));
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + 8 * Math.sin(t / 9)}% ${48 + 6 * Math.cos(t / 11)}%, #0F3B2E 0%, rgba(3,11,9,0) 55%),
          radial-gradient(circle at ${20 + 6 * Math.cos(t / 7)}% 85%, rgba(0,225,239,0.10) 0%, rgba(0,0,0,0) 45%),
          radial-gradient(circle at 50% 56%, rgba(233,196,106,${0.16 * warm}) 0%, rgba(0,0,0,0) 50%)`,
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", opacity: 0.09 }}>
        <defs>
          <pattern id="geo" width="140" height="140" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${(t * 6) % 140} ${(t * 3) % 140})`}>
            <g fill="none" stroke={C.em} strokeWidth="2">
              <rect x="35" y="35" width="70" height="70" />
              <rect x="35" y="35" width="70" height="70" transform="rotate(45 70 70)" />
              <circle cx="70" cy="70" r="22" />
            </g>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#geo)" />
      </svg>
      {new Array(30).fill(0).map((_, i) => {
        const x = random(`px${i}`) * width;
        const speed = 18 + random(`ps${i}`) * 30;
        const y = height - ((random(`py${i}`) * height + t * speed) % (height + 40));
        const s = 2 + random(`pz${i}`) * 4;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%",
            background: i % 3 ? C.gold : C.em, opacity: 0.35 + 0.35 * Math.sin(t * 2 + i),
            boxShadow: `0 0 ${s * 3}px ${i % 3 ? C.gold : C.em}`,
          }} />
        );
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Elemen sistem ----------
const CHAPTERS = [
  { at: S[1].start, label: "KISAH 1" },
  { at: S[3].start, label: "KISAH 2" },
  { at: S[4].start, label: "JAWABAN" },
  { at: S[6].start, label: "TWIST" },
];
const Progress: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(t / END, 1);
  const o = 1 - ramp(t, END, END + 0.4);
  return (
    <div style={{ position: "absolute", left: 80, top: 236, width: 920, opacity: o }}>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(46,242,164,0.15)" }} />
      <div style={{ position: "absolute", top: 0, height: 6, width: 920 * p, borderRadius: 3,
        background: `linear-gradient(90deg, ${C.em}, ${C.tosca})`, boxShadow: `0 0 14px ${C.em}` }} />
      {CHAPTERS.map((c) => {
        const x = (c.at / END) * 920;
        const done = t >= c.at;
        return (
          <div key={c.label} style={{ position: "absolute", left: x - 6, top: -4 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: done ? C.gold : C.bg,
              border: `2px solid ${done ? C.gold : C.muted}`, boxShadow: done ? `0 0 12px ${C.gold}` : "none" }} />
          </div>
        );
      })}
    </div>
  );
};

const Watermark: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 80, top: 262, display: "flex", alignItems: "center", gap: 14,
    opacity: ramp(t, 2, 2.6) * (1 - ramp(t, END - 0.3, END)) }}>
    <Img src={staticFile("logo.png")} style={{ width: 52, height: 52 }} />
    <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 30, color: C.text }}>Muslim Leveling</div>
  </div>
);

// Judul: per kata reveal naik; *kata* = emas
const Title: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number }> = ({
  t, at, until, text, y = 450, size = 92,
}) => {
  const words = text.split(" ");
  const out = 1 - ramp(t, until - 0.3, until, IN);
  if (t < at - 0.1 || t > until) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 70, width: 860, textAlign: "center", opacity: out,
      fontFamily: KUFI, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -1 }}>
      {words.map((w, i) => {
        if (w === "|") return <br key={i} />;
        const gold = w.startsWith("*");
        const p = ramp(t, at + i * 0.08, at + i * 0.08 + 0.45, BACK);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0 10px" }}>
            <span style={{ display: "inline-block", translate: `0px ${(1 - p) * 110}%`, color: gold ? C.gold : C.text,
              textShadow: textGlow(gold ? C.gold : C.em) }}>
              {w.replace(/\*/g, "")}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const Pill: React.FC<{ t: number; at: number; until: number; children: React.ReactNode; y?: number; color?: string }> = ({
  t, at, until, children, y = 690, color = C.tosca,
}) => (
  <div style={{ position: "absolute", top: y, left: 0, width: 1080, display: "flex", justifyContent: "center",
    opacity: win(t, at + 0.4, until), scale: String(0.9 + 0.1 * ramp(t, at, at + 0.5, BACK)) }}>
    <div style={{ fontFamily: READEX, fontWeight: 500, fontSize: 30, color, padding: "8px 22px", borderRadius: 999,
      background: C.card, border: `1.5px solid ${color}66`, boxShadow: `0 0 18px ${color}33` }}>{children}</div>
  </div>
);

// Caption karaoke: kelompok kata, kata aktif emas
type W = { w: string; s: number; e: number };
const GROUPS: W[][] = (() => {
  const g: W[][] = [];
  let cur: W[] = [];
  (cues.words as W[]).forEach((w, i, arr) => {
    cur.push(w);
    const next = arr[i + 1];
    if (!next || cur.length >= 4 || /[.,?!:]$/.test(w.w) || next.s - w.e > 0.35) {
      g.push(cur);
      cur = [];
    }
  });
  return g;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const grp = GROUPS.find((g, i) => t >= g[0].s - 0.05 && t < (GROUPS[i + 1]?.[0].s ?? g[g.length - 1].e + 0.6) - 0.05
    && t < g[g.length - 1].e + 0.6);
  if (!grp || t >= END) return null;
  const pop = ramp(t, grp[0].s - 0.05, grp[0].s + 0.15, BACK);
  return (
    <div style={{ position: "absolute", bottom: 520, left: 80, width: 840, textAlign: "center",
      scale: String(0.92 + 0.08 * pop), opacity: pop }}>
      <span style={{ fontFamily: READEX, fontWeight: 700, fontSize: 50, lineHeight: 1.3, padding: "10px 24px",
        borderRadius: 22, background: "rgba(3,11,9,0.62)", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
        {grp.map((w, i) => {
          const on = t >= w.s - 0.03 && t < w.e + 0.08;
          return (
            <span key={i} style={{ color: on ? C.gold : C.text, opacity: t >= w.s - 0.03 ? 1 : 0.55,
              textShadow: on ? `0 0 18px ${C.gold}aa` : "none" }}>
              {w.w}{i < grp.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </div>
  );
};

// Light leak di tiap pergantian bab (WebGL)
const Leaks: React.FC<{ t: number }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const cut = [S[1].start, S[3].start, S[4].start, S[6].start, S[7].start, S[9].start].find((c) => Math.abs(t - c) < 0.6);
  if (cut === undefined) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.35 }}>
      <Solid width={width} height={height} color="transparent"
        effects={[lightLeak({ progress: interpolate(t, [cut - 0.6, cut + 0.6], [0, 1], clamp), seed: Math.round(cut), hueShift: 260 })]} />
    </AbsoluteFill>
  );
};

// ---------- Objek ----------
// Bintang 8 sudut (khatam): dua persegi 45° + lingkaran dalam
const Star: React.FC<{ draw: number; glow: number; color?: string; size?: number; fill?: number; children?: React.ReactNode }> = ({
  draw, glow, color = C.gold, size = 520, fill = 0, children,
}) => {
  const L = 4 * 300; // keliling satu persegi
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="-260 -260 520 520" width={size} height={size} style={{ overflow: "visible", filter: neon(color, glow) }}>
        <circle r={240} fill="none" stroke={color} strokeOpacity={0.18 * glow} strokeWidth={2} />
        {[0, 45].map((r) => (
          <rect key={r} x={-150} y={-150} width={300} height={300} transform={`rotate(${r})`}
            fill={color} fillOpacity={0.06 * fill} stroke={color} strokeWidth={6}
            strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinejoin="round" />
        ))}
        <circle r={112} fill="none" stroke={C.tosca} strokeWidth={3} strokeDasharray={704} strokeDashoffset={704 * (1 - draw)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};

// Mushaf terbuka garis neon
const Book: React.FC<{ t: number; flip: number; color?: string; w?: number }> = ({ t, flip, color = C.em, w = 560 }) => (
  <svg viewBox="-300 -200 600 400" width={w} style={{ overflow: "visible", filter: neon(color, 0.8) }}>
    <path d="M0 -150 C -80 -175 -200 -170 -270 -140 L -270 150 C -200 120 -80 125 0 150 Z" fill="rgba(46,242,164,0.04)" stroke={color} strokeWidth={5} />
    <path d="M0 -150 C 80 -175 200 -170 270 -140 L 270 150 C 200 120 80 125 0 150 Z" fill="rgba(46,242,164,0.04)" stroke={color} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M ${-235 + i * 4} ${-110 + i * 50} L ${-40} ${-110 + i * 50}`} stroke={color} strokeOpacity={0.5} strokeWidth={3} />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M 40 ${-110 + i * 50} L ${235 - i * 4} ${-110 + i * 50}`} stroke={color} strokeOpacity={0.5} strokeWidth={3} />
    ))}
    {new Array(6).fill(0).map((_, i) => {
      const a = ((t * 2.4 + i / 6) % 1) * flip;
      return (
        <path key={i} d="M0 -150 C 80 -175 200 -170 270 -140 L 270 150 C 200 120 80 125 0 150 Z" fill="none"
          stroke={C.gold} strokeOpacity={0.55 * Math.sin(a * Math.PI)} strokeWidth={3}
          transform={`scale(${Math.cos(a * Math.PI)} 1)`} />
      );
    })}
  </svg>
);

const Arabic: React.FC<{ t: number; at: number; text: string; step?: number; size?: number; color?: string }> = ({
  t, at, text, step = 0.42, size = 70, color = C.gold,
}) => (
  <div style={{ direction: "rtl", fontFamily: AMIRI, fontWeight: 700, fontSize: size, lineHeight: 1.75, textAlign: "center" }}>
    {text.split(" ").map((w, i) => {
      const p = ramp(t, at + i * step, at + i * step + 0.5);
      return (
        <span key={i} style={{ display: "inline-block", margin: "0 10px", opacity: p, color,
          translate: `0px ${(1 - p) * 24}px`, textShadow: `0 0 ${10 + 20 * p}px ${color}aa` }}>{w}</span>
      );
    })}
  </div>
);

const Center: React.FC<{ y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y = 1080, children, style }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 0, display: "flex", alignItems: "center",
    justifyContent: "center", ...style }}>{children}</div>
);

// ---------- Adegan ----------
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const sec = Math.min(10, interpolate(t, [0.2, K.ten + 0.3], [0, 10], clamp));
  const arc = sec / 10;
  return (
    <>
      <Title t={t} at={0} until={S[0].end} text="SEPERTIGA AL-QUR'AN | *10* *DETIK*" />
      <Center y={980} style={{ opacity: 0.55 }}><Book t={t} flip={1} w={760} /></Center>
      <Center y={980}>
        <svg viewBox="-200 -200 400 400" width={420} style={{ overflow: "visible", filter: neon(C.gold, 1.1) }}>
          <circle r={170} fill="rgba(3,11,9,0.7)" stroke={C.em} strokeOpacity={0.35} strokeWidth={4} />
          <circle r={170} fill="none" stroke={C.gold} strokeWidth={10} strokeLinecap="round"
            strokeDasharray={1068} strokeDashoffset={1068 * (1 - arc)} transform="rotate(-90)" />
          <rect x={-18} y={-222} width={36} height={26} rx={6} fill={C.gold} />
        </svg>
      </Center>
      <Center y={980}>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 120, color: C.gold, textShadow: textGlow(C.gold),
          scale: String(1 + 0.06 * Math.sin(t * 6) * ramp(t, K.ten, K.ten + 0.2)) }}>
          {"00:" + String(Math.floor(sec)).padStart(2, "0")}
        </div>
      </Center>
      <Center y={1230} style={{ opacity: ramp(t, 3.4, 4) }}>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 150, color: C.gold, textShadow: textGlow(C.gold) }}>⅓</div>
      </Center>
    </>
  );
};

const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[1].start;
  const n = Math.floor(interpolate(lt, [0.5, 7], [0, 22], clamp));
  const wobble = Math.sin(t * 5) * 3 * ramp(t, 13, 15);
  return (
    <>
      <Title t={t} at={K.sanggup - 0.3} until={S[1].end} text="SANGGUP *SEMALAM?*" />
      <Pill t={t} at={S[1].start + 0.3} until={S[1].end}>HR. Bukhari no. 5015</Pill>
      <div style={{ position: "absolute", right: 120, top: 760, width: 150, height: 150, borderRadius: "50%",
        boxShadow: `-26px 18px 0 6px ${C.tosca}`, filter: neon(C.tosca, 0.8), opacity: ramp(lt, 0, 1), rotate: "-20deg" }} />
      <Center y={1390} style={{ alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", rotate: `${wobble}deg`, transformOrigin: "bottom" }}>
          {new Array(22).fill(0).map((_, i) => (
            <div key={i} style={{ width: 380 - (i % 3) * 14, height: 16, marginTop: 6, borderRadius: 4,
              border: `2.5px solid ${i % 4 === 0 ? C.gold : C.em}`, opacity: i < n ? 1 : 0,
              translate: `${random(`st${i}`) * 30 - 15}px ${i < n ? 0 : -40}px`,
              boxShadow: `0 0 10px ${C.em}66` }} />
          ))}
        </div>
      </Center>
    </>
  );
};

const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const p = ramp(t, S[2].start, S[2].start + 1.4, Easing.inOut(Easing.cubic));
  return (
    <>
      <Title t={t} at={K.jawaban - 0.2} until={S[2].end} text="JAWABANNYA…" />
      <Center y={1080}>
        <div style={{ width: 380 + 400 * p, height: 380 * (1 - p) + 6, borderRadius: 6,
          border: `3px solid ${p > 0.9 ? C.gold : C.em}`, background: p > 0.9 ? C.gold : "transparent",
          boxShadow: `0 0 ${20 + 40 * p}px ${C.gold}`, opacity: 0.4 + 0.6 * p }} />
      </Center>
      <Center y={1200} style={{ opacity: ramp(t, 17.5, 18.1) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 44, color: C.text }}>surah yang kamu baca <span style={{ color: C.gold }}>tiap hari</span></div>
      </Center>
    </>
  );
};

const Arch: React.FC<{ open: number }> = ({ open }) => (
  <svg viewBox="-200 -330 400 460" width={380} style={{ overflow: "visible", filter: neon(C.gold, 0.6 + open) }}>
    <defs>
      <radialGradient id="door" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stopColor="#FFF4CF" stopOpacity={0.95 * open} />
        <stop offset="100%" stopColor={C.gold} stopOpacity={0.15 * open} />
      </radialGradient>
    </defs>
    <path d="M -140 120 L -140 -120 C -140 -230 -40 -280 0 -320 C 40 -280 140 -230 140 -120 L 140 120 Z"
      fill="url(#door)" stroke={C.gold} strokeWidth={6} />
    <path d="M -110 120 L -110 -110 C -110 -200 -30 -240 0 -275 C 30 -240 110 -200 110 -110 L 110 120" fill="none" stroke={C.gold} strokeOpacity={0.4} strokeWidth={3} />
  </svg>
);

const Crowd: React.FC<{ t: number; gather: number }> = ({ t, gather }) => (
  <>
    {new Array(28).fill(0).map((_, i) => {
      const row = Math.floor(i / 7), col = i % 7;
      const side = col < 3.5 ? -1 : 1;
      const x = 540 + (col - 3) * 130 + (row % 2) * 40 + side * (1 - gather) * 500;
      const y = 1190 + row * 46;
      const sway = Math.sin(t * 2 + i) * 3;
      return (
        <svg key={i} viewBox="-30 -50 60 100" width={70} style={{ position: "absolute", left: x - 35, top: y - 50 + sway,
          overflow: "visible", opacity: (0.35 + 0.15 * row) * gather, filter: neon(row % 2 ? C.tosca : C.em, 0.5) }}>
          <circle cy={-28} r={13} fill="none" stroke={row % 2 ? C.tosca : C.em} strokeWidth={3} />
          <path d="M -24 40 C -24 0 24 0 24 40" fill="none" stroke={row % 2 ? C.tosca : C.em} strokeWidth={3} />
        </svg>
      );
    })}
  </>
);

const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const gather = ramp(t, K.berkumpul + 0.5, K.berkumpul + 3, Easing.inOut(Easing.cubic));
  const open = Math.max(
    win(t, K.keluar1 - 0.3, K.arabEnd + 0.6, 0.6),
    ramp(t, K.keluar2 - 0.2, K.keluar2 + 0.8),
  );
  const whisper = win(t, K.bisik - 0.2, K.keluar2, 0.3);
  return (
    <>
      <Title t={t} at={K.berkumpul - 0.2} until={K.arab - 0.2} text="*BERKUMPULLAH*" />
      <Title t={t} at={K.bisik - 0.2} until={K.ketahuilah - 0.2} text="ADA *WAHYU?*" />
      <Title t={t} at={K.ketahuilah} until={S[3].end} text="SETARA *⅓* AL-QUR'AN" />
      <Pill t={t} at={S[3].start + 0.5} until={K.arab - 0.2}>HR. Muslim no. 812</Pill>
      <Pill t={t} at={K.bisik} until={S[3].end}>HR. Muslim no. 812</Pill>
      <Center y={950}><Arch open={open} /></Center>
      <Center y={950} style={{ opacity: open * 0.5 }}>
        <div style={{ width: 900, height: 900, background: `radial-gradient(circle, ${C.gold}55 0%, rgba(0,0,0,0) 60%)` }} />
      </Center>
      <Crowd t={t} gather={gather} />
      <Center y={540} style={{ opacity: win(t, K.arab - 0.2, K.bisik - 0.2) }}>
        <div style={{ padding: "0 40px", borderRadius: 30, background: C.card }}>
          <Arabic t={t} at={K.arab - 0.1} step={0.42} size={78} text="قُلْ هُوَ اللَّهُ أَحَدٌ" />
        </div>
      </Center>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: [170, 790, 300][i], top: [1150, 1180, 1220][i],
          opacity: whisper * (0.5 + 0.5 * Math.sin(t * 7 + i * 2)), fontFamily: KUFI, fontSize: 64, color: C.tosca,
          textShadow: textGlow(C.tosca) }}>…?</div>
      ))}
    </>
  );
};

const PANELS = [
  { label: "HUKUM", sub: "cara hidup", c: C.em, at: K.hukum },
  { label: "KISAH", sub: "pelajaran", c: C.tosca, at: K.kisah },
  { label: "TAUHID", sub: "mengenal Allah", c: C.gold, at: K.tauhid },
];
const Panel: React.FC<{ p: (typeof PANELS)[number]; show: number; dim?: number; tilt?: number; w?: number; h?: number }> = ({
  p, show, dim = 1, tilt = 0, w = 280, h = 520,
}) => (
  <div style={{ width: w, height: h, borderRadius: 26, background: "rgba(10,26,21,0.55)", border: `3px solid ${p.c}`,
    boxShadow: `0 0 ${24 * dim}px ${p.c}88, inset 0 0 40px ${p.c}22`, opacity: show * (0.25 + 0.75 * dim),
    translate: `0px ${(1 - show) * 80}px`, rotate: `${tilt}deg`, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 14 }}>
    <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 52, color: p.c, textShadow: textGlow(p.c) }}>{p.label}</div>
    <div style={{ fontFamily: READEX, fontWeight: 500, fontSize: 28, color: C.muted }}>{p.sub}</div>
  </div>
);

const AYAT = ["قُلْ هُوَ اللَّهُ أَحَدٌ", "اللَّهُ الصَّمَدُ", "لَمْ يَلِدْ وَلَمْ يُولَدْ", "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"];

const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const toStar = ramp(t, K.ikhlas - 0.4, K.ikhlas + 1.2, Easing.inOut(Easing.cubic));
  return (
    <>
      <Title t={t} at={S[4].start + 0.2} until={K.hukum - 0.3} text="DIBAGI *TIGA*" />
      <Title t={t} at={K.hukum - 0.2} until={K.ikhlas - 0.3} text="ISI AL-QUR'AN" />
      <Title t={t} at={K.ikhlas - 0.1} until={S[4].end} text="INTI *TAUHID*" />
      <Pill t={t} at={S[4].start + 0.5} until={K.hukum}>HR. Muslim no. 811</Pill>
      <Center y={1020} style={{ gap: 26, opacity: 1 - toStar }}>
        {PANELS.map((p) => <Panel key={p.label} p={p} show={ramp(t, p.at - 0.2, p.at + 0.4, BACK)} />)}
      </Center>
      <Center y={1000} style={{ opacity: toStar, scale: String(0.6 + 0.4 * toStar) }}>
        <Star draw={ramp(t, K.ikhlas, K.ikhlas + 1.6)} glow={1} fill={toStar} size={420}>
          <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 64, color: C.gold, textShadow: textGlow(C.gold) }}>أَحَد</div>
        </Star>
      </Center>
      {AYAT.map((a, i) => {
        const ang = (i / 4) * Math.PI * 2 - Math.PI / 2;
        return (
          <div key={i} style={{ position: "absolute", left: 540 + Math.cos(ang) * 280 - 150, top: 1000 + Math.sin(ang) * 250 - 30,
            width: 300, textAlign: "center", direction: "rtl", fontFamily: AMIRI, fontWeight: 700, fontSize: 36,
            color: C.text, opacity: ramp(t, K.ikhlas + 1 + i * 0.35, K.ikhlas + 1.5 + i * 0.35) * 0.9,
            textShadow: `0 0 14px ${C.em}` }}>{a}</div>
        );
      })}
    </>
  );
};

const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const away = Math.max(win(t, K.salat - 0.2, K.semuanya, 0.6), 0);
  const back = ramp(t, K.semuanya, K.semuanya + 0.8, BACK);
  const lift = away * (1 - back);
  const flick = 1 - lift * (0.5 + 0.5 * Math.abs(Math.sin(t * 17)));
  return (
    <>
      <Title t={t} at={S[5].start + 0.2} until={K.siapa - 0.4} text="*TAUHID* = FONDASI" />
      <Title t={t} at={K.siapa - 0.3} until={S[5].end} text="SIAPA YANG KAMU *SEMBAH?*" />
      <Center y={840} style={{ gap: 40 }}>
        <Panel p={PANELS[0]} show={1} dim={flick} tilt={-14 * lift} w={300} h={380} />
        <Panel p={PANELS[1]} show={1} dim={flick} tilt={12 * lift} w={300} h={380} />
      </Center>
      <Center y={1190} style={{ translate: `0px ${lift * 360}px`, opacity: 1 - 0.7 * lift }}>
        <Star draw={1} glow={1.2 - lift} fill={1} size={340} />
      </Center>
      <Center y={1110} style={{ opacity: win(t, K.salat, K.kisah2 - 0.2) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 40, color: C.muted }}>sholat → hanya gerakan</div>
      </Center>
      <Center y={1110} style={{ opacity: win(t, K.kisah2, K.semuanya - 0.1) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 40, color: C.muted }}>kisah → hanya dongeng</div>
      </Center>
    </>
  );
};

const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const strike = ramp(t, K.tidak, K.tidak + 0.6, Easing.inOut(Easing.cubic));
  const book = ramp(t, K.tetap - 0.2, K.tetap + 0.8);
  return (
    <>
      <Title t={t} at={K.setara2 - 0.2} until={S[6].end} text="SETARA *≠* MENGGANTI" />
      <Center y={900} style={{ opacity: ramp(t, K.setara2, K.setara2 + 0.5) * (1 - book) }}>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 300, color: C.tosca, textShadow: textGlow(C.tosca), lineHeight: 1 }}>≠</div>
      </Center>
      <Center y={1180} style={{ opacity: ramp(t, K.setara2 + 2.5, K.setara2 + 3) * (1 - book * 0.85) }}>
        <div style={{ position: "relative", fontFamily: KUFI, fontWeight: 700, fontSize: 54, color: C.text, padding: "16px 30px",
          borderRadius: 24, background: C.card, border: `2px solid ${C.muted}55` }}>
          3× AL-IKHLAS = KHATAM
          <svg style={{ position: "absolute", left: 20, top: "calc(50% - 20px)", overflow: "visible" }} width={620} height={40}>
            <path d="M 0 20 C 150 10 400 28 620 16" stroke={C.tosca} strokeWidth={8} strokeLinecap="round" fill="none"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} style={{ filter: neon(C.tosca, 0.8) }} />
          </svg>
        </div>
      </Center>
      <Center y={1000} style={{ opacity: book, scale: String(0.85 + 0.15 * book) }}>
        <Book t={t} flip={0} color={C.gold} w={620} />
      </Center>
    </>
  );
};

const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const card = ramp(t, K.kabarkan - 0.3, K.kabarkan + 0.4, BACK);
  const pulse = 1 + 0.03 * Math.sin((t - K.allah) * 8) * ramp(t, K.allah, K.allah + 0.3) * (1 - ramp(t, K.allah + 2, K.allah + 3));
  const rays = ramp(t, K.allah - 0.3, K.allah + 0.6);
  return (
    <>
      <Title t={t} at={S[7].start + 0.2} until={K.kabarkan - 0.4} text="KENAPA *BERHARGA?*" />
      <Title t={t} at={K.allah - 0.3} until={S[7].end} text="ALLAH *MENCINTAINYA*" />
      <Center y={1000} style={{ opacity: rays * 0.8, rotate: `${t * 6}deg` }}>
        <svg viewBox="-600 -600 1200 1200" width={1300}>
          {new Array(24).fill(0).map((_, i) => (
            <path key={i} d="M 0 0 L -26 -600 L 26 -600 Z" fill={i % 2 ? C.gold : C.em} fillOpacity={0.08}
              transform={`rotate(${i * 15})`} />
          ))}
        </svg>
      </Center>
      <Center y={1000} style={{ opacity: 1 - card * 0.75, scale: String(1 + 0.25 * ramp(t, K.rahman, K.kabarkan)) }}>
        <Star draw={1} glow={1 + ramp(t, K.rahman, K.rahman + 1)} fill={1} size={460} />
      </Center>
      <Center y={1000} style={{ opacity: win(t, K.rahman - 0.2, K.kabarkan - 0.3) }}>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 54, color: C.gold, textShadow: textGlow(C.gold), textAlign: "center" }}>
          SIFAT<br />AR-RAHMAN
        </div>
      </Center>
      <Center y={1040} style={{ opacity: card, scale: String((0.9 + 0.1 * card) * pulse) }}>
        <div style={{ width: 820, translate: "-20px 0px", borderRadius: 34, padding: "40px 40px 30px", background: C.card,
          border: `2px solid ${C.gold}88`, boxShadow: `0 0 50px ${C.gold}44, inset 0 0 60px ${C.em}14`, textAlign: "center" }}>
          <Arabic t={t} at={K.kabarkan - 0.2} step={0.3} size={76} text="أَخْبِرُوهُ أَنَّ اللَّهَ يُحِبُّهُ" />
          <div style={{ fontFamily: READEX, fontWeight: 500, fontSize: 40, color: C.text, marginTop: 10, opacity: ramp(t, K.allah, K.allah + 0.5) }}>
            “Kabarkan padanya, Allah mencintainya.”
          </div>
          <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 30, color: C.tosca, marginTop: 22 }}>HR. Bukhari no. 7375 · Muslim no. 813</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 18, opacity: 0.85 }}>
            <Img src={staticFile("logo.png")} style={{ width: 36, height: 36 }} />
            <span style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 24, color: C.muted }}>Muslim Leveling</span>
          </div>
        </div>
      </Center>
    </>
  );
};

const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[8].start;
  return (
    <>
      <Title t={t} at={S[8].start + 0.2} until={K.simpan - 0.3} text="BACA *PELAN* MALAM INI" />
      <Title t={t} at={K.simpan - 0.2} until={S[8].end} text="SIMPAN & *BAGIKAN*" />
      <div style={{ position: "absolute", right: 150, top: 720, width: 130, height: 130, borderRadius: "50%",
        boxShadow: `-22px 16px 0 5px ${C.gold}`, filter: neon(C.gold, 0.7), rotate: "-20deg", opacity: ramp(lt, 0, 1) }} />
      <Center y={1080} style={{ scale: String(0.75 + 0.03 * Math.sin(t * 1.5)) }}>
        <Star draw={1} glow={0.9 + 0.3 * Math.sin(t * 1.5)} fill={1} size={460}>
          <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 60, color: C.gold, textShadow: textGlow(C.gold) }}>الإخلاص</div>
        </Star>
      </Center>
    </>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const g = ramp(t, END, END + 0.7, BACK);
  return (
    <>
      <Center y={900} style={{ opacity: 1 - ramp(t, END, END + 0.5), scale: String(0.75 * (1 - 0.6 * ramp(t, END, END + 0.6))) }}>
        <Star draw={1} glow={1} fill={1} size={460} />
      </Center>
      <Center y={900} style={{ opacity: g, scale: String(0.4 + 0.6 * g) }}>
        <Img src={staticFile("logo.png")} style={{ width: 460, height: 460, filter: neon(C.em, 0.8) }} />
      </Center>
      <Center y={1220} style={{ opacity: ramp(t, END + 0.4, END + 0.9) }}>
        <div style={{ fontFamily: KUFI, fontWeight: 700, fontSize: 92, color: C.text, textShadow: textGlow(C.em) }}>Muslim Leveling</div>
      </Center>
      <Center y={1360} style={{ opacity: ramp(t, END + 0.8, END + 1.3), scale: String(0.9 + 0.1 * ramp(t, END + 0.8, END + 1.3, BACK)) }}>
        <div style={{ fontFamily: READEX, fontWeight: 700, fontSize: 38, color: C.bg, background: C.tosca, padding: "16px 44px",
          borderRadius: 999, boxShadow: `0 0 30px ${C.tosca}88` }}>Download sekarang</div>
      </Center>
    </>
  );
};

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, EndCard];

export const AlIkhlas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <Audio src={staticFile("narasi.wav")} />
      <Background t={t} />
      {SCENES.map((Scene, i) => {
        const s = S[i];
        if (t < s.start - 0.4 || t > s.end + 0.4) return null;
        const lt = t - s.start;
        return (
          <AbsoluteFill key={i} style={{
            opacity: win(t, s.start + 0.4, s.end + 0.4, 0.4),
            scale: String(interpolate(lt, [0, s.end - s.start], [1, 1.04], clamp)),
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
