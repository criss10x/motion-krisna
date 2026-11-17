// Tulis shots/k.txt (event visual → detik) dari EV di film-remotion/src/timing.ts, supaya SFX sama persis dengan video.
// Pakai dari root repo: node --experimental-strip-types skills/kamera-virtual/scripts/k.mts projects/<topik>
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const dir = resolve(process.argv[2] ?? ".");
const { makeTiming } = await import(pathToFileURL(`${dir}/film-remotion/src/timing.ts`).href);
const cues = JSON.parse(readFileSync(`${dir}/film-remotion/public/cues.json`, "utf8"));
const T = makeTiming(cues.words, cues.scenes.map((s: { start: number }) => s.start));
const rows = Object.entries(T.EV as Record<string, number>).sort((a, b) => a[1] - b[1]).map(([k, v]) => `${k}: ${v.toFixed(2)}`);
writeFileSync(`${dir}/shots/k.txt`, rows.join("\n") + "\n");
console.log(`${rows.length} event → ${dir}/shots/k.txt`);
